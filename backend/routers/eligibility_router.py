from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Application, WorkflowEvent, User
from ..schemas import EligibilityEvaluationResponse
from ..auth import get_current_user
from ..services.eligibility_engine import eligibility_engine
from ..services.audit_service import audit_service

router = APIRouter(prefix="/eligibility", tags=["Configurable Eligibility Engine"])

@router.post("/evaluate/{app_id}", response_model=EligibilityEvaluationResponse)
def evaluate_application_eligibility(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    scheme = app.scheme
    if not scheme:
        raise HTTPException(status_code=400, detail="Scheme not associated with this application")

    # Build answers map
    answers_dict = {}
    for ans in app.answers:
        answers_dict[ans.field_name] = ans.field_value

    uploaded_doc_types = [doc.document_type for doc in app.documents]

    # Run deterministic rules engine
    evaluation = eligibility_engine.evaluate_application(
        scheme=scheme,
        application=app,
        answers_dict=answers_dict,
        uploaded_doc_types=uploaded_doc_types
    )

    # Update application eligibility status
    prev_eligibility = app.eligibility_status
    app.eligibility_status = evaluation["overall_status"]
    
    # Workflow event
    we = WorkflowEvent(
        application_id=app.id,
        stage="Eligibility Verification",
        title=f"Eligibility Engine: {evaluation['overall_status']}",
        description=evaluation["summary_explanation"],
        actor_role="AI_AGENT",
        actor_id="TribalScholar-RulesEngine"
    )
    db.add(we)
    db.commit()
    db.refresh(app)

    audit_service.log(
        db,
        action="Rule Engine Evaluation",
        user_role="AI_AGENT",
        user_name="Eligibility Engine",
        application_no=app.application_no,
        previous_status=prev_eligibility,
        new_status=app.eligibility_status,
        details=f"Evaluation completed: {evaluation['passed_count']} passed, {evaluation['warning_count']} warnings, {evaluation['failed_count']} failed.",
        actor_type="AI_AGENT"
    )

    return evaluation
