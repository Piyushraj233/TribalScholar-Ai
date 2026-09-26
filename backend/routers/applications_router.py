import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Application, ApplicationAnswer, Scheme, User, WorkflowEvent, 
    Notification, Document, VerificationResult, Deficiency
)
from ..schemas import (
    ApplicationResponse, ApplicationDetailResponse, ApplicationCreate, 
    ApplicationAnswerSchema, WorkflowEventResponse
)
from ..auth import get_current_user
from ..services.audit_service import audit_service
from ..services.eligibility_engine import eligibility_engine

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    scheme_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Application)

    # Role restriction
    if current_user.role == "applicant":
        query = query.filter(Application.user_id == current_user.id)

    if status_filter and status_filter != "All":
        query = query.filter(Application.status == status_filter)

    if scheme_id:
        query = query.filter(Application.scheme_id == scheme_id)

    if search:
        query = query.join(User, Application.user_id == User.id).filter(
            (Application.application_no.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%")) |
            (User.state.ilike(f"%{search}%"))
        )

    apps = query.order_by(Application.created_at.desc()).all()
    return apps

@router.get("/{app_id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Access check
    if current_user.role == "applicant" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")

    return app

@router.post("", response_model=ApplicationDetailResponse)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scheme = db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Generate sequential application number e.g. NFST202600123
    seq = random.randint(100, 999)
    prefix = scheme.code.upper().replace("-", "").replace(" ", "")[:4]
    app_no = f"{prefix}202600{seq}"

    new_app = Application(
        application_no=app_no,
        user_id=current_user.id,
        scheme_id=scheme.id,
        status="Draft",
        stage="Application Submitted",
        eligibility_status="Pending",
        document_status="Pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    # Save answers
    for ans in app_in.answers:
        answer_rec = ApplicationAnswer(
            application_id=new_app.id,
            section_name=ans.section_name,
            field_name=ans.field_name,
            field_value=ans.field_value
        )
        db.add(answer_rec)

    # Record workflow creation
    event = WorkflowEvent(
        application_id=new_app.id,
        stage="Draft Created",
        title="Application Form Draft Saved",
        description=f"Initial application draft started for {scheme.name}",
        actor_role="APPLICANT",
        actor_id=str(current_user.id)
    )
    db.add(event)
    db.commit()
    db.refresh(new_app)

    audit_service.log(
        db,
        action="Application Created",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        application_no=new_app.application_no,
        previous_status=None,
        new_status="Draft",
        details=f"Draft application created for scheme {scheme.code}"
    )

    return new_app

@router.post("/{app_id}/submit", response_model=ApplicationDetailResponse)
def submit_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == "applicant" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    prev_status = app.status
    app.status = "Document Verification"
    app.stage = "Document Verification"
    app.submission_date = datetime.utcnow()

    # Workflow Event
    ev = WorkflowEvent(
        application_id=app.id,
        stage="Document Verification",
        title="Application Submitted & Queued for AI Intelligence",
        description="Application successfully lodged. AI document verification pipeline initiated.",
        actor_role="APPLICANT",
        actor_id=str(current_user.id)
    )
    db.add(ev)

    # Notification
    notif = Notification(
        user_id=app.user_id,
        title="Application Submitted Successfully",
        message=f"Your application {app.application_no} for {app.scheme.name} is now undergoing AI Document Verification.",
        type="success",
        channel="in_app"
    )
    db.add(notif)
    db.commit()
    db.refresh(app)

    audit_service.log(
        db,
        action="Submit Application",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        application_no=app.application_no,
        previous_status=prev_status,
        new_status="Document Verification",
        details="Applicant finalized submission and agreed to digital declaration."
    )

    return app

@router.post("/{app_id}/resubmit", response_model=ApplicationDetailResponse)
def resubmit_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    prev_status = app.status
    app.status = "Resubmitted"
    app.stage = "Scrutiny"

    # Mark open deficiencies as resolved
    for d in app.deficiencies:
        if d.status == "OPEN":
            d.status = "RESOLVED"
            d.resolved_at = datetime.utcnow()

    ev = WorkflowEvent(
        application_id=app.id,
        stage="Resubmitted",
        title="Applicant Resubmission Received",
        description="Applicant provided rectified documentation. Application requeued for Scrutiny review.",
        actor_role="APPLICANT",
        actor_id=str(current_user.id)
    )
    db.add(ev)
    db.commit()
    db.refresh(app)

    audit_service.log(
        db,
        action="Resubmit Documents",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        application_no=app.application_no,
        previous_status=prev_status,
        new_status="Resubmitted",
        details="Deficiency rectified by applicant."
    )

    return app
