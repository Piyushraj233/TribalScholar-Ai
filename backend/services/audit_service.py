from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from ..models import AuditLog

class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        user_role: str,
        user_name: Optional[str] = "System",
        user_id: Optional[int] = None,
        application_no: Optional[str] = None,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        details: Optional[str] = None,
        actor_type: str = "HUMAN",
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            application_no=application_no,
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            details=details,
            actor_type=actor_type,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

audit_service = AuditService()
