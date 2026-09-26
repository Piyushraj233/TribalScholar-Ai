from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    mobile = Column(String(20), nullable=True)
    role = Column(String(30), default="applicant", index=True)  # applicant, reviewer, admin, superadmin
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("ApplicantProfile", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="applicant")
    notifications = relationship("Notification", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class ApplicantProfile(Base):
    __tablename__ = "applicant_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    dob = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    st_status = Column(String(20), default="ST")
    st_tribe_name = Column(String(100), nullable=True)
    st_certificate_no = Column(String(100), nullable=True)
    st_issuing_authority = Column(String(150), nullable=True)
    highest_qualification = Column(String(100), nullable=True)
    institution = Column(String(200), nullable=True)
    course = Column(String(150), nullable=True)
    percentage = Column(Float, nullable=True)
    year_of_completion = Column(Integer, nullable=True)
    bank_name = Column(String(150), nullable=True)
    account_no = Column(String(50), nullable=True)
    ifsc = Column(String(30), nullable=True)
    account_holder = Column(String(150), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)  # NFST, NOS, TCES, ST_PRE_MATRIC
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    education_level = Column(String(100), nullable=False)  # Ph.D / M.Phil, Masters / Ph.D Abroad, Undergraduate, Post-Graduate
    study_location = Column(String(100), nullable=False)  # Indian Universities, Top 500 QS World Ranking Universities, etc.
    financial_assistance = Column(String(255), nullable=False)  # ₹31,000 to ₹35,000 / month + Contingency
    slots = Column(Integer, default=750)
    deadline = Column(String(50), nullable=False)
    status = Column(String(30), default="Active")  # Active, Closed, Upcoming
    is_prototype = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    rules = relationship("SchemeRule", back_populates="scheme", cascade="all, delete-orphan")
    doc_requirements = relationship("SchemeDocumentRequirement", back_populates="scheme", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="scheme")


class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    field_name = Column(String(100), nullable=False)  # category, percentage, qualification, admission_status, etc.
    operator = Column(String(50), nullable=False)  # equals, gte, lte, in, required
    target_value = Column(String(255), nullable=True)  # ST, 55, Master Degree, etc.
    severity = Column(String(30), default="Mandatory")  # Mandatory, Recommended
    description = Column(String(255), nullable=False)

    scheme = relationship("Scheme", back_populates="rules")


class SchemeDocumentRequirement(Base):
    __tablename__ = "scheme_document_requirements"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    document_type = Column(String(100), nullable=False)  # ST_CERTIFICATE, MARKSHEET, DEGREE_CERTIFICATE, ADMISSION_PROOF, INCOME_CERTIFICATE, PASSPORT
    display_name = Column(String(150), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)

    scheme = relationship("Scheme", back_populates="doc_requirements")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    status = Column(String(50), default="Draft", index=True)
    # Draft, Submitted, Document Verification, Eligibility Check, Scrutiny, Deficiency, Resubmitted, Selected, Not Selected, Completed
    stage = Column(String(50), default="Application Submitted")
    # Application Submitted -> Document Verification -> Eligibility Verification -> Scrutiny -> Selection -> Final Communication -> Post-Selection
    submission_date = Column(DateTime, nullable=True)
    eligibility_status = Column(String(50), default="Pending")  # Eligible, Needs Review, Ineligible
    document_status = Column(String(50), default="Pending")  # Verified, Issues Detected, Pending Resubmission, Complete
    current_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applicant = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
    answers = relationship("ApplicationAnswer", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="application", cascade="all, delete-orphan")
    deficiencies = relationship("Deficiency", back_populates="application", cascade="all, delete-orphan")
    workflow_events = relationship("WorkflowEvent", back_populates="application", cascade="all, delete-orphan")


class ApplicationAnswer(Base):
    __tablename__ = "application_answers"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    section_name = Column(String(100), nullable=False)  # Personal, Social, Academic, Fellowship, Overseas, Bank, Declaration
    field_name = Column(String(100), nullable=False)
    field_value = Column(Text, nullable=True)

    application = relationship("Application", back_populates="answers")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String(100), nullable=False)  # ST_CERTIFICATE, MARKSHEET, DEGREE_CERTIFICATE, ADMISSION_PROOF, INCOME_CERTIFICATE, PASSPORT
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    status = Column(String(50), default="Uploaded")  # Uploaded, Processing, Verified, Deficiency, Rejected
    upload_date = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="documents")
    extraction = relationship("DocumentExtraction", back_populates="document", uselist=False, cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="document", cascade="all, delete-orphan")
    deficiencies = relationship("Deficiency", back_populates="document")


class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), unique=True, nullable=False)
    ocr_engine = Column(String(50), default="TribalOCR-v2 + OpenCV Preprocessing")
    raw_text = Column(Text, nullable=True)
    extracted_fields_json = Column(Text, nullable=True)  # JSON dictionary of key-values
    confidence_score = Column(Float, default=0.95)
    quality_score = Column(Float, default=0.92)
    is_blurry = Column(Boolean, default=False)
    is_skewed = Column(Boolean, default=False)
    processed_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extraction")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    check_type = Column(String(100), nullable=False)  # OCR_EXTRACTION, NAME_MATCH, DOB_MATCH, INSTITUTION_MATCH, CATEGORY_MATCH, QUALITY_CHECK
    status = Column(String(30), default="PASS")  # PASS, WARNING, FAIL
    confidence_score = Column(Float, default=0.95)
    field_checked = Column(String(100), nullable=True)
    expected_value = Column(String(255), nullable=True)
    actual_value = Column(String(255), nullable=True)
    similarity_score = Column(Float, default=1.0)
    message = Column(String(255), nullable=False)
    recommendation = Column(String(255), nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="verification_results")
    document = relationship("Document", back_populates="verification_results")


class Deficiency(Base):
    __tablename__ = "deficiencies"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(30), default="Medium")  # Low, Medium, High, Critical
    status = Column(String(30), default="OPEN")  # OPEN, RESOLVED, WAIVED
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resubmitted_file_id = Column(Integer, nullable=True)

    application = relationship("Application", back_populates="deficiencies")
    document = relationship("Document", back_populates="deficiencies")


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    stage = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    actor_role = Column(String(50), default="AI_AGENT")  # AI_AGENT, APPLICANT, REVIEWER, SUPER_ADMIN
    actor_id = Column(String(100), nullable=True)
    event_time = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="workflow_events")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="info")  # info, warning, success, error
    channel = Column(String(30), default="in_app")  # in_app, email, sms
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Scheme Guidelines, Government Notification, FAQs, Circular
    file_name = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    source_type = Column(String(50), default="OFFICIAL_CIRCULAR")
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False)
    section_title = Column(String(200), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)

    document = relationship("KnowledgeDocument", back_populates="chunks")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(30), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    intent = Column(String(50), nullable=True)  # SCHEME_QA, DOCUMENT_QA, APPLICATION_STATUS, GENERAL
    sources_json = Column(Text, nullable=True)  # Citations list in JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(150), nullable=True)
    user_role = Column(String(50), nullable=False)
    application_no = Column(String(50), nullable=True, index=True)
    action = Column(String(150), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    actor_type = Column(String(30), default="HUMAN")  # HUMAN, AI_AGENT
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
