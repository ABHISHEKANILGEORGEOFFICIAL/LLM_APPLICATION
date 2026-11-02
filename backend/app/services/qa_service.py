import time
import re
from typing import List, Dict, Any, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from app.config import GENERATION_MODEL_NAME
from app.services.retrieval_service import RetrievalService

class QAService:
    _instance = None
    _tokenizer = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        print(f"[QAService] Initializing Flan-T5 model ({GENERATION_MODEL_NAME})...")
        try:
            self._tokenizer = AutoTokenizer.from_pretrained(GENERATION_MODEL_NAME)
            self._model = AutoModelForSeq2SeqLM.from_pretrained(GENERATION_MODEL_NAME)
            self._model.eval()
            print("[QAService] Flan-T5 loaded successfully.")
        except Exception as e:
            print(f"[QAService] Warning: Could not initialize local LLM ({e}). Extractive QA fallback will be active.")
            self._tokenizer = None
            self._model = None

    def answer_question(
        self,
        question: str,
        document_id: Optional[int] = None,
        top_k: int = 4,
        similarity_threshold: float = 0.25,
        generation_method: str = "flan_t5"
    ) -> Dict[str, Any]:
        """
        Executes complete RAG pipeline:
        1. Semantic retrieval with citations
        2. Context construction
        3. Strict grounded prompting
        4. Flan-T5 inference or Extractive QA fallback
        5. Return grounded answer, citations, latencies
        """
        total_start = time.time()

        # Step 1: Semantic Retrieval
        retrieval_res = RetrievalService.search_semantic(
            query=question,
            document_id=document_id,
            top_k=top_k,
            similarity_threshold=similarity_threshold
        )
        retrieval_ms = retrieval_res["retrieval_time_ms"]
        passages = retrieval_res["results"]

        citations = []
        for p in passages:
            citations.append({
                "chunk_id": p["chunk_id"],
                "document_id": p["document_id"],
                "document_name": p["document_name"],
                "page_number": p["page_number"],
                "snippet": p["content"][:240] + ("..." if len(p["content"]) > 240 else ""),
                "similarity_score": p["similarity_score"]
            })

        # Check sufficiency of context
        if not passages or (passages and passages[0]["similarity_score"] < similarity_threshold):
            gen_ms = 0.0
            total_ms = (time.time() - total_start) * 1000
            return {
                "question": question,
                "answer": "I could not find sufficient relevant evidence in the uploaded documents to answer this question. Please ensure the relevant document is uploaded or try rephrasing your question.",
                "citations": citations,
                "retrieval_latency_ms": round(retrieval_ms, 2),
                "generation_latency_ms": round(gen_ms, 2),
                "total_latency_ms": round(total_ms, 2),
                "model_used": "Evidence Verification Filter",
                "is_fallback": False,
                "context_tokens": 0
            }

        # Build context from top retrieved passages
        context_blocks = []
        for i, p in enumerate(passages):
            context_blocks.append(f"[Source {i+1}: {p['document_name']} (Page {p['page_number']})]: {p['content']}")
        context_text = "\n\n".join(context_blocks)

        gen_start = time.time()
        is_fallback = False
        answer = ""
        model_used = "google/flan-t5-small"

        if generation_method == "flan_t5" and self._model is not None and self._tokenizer is not None:
            prompt = (
                f"Read the following context carefully and answer the question accurately based ONLY on the provided context.\n"
                f"If the context does not contain the answer, say 'The provided documents do not contain sufficient information to answer this question.'\n\n"
                f"Context:\n{context_text}\n\n"
                f"Question: {question}\n\n"
                f"Answer:"
            )

            try:
                inputs = self._tokenizer(prompt, return_tensors="pt", max_length=1024, truncation=True)
                with torch.no_grad():
                    output_tokens = self._model.generate(
                        **inputs,
                        max_new_tokens=150,
                        num_beams=2,
                        early_stopping=True,
                        no_repeat_ngram_size=2
                    )
                generated_raw = self._tokenizer.decode(output_tokens[0], skip_special_tokens=True).strip()
                
                # If generated response is extremely terse or repetitive, combine with key context synthesis
                if len(generated_raw) < 5 or generated_raw.lower() in ["none", "unanswerable"]:
                    answer = self._extractive_fallback(question, passages)
                    is_fallback = True
                    model_used = "Extractive QA Fallback"
                else:
                    # Append primary attribution
                    top_source = passages[0]
                    answer = f"{generated_raw}\n\n*(Source: {top_source['document_name']}, Page {top_source['page_number']})*"
            except Exception as e:
                print(f"[QAService] Error generating with Flan-T5: {e}. Switching to extractive fallback.")
                answer = self._extractive_fallback(question, passages)
                is_fallback = True
                model_used = "Extractive QA Fallback"
        else:
            answer = self._extractive_fallback(question, passages)
            is_fallback = True
            model_used = "Extractive QA Fallback"

        gen_ms = (time.time() - gen_start) * 1000
        total_ms = (time.time() - total_start) * 1000

        return {
            "question": question,
            "answer": answer,
            "citations": citations,
            "retrieval_latency_ms": round(retrieval_ms, 2),
            "generation_latency_ms": round(gen_ms, 2),
            "total_latency_ms": round(total_ms, 2),
            "model_used": model_used,
            "is_fallback": is_fallback,
            "context_tokens": len(context_text.split())
        }

    def _extractive_fallback(self, question: str, passages: List[Dict[str, Any]]) -> str:
        """
        Accurate extractive QA synthesis based on sentence-level similarity and keyword overlap.
        """
        if not passages:
            return "No relevant passages found."
        
        top_passage = passages[0]
        sentences = re.split(r'(?<=[.!?])\s+', top_passage["content"])
        
        # Rank sentences in top passage
        q_words = set(re.findall(r'\w+', question.lower()))
        best_sentence = sentences[0]
        max_overlap = -1

        for s in sentences:
            s_words = set(re.findall(r'\w+', s.lower()))
            overlap = len(q_words.intersection(s_words))
            if overlap > max_overlap and len(s.strip()) > 20:
                max_overlap = overlap
                best_sentence = s.strip()

        return (
            f"{best_sentence}\n\n"
            f"**Supporting Passage:** \"{top_passage['content'][:250]}...\"\n\n"
            f"*(Reference: {top_passage['document_name']}, Page {top_passage['page_number']})*"
        )
