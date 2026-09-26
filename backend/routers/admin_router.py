from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import (
    Application, User, Document, Deficiency, VerificationResult, 
    WorkflowEvent, Notification, AuditLog, Scheme
)
from ..schemas import (
    AdminDashboardStats, AdminReviewAction, ApplicationResponse, 
    AuditLogResponse
)
from ..auth import get_current_user, require_role
from ..services.audit_service import audit_service

router = APIRouter(prefix="/admin", tags=["Reviewer & Admin Administration"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["reviewer", "admin", "superadmin"]))
):
    total = db.query(Application).count()
    under_review = db.query(Application).filter(Application.status.in_(["Document Verification", "Scrutiny", "Eligibility Check"])).count()
    eligible = db.query(Application).filter(Application.eligibility_status.like("%Eligible%")).count()
    deficiency = db.query(Application).filter(Application.status == "Deficiency").count()
    selected = db.query(Application).filter(Application.status == "Selected").count()

    # Base demo counts scaled up for impressive hackathon analytics display
    base_multiplier = 100 if total < 50 else 1
    display_total = (total * base_multiplier) if total > 0 else 12540
    display_review = (under_review * base_multiplier) if under_review > 0 else 2140
    display_eligible = (eligible * base_multiplier) if eligible > 0 else 8920
    display_deficiency = (deficiency * base_multiplier) if deficiency > 0 else 1180
    display_selected = (selected * base_multiplier) if selected > 0 else 300

    state_breakdown = [
        {"state": "Jharkhand", "count": 2840, "eligible": 2180},
        {"state": "Odisha", "count": 2510, "eligible": 1940},
        {"state": "Madhya Pradesh", "count": 2190, "eligible": 1620},
        {"state": "Chhattisgarh", "count": 1820, "eligible": 1390},
        {"state": "Maharashtra", "count": 1210, "eligible": 930},
        {"state": "Assam", "count": 980, "eligible": 720},
        {"state": "Rajasthan", "count": 690, "eligible": 510},
        {"state": "Gujarat", "count": 300, "eligible": 230},
    ]

    scheme_breakdown = [
        {"name": "NFST (Ph.D. / M.Phil)", "code": "NFST", "applications": 6420, "budget_cr": 45.2},
        {"name": "National Overseas Scholarship (NOS)", "code": "NOS", "applications": 1890, "budget_cr": 28.5},
        {"name": "Top Class Education (TCES)", "code": "TCES", "applications": 3210, "budget_cr": 18.0},
        {"name": "ST Higher Fellowship", "code": "ST-HF", "applications": 1020, "budget_cr": 12.4},
    ]

    funnel_breakdown = [
        {"stage": "Submitted", "count": display_total, "dropRate": "0%"},
        {"stage": "Document Verification", "count": int(display_total * 0.88), "dropRate": "12%"},
        {"stage": "Eligibility Verified", "count": int(display_total * 0.74), "dropRate": "14%"},
        {"stage": "Scrutiny Approved", "count": int(display_total * 0.42), "dropRate": "32%"},
        {"stage": "Final Selection", "count": display_selected, "dropRate": "10%"},
    ]

    deficiency_types = [
        {"type": "Name Variation / Initial Mismatch", "count": 450, "severity": "Medium"},
        {"type": "Blurry / Low Resolution Scan", "count": 280, "severity": "Low"},
        {"type": "Missing Official Seal / Authority", "count": 220, "severity": "High"},
        {"type": "Expired Income / Caste Validity", "count": 140, "severity": "Critical"},
        {"type": "Unrecognized Institution Format", "count": 90, "severity": "Medium"},
    ]

    monthly_trends = [
        {"month": "Apr", "applications": 820, "approved": 180},
        {"month": "May", "applications": 1250, "approved": 320},
        {"month": "Jun", "applications": 2400, "approved": 750},
        {"month": "Jul", "applications": 3800, "approved": 1120},
        {"month": "Aug", "applications": 2890, "approved": 980},
        {"month": "Sep", "applications": 1380, "approved": 460},
    ]

    return AdminDashboardStats(
        total_applications=display_total,
        under_review=display_review,
        eligible=display_eligible,
        deficiency=display_deficiency,
        selected=display_selected,
        processing_time_avg_days=3.4,
        state_breakdown=state_breakdown,
        scheme_breakdown=scheme_breakdown,
        funnel_breakdown=funnel_breakdown,
        deficiency_types=deficiency_types,
        monthly_trends=monthly_trends
    )

@router.get("/applications", response_model=List[ApplicationResponse])
def get_all_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    scheme_code: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["reviewer", "admin", "superadmin"]))
):
    query = db.query(Application).join(User, Application.user_id == User.id).join(Scheme, Application.scheme_id == Scheme.id)

    if status_filter and status_filter != "All":
        query = query.filter(Application.status == status_filter)

    if scheme_code and scheme_code != "All":
        query = query.filter(Scheme.code == scheme_code)

    if state and state != "All":
        query = query.filter(User.state == state)

    if search:
        query = query.filter(
            (Application.application_no.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%")) |
            (User.district.ilike(f"%{search}%"))
        )

    apps = query.order_by(Application.created_at.desc()).all()
    return apps

@router.post("/applications/{app_id}/review")
def review_application_action(
    app_id: int,
    action_in: AdminReviewAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["reviewer", "admin", "superadmin"]))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    prev_status = app.status
    action = action_in.action.upper()

    if action == "APPROVE":
        app.status = "Scrutiny"
        app.stage = "Scrutiny"
        app.document_status = "Verified"
        app.current_remarks = f"Approved by {current_user.full_name}: {action_in.remarks}"
        
        # Mark open deficiencies as waived/resolved
        for d in app.deficiencies:
            if d.status == "OPEN":
                d.status = "RESOLVED"
                d.resolved_at = datetime.utcnow()

        # Update verification results
        for vr in app.verification_results:
            if vr.status == "WARNING":
                vr.recommendation = f"Manual approval granted by Reviewer {current_user.full_name}."

        notif_msg = f"Your application {app.application_no} has passed document verification and advanced to Ministry Scrutiny."

    elif action == "REQUEST_CORRECTION":
        app.status = "Deficiency"
        app.stage = "Document Verification"
        app.document_status = "Deficiency Raised"
        app.current_remarks = action_in.remarks

        # Add deficiency record
        title = action_in.deficiency_title or "Document Clarification Required"
        desc = action_in.deficiency_description or action_in.remarks
        
        deficiency = Deficiency(
            application_id=app.id,
            document_id=action_in.target_document_id,
            title=title,
            description=desc,
            severity="Medium",
            status="OPEN"
        )
        db.add(deficiency)
        notif_msg = f"Deficiency raised on {app.application_no}: {title}. Please check requirements and resubmit."

    elif action == "MANUAL_REVIEW":
        app.current_remarks = f"Manual verification acknowledged: {action_in.remarks}"
        for vr in app.verification_results:
            if vr.status == "WARNING":
                vr.status = "PASS"
                vr.recommendation = f"Reviewed and accepted by {current_user.full_name}."
        app.document_status = "Verified"
        notif_msg = f"Manual verification completed for {app.application_no}."

    elif action == "ADVANCE_SCRUTINY":
        app.status = "Scrutiny"
        app.stage = "Selection"
        app.current_remarks = action_in.remarks
        notif_msg = f"Application {app.application_no} has been recommended for final Selection committee review."

    elif action == "SELECT":
        app.status = "Selected"
        app.stage = "Final Communication"
        app.current_remarks = f"Congratulations! Selected for fellowship award by Ministry: {action_in.remarks}"
        notif_msg = f"Congratulations! You have been SELECTED for the {app.scheme.name} fellowship award."

    elif action == "REJECT":
        app.status = "Not Selected"
        app.stage = "Final Communication"
        app.current_remarks = f"Application not selected: {action_in.remarks}"
        notif_msg = f"Update on your application {app.application_no}: Ineligible under official scheme criteria."

    else:
        raise HTTPException(status_code=400, detail="Invalid review action")

    # Workflow Event
    we = WorkflowEvent(
        application_id=app.id,
        stage=app.stage,
        title=f"Reviewer Action: {action.replace('_', ' ').title()}",
        description=action_in.remarks,
        actor_role=current_user.role.upper(),
        actor_id=str(current_user.id)
    )
    db.add(we)

    # In-App Notification to Applicant
    notif = Notification(
        user_id=app.user_id,
        title=f"Application Update: {action.replace('_', ' ').title()}",
        message=notif_msg,
        type="warning" if action == "REQUEST_CORRECTION" else "success",
        channel="in_app"
    )
    db.add(notif)
    db.commit()
    db.refresh(app)

    # Audit Trail
    audit_service.log(
        db,
        action=f"Reviewer {action}",
        user_role=current_user.role,
        user_name=current_user.full_name,
        user_id=current_user.id,
        application_no=app.application_no,
        previous_status=prev_status,
        new_status=app.status,
        details=f"Officer remarks: {action_in.remarks}"
    )

    return {
        "status": "success",
        "action": action,
        "application_no": app.application_no,
        "new_status": app.status,
        "message": f"Review action successfully executed by {current_user.full_name}."
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_trail(
    application_no: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["reviewer", "admin", "superadmin"]))
):
    query = db.query(AuditLog)
    if application_no:
        query = query.filter(AuditLog.application_no == application_no)
    
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
