import os
import json
from pathlib import Path
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple
from app.config import VECTOR_STORE_DIR, EMBEDDING_DIM

INDEX_FILE = VECTOR_STORE_DIR / "faiss_index.bin"
METADATA_FILE = VECTOR_STORE_DIR / "metadata.json"

class VectorStore:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.dim = EMBEDDING_DIM
        self.metadata: List[Dict[str, Any]] = []
        self.index = None
        self._load_or_create()

    def _load_or_create(self):
        if INDEX_FILE.exists() and METADATA_FILE.exists():
            try:
                self.index = faiss.read_index(str(INDEX_FILE))
                with open(METADATA_FILE, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                print(f"[VectorStore] Loaded FAISS index with {self.index.ntotal} vectors.")
                return
            except Exception as e:
                print(f"[VectorStore] Error loading existing index: {e}. Reinitializing empty.")
        
        # Inner product index on normalized vectors = Cosine Similarity
        self.index = faiss.IndexFlatIP(self.dim)
        self.metadata = []
        self._save()

    def _save(self):
        try:
            faiss.write_index(self.index, str(INDEX_FILE))
            with open(METADATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, ensure_ascii=False)
        except Exception as e:
            print(f"[VectorStore] Error saving index: {e}")

    def add_vectors(self, vectors: np.ndarray, metadata_items: List[Dict[str, Any]]):
        """
        Adds vectors and corresponding metadata into the FAISS index and persists them.
        """
        if len(vectors) == 0:
            return
        
        if vectors.dtype != np.float32:
            vectors = vectors.astype(np.float32)

        self.index.add(vectors)
        self.metadata.extend(metadata_items)
        self._save()

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 5,
        document_id: int = None,
        threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Searches vectors. If document_id is provided, filters for that specific document.
        Returns list of matched metadata with similarity scores.
        """
        if self.index.ntotal == 0:
            return []

        if query_vector.ndim == 1:
            query_vector = np.expand_dims(query_vector, axis=0)

        # Retrieve more candidates if document filter is present
        k_search = min(self.index.ntotal, top_k * 5 if document_id else top_k)
        scores, indices = self.index.search(query_vector, k_search)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            meta = self.metadata[idx].copy()
            similarity = float(score)

            if document_id is not None and meta.get("document_id") != document_id:
                continue

            if similarity < threshold:
                continue

            meta["similarity_score"] = round(similarity, 4)
            results.append(meta)

            if len(results) >= top_k:
                break

        return results

    def remove_document(self, document_id: int):
        """
        Reconstructs the index excluding the chunks from the given document_id.
        """
        if self.index.ntotal == 0:
            return

        retained_meta = []
        retained_indices = []

        for i, item in enumerate(self.metadata):
            if item.get("document_id") != document_id:
                retained_meta.append(item)
                retained_indices.append(i)

        if len(retained_indices) == 0:
            # All removed
            self.index = faiss.IndexFlatIP(self.dim)
            self.metadata = []
            self._save()
            return

        # Reconstruct vectors for retained items
        retained_vectors = np.zeros((len(retained_indices), self.dim), dtype=np.float32)
        for new_idx, old_idx in enumerate(retained_indices):
            retained_vectors[new_idx] = self.index.reconstruct(int(old_idx))

        new_index = faiss.IndexFlatIP(self.dim)
        new_index.add(retained_vectors)
        self.index = new_index
        self.metadata = retained_meta
        self._save()

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_vectors": self.index.ntotal if self.index else 0,
            "dimension": self.dim,
            "index_type": "IndexFlatIP (Cosine Similarity)",
            "persisted_path": str(INDEX_FILE)
        }
