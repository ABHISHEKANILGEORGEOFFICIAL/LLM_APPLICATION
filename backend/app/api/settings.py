from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.document import SystemSettings
from app.schemas.schemas import SettingsSchema
from app.config import EMBEDDING_MODEL_NAME, GENERATION_MODEL_NAME

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("", response_model=SettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    """Fetches user and system NLP configuration."""
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return SettingsSchema(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        top_k=settings.top_k,
        similarity_threshold=settings.similarity_threshold,
        embedding_model=settings.embedding_model or EMBEDDING_MODEL_NAME,
        generation_model=settings.generation_model or GENERATION_MODEL_NAME,
        temperature=settings.temperature,
        use_flan_t5=settings.use_flan_t5
    )

@router.put("", response_model=SettingsSchema)
def update_settings(payload: SettingsSchema, db: Session = Depends(get_db)):
    """Updates user and system NLP configuration."""
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)

    settings.chunk_size = payload.chunk_size
    settings.chunk_overlap = payload.chunk_overlap
    settings.top_k = payload.top_k
    settings.similarity_threshold = payload.similarity_threshold
    settings.temperature = payload.temperature
    settings.use_flan_t5 = payload.use_flan_t5

    db.commit()
    db.refresh(settings)

    return SettingsSchema(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        top_k=settings.top_k,
        similarity_threshold=settings.similarity_threshold,
        embedding_model=settings.embedding_model or EMBEDDING_MODEL_NAME,
        generation_model=settings.generation_model or GENERATION_MODEL_NAME,
        temperature=settings.temperature,
        use_flan_t5=settings.use_flan_t5
    )
