import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.document import Document, Chunk
from app.schemas.schemas import DocumentOut, DocumentContentOut, ChunkOut
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import VectorStore

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Uploads, validates, chunks, embeds, and indexes a document."""
    try:
        content = await file.read()
        res = DocumentProcessor.process_document(
            filename=file.filename,
            content=content,
            db=db
        )
        return res["document"]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("", response_model=List[DocumentOut])
def get_documents(db: Session = Depends(get_db)):
    """Returns all uploaded documents ordered by recency."""
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Returns metadata for a specific document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/content", response_model=DocumentContentOut)
def get_document_content(document_id: int, db: Session = Depends(get_db)):
    """Returns chunks and content preview for the document workspace."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    chunks = db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.chunk_index).all()
    
    # Generate concise overview summary from initial chunks
    summary_text = " ".join([c.content for c in chunks[:3]])
    summary = summary_text[:400] + ("..." if len(summary_text) > 400 else "")

    return {
        "document": doc,
        "chunks": chunks,
        "summary": summary if summary else "No text preview available."
    }

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Deletes document from database, disk storage, and FAISS vector index."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 1. Remove vector embeddings
    vector_store = VectorStore.get_instance()
    vector_store.remove_document(document_id)

    # 2. Remove file on disk if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    # 3. Delete from DB (cascades chunks)
    db.delete(doc)
    db.commit()

    return {"message": f"Document '{doc.original_name}' deleted successfully", "id": document_id}
