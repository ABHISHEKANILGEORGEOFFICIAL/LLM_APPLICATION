import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, txt, pptx
    file_path = Column(String, nullable=False)
    file_size_bytes = Column(Integer, default=0)
    file_hash = Column(String, unique=True, index=True)  # prevents duplicate upload
    total_pages = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    processing_status = Column(String, default="pending")  # pending, extracting, chunking, indexing, completed, failed
    status_message = Column(String, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    queries = relationship("QueryLog", back_populates="document")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    vector_id = Column(Integer, index=True)  # Mapping index to FAISS row

    document = relationship("Document", back_populates="chunks")

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    mode = Column(String, default="rag")  # 'search' or 'rag' or 'keyword'
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    answer_text = Column(Text, nullable=True)
    citations_json = Column(Text, default="[]")
    retrieval_latency_ms = Column(Float, default=0.0)
    generation_latency_ms = Column(Float, default=0.0)
    total_latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="queries")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    chunk_size = Column(Integer, default=500)
    chunk_overlap = Column(Integer, default=80)
    top_k = Column(Integer, default=4)
    similarity_threshold = Column(Float, default=0.35)
    embedding_model = Column(String, default="sentence-transformers/all-MiniLM-L6-v2")
    generation_model = Column(String, default="google/flan-t5-small")
    temperature = Column(Float, default=0.2)
    use_flan_t5 = Column(Boolean, default=True)
