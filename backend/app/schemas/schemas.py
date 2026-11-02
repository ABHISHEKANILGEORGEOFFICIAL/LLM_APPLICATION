from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    file_size_bytes: int
    total_pages: int
    chunk_count: int
    processing_status: str
    status_message: Optional[str] = ""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChunkOut(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    page_number: int
    content: str
    word_count: int

    class Config:
        from_attributes = True

class DocumentContentOut(BaseModel):
    document: DocumentOut
    chunks: List[ChunkOut]
    summary: str

class SearchRequest(BaseModel):
    query: str
    document_id: Optional[int] = None
    top_k: Optional[int] = 4
    similarity_threshold: Optional[float] = 0.25
    mode: Optional[str] = "semantic"  # "semantic" or "keyword" (TF-IDF)

class SearchResultItem(BaseModel):
    chunk_id: int
    document_id: int
    document_name: str
    page_number: int
    content: str
    similarity_score: float
    retrieval_method: str

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    retrieval_time_ms: float
    total_chunks_searched: int

class QARequest(BaseModel):
    question: str
    document_id: Optional[int] = None
    top_k: Optional[int] = 4
    similarity_threshold: Optional[float] = 0.25
    generation_method: Optional[str] = "flan_t5"  # "flan_t5" or "extractive"

class CitationItem(BaseModel):
    chunk_id: int
    document_id: int
    document_name: str
    page_number: int
    snippet: str
    similarity_score: float

class QAResponse(BaseModel):
    question: str
    answer: str
    citations: List[CitationItem]
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    model_used: str
    is_fallback: bool
    context_tokens: int

class SettingsSchema(BaseModel):
    chunk_size: int = 500
    chunk_overlap: int = 80
    top_k: int = 4
    similarity_threshold: float = 0.35
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    generation_model: str = "google/flan-t5-small"
    temperature: float = 0.2
    use_flan_t5: bool = True

class AnalyticsOverview(BaseModel):
    total_documents: int
    total_pages: int
    indexed_chunks: int
    questions_answered: int
    average_retrieval_time_ms: float
    average_generation_time_ms: float
    active_embedding_model: str
    active_generation_model: str
    vector_store_status: str
    database_status: str

class EvalRequest(BaseModel):
    dataset_name: Optional[str] = "academic_rag"
    k_values: Optional[List[int]] = [1, 3, 5]
