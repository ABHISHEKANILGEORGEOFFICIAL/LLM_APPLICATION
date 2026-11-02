import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.document import QueryLog
from app.schemas.schemas import SearchRequest, SearchResponse
from app.services.retrieval_service import RetrievalService

router = APIRouter(prefix="/api/search", tags=["search"])

@router.post("", response_model=SearchResponse)
def search_documents(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Executes semantic or keyword search across all indexed chunks or a selected document.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    if request.mode == "keyword":
        res = RetrievalService.search_keyword_tfidf(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k or 4,
            similarity_threshold=request.similarity_threshold or 0.05
        )
    else:
        res = RetrievalService.search_semantic(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k or 4,
            similarity_threshold=request.similarity_threshold or 0.2
        )

    # Log query
    try:
        log = QueryLog(
            query_text=request.query,
            mode="search" if request.mode != "keyword" else "keyword",
            document_id=request.document_id,
            retrieval_latency_ms=res["retrieval_time_ms"],
            total_latency_ms=res["retrieval_time_ms"],
            citations_json=json.dumps([{"chunk_id": r["chunk_id"], "doc": r["document_name"]} for r in res["results"]])
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()

    return res
