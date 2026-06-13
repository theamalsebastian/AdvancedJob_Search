import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)
_reranker = None
RERANK_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


def get_reranker():
    global _reranker
    if _reranker is None:
        from sentence_transformers import CrossEncoder
        _reranker = CrossEncoder(RERANK_MODEL)
    return _reranker


def rerank(query: str, candidates: List[Tuple[Dict, float]], top_k: int = 10) -> List[Tuple[Dict, float]]:
    if not candidates:
        return []

    model = get_reranker()
    pairs = [
        (query, f"{c[0].get('title','')} {c[0].get('company','')} {c[0].get('description','')[:300]}")
        for c in candidates
    ]
    scores = model.predict(pairs)

    reranked = list(zip([c[0] for c in candidates], scores))
    reranked.sort(key=lambda x: x[1], reverse=True)
    return [(payload, float(score)) for payload, score in reranked[:top_k]]