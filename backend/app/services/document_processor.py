import os
import shutil
from pathlib import Path
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.config import UPLOADS_DIR
from app.models.document import Document, Chunk
from app.utils.file_validation import validate_uploaded_file, compute_sha256
from app.services.text_extractor import TextExtractor
from app.services.chunking import DocumentChunker
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore

class DocumentProcessor:
    @staticmethod
    def process_document(
        filename: str,
        content: bytes,
        db: Session,
        chunk_size: int = 500,
        chunk_overlap: int = 80
    ) -> Dict[str, Any]:
        """
        Executes end-to-end ingestion:
        1. Validation & duplicate check via SHA-256
        2. File persistence
        3. Text extraction with page tracking
        4. Text chunking
        5. Embedding generation (MiniLM)
        6. FAISS vector storage
        7. SQL persistence
        """
        # 1. Validation
        is_valid, file_type, err = validate_uploaded_file(filename, content)
        if not is_valid:
            raise ValueError(err)

        file_hash = compute_sha256(content)
        existing = db.query(Document).filter(Document.file_hash == file_hash).first()
        if existing:
            return {
                "document": existing,
                "message": f"Document '{existing.original_name}' has already been uploaded and indexed.",
                "is_duplicate": True
            }

        # 2. File saving
        safe_filename = f"{file_hash[:10]}_{filename}"
        saved_path = UPLOADS_DIR / safe_filename
        with open(saved_path, "wb") as f:
            f.write(content)

        # 3. Create initial Document entry
        doc_record = Document(
            filename=safe_filename,
            original_name=filename,
            file_type=file_type,
            file_path=str(saved_path),
            file_size_bytes=len(content),
            file_hash=file_hash,
            processing_status="processing",
            status_message="Extracting document text..."
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        try:
            # 4. Extract Text
            doc_record.status_message = "Extracting text and page boundaries..."
            db.commit()
            pages = TextExtractor.extract(str(saved_path), file_type)
            doc_record.total_pages = max(1, len(pages))

            # 5. Chunk text
            doc_record.status_message = "Generating semantic text chunks..."
            db.commit()
            chunk_dicts = DocumentChunker.chunk_pages(
                pages=pages,
                chunk_size_words=max(50, chunk_size // 4), # approximate words
                chunk_overlap_words=max(10, chunk_overlap // 4)
            )

            if not chunk_dicts:
                # In case document is empty or unparsable
                doc_record.processing_status = "completed"
                doc_record.status_message = "Document processed but no text content was found."
                db.commit()
                return {"document": doc_record, "message": "No text extracted", "is_duplicate": False}

            # 6. Generate Embeddings & Vector Indexing
            doc_record.status_message = "Encoding embeddings (all-MiniLM-L6-v2)..."
            db.commit()

            embedding_service = EmbeddingService.get_instance()
            vector_store = VectorStore.get_instance()

            texts = [c["content"] for c in chunk_dicts]
            vectors = embedding_service.encode(texts)

            # Store in DB and FAISS
            db_chunks = []
            faiss_metadata = []

            for i, c in enumerate(chunk_dicts):
                db_chunk = Chunk(
                    document_id=doc_record.id,
                    chunk_index=c["chunk_index"],
                    page_number=c["page_number"],
                    content=c["content"],
                    char_count=c["char_count"],
                    word_count=c["word_count"],
                    vector_id=len(vector_store.metadata) + i
                )
                db_chunks.append(db_chunk)

            db.bulk_save_objects(db_chunks)
            db.commit()

            # Refresh to get chunk IDs
            created_chunks = db.query(Chunk).filter(Chunk.document_id == doc_record.id).order_by(Chunk.chunk_index).all()
            for chunk_obj in created_chunks:
                faiss_metadata.append({
                    "chunk_id": chunk_obj.id,
                    "document_id": doc_record.id,
                    "document_name": doc_record.original_name,
                    "page_number": chunk_obj.page_number,
                    "content": chunk_obj.content
                })

            vector_store.add_vectors(vectors, faiss_metadata)

            # 7. Complete
            doc_record.chunk_count = len(created_chunks)
            doc_record.processing_status = "completed"
            doc_record.status_message = f"Indexed {len(created_chunks)} chunks across {doc_record.total_pages} pages."
            db.commit()
            db.refresh(doc_record)

            return {
                "document": doc_record,
                "message": "Document processed and indexed successfully.",
                "is_duplicate": False
            }

        except Exception as e:
            db.rollback()
            doc_record.processing_status = "failed"
            doc_record.status_message = f"Processing error: {str(e)}"
            db.commit()
            raise e
