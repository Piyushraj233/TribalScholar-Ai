from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import engine, Base
from .routers import (
    auth_router,
    schemes_router,
    applications_router,
    documents_router,
    eligibility_router,
    ai_router,
    admin_router,
    knowledge_router,
    notifications_router
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Enabled Scholarship & Fellowship Management System for Scheduled Tribes (SIH 2026 Grand Prototype)"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files directory for document preview
app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(schemes_router.router, prefix="/api")
app.include_router(applications_router.router, prefix="/api")
app.include_router(documents_router.router, prefix="/api")
app.include_router(eligibility_router.router, prefix="/api")
app.include_router(ai_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(knowledge_router.router, prefix="/api")
app.include_router(notifications_router.router, prefix="/api")

@app.get("/")
def root():
    return {
        "portal": "TribalScholar AI — Ministry of Tribal Affairs Prototype",
        "status": "Operational",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
