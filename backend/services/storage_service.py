import os
import shutil
import hashlib
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..config import settings

class StorageService:
    def __init__(self, upload_dir: Path = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file: UploadFile, subfolder: str = "documents") -> dict:
        # Validate extension
        suffix = Path(file.filename).suffix.lower()
        if suffix not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{suffix}' not allowed. Permitted: {settings.ALLOWED_EXTENSIONS}"
            )

        target_dir = self.upload_dir / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename while retaining readable slug
        clean_name = Path(file.filename).stem.replace(" ", "_")
        random_token = hashlib.md5(f"{file.filename}_{os.urandom(8)}".encode()).hexdigest()[:8]
        stored_filename = f"{clean_name}_{random_token}{suffix}"
        target_path = target_dir / stored_filename

        # Write file and calculate hash & size
        hasher = hashlib.sha256()
        file_size = 0

        with open(target_path, "wb") as buffer:
            while chunk := file.file.read(8192):
                hasher.update(chunk)
                file_size += len(chunk)
                if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                    # Clean up
                    target_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=400,
                        detail=f"File size exceeds maximum {settings.MAX_FILE_SIZE_MB}MB limit."
                    )
                buffer.write(chunk)

        return {
            "file_name": file.filename,
            "stored_file_name": stored_filename,
            "file_path": str(target_path.relative_to(settings.BASE_DIR)),
            "absolute_path": str(target_path),
            "file_size": file_size,
            "mime_type": file.content_type or "application/octet-stream",
            "sha256": hasher.hexdigest(),
        }

    def get_file_path(self, relative_path: str) -> Path:
        full_path = settings.BASE_DIR / relative_path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="Requested file not found on storage")
        return full_path

storage_service = StorageService()
