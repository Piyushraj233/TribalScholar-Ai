import json
from datetime import datetime, timedelta
from pathlib import Path
from .database import engine, SessionLocal, Base
from .models import (
    User, ApplicantProfile, Scheme, SchemeRule, SchemeDocumentRequirement,
    Application, ApplicationAnswer, Document, DocumentExtraction,
    VerificationResult, Deficiency, WorkflowEvent, Notification,
    KnowledgeDocument, KnowledgeChunk, AuditLog
)
from .auth import hash_password
from .config import settings

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Scheme).count() > 0:
        print("Database already contains seed data. Refreshing demo instances...")
        # Clear existing to ensure clean demo environment
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(WorkflowEvent).delete()
        db.query(Deficiency).delete()
        db.query(VerificationResult).delete()
        db.query(DocumentExtraction).delete()
        db.query(Document).delete()
        db.query(ApplicationAnswer).delete()
        db.query(Application).delete()
        db.query(SchemeDocumentRequirement).delete()
        db.query(SchemeRule).delete()
        db.query(Scheme).delete()
        db.query(KnowledgeChunk).delete()
        db.query(KnowledgeDocument).delete()
        db.query(ApplicantProfile).delete()
        db.query(User).delete()
        db.commit()

    print("Seeding TribalScholar AI database...")

    # 1. SCHEMES & CONFIGURABLE RULES
    # Scheme 1: NFST
    nfst = Scheme(
        code="NFST",
        name="National Fellowship for Scheduled Tribes (NFST)",
        description="Flagship central fellowship supporting meritorious ST scholars to pursue regular full-time M.Phil and Ph.D. degrees in Science, Engineering, Humanities, and Social Sciences at UGC/AICTE recognized institutions.",
        education_level="Ph.D. / M.Phil (Regular)",
        study_location="Indian Central & State Universities, IITs, NITs, IISc",
        financial_assistance="JRF @ ₹31,000/mo (Years 1-2), SRF @ ₹35,000/mo (Years 3-5) + ₹12,000/yr Contingency + HRA",
        slots=750,
        deadline="30 Nov 2026",
        status="Active",
        is_prototype=False
    )
    db.add(nfst)
    db.commit()

    # NFST Rules
    nfst_rules = [
        SchemeRule(scheme_id=nfst.id, field_name="category", operator="equals", target_value="ST", severity="Mandatory", description="Must belong to a notified Scheduled Tribe community in India"),
        SchemeRule(scheme_id=nfst.id, field_name="percentage", operator="gte", target_value="55", severity="Mandatory", description="Minimum 55% aggregate marks in Master's / Post-Graduate degree"),
        SchemeRule(scheme_id=nfst.id, field_name="admission_status", operator="equals", target_value="Confirmed", severity="Mandatory", description="Regular full-time doctoral registration in recognized institution"),
        SchemeRule(scheme_id=nfst.id, field_name="other_fellowships", operator="equals", target_value="None", severity="Mandatory", description="Must not hold dual central or state research stipends simultaneously"),
    ]
    for r in nfst_rules:
        db.add(r)

    # NFST Doc Requirements
    nfst_docs = [
        SchemeDocumentRequirement(scheme_id=nfst.id, document_type="ST_CERTIFICATE", display_name="Scheduled Tribe (ST) Certificate", is_mandatory=True, description="Digitally verified caste certificate issued by SDM/DM/Tehsildar"),
        SchemeDocumentRequirement(scheme_id=nfst.id, document_type="MARKSHEET", display_name="Post-Graduate Consolidated Marksheet", is_mandatory=True, description="Master's degree grade card reflecting minimum 55% or CGPA"),
        SchemeDocumentRequirement(scheme_id=nfst.id, document_type="DEGREE_CERTIFICATE", display_name="Post-Graduate Degree Certificate", is_mandatory=True, description="Official convocation degree or provisional pass certificate"),
        SchemeDocumentRequirement(scheme_id=nfst.id, document_type="ADMISSION_PROOF", display_name="Ph.D. Admission / Joining Letter", is_mandatory=True, description="Official doctoral admission letter from University Registrar"),
        SchemeDocumentRequirement(scheme_id=nfst.id, document_type="RESEARCH_PROPOSAL", display_name="Synopsis / Research Proposal", is_mandatory=False, description="Brief 3-5 page research outline countersigned by Guide"),
    ]
    for d in nfst_docs:
        db.add(d)

    # Scheme 2: National Overseas Scholarship (NOS)
    nos = Scheme(
        code="NOS",
        name="National Overseas Scholarship for ST Candidates (NOS)",
        description="Provides financial assistance to selected Scheduled Tribe candidates pursuing Master's level courses and Ph.D. degrees in premier universities abroad (ranked in Top 500 QS World Rankings).",
        education_level="Master's / Ph.D. Abroad",
        study_location="Global QS Top 500 Universities (USA, UK, Canada, Australia, Germany)",
        financial_assistance="Full Tuition Fees + Annual Maintenance Allowance USD 15,400 / GBP 9,900 + Airfare + Visa & Health Insurance",
        slots=125,
        deadline="15 Oct 2026",
        status="Active",
        is_prototype=False
    )
    db.add(nos)
    db.commit()

    nos_rules = [
        SchemeRule(scheme_id=nos.id, field_name="category", operator="equals", target_value="ST", severity="Mandatory", description="Must belong to recognized Scheduled Tribe"),
        SchemeRule(scheme_id=nos.id, field_name="percentage", operator="gte", target_value="60", severity="Mandatory", description="Minimum 60% marks in qualifying degree for overseas admission"),
        SchemeRule(scheme_id=nos.id, field_name="family_income", operator="lte", target_value="800000", severity="Mandatory", description="Total family income from all sources must not exceed ₹8,00,000 per annum"),
        SchemeRule(scheme_id=nos.id, field_name="qs_ranking", operator="lte", target_value="500", severity="Mandatory", description="Foreign university must be within Top 500 in latest QS World Rankings")
    ]
    for r in nos_rules:
        db.add(r)

    nos_docs = [
        SchemeDocumentRequirement(scheme_id=nos.id, document_type="ST_CERTIFICATE", display_name="ST Caste Certificate", is_mandatory=True),
        SchemeDocumentRequirement(scheme_id=nos.id, document_type="INCOME_CERTIFICATE", display_name="Income Certificate (FY 2025-26)", is_mandatory=True),
        SchemeDocumentRequirement(scheme_id=nos.id, document_type="ADMISSION_PROOF", display_name="Unconditional Foreign Offer Letter", is_mandatory=True),
        SchemeDocumentRequirement(scheme_id=nos.id, document_type="PASSPORT", display_name="Valid Passport Copy", is_mandatory=True),
        SchemeDocumentRequirement(scheme_id=nos.id, document_type="MARKSHEET", display_name="Bachelors/Masters Transcripts", is_mandatory=True),
    ]
    for d in nos_docs:
        db.add(d)

    # Scheme 3: Top Class Education (TCES)
    tces = Scheme(
        code="TCES",
        name="Top Class Education Scheme for ST Students (TCES)",
        description="Encourages meritorious ST students who have gained admission in premier identified institutions (IITs, IIMs, AIIMS, NLUs) through full reimbursement of tuition fees and living stipends.",
        education_level="Undergraduate / Post-Graduate",
        study_location="256 Identified Premier Institutes (IIT, IIM, NIT, AIIMS, NLU)",
        financial_assistance="Full Tuition Fee Reimbursement + ₹3,000/mo Living Expense + ₹45,000 Computer Grant (One-time)",
        slots=1000,
        deadline="20 Dec 2026",
        status="Active",
        is_prototype=True
    )
    db.add(tces)
    db.commit()

    # Scheme 4: ST Fellowship for Higher Education
    st_he = Scheme(
        code="ST-HF",
        name="Tribal Research Fellowship for Climate & Indigenous Knowledge",
        description="[Prototype Scheme] Special research fellowship dedicated to doctoral inquiry into indigenous medicinal botany, climate resilience, and tribal linguistic preservation.",
        education_level="Ph.D. / Post-Doc",
        study_location="Research Centers across Central & North-East India",
        financial_assistance="Fellowship @ ₹38,000/mo + ₹25,000/yr Fieldwork Travel Grant",
        slots=150,
        deadline="31 Jan 2027",
        status="Active",
        is_prototype=True
    )
    db.add(st_he)
    db.commit()

    # 2. SEED USERS (ADMINS & REVIEWERS)
    admin_user = User(
        email="admin@tribalscholar.gov.in",
        password_hash=hash_password("password123"),
        full_name="Joint Secretary (Scholarships)",
        mobile="9876543210",
        role="admin",
        state="Delhi",
        district="New Delhi",
        is_active=True
    )
    db.add(admin_user)

    reviewer_user = User(
        email="reviewer@tribalscholar.gov.in",
        password_hash=hash_password("password123"),
        full_name="Dr. Meenakshi Sahu (Scrutiny Officer)",
        mobile="9876543211",
        role="reviewer",
        state="Jharkhand",
        district="Ranchi",
        is_active=True
    )
    db.add(reviewer_user)

    super_admin = User(
        email="superadmin@tribalscholar.gov.in",
        password_hash=hash_password("password123"),
        full_name="Director General (Digital Governance)",
        mobile="9876543212",
        role="superadmin",
        state="Delhi",
        district="New Delhi",
        is_active=True
    )
    db.add(super_admin)
    db.commit()

    # 3. HERO APPLICANT: Rahul Kumar Singh (SIH Main Demo Scenario)
    rahul = User(
        email="rahul.singh@tribalscholar.gov.in",
        password_hash=hash_password("password123"),
        full_name="Rahul Kumar Singh",
        mobile="9823012345",
        role="applicant",
        state="Jharkhand",
        district="Ranchi",
        is_active=True
    )
    db.add(rahul)
    db.commit()

    rahul_profile = ApplicantProfile(
        user_id=rahul.id,
        dob="1998-07-14",
        gender="Male",
        st_status="ST",
        st_tribe_name="Santhal",
        st_certificate_no="ST123456",
        st_issuing_authority="Sub-Divisional Magistrate (SDM), Ranchi",
        highest_qualification="Master of Technology (Computer Science)",
        institution="National Institute of Technology Jamshedpur",
        course="Ph.D. in Computer Science & AI",
        percentage=79.5,
        year_of_completion=2024,
        bank_name="State Bank of India",
        account_no="38291048291",
        ifsc="SBIN0001234",
        account_holder="Rahul Kumar Singh"
    )
    db.add(rahul_profile)

    # HERO APPLICATION: NFST202600123
    hero_app = Application(
        application_no="NFST202600123",
        user_id=rahul.id,
        scheme_id=nfst.id,
        status="Deficiency",
        stage="Document Verification",
        submission_date=datetime.utcnow() - timedelta(days=2),
        eligibility_status="Eligible — Pending Human Verification",
        document_status="Issues Detected",
        current_remarks="AI Document Agent flagged 94% name similarity on ST Certificate (Rahul K Singh vs Rahul Kumar Singh). Manual scrutiny required.",
        created_at=datetime.utcnow() - timedelta(days=3),
        updated_at=datetime.utcnow() - timedelta(hours=4)
    )
    db.add(hero_app)
    db.commit()

    # Form Answers for Rahul
    rahul_answers = [
        ("Personal", "full_name", "Rahul Kumar Singh"),
        ("Personal", "dob", "1998-07-14"),
        ("Personal", "gender", "Male"),
        ("Personal", "state", "Jharkhand"),
        ("Personal", "district", "Ranchi"),
        ("Social", "category", "ST"),
        ("Social", "st_tribe_name", "Santhal"),
        ("Social", "certificate_no", "ST123456"),
        ("Social", "issuing_authority", "Sub-Divisional Magistrate (SDM), Ranchi"),
        ("Academic", "highest_qualification", "Post-Graduate (M.Tech)"),
        ("Academic", "institution", "National Institute of Technology Jamshedpur"),
        ("Academic", "course", "Computer Science and Engineering"),
        ("Academic", "percentage", "79.5"),
        ("Academic", "year_of_completion", "2024"),
        ("Fellowship", "research_area", "AI-Assisted Natural Language Processing for Santhali & Munda Tribal Dialects"),
        ("Fellowship", "research_institution", "National Institute of Technology Jamshedpur"),
        ("Fellowship", "admission_status", "Confirmed"),
        ("Fellowship", "other_fellowships", "None"),
        ("Bank", "bank_name", "State Bank of India"),
        ("Bank", "account_no", "38291048291"),
        ("Bank", "ifsc", "SBIN0001234"),
        ("Bank", "account_holder", "Rahul Kumar Singh"),
        ("Declaration", "declaration_agreed", "True")
    ]
    for sec, field, val in rahul_answers:
        db.add(ApplicationAnswer(application_id=hero_app.id, section_name=sec, field_name=field, field_value=val))

    # Hero Documents
    # 1. ST Certificate (Contains abbreviation: Rahul K Singh)
    doc_st = Document(
        application_id=hero_app.id,
        user_id=rahul.id,
        document_type="ST_CERTIFICATE",
        file_name="Rahul_Kumar_Singh_ST_Certificate.pdf",
        file_path="uploads/app_hero/st_cert_rahul.pdf",
        file_size=524288,
        mime_type="application/pdf",
        status="Deficiency",
        upload_date=datetime.utcnow() - timedelta(days=2)
    )
    db.add(doc_st)
    db.commit()

    # Extraction with Rahul K Singh
    ext_st = DocumentExtraction(
        document_id=doc_st.id,
        ocr_engine="TribalOCR-v2 + OpenCV Preprocessing",
        raw_text="GOVERNMENT OF JHARKHAND\nSCHEDULED TRIBE CERTIFICATE\nCertificate No: ST123456\nThis is to certify that Sri Rahul K Singh, resident of Morabadi, Ranchi belongs to Santhal community.\nSDM, Ranchi. 14/03/2022",
        extracted_fields_json=json.dumps({
            "document_type": "Scheduled Tribe Certificate",
            "extracted_name": "Rahul K Singh",
            "certificate_no": "ST123456",
            "category": "ST",
            "tribe_community": "Santhal",
            "issuing_authority": "Sub-Divisional Magistrate (SDM), Ranchi",
            "issue_date": "14/03/2022",
            "digital_signature_valid": True,
            "emblem_detected": True
        }),
        confidence_score=0.97,
        quality_score=0.95,
        is_blurry=False,
        is_skewed=False
    )
    db.add(ext_st)

    # Verification result with 94% similarity
    vr_name = VerificationResult(
        application_id=hero_app.id,
        document_id=doc_st.id,
        check_type="NAME_MATCH",
        status="WARNING",
        confidence_score=0.88,
        field_checked="Full Name",
        expected_value="Rahul Kumar Singh",
        actual_value="Rahul K Singh",
        similarity_score=0.94,
        message="Potential Name Mismatch: Application has 'Rahul Kumar Singh' while document reads 'Rahul K Singh'.",
        recommendation="Manual verification recommended by reviewer."
    )
    vr_cat = VerificationResult(
        application_id=hero_app.id,
        document_id=doc_st.id,
        check_type="CATEGORY_MATCH",
        status="PASS",
        confidence_score=0.99,
        field_checked="Social Category",
        expected_value="ST",
        actual_value="ST",
        similarity_score=1.0,
        message="Scheduled Tribe caste validity confirmed (Santhal).",
        recommendation="Passed statutory ST requirement."
    )
    db.add(vr_name)
    db.add(vr_cat)

    # Deficiency for ST Cert
    def_st = Deficiency(
        application_id=hero_app.id,
        document_id=doc_st.id,
        title="Potential Name Mismatch: Middle Name Abbreviation",
        description="Application records 'Rahul Kumar Singh' whereas ST Certificate states 'Rahul K Singh' (94% similarity). Reviewer manual verification or name affidavit recommended.",
        severity="Medium",
        status="OPEN"
    )
    db.add(def_st)

    # 2. Marksheet
    doc_marksheet = Document(
        application_id=hero_app.id,
        user_id=rahul.id,
        document_type="MARKSHEET",
        file_name="MTech_Consolidated_Marksheet_Rahul.pdf",
        file_path="uploads/app_hero/marksheet_rahul.pdf",
        file_size=748291,
        mime_type="application/pdf",
        status="Verified",
        upload_date=datetime.utcnow() - timedelta(days=2)
    )
    db.add(doc_marksheet)
    db.commit()

    ext_ms = DocumentExtraction(
        document_id=doc_marksheet.id,
        ocr_engine="TribalOCR-v2 + OpenCV Preprocessing",
        raw_text="NIT JAMSHEDPUR - CONSOLIDATED STATEMENT OF MARKS\nCandidate: Rahul Kumar Singh\nRoll No: 2021/CS/7841\nCGPA: 8.45 (79.5%)\nDivision: First Division with Distinction",
        extracted_fields_json=json.dumps({
            "document_type": "Academic Degree / Marksheet",
            "extracted_name": "Rahul Kumar Singh",
            "roll_no": "2021/CS/7841",
            "degree": "M.Tech Computer Science",
            "institution": "National Institute of Technology Jamshedpur",
            "percentage_or_cgpa": "8.45 CGPA (79.5%)",
            "year_of_passing": "2024",
            "university_seal_detected": True
        }),
        confidence_score=0.98,
        quality_score=0.96
    )
    db.add(ext_ms)

    # 3. Ph.D. Admission Proof
    doc_adm = Document(
        application_id=hero_app.id,
        user_id=rahul.id,
        document_type="ADMISSION_PROOF",
        file_name="PhD_Admission_Letter_NIT.pdf",
        file_path="uploads/app_hero/phd_admission_rahul.pdf",
        file_size=612940,
        mime_type="application/pdf",
        status="Verified",
        upload_date=datetime.utcnow() - timedelta(days=2)
    )
    db.add(doc_adm)
    db.commit()

    ext_adm = DocumentExtraction(
        document_id=doc_adm.id,
        ocr_engine="TribalOCR-v2 + OpenCV Preprocessing",
        raw_text="OFFICE OF DEAN ACADEMIC - NIT JAMSHEDPUR\nPh.D. ENROLMENT LETTER\nCandidate: Rahul Kumar Singh\nProgram: Ph.D. (Regular Full-Time)\nDept: Computer Science & Engineering\nRegistration No: PHD/CS/2025/089",
        extracted_fields_json=json.dumps({
            "document_type": "Ph.D. Admission Confirmation",
            "extracted_name": "Rahul Kumar Singh",
            "program": "Ph.D. Full-Time",
            "institution": "National Institute of Technology Jamshedpur",
            "admission_status": "Confirmed Full-Time",
            "supervisor_allocated": True
        }),
        confidence_score=0.95,
        quality_score=0.93
    )
    db.add(ext_adm)

    # 4. Degree Certificate
    doc_deg = Document(
        application_id=hero_app.id,
        user_id=rahul.id,
        document_type="DEGREE_CERTIFICATE",
        file_name="MTech_Degree_Certificate.pdf",
        file_path="uploads/app_hero/degree_cert_rahul.pdf",
        file_size=489201,
        mime_type="application/pdf",
        status="Verified",
        upload_date=datetime.utcnow() - timedelta(days=2)
    )
    db.add(doc_deg)

    # Hero Workflow Events
    db.add(WorkflowEvent(
        application_id=hero_app.id,
        stage="Application Submitted",
        title="Application Submitted by Rahul Kumar Singh",
        description="Digital declaration confirmed and application submitted for NFST Fellowship 2026.",
        actor_role="APPLICANT",
        actor_id=str(rahul.id),
        event_time=datetime.utcnow() - timedelta(days=2, hours=3)
    ))
    db.add(WorkflowEvent(
        application_id=hero_app.id,
        stage="Document Verification",
        title="AI Document Intelligence Completed",
        description="OCR extracted 4 documents. 3 passed automatically. 1 potential name mismatch flagged (Rahul Kumar Singh vs Rahul K Singh: 94%).",
        actor_role="AI_AGENT",
        actor_id="TribalScholar-DocAgent-v2",
        event_time=datetime.utcnow() - timedelta(days=2, hours=2)
    ))
    db.add(WorkflowEvent(
        application_id=hero_app.id,
        stage="Eligibility Verification",
        title="Configurable Rules Evaluated: Eligible — Pending Human Verification",
        description="Deterministic checks passed (Category=ST, Percentage=79.5% >= 55%). Human verification requested for name variation.",
        actor_role="AI_AGENT",
        actor_id="TribalScholar-RulesEngine",
        event_time=datetime.utcnow() - timedelta(days=2, hours=1)
    ))

    # Hero Notification
    db.add(Notification(
        user_id=rahul.id,
        title="Action Recommended: Document Scrutiny",
        message="Your application NFST202600123 has been reviewed by AI Document Agent. A minor name variation was noted on your ST Certificate and is queued for officer approval.",
        type="warning",
        channel="in_app"
    ))

    # 4. POPULATE 20 ADDITIONAL REALISTIC APPLICANTS ACROSS STATES
    sample_applicants = [
        ("Sunita Marandi", "sunita.marandi@example.gov.in", "Female", "Jharkhand", "Dumka", "Santhal", "M.Sc Biotechnology", 82.4, "NFST", "Scrutiny"),
        ("Birsa Munda", "birsa.munda@example.gov.in", "Male", "Jharkhand", "Khunti", "Munda", "M.Tech Mechanical", 75.0, "NFST", "Selected"),
        ("Anjali Boro", "anjali.boro@example.gov.in", "Female", "Assam", "Kokrajhar", "Boro", "M.A. Linguistics", 71.8, "NFST", "Document Verification"),
        ("Devendra Gond", "devendra.gond@example.gov.in", "Male", "Madhya Pradesh", "Dindori", "Gond", "M.Sc Forestry", 68.5, "NFST", "Eligibility Check"),
        ("Pooja Meena", "pooja.meena@example.gov.in", "Female", "Rajasthan", "Udaipur", "Meena", "M.S. Robotics (Imperial College)", 84.0, "NOS", "Selected"),
        ("Rameshwar Oraon", "rameshwar.oraon@example.gov.in", "Male", "Chhattisgarh", "Jashpur", "Oraon", "Ph.D. Renewable Energy", 77.2, "NFST", "Scrutiny"),
        ("Lalita Naik", "lalita.naik@example.gov.in", "Female", "Odisha", "Mayurbhanj", "Ho", "B.Tech Computer Science", 88.2, "TCES", "Completed"),
        ("Kavita Bhil", "kavita.bhil@example.gov.in", "Female", "Gujarat", "Dahod", "Bhil", "M.Pharm Pharmacology", 74.0, "NFST", "Deficiency"),
        ("Hemant Warli", "hemant.warli@example.gov.in", "Male", "Maharashtra", "Palghar", "Warli", "M.A. Indigenous Art", 70.5, "ST-HF", "Scrutiny"),
        ("Roshni Khasi", "roshni.khasi@example.gov.in", "Female", "Meghalaya", "Shillong", "Khasi", "M.Sc Ecology (Oxford)", 86.5, "NOS", "Scrutiny"),
        ("Prakash Rathwa", "prakash.rathwa@example.gov.in", "Male", "Gujarat", "Chhota Udaipur", "Rathwa", "M.Tech Civil Engg", 66.4, "NFST", "Document Verification"),
        ("Geeta Jamatia", "geeta.jamatia@example.gov.in", "Female", "Tripura", "Khowai", "Tripuri", "M.Sc Botany", 78.0, "NFST", "Selected"),
        ("Subhash Kol", "subhash.kol@example.gov.in", "Male", "Madhya Pradesh", "Rewa", "Kol", "M.Sc Chemistry", 64.2, "NFST", "Not Selected"),
        ("Deepika Angami", "deepika.angami@example.gov.in", "Female", "Nagaland", "Kohima", "Angami", "M.Sc Environmental Engg (ANU)", 81.0, "NOS", "Selected"),
        ("Manoj Korwa", "manoj.korwa@example.gov.in", "Male", "Chhattisgarh", "Balrampur", "Pahari Korwa", "M.A. Sociology", 72.0, "ST-HF", "Resubmitted"),
        ("Shweta Baiga", "shweta.baiga@example.gov.in", "Female", "Madhya Pradesh", "Mandla", "Baiga", "M.Sc Traditional Medicine", 80.5, "ST-HF", "Scrutiny"),
        ("Arun Sahariya", "arun.sahariya@example.gov.in", "Male", "Rajasthan", "Baran", "Sahariya", "B.Tech Electrical", 73.0, "TCES", "Eligibility Check"),
        ("Nandini Kondh", "nandini.kondh@example.gov.in", "Female", "Odisha", "Rayagada", "Kondh", "M.Sc Agriculture", 76.5, "NFST", "Scrutiny"),
        ("Ajay Tharu", "ajay.tharu@example.gov.in", "Male", "Uttarakhand", "Udham Singh Nagar", "Tharu", "M.Tech VLSI", 83.0, "NFST", "Selected"),
    ]

    for idx, (name, email, gender, state, dist, tribe, qual, pct, scheme_code, app_status) in enumerate(sample_applicants):
        u = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name=name,
            mobile=f"98{idx:02d}102938",
            role="applicant",
            state=state,
            district=dist,
            is_active=True
        )
        db.add(u)
        db.commit()

        # Profile
        prof = ApplicantProfile(
            user_id=u.id,
            dob="1999-04-12",
            gender=gender,
            st_status="ST",
            st_tribe_name=tribe,
            st_certificate_no=f"ST{state[:2].upper()}{idx:04d}",
            st_issuing_authority=f"District Magistrate, {dist}",
            highest_qualification=qual,
            institution=f"Central University of {state}",
            percentage=pct,
            account_holder=name
        )
        db.add(prof)

        # Target scheme
        target_scheme = nfst
        if scheme_code == "NOS":
            target_scheme = nos
        elif scheme_code == "TCES":
            target_scheme = tces
        elif scheme_code == "ST-HF":
            target_scheme = st_he

        # Application
        app_no = f"{scheme_code}2026{idx+200:04d}"
        elig_status = "Eligible" if app_status in ["Selected", "Scrutiny", "Completed"] else "Pending"
        if app_status == "Not Selected":
            elig_status = "Ineligible"
        elif app_status == "Deficiency":
            elig_status = "Eligible — Pending Human Verification"

        application = Application(
            application_no=app_no,
            user_id=u.id,
            scheme_id=target_scheme.id,
            status=app_status,
            stage="Selection" if app_status == "Selected" else ("Scrutiny" if app_status in ["Scrutiny", "Completed"] else "Document Verification"),
            submission_date=datetime.utcnow() - timedelta(days=idx+4),
            eligibility_status=elig_status,
            document_status="Verified" if app_status not in ["Deficiency", "Document Verification"] else "Pending",
            created_at=datetime.utcnow() - timedelta(days=idx+5)
        )
        db.add(application)
        db.commit()

        # Add sample document
        doc = Document(
            application_id=application.id,
            user_id=u.id,
            document_type="ST_CERTIFICATE",
            file_name=f"{name.replace(' ', '_')}_ST_Cert.pdf",
            file_path=f"uploads/app_{application.id}/st_cert.pdf",
            file_size=420000,
            status="Verified" if app_status != "Deficiency" else "Deficiency"
        )
        db.add(doc)

    # 5. KNOWLEDGE BASE & OFFICIAL GUIDELINE DOCUMENTS FOR RAG
    kb_docs = [
        {
            "title": "NFST Guidelines 2025-2026 (Official Scheme Manual)",
            "category": "Scheme Guidelines",
            "file_name": "NFST_Guidelines_2025_26.pdf",
            "summary": "Full regulatory framework for National Fellowship for ST candidates pursuing M.Phil and Ph.D. degrees, covering tenure, allowances, eligibility and digital verification.",
            "chunks": [
                ("Clause 1: Eligibility and Minimum Educational Qualifications", "To be eligible for NFST, candidate must belong to a notified Scheduled Tribe community. Candidate must have secured minimum 55% marks in Master's degree examination from a recognized university. Candidate must be registered in regular and full-time M.Phil/Ph.D. courses in Universities/Institutions recognized by UGC.", 1),
                ("Clause 2: Financial Entitlements and Direct Benefit Transfer (DBT)", "Fellowship rate: Junior Research Fellow (JRF) @ ₹31,000/- p.m. for initial two years. Senior Research Fellow (SRF) @ ₹35,000/- p.m. for remaining tenure of 3 years. Contingency grant of ₹10,000/- p.a. for Humanities and Social Sciences and ₹12,000/- p.a. for Science, Engineering and Technology. Monthly disbursements are linked directly to Scholar bank accounts via Aadhaar Payment Bridge.", 2),
                ("Clause 3: Mandatory Document Checklist Dossier", "Every applicant must upload: 1. ST Certificate issued by Competent Authority (SDM/DM/Tehsildar). 2. Consolidated Master's Degree Marksheet. 3. Ph.D. confirmed admission letter. 4. Aadhaar-seeded Bank Account Passbook copy. Incomplete documentation leads to immediate deficiency flag.", 3),
                ("Clause 4: Rectification of Deficiencies and Name Discrepancies", "If the name on the ST Certificate exhibits spelling variations or middle-name initials (e.g. Rahul Kumar Singh vs Rahul K Singh), scrutiny officers are empowered to accept a formal affidavit or university registrar certificate confirming applicant identity without canceling application.", 4)
            ]
        },
        {
            "title": "National Overseas Scholarship (NOS) Official Regulations",
            "category": "Scheme Guidelines",
            "file_name": "National_Overseas_Scholarship_Manual.pdf",
            "summary": "Rules governing overseas educational grants for ST students in QS Top 500 universities abroad.",
            "chunks": [
                ("Section 2.1: Foreign Institution Ranking Criteria", "Scholarships under NOS are strictly restricted to institutions ranked in the Top 500 QS World University Rankings. Unconditional admission letters from such institutions are mandatory prior to final selection.", 1),
                ("Section 3.2: Annual Family Income Ceiling", "Total family income from all sources should not exceed ₹8,00,000 (Rupees Eight Lakhs) per annum. An authentic Income Certificate issued by an Executive Magistrate or Revenue Officer is mandatory.", 2)
            ]
        },
        {
            "title": "Tribal Affairs Scrutiny Manual: AI and Human Review Workflow",
            "category": "Official Circulars",
            "file_name": "Tribal_Affairs_Circular_Doc_Scrutiny.pdf",
            "summary": "Standard Operating Procedure (SOP) on Human-in-the-Loop decision making, AI OCR confidence score interpretation, and audit trails.",
            "chunks": [
                ("SOP 1.3: Human-in-the-Loop Imperative", "AI Document Intelligence serves strictly as a decision-support system. No scholarship application can be denied or rejected solely through automated algorithms. Every adverse finding must be examined and signed off by a designated Human Scrutiny Officer.", 1),
                ("SOP 2.4: Resolution Protocols for Missing Documents", "Applicants who receive an automated Deficiency notice are granted a 15-day rectification window to upload requested affidavits or clear scans. Seniority of application is preserved during this period.", 2)
            ]
        }
    ]

    for k in kb_docs:
        kdoc = KnowledgeDocument(
            title=k["title"],
            category=k["category"],
            file_name=k["file_name"],
            summary=k["summary"],
            source_type="OFFICIAL_CIRCULAR"
        )
        db.add(kdoc)
        db.commit()

        for idx, (sec, text, pg) in enumerate(k["chunks"]):
            chunk = KnowledgeChunk(
                document_id=kdoc.id,
                section_title=sec,
                chunk_text=text,
                page_number=pg,
                chunk_index=idx
            )
            db.add(chunk)

    # 6. SEED AUDIT LOGS (Demonstrating timeline of applicant, reviewer, and AI actions)
    sample_logs = [
        ("Applicant Registration", "applicant", "Rahul Kumar Singh", "NFST202600123", None, "Registered", "Applicant registered from Ranchi, Jharkhand", "HUMAN"),
        ("Application Form Submitted", "applicant", "Rahul Kumar Singh", "NFST202600123", "Draft", "Submitted", "Submitted application for NFST Fellowship 2026", "HUMAN"),
        ("AI OCR Pipeline Executed", "AI_AGENT", "TribalScholar AI Agent", "NFST202600123", "Submitted", "Document Verification", "OCR extracted ST Certificate, Marksheet, and Admission Letter with 96% avg confidence", "AI_AGENT"),
        ("Name Mismatch Detected", "AI_AGENT", "TribalScholar AI Agent", "NFST202600123", "Document Verification", "Deficiency", "Flagged 94% similarity: Rahul Kumar Singh vs Rahul K Singh. Deficiency raised.", "AI_AGENT"),
        ("Manual Review Requested", "reviewer", "Dr. Meenakshi Sahu", "NFST202600123", "Deficiency", "Document Verification", "Reviewer opened split-screen review for application NFST202600123", "HUMAN"),
        ("Scheme Configuration Updated", "admin", "Joint Secretary", None, None, None, "Updated mandatory rules for NFST 2026", "HUMAN"),
    ]

    for action, role, name, app_no, prev_s, new_s, det, actor_t in sample_logs:
        db.add(AuditLog(
            user_name=name,
            user_role=role,
            application_no=app_no,
            action=action,
            previous_status=prev_s,
            new_status=new_s,
            details=det,
            actor_type=actor_t,
            timestamp=datetime.utcnow() - timedelta(hours=len(sample_logs)*3)
        ))

    db.commit()
    db.close()
    print("Database seeding completed successfully with Hero scenario NFST202600123!")

if __name__ == "__main__":
    run_seed()
