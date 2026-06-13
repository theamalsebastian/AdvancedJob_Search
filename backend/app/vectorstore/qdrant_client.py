import logging
import uuid
from typing import List, Dict, Optional, Tuple

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION, EMBED_DIM, EMBED_MODEL

logger = logging.getLogger(__name__)

_client: Optional[QdrantClient] = None
_embedder = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)
        _ensure_collection(_client)
    return _client

def get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer(EMBED_MODEL)
    return _embedder


def _ensure_collection(client: QdrantClient):
    collections = [c.name for c in client.get_collections().collections]
    if QDRANT_COLLECTION not in collections:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=qmodels.VectorParams(size=EMBED_DIM, distance=qmodels.Distance.COSINE),
        )


def embed_text(text: str) -> List[float]:
    model = get_embedder()
    return model.encode(text, normalize_embeddings=True).tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    model = get_embedder()
    return model.encode(texts, normalize_embeddings=True).tolist()


def upsert_jobs(jobs: List[Dict]) -> List[str]:
    client = get_client()
    texts = [_job_to_text(j) for j in jobs]
    vectors = embed_batch(texts)

    points = []
    point_ids = []
    for job, vec in zip(jobs, vectors):
        pid = str(uuid.uuid5(uuid.NAMESPACE_URL, job["url"]))
        point_ids.append(pid)
        points.append(
            qmodels.PointStruct(
                id=pid,
                vector=vec,
                payload={
                    "title": job.get("title", ""),
                    "company": job.get("company", ""),
                    "location": job.get("location", ""),
                    "description": job.get("description", ""),
                    "url": job.get("url", ""),
                    "source": job.get("source", ""),
                    "posted_date": str(job.get("posted_date", "")),
                },
            )
        )

    client.upsert(collection_name=QDRANT_COLLECTION, points=points)
    return point_ids


def semantic_search(query: str, top_k: int = 10, source_filter: Optional[str] = None) -> List[Tuple[Dict, float]]:
    client = get_client()
    query_vec = embed_text(query)

    qfilter = None
    if source_filter:
        qfilter = qmodels.Filter(
            must=[qmodels.FieldCondition(key="source", match=qmodels.MatchValue(value=source_filter))]
        )

    results = client.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=query_vec,
        limit=top_k,
        query_filter=qfilter,
        with_payload=True,
    )
    return [(r.payload, r.score) for r in results]


def keyword_search(query: str, top_k: int = 20) -> List[Dict]:
    client = get_client()
    keywords = [w.lower() for w in query.split() if len(w) > 2]

    results, _ = client.scroll(collection_name=QDRANT_COLLECTION, limit=200, with_payload=True)

    scored = []
    for point in results:
        text = (point.payload.get("title", "") + " " + point.payload.get("description", "")).lower()
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scored.append((point.payload, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [p for p, _ in scored[:top_k]]


def hybrid_search(query: str, top_k: int = 10, alpha: float = 0.7) -> List[Tuple[Dict, float]]:
    semantic_results = semantic_search(query, top_k=top_k * 2)
    keyword_results = keyword_search(query, top_k=top_k * 2)

    sem_ranks = {r[0]["url"]: i for i, r in enumerate(semantic_results)}
    kw_ranks = {r["url"]: i for i, r in enumerate(keyword_results)}

    all_urls = set(sem_ranks) | set(kw_ranks)
    fused = []
    for url in all_urls:
        sem_rank = sem_ranks.get(url, top_k * 2)
        kw_rank = kw_ranks.get(url, top_k * 2)
        score = alpha * (1 / (sem_rank + 1)) + (1 - alpha) * (1 / (kw_rank + 1))

        payload = None
        for p, _ in semantic_results:
            if p["url"] == url:
                payload = p
                break
        if not payload:
            for p in keyword_results:
                if p["url"] == url:
                    payload = p
                    break

        if payload:
            fused.append((payload, score))

    fused.sort(key=lambda x: x[1], reverse=True)
    return fused[:top_k]


def _job_to_text(job: Dict) -> str:
    return " | ".join([job.get("title", ""), job.get("company", ""), job.get("location", ""), job.get("description", "")])


def collection_stats() -> Dict:
    client = get_client()
    info = client.get_collection(QDRANT_COLLECTION)
    return {"total_points": info.points_count, "status": info.status}