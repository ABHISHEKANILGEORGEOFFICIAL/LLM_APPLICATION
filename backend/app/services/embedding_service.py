import numpy as np
from typing import List, Union
from sentence_transformers import SentenceTransformer
from app.config import EMBEDDING_MODEL_NAME

class EmbeddingService:
    _instance = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        print(f"[EmbeddingService] Loading model: {EMBEDDING_MODEL_NAME}...")
        self._model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        print("[EmbeddingService] Model loaded successfully.")

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        embeddings = self._model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
            normalize_embeddings=True  # Cosine similarity ready
        )
        return embeddings.astype("float32")

    def encode_single(self, text: str) -> np.ndarray:
        return self.encode([text])[0]
