from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.connection import get_db
from app.schemas.schemas import AnalyticsOverview
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Returns overview counts and operational status."""
    return AnalyticsService.get_overview(db)

@router.get("/usage")
def get_analytics_usage(db: Session = Depends(get_db)):
    """Returns file type distributions and latency log history."""
    return AnalyticsService.get_usage_data(db)
