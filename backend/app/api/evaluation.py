from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.evaluation_service import EvaluationService
from app.schemas.schemas import EvalRequest

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

@router.post("/run")
def run_evaluation(payload: EvalRequest) -> Dict[str, Any]:
    """
    Executes live scientific evaluation on TF-IDF vs MiniLM vs RAG
    and returns Precision@K, MRR, ROUGE-L, F1, and latencies.
    """
    k_vals = payload.k_values or [1, 3, 5]
    results = EvaluationService.run_benchmark_evaluation(k_values=k_vals)
    return results
