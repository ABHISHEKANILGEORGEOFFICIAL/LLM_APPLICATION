import time
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
from app.database.connection import SessionLocal
from app.models.document import Chunk, Document

class RetrievalService:
    @staticmethod
    def search_semantic(
        query: str,
        document_id: Optional[int] = None,
        top_k: int = 4,
        similarity_threshold: float = 0.25
    ) -> Dict[str, Any]:
        """
        Retrieves passages using dense MiniLM embeddings and FAISS cosine similarity.
        """
        start_time = time.time()
        embedding_service = EmbeddingService.get_instance()
        vector_store = VectorStore.get_instance()

        query_vec = embedding_service.encode_single(query)
        matches = vector_store.search(
            query_vector=query_vec,
            top_k=top_k,
            document_id=document_id,
            threshold=similarity_threshold
        )
        elapsed_ms = (time.time() - start_time) * 1000

        formatted_results = []
        for m in matches:
            formatted_results.append({
                "chunk_id": m.get("chunk_id", 0),
                "document_id": m.get("document_id", 0),
                "document_name": m.get("document_name", "Unknown"),
                "page_number": m.get("page_number", 1),
                "content": m.get("content", ""),
                "similarity_score": m.get("similarity_score", 0.0),
                "retrieval_method": "Semantic (all-MiniLM-L6-v2)"
            })

        return {
            "query": query,
            "results": formatted_results,
            "retrieval_time_ms": round(elapsed_ms, 2),
            "total_chunks_searched": vector_store.index.ntotal if vector_store.index else 0
        }

    @staticmethod
    def search_keyword_tfidf(
        query: str,
        document_id: Optional[int] = None,
        top_k: int = 4,
        similarity_threshold: float = 0.05
    ) -> Dict[str, Any]:
        """
        Retrieves passages using sparse TF-IDF matching for evaluation and comparison baseline.
        """
        start_time = time.time()
        db = SessionLocal()
        try:
            query_filter = db.query(Chunk, Document.original_name)\
                .join(Document, Chunk.document_id == Document.id)
            if document_id:
                query_filter = query_filter.filter(Chunk.document_id == document_id)
            chunks_records = query_filter.all()

            if not chunks_records:
                return {
                    "query": query,
                    "results": [],
                    "retrieval_time_ms": 0.0,
                    "total_chunks_searched": 0
                }

            corpus = [r[0].content for r in chunks_records]
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            query_vec = vectorizer.transform([query])

            sim_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
            top_indices = np.argsort(sim_scores)[::-1]

            results = []
            for idx in top_indices:
                score = float(sim_scores[idx])
                if score < similarity_threshold:
                    break
                chunk_obj, doc_name = chunks_records[idx]
                results.append({
                    "chunk_id": chunk_obj.id,
                    "document_id": chunk_obj.document_id,
                    "document_name": doc_name,
                    "page_number": chunk_obj.page_number,
                    "content": chunk_obj.content,
                    "similarity_score": round(score, 4),
                    "retrieval_method": "Keyword (TF-IDF)"
                })
                if len(results) >= top_k:
                    break

            elapsed_ms = (time.time() - start_time) * 1000
            return {
                "query": query,
                "results": results,
                "retrieval_time_ms": round(elapsed_ms, 2),
                "total_chunks_searched": len(chunks_records)
            }
        finally:
            db.close()
