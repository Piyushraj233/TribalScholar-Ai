from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    mobile: Optional[str] = None
    role: Optional[str] = "applicant"
    state: Optional[str] = None
    district: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    mobile: Optional[str] = None
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OTPRequest(BaseModel):
    mobile: str
    email: Optional[str] = None

class OTPVerify(BaseModel):
    mobile: str
    otp: str

# Profile schemas
class ApplicantProfileSchema(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    st_status: Optional[str] = "ST"
    st_tribe_name: Optional[str] = None
    st_certificate_no: Optional[str] = None
    st_issuing_authority: Optional[str] = None
    highest_qualification: Optional[str] = None
    institution: Optional[str] = None
    course: Optional[str] = None
    percentage: Optional[float] = None
    year_of_completion: Optional[int] = None
    bank_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc: Optional[str] = None
    account_holder: Optional[str] = None

# Scheme schemas
class SchemeRuleSchema(BaseModel):
    id: Optional[int] = None
    field_name: str
    operator: str  # equals, gte, lte, in, required
    target_value: Optional[str] = None
    severity: str = "Mandatory"
    description: str

    class Config:
        from_attributes = True

class DocRequirementSchema(BaseModel):
    id: Optional[int] = None
    document_type: str
    display_name: str
    is_mandatory: bool = True
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SchemeResponse(BaseModel):
    id: int
    code: str
    name: str
    description: str
    education_level: str
    study_location: str
    financial_assistance: str
    slots: int
    deadline: str
    status: str
    is_prototype: bool
    rules: List[SchemeRuleSchema] = []
    doc_requirements: List[DocRequirementSchema] = []

    class Config:
        from_attributes = True

class SchemeCreate(BaseModel):
    code: str
    name: str
    description: str
    education_level: str
    study_location: str
    financial_assistance: str
    slots: int = 500
    deadline: str
    status: str = "Active"
    is_prototype: bool = True
    rules: List[SchemeRuleSchema] = []
    doc_requirements: List[DocRequirementSchema] = []

# Application schemas
class ApplicationAnswerSchema(BaseModel):
    section_name: str
    field_name: str
    field_value: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    scheme_id: int
    answers: List[ApplicationAnswerSchema] = []

class DocumentExtractionResponse(BaseModel):
    id: int
    ocr_engine: str
    raw_text: Optional[str] = None
    extracted_fields_json: Optional[str] = None
    confidence_score: float
    quality_score: float
    is_blurry: bool
    is_skewed: bool

    class Config:
        from_attributes = True

class VerificationResultResponse(BaseModel):
    id: int
    check_type: str
    status: str
    confidence_score: float
    field_checked: Optional[str] = None
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    similarity_score: float
    message: str
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True

class DeficiencyResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    title: str
    description: str
    severity: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    application_id: int
    document_type: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    status: str
    upload_date: datetime
    extraction: Optional[DocumentExtractionResponse] = None
    verification_results: List[VerificationResultResponse] = []

    class Config:
        from_attributes = True

class WorkflowEventResponse(BaseModel):
    id: int
    stage: str
    title: str
    description: Optional[str] = None
    actor_role: str
    event_time: datetime

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    application_no: str
    user_id: int
    scheme_id: int
    status: str
    stage: str
    submission_date: Optional[datetime] = None
    eligibility_status: str
    document_status: str
    current_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    scheme: Optional[SchemeResponse] = None
    applicant: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    answers: List[ApplicationAnswerSchema] = []
    documents: List[DocumentResponse] = []
    verification_results: List[VerificationResultResponse] = []
    deficiencies: List[DeficiencyResponse] = []
    workflow_events: List[WorkflowEventResponse] = []

    class Config:
        from_attributes = True

# Eligibility analysis schemas
class RuleEvaluationItem(BaseModel):
    field_name: str
    operator: str
    target_value: Optional[str] = None
    actual_value: Optional[str] = None
    status: str  # PASS, WARNING, FAIL
    severity: str
    message: str

class EligibilityEvaluationResponse(BaseModel):
    overall_status: str  # Eligible, Eligible — Pending Human Verification, Ineligible
    passed_count: int
    warning_count: int
    failed_count: int
    rule_results: List[RuleEvaluationItem] = []
    document_results: List[Dict[str, Any]] = []
    summary_explanation: str
    recommendations: List[str] = []

# Review Action schemas
class AdminReviewAction(BaseModel):
    action: str  # APPROVE, REQUEST_CORRECTION, MANUAL_REVIEW, ADVANCE_SCRUTINY, SELECT, REJECT
    remarks: str
    deficiency_title: Optional[str] = None
    deficiency_description: Optional[str] = None
    target_document_id: Optional[int] = None

# Chat and AI Assistant schemas
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    application_no: Optional[str] = None

class SourceCitation(BaseModel):
    document_title: str
    section: str
    page: Optional[int] = 1
    snippet: str
    confidence: float

class ChatResponse(BaseModel):
    session_id: str
    role: str = "assistant"
    content: str
    intent: str
    sources: List[SourceCitation] = []

class DocumentQARequest(BaseModel):
    document_id: Optional[int] = None
    file_name: Optional[str] = None
    question: str

# Audit Log schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: str
    application_no: Optional[str] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    details: Optional[str] = None
    actor_type: str
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    channel: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard stats
class AdminDashboardStats(BaseModel):
    total_applications: int
    under_review: int
    eligible: int
    deficiency: int
    selected: int
    processing_time_avg_days: float
    state_breakdown: List[Dict[str, Any]]
    scheme_breakdown: List[Dict[str, Any]]
    funnel_breakdown: List[Dict[str, Any]]
    deficiency_types: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
