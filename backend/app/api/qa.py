import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.document import QueryLog, SystemSettings
from app.schemas.schemas import QARequest, QAResponse
from app.services.qa_service import QAService

router = APIRouter(prefix="/api/qa", tags=["qa"])

@router.post("/ask", response_model=QAResponse)
def ask_question(request: QARequest, db: Session = Depends(get_db)):
    """
    RAG endpoint: semantic retrieval + grounded LLM answer generation with citations.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Check settings if custom threshold configured
    settings = db.query(SystemSettings).first()
    thresh = request.similarity_threshold or (settings.similarity_threshold if settings else 0.25)
    top_k = request.top_k or (settings.top_k if settings else 4)

    qa_service = QAService.get_instance()
    res = qa_service.answer_question(
        question=request.question,
        document_id=request.document_id,
        top_k=top_k,
        similarity_threshold=thresh,
        generation_method=request.generation_method or "flan_t5"
    )

    # Persist interaction into query logs
    try:
        log = QueryLog(
            query_text=request.question,
            mode="rag",
            document_id=request.document_id,
            answer_text=res["answer"],
            citations_json=json.dumps(res["citations"]),
            retrieval_latency_ms=res["retrieval_latency_ms"],
            generation_latency_ms=res["generation_latency_ms"],
            total_latency_ms=res["total_latency_ms"]
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()

    return res
