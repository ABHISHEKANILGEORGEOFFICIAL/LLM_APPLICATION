import time
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.document import Document, Chunk, QueryLog
from app.services.vector_store import VectorStore
from app.config import EMBEDDING_MODEL_NAME, GENERATION_MODEL_NAME

class AnalyticsService:
    @staticmethod
    def get_overview(db: Session) -> Dict[str, Any]:
        """Calculates live operational metrics from database and vector index."""
        total_docs = db.query(Document).count()
        total_pages = db.query(func.sum(Document.total_pages)).scalar() or 0
        indexed_chunks = db.query(Chunk).count()
        questions_answered = db.query(QueryLog).filter(QueryLog.mode == "rag").count()

        avg_retrieval = db.query(func.avg(QueryLog.retrieval_latency_ms)).scalar() or 0.0
        avg_generation = db.query(func.avg(QueryLog.generation_latency_ms)).scalar() or 0.0

        vector_store = VectorStore.get_instance()
        vector_count = vector_store.index.ntotal if vector_store.index else 0

        return {
            "total_documents": total_docs,
            "total_pages": int(total_pages),
            "indexed_chunks": indexed_chunks,
            "questions_answered": questions_answered,
            "average_retrieval_time_ms": round(float(avg_retrieval), 2),
            "average_generation_time_ms": round(float(avg_generation), 2),
            "active_embedding_model": EMBEDDING_MODEL_NAME,
            "active_generation_model": GENERATION_MODEL_NAME,
            "vector_store_status": f"Online ({vector_count} indexed vectors)",
            "database_status": "SQLite Connected (WAL Mode)"
        }

    @staticmethod
    def get_usage_data(db: Session) -> Dict[str, Any]:
        """Generates real-time breakdown of documents by file type and recent queries."""
        type_counts = db.query(Document.file_type, func.count(Document.id))\
            .group_by(Document.file_type).all()
        by_type = [{"name": str(t).upper(), "value": count} for t, count in type_counts]

        recent_queries = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(15).all()
        queries_formatted = []
        for q in recent_queries:
            queries_formatted.append({
                "id": q.id,
                "query": q.query_text,
                "mode": q.mode,
                "retrieval_time_ms": q.retrieval_latency_ms,
                "generation_time_ms": q.generation_latency_ms,
                "total_time_ms": q.total_latency_ms,
                "created_at": q.created_at.isoformat() if q.created_at else ""
            })

        return {
            "documents_by_type": by_type,
            "recent_queries": queries_formatted
        }
