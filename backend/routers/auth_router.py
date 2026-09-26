from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import User, ApplicantProfile, Notification
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse, OTPRequest, OTPVerify
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered.")

    new_user = User(
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        mobile=user_in.mobile,
        role=user_in.role or "applicant",
        state=user_in.state or "Jharkhand",
        district=user_in.district or "Ranchi",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize applicant profile
    profile = ApplicantProfile(
        user_id=new_user.id,
        st_status="ST",
        st_tribe_name="Santhal",
        highest_qualification="Post-Graduate",
        institution="National Institute of Technology",
        percentage=78.5,
        account_holder=new_user.full_name
    )
    db.add(profile)

    # Welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to TribalScholar AI Portal",
        message="Your digital account has been created. Explore available scholarship and fellowship schemes.",
        type="info",
        channel="in_app"
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    audit_service.log(
        db,
        action="User Registration",
        user_role=new_user.role,
        user_name=new_user.full_name,
        user_id=new_user.id,
        details=f"New user registered with role {new_user.role}"
    )

    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    audit_service.log(
        db,
        action="User Login",
        user_role=user.role,
        user_name=user.full_name,
        user_id=user.id,
        details="Successful password authentication"
    )

    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/send-otp")
def send_otp(otp_req: OTPRequest):
    # Mock OTP dispatch for government portal workflow demonstration
    return {
        "status": "success",
        "message": f"OTP successfully dispatched to registered mobile +91-XXXXXX{otp_req.mobile[-4:] if len(otp_req.mobile) >= 4 else '1234'}",
        "mock_otp": "2026",
        "expires_in_seconds": 300
    }

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(otp_ver: OTPVerify, db: Session = Depends(get_db)):
    if otp_ver.otp not in ["2026", "123456", "7890"]:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter 2026.")
    
    # Locate or create user for this mobile
    user = db.query(User).filter(User.mobile == otp_ver.mobile).first()
    if not user:
        user = db.query(User).filter(User.role == "applicant").first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Applicant account not found.")

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.post("/demo-login/{role}", response_model=TokenResponse)
def demo_login(role: str, db: Session = Depends(get_db)):
    """
    Instant role switch for hackathon judges & demo:
    - 'applicant': Rahul Kumar Singh (Demo Application NFST202600123)
    - 'reviewer': Dr. Meenakshi Sahu (Scrutiny Officer)
    - 'admin': Joint Secretary (Ministry Official)
    - 'superadmin': Director General
    """
    norm_role = role.lower()
    target_user = None

    if norm_role == "applicant":
        target_user = db.query(User).filter(User.email.like("%rahul%")).first()
    elif norm_role in ["reviewer", "scrutiny"]:
        target_user = db.query(User).filter(User.role == "reviewer").first()
    elif norm_role in ["admin", "superadmin", "ministry"]:
        target_user = db.query(User).filter(User.role.in_(["admin", "superadmin"])).first()

    if not target_user:
        target_user = db.query(User).filter(User.role == norm_role).first()
    
    if not target_user:
        target_user = db.query(User).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Demo user not found. Please run seed data.")

    token = create_access_token({"sub": str(target_user.id), "role": target_user.role, "email": target_user.email})
    audit_service.log(
        db,
        action="Quick Demo Switch",
        user_role=target_user.role,
        user_name=target_user.full_name,
        user_id=target_user.id,
        details=f"Demo fast login as {target_user.role}"
    )

    return TokenResponse(access_token=token, user=UserResponse.model_validate(target_user))
