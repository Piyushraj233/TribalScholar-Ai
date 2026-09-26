from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Scheme, SchemeRule, SchemeDocumentRequirement, User
from ..schemas import SchemeResponse, SchemeCreate, SchemeRuleSchema, DocRequirementSchema
from ..auth import get_current_user, require_role
from ..services.audit_service import audit_service

router = APIRouter(prefix="/schemes", tags=["Schemes & Rules Engine"])

@router.get("", response_model=List[SchemeResponse])
def get_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    return schemes

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_by_id(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

@router.post("", response_model=SchemeResponse)
def create_scheme(
    scheme_in: SchemeCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    existing = db.query(Scheme).filter(Scheme.code == scheme_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme code already exists")

    new_scheme = Scheme(
        code=scheme_in.code,
        name=scheme_in.name,
        description=scheme_in.description,
        education_level=scheme_in.education_level,
        study_location=scheme_in.study_location,
        financial_assistance=scheme_in.financial_assistance,
        slots=scheme_in.slots,
        deadline=scheme_in.deadline,
        status=scheme_in.status,
        is_prototype=scheme_in.is_prototype
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)

    # Add rules
    for r in scheme_in.rules:
        rule = SchemeRule(
            scheme_id=new_scheme.id,
            field_name=r.field_name,
            operator=r.operator,
            target_value=r.target_value,
            severity=r.severity,
            description=r.description
        )
        db.add(rule)

    # Add doc requirements
    for d in scheme_in.doc_requirements:
        doc = SchemeDocumentRequirement(
            scheme_id=new_scheme.id,
            document_type=d.document_type,
            display_name=d.display_name,
            is_mandatory=d.is_mandatory,
            description=d.description
        )
        db.add(doc)

    db.commit()
    db.refresh(new_scheme)

    audit_service.log(
        db,
        action="Create Scheme",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        details=f"Created scheme {new_scheme.code} - {new_scheme.name}"
    )

    return new_scheme

@router.post("/{scheme_id}/rules", response_model=SchemeRuleSchema)
def add_scheme_rule(
    scheme_id: int,
    rule_in: SchemeRuleSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    new_rule = SchemeRule(
        scheme_id=scheme_id,
        field_name=rule_in.field_name,
        operator=rule_in.operator,
        target_value=rule_in.target_value,
        severity=rule_in.severity,
        description=rule_in.description
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    audit_service.log(
        db,
        action="Configure Scheme Rule",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        details=f"Added rule {new_rule.field_name} {new_rule.operator} {new_rule.target_value} to {scheme.code}"
    )
    return new_rule

@router.delete("/{scheme_id}/rules/{rule_id}")
def delete_scheme_rule(
    scheme_id: int,
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    rule = db.query(SchemeRule).filter(SchemeRule.id == rule_id, SchemeRule.scheme_id == scheme_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    db.delete(rule)
    db.commit()
    return {"status": "success", "message": "Rule removed"}
