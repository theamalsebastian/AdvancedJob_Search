# AI Job Search Assistant 🔍

A full-stack, RAG-powered career platform that helps job seekers find relevant openings, understand how their skills stack up, and check whether their resume will survive an ATS (Applicant Tracking System) scan — all through a natural-language chat interface.

**🔗 Live demo:** https://advanced-job-search.vercel.app
*(Note: backend runs on a free-tier host and may take ~30s to wake up on first request)*

---

## What it does

- **Chat-based job search** — ask "What jobs match my Python and ML skills?" and get a grounded answer plus matching job cards, generated via a RAG pipeline over live job postings.
- **Resume parsing** — upload a PDF resume; the app extracts 200+ technical skills across 7 categories, estimates years of experience, and pulls contact info.
- **ATS scoring** — get a 0–100 score across five dimensions (formatting, section completeness, action verbs, quantified achievements, keyword match against a job description) with specific, actionable suggestions.
- **Live job board** — semantic search over indexed postings, refreshed on demand from a free job-board API.
- **Analytics dashboard** — in-demand skills, job source breakdown, and search activity over time, computed from real Postgres data.

---

## Architecture

```
┌──────────────────────────────┐
│   Next.js 14 + TypeScript     │   Vercel
│   Tailwind CSS v4              │
└───────────────┬────────────────┘
                 │ REST (JSON)
┌───────────────▼────────────────┐
│        FastAPI backend         │   Render (Docker)
│  ├─ /api/chat   (RAG)          │
│  ├─ /api/jobs   (search/scrape)│
│  ├─ /api/resume (parsing)      │
│  ├─ /api/ats    (scoring)      │
│  └─ /api/analytics             │
└──────┬──────────────┬──────────┘
       │              │
┌──────▼──────┐ ┌─────▼──────────┐
│  Qdrant      │ │  PostgreSQL    │
│  (vectors)   │ │  (Neon)        │
└──────────────┘ └────────────────┘
       │
┌──────▼──────────┐
│  Groq API        │
│  (Llama 3.3-70B) │
└──────────────────┘
```

---

## Tech stack

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- Recharts (analytics charts)
- lucide-react (icons)

**Backend**
- FastAPI + Pydantic
- SQLAlchemy ORM
- Groq API (Llama 3.3-70B) for RAG responses
- Qdrant for vector search
- FastEmbed (`BAAI/bge-small-en-v1.5`) for embeddings — chosen for its small footprint to fit free-tier memory limits
- pdfplumber for resume PDF parsing
- BeautifulSoup for job description cleanup

**Data & infrastructure**
- PostgreSQL via Neon (serverless Postgres)
- Qdrant Cloud (vector database)
- Docker (backend containerization)
- Render (backend hosting)
- Vercel (frontend hosting)
- Arbeitnow public API (job postings source)

---

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, startup hooks
│   │   ├── config.py            # env-based settings
│   │   ├── db/
│   │   │   ├── database.py      # SQLAlchemy engine/session
│   │   │   └── models.py        # Job, Resume, ATSScore, SearchLog
│   │   ├── routers/
│   │   │   ├── jobs.py          # scrape, search, list, stats
│   │   │   ├── resume.py        # upload, parse
│   │   │   ├── ats.py           # ATS scoring
│   │   │   ├── chat.py          # RAG chat endpoint
│   │   │   └── analytics.py     # dashboard aggregates
│   │   ├── services/
│   │   │   ├── scraper.py       # Arbeitnow job scraper
│   │   │   ├── embedder.py      # resume parsing + skill ontology
│   │   │   ├── ats_scorer.py    # ATS scoring logic
│   │   │   ├── reranker.py      # cross-encoder reranking (optional)
│   │   │   └── rag.py           # RAG orchestration (Groq + Qdrant)
│   │   └── vectorstore/
│   │       └── qdrant_client.py # embeddings + vector search
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # chat page
    │   │   ├── jobs/page.tsx     # job board
    │   │   ├── resume/page.tsx   # resume upload + ATS
    │   │   ├── analytics/page.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── ChatWindow.tsx
    │   │   ├── JobCard.tsx
    │   │   ├── ResumeUpload.tsx
    │   │   ├── ATSScoreCard.tsx
    │   │   └── AnalyticsDashboard.tsx
    │   └── lib/api.ts            # typed API client
    ├── tailwind.config.js
    └── postcss.config.mjs
```

---

## API overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | RAG chat — semantic search + LLM-generated answer |
| `/api/jobs/scrape` | POST | Scrape job postings and index into Qdrant + Postgres |
| `/api/jobs/search` | POST | Semantic/hybrid search over indexed jobs |
| `/api/jobs/list` | GET | Browse indexed jobs |
| `/api/jobs/stats` | GET | Index + database stats |
| `/api/resume/upload` | POST | Upload and parse a resume PDF |
| `/api/resume/{id}` | GET | Retrieve a parsed resume profile |
| `/api/ats/score` | POST | Run ATS scoring against an optional job description |
| `/api/analytics` | GET | Aggregate stats for the dashboard |

Full interactive API docs available at `<backend-url>/docs` (Swagger UI).

---

## Running locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free accounts: [Groq](https://console.groq.com), [Qdrant Cloud](https://cloud.qdrant.io), [Neon](https://neon.tech)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# create .env with:
# DATABASE_URL=postgresql://...
# QDRANT_URL=https://...
# QDRANT_API_KEY=...
# GROQ_API_KEY=gsk_...
# FRONTEND_URL=http://localhost:3000

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` — Swagger docs at `/docs`.

### Frontend

```bash
cd frontend
npm install

# create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:3000`.

### Seeding job data

With the backend running, call `POST /api/jobs/scrape` via `/docs` with a body like:

```json
{
  "queries": ["python", "developer", "engineer"],
  "location": "",
  "max_per_query": 15
}
```

---

## Deployment

- **Frontend**: deployed on Vercel, root directory `frontend`, env var `NEXT_PUBLIC_API_URL` pointing at the backend.
- **Backend**: deployed on Render as a Docker web service, root directory `backend`. Environment variables: `DATABASE_URL`, `QDRANT_URL`, `QDRANT_API_KEY`, `GROQ_API_KEY`, `FRONTEND_URL`.
- **Vector DB**: Qdrant Cloud free-tier cluster.
- **Database**: Neon serverless Postgres free tier.

### Notes on free-tier constraints
- Render's free tier (512MB RAM) cannot run `sentence-transformers`/torch — embeddings use **FastEmbed** with an ONNX-based model instead.
- Hybrid (keyword + vector) search and cross-encoder reranking are implemented but **disabled by default** in production to stay within memory limits; pure semantic search is used instead.
- The backend spins down after ~15 minutes of inactivity on Render's free tier — first request after idle may take 30-60 seconds.

---

## Key design decisions

- **FastEmbed over sentence-transformers**: drops the torch dependency entirely, fitting comfortably within 512MB RAM while keeping a 384-dimension embedding model (`BAAI/bge-small-en-v1.5`).
- **Skill ontology-based parsing**: rather than relying solely on an LLM for resume parsing, a curated dictionary of 200+ skills across 7 categories (languages, ML/AI, frameworks, data, backend, cloud/DevOps, tools) enables fast, deterministic, and free skill extraction.
- **Weighted ATS scoring**: the five scoring dimensions are combined with configurable weights, and keyword matching dynamically re-weights when a job description is provided versus when it isn't.
- **Decoupled architecture**: frontend and backend are independently deployable services communicating over a typed REST API, mirroring real-world microservice patterns.

---

## Future improvements

- Re-enable hybrid search + reranking on a higher-memory tier
- Add authentication and per-user saved searches / resume history
- Scheduled job-index refresh via GitHub Actions
- LinkedIn job source integration
- Cover letter generation from resume + job description

---

## License

MIT
