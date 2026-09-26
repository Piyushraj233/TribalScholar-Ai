from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Notification, User
from ..schemas import NotificationResponse
from ..auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifs

@router.put("/{notif_id}/read")
def mark_notification_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    db.commit()
    return {"status": "success", "is_read": True}

@router.post("/send-mock")
def send_mock_notification(
    channel: str,
    recipient: str,
    message: str
):
    return {
        "status": "delivered",
        "channel": channel,  # in_app, sms, email
        "recipient": recipient,
        "message": message,
        "gateway_ref": "GOV-NIC-SMS-2026-OK"
    }
