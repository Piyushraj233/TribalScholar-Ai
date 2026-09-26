from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import KnowledgeDocument, KnowledgeChunk, User
from ..auth import get_current_user, require_role
from ..services.storage_service import storage_service
from ..services.audit_service import audit_service

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base & RAG Engine"])

@router.get("")
def list_knowledge_documents(db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDocument).all()
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "file_name": d.file_name,
            "summary": d.summary,
            "source_type": d.source_type,
            "chunk_count": len(d.chunks),
            "created_at": d.created_at
        })
    return results

@router.delete("/{doc_id}")
def delete_knowledge_document(
    doc_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    title = doc.title
    db.delete(doc)
    db.commit()

    audit_service.log(
        db,
        action="Delete Knowledge Document",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        details=f"Removed {title} from RAG vector knowledge base"
    )
    return {"status": "success", "message": f"Deleted {title}"}
