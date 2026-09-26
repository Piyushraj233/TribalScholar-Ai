import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings:
    PROJECT_NAME: str = "TribalScholar AI"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tribalscholar-ai-secret-key-sih-2026-production-grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'tribalscholar.db'}")
    
    # File Storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: set = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
