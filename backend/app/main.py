import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.api import documents, search, qa, analytics, settings, evaluation
from app.services.vector_store import VectorStore
from app.services.embedding_service import EmbeddingService
from app.services.qa_service import QAService

# Create database tables automatically
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================")
    print("SYNAPSE AI ENGINE — STARTING UP")
    print("==================================================")
    # Warm up singleton models in memory
    VectorStore.get_instance()
    EmbeddingService.get_instance()
    QAService.get_instance()
    yield
    print("SYNAPSE AI ENGINE — SHUTTING DOWN")

app = FastAPI(
    title="SYNAPSE — Intelligent Document Retrieval & Question Answering Platform",
    description="Research-grade document intelligence platform powered by MiniLM embeddings & lightweight LLMs.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for Vite frontend (runs on 5173 by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(qa.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(evaluation.router)

@app.get("/api/health")
def health_check():
    vector_store = VectorStore.get_instance()
    return {
        "status": "healthy",
        "system": "SYNAPSE Document Retrieval & QA Platform",
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "llm_model": "google/flan-t5-small (CPU inference)",
        "indexed_vectors": vector_store.index.ntotal if vector_store.index else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
