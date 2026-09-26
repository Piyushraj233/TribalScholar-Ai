import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Application, Document, DocumentExtraction, VerificationResult, 
    Deficiency, WorkflowEvent, User
)
from ..schemas import DocumentResponse, VerificationResultResponse
from ..auth import get_current_user
from ..services.storage_service import storage_service
from ..services.ocr_service import ocr_service
from ..services.cross_verification import cross_verification_service
from ..services.audit_service import audit_service
from ..config import settings

router = APIRouter(prefix="/documents", tags=["AI Document Intelligence"])

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    application_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == "applicant" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Save to storage
    saved = storage_service.save_file(file, subfolder=f"app_{app.id}")

    doc = Document(
        application_id=app.id,
        user_id=current_user.id,
        document_type=document_type,
        file_name=saved["file_name"],
        file_path=saved["file_path"],
        file_size=saved["file_size"],
        mime_type=saved["mime_type"],
        status="Uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    audit_service.log(
        db,
        action="Upload Document",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        application_no=app.application_no,
        details=f"Uploaded {document_type}: {saved['file_name']}"
    )

    return doc

@router.post("/{doc_id}/process", response_model=DocumentResponse)
def process_document_ai(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    app = doc.application
    applicant = app.applicant

    # Context for AI OCR engine
    applicant_context = {
        "full_name": applicant.full_name if applicant else "Applicant",
        "application_no": app.application_no,
        "category": "ST",
        "institution": "National Institute of Technology"
    }
    
    # Read any answers provided in application
    for ans in app.answers:
        if ans.field_name == "full_name":
            applicant_context["full_name"] = ans.field_value
        elif ans.field_name == "institution":
            applicant_context["institution"] = ans.field_value
        elif ans.field_name == "certificate_no":
            applicant_context["cert_no"] = ans.field_value

    # 1. Execute OCR & Document Intelligence
    ocr_result = ocr_service.process_document(
        doc.file_path, 
        doc.document_type, 
        applicant_context
    )

    # Save or update extraction
    extraction = doc.extraction
    if not extraction:
        extraction = DocumentExtraction(
            document_id=doc.id,
            ocr_engine=ocr_result["ocr_engine"],
            raw_text=ocr_result["raw_text"],
            extracted_fields_json=json.dumps(ocr_result["extracted_fields"]),
            confidence_score=ocr_result["confidence_score"],
            quality_score=ocr_result["quality_score"],
            is_blurry=ocr_result["is_blurry"],
            is_skewed=ocr_result["is_skewed"]
        )
        db.add(extraction)
    else:
        extraction.raw_text = ocr_result["raw_text"]
        extraction.extracted_fields_json = json.dumps(ocr_result["extracted_fields"])
        extraction.confidence_score = ocr_result["confidence_score"]
        extraction.quality_score = ocr_result["quality_score"]

    # 2. Run Cross-Document Verification checks
    checks = cross_verification_service.verify_document_against_application(
        doc.document_type,
        ocr_result["extracted_fields"],
        applicant_context
    )

    # Clear old verification results for this document
    db.query(VerificationResult).filter(VerificationResult.document_id == doc.id).delete()

    has_issue = False
    warning_issue_text = ""

    for c in checks:
        vr = VerificationResult(
            application_id=app.id,
            document_id=doc.id,
            check_type=c["check_type"],
            status=c["status"],
            confidence_score=c["confidence_score"],
            field_checked=c.get("field_checked"),
            expected_value=c.get("expected_value"),
            actual_value=c.get("actual_value"),
            similarity_score=c.get("similarity_score", 1.0),
            message=c["message"],
            recommendation=c.get("recommendation")
        )
        db.add(vr)

        if c["status"] in ["WARNING", "FAIL"]:
            has_issue = True
            warning_issue_text = c["message"]

    # If issue detected, generate or flag deficiency
    if has_issue:
        doc.status = "Deficiency"
        app.document_status = "Issues Detected"
        app.status = "Deficiency"
        
        # Check if deficiency already exists
        existing_def = db.query(Deficiency).filter(
            Deficiency.application_id == app.id,
            Deficiency.document_id == doc.id,
            Deficiency.status == "OPEN"
        ).first()

        if not existing_def:
            deficiency = Deficiency(
                application_id=app.id,
                document_id=doc.id,
                title="Potential Issue Detected: Name Variation / Verification Needed",
                description=f"{warning_issue_text} AI Recommendation: Manual verification required by scrutiny officer.",
                severity="Medium",
                status="OPEN"
            )
            db.add(deficiency)
    else:
        doc.status = "Verified"

    # Add workflow event
    we = WorkflowEvent(
        application_id=app.id,
        stage="Document Verification",
        title=f"AI Intelligence Processed {doc.document_type}",
        description=f"OCR Confidence: {int(ocr_result['confidence_score']*100)}%, Quality: {int(ocr_result['quality_score']*100)}%. " +
                    (f"Issue flagged: {warning_issue_text}" if has_issue else "All fields verified."),
        actor_role="AI_AGENT",
        actor_id="TribalScholar-DocAgent-v2"
    )
    db.add(we)
    db.commit()
    db.refresh(doc)

    audit_service.log(
        db,
        action="AI Document Verification Completed",
        user_role="AI_AGENT",
        user_name="AI Document Agent",
        application_no=app.application_no,
        previous_status=app.status if not has_issue else "Document Verification",
        new_status=app.status,
        details=f"Completed OCR & cross-matching for {doc.document_type}. Status: {doc.status}",
        actor_type="AI_AGENT"
    )

    return doc

@router.get("/download/{filename}")
def download_document(filename: str):
    # Safety check for path traversal
    safe_name = Path(filename).name
    file_path = settings.UPLOAD_DIR / safe_name
    if not file_path.exists():
        # Search subfolders
        matches = list(settings.UPLOAD_DIR.glob(f"**/{safe_name}"))
        if matches:
            file_path = matches[0]
        else:
            raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(path=file_path, filename=safe_name)

@router.get("/matrix/{application_id}")
def get_cross_doc_matrix(
    application_id: int, 
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    matrix = cross_verification_service.compute_cross_document_matrix(app, app.documents)
    return matrix
