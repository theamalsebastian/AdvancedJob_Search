import re
import logging
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

SKILL_ONTOLOGY = {
    "languages": ["python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "scala", "kotlin", "swift", "ruby", "php", "r", "matlab", "julia", "bash", "shell", "sql", "html", "css", "dart"],
    "ml_ai": ["machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "reinforcement learning", "llm", "large language model", "transformer", "bert", "gpt", "rag", "retrieval augmented generation", "fine-tuning", "finetuning", "embeddings", "vector database", "langchain", "hugging face", "huggingface", "openai", "anthropic", "claude", "diffusion", "gan", "generative ai", "prompt engineering", "mlops"],
    "ml_frameworks": ["pytorch", "tensorflow", "keras", "scikit-learn", "sklearn", "xgboost", "lightgbm", "catboost", "jax", "flax", "spacy", "nltk", "gensim", "sentence-transformers", "faiss", "chromadb", "weaviate", "pinecone", "qdrant", "onnx", "triton", "torchserve"],
    "data": ["pandas", "numpy", "polars", "dask", "spark", "pyspark", "hadoop", "kafka", "airflow", "dbt", "great expectations", "feast", "sql", "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch", "cassandra", "bigquery", "snowflake", "redshift", "databricks", "delta lake"],
    "backend": ["fastapi", "flask", "django", "fastify", "express", "spring boot", "graphql", "rest", "grpc", "websocket", "celery", "rabbitmq", "microservices", "api design", "system design", "next.js", "nextjs"],
    "cloud_devops": ["aws", "gcp", "google cloud", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible", "ci/cd", "github actions", "jenkins", "argocd", "helm", "prometheus", "grafana", "datadog", "sentry", "lambda", "ec2", "s3", "sagemaker", "vertex ai", "azure ml", "vercel", "render", "railway", "neon"],
    "tools": ["git", "github", "gitlab", "jira", "linear", "notion", "jupyter", "vscode", "linux", "unix", "streamlit", "gradio", "plotly", "matplotlib", "seaborn", "react"],
}

SKILL_TO_CATEGORY: Dict[str, str] = {}
for cat, skills in SKILL_ONTOLOGY.items():
    for skill in skills:
        SKILL_TO_CATEGORY[skill.lower()] = cat

SECTION_PATTERNS = {
    "contact": r"(contact|email|phone|linkedin|github|location)",
    "summary": r"(summary|objective|profile|about me|overview)",
    "experience": r"(experience|work history|employment|career)",
    "education": r"(education|degree|university|college|academic)",
    "skills": r"(skills|technologies|tech stack|tools|competencies)",
    "projects": r"(projects|portfolio|open.?source|side projects)",
    "certifications": r"(certifications?|certificates?|licenses?|credentials)",
    "publications": r"(publications?|papers?|research|patents?)",
}


def extract_text_from_pdf(pdf_path: str) -> str:
    import pdfplumber
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    full_text = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text(x_tolerance=3, y_tolerance=3)
            if text:
                full_text.append(text)
    return "\n".join(full_text)


def detect_sections(text: str) -> Dict[str, str]:
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {"header": []}
    current_section = "header"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            sections.setdefault(current_section, []).append("")
            continue

        matched_section = None
        for section_name, pattern in SECTION_PATTERNS.items():
            if re.search(pattern, stripped.lower()) and len(stripped) < 60:
                matched_section = section_name
                break

        if matched_section:
            current_section = matched_section
            sections.setdefault(current_section, [])
        else:
            sections.setdefault(current_section, []).append(stripped)

    return {k: "\n".join(v).strip() for k, v in sections.items() if v}


def extract_skills_keyword(text: str) -> Dict[str, List[str]]:
    text_lower = text.lower()
    found: Dict[str, List[str]] = {}

    for skill, category in SKILL_TO_CATEGORY.items():
        if " " in skill:
            if skill in text_lower:
                found.setdefault(category, []).append(skill)
        else:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found.setdefault(category, []).append(skill)

    return {cat: sorted(set(skills)) for cat, skills in found.items()}


def extract_contact_info(text: str) -> Dict[str, str]:
    contact = {}
    email = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email:
        contact["email"] = email.group()

    phone = re.search(r'(\+?\d[\d\s\-().]{7,}\d)', text)
    if phone:
        contact["phone"] = phone.group().strip()

    linkedin = re.search(r'linkedin\.com/in/[\w\-]+', text, re.IGNORECASE)
    if linkedin:
        contact["linkedin"] = "https://" + linkedin.group()

    github = re.search(r'github\.com/[\w\-]+', text, re.IGNORECASE)
    if github:
        contact["github"] = "https://" + github.group()

    return contact


def estimate_experience_years(text: str) -> Optional[int]:
    import datetime
    current_year = datetime.datetime.now().year

    year_range_pattern = re.compile(
        r'(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|19\d{2}|present|current|now)',
        re.IGNORECASE,
    )
    matches = year_range_pattern.findall(text)

    total_years = 0
    seen = set()
    for start_str, end_str in matches:
        try:
            start = int(start_str)
            end = current_year if re.search(r'present|current|now', end_str, re.IGNORECASE) else int(end_str)
            key = (start, end)
            if key not in seen and 1990 <= start <= current_year and start <= end:
                total_years += end - start
                seen.add(key)
        except ValueError:
            continue

    return total_years if total_years > 0 else None


def parse_resume(pdf_path: str) -> Dict:
    raw_text = extract_text_from_pdf(pdf_path)
    sections = detect_sections(raw_text)
    contact = extract_contact_info(raw_text)
    skills_by_cat = extract_skills_keyword(raw_text)
    all_skills = sorted({s for skills in skills_by_cat.values() for s in skills})
    exp_years = estimate_experience_years(sections.get("experience", raw_text))

    return {
        "raw_text": raw_text,
        "sections": sections,
        "contact": contact,
        "skills_by_category": skills_by_cat,
        "all_skills": all_skills,
        "experience_years": exp_years,
        "skill_count": len(all_skills),
        "source_file": str(Path(pdf_path).name),
    }