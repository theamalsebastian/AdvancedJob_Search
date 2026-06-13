import os
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@host/db")

QDRANT_URL = os.getenv("QDRANT_URL", "https://xxx.cloud.qdrant.io")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION = "jobs"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
LLM_MODEL = "llama-3.3-70b-versatile"

EMBED_MODEL = "all-MiniLM-L6-v2"
EMBED_DIM = 384

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")