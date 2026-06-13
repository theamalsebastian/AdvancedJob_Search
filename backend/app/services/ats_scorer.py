import re
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

ACTION_VERBS = {
    "achieved", "improved", "built", "developed", "led", "managed", "created",
    "designed", "implemented", "launched", "increased", "decreased", "reduced",
    "optimized", "automated", "architected", "deployed", "scaled", "delivered",
    "spearheaded", "drove", "transformed", "streamlined", "engineered",
}

REQUIRED_SECTIONS = ["experience", "education", "skills", "summary"]


def score_formatting(raw_text: str, sections: Dict[str, str]) -> Dict:
    issues = []
    score = 100

    lines = [l for l in raw_text.split("\n") if l.strip()]
    short_lines = sum(1 for l in lines if len(l.strip()) < 15)
    if short_lines / max(len(lines), 1) > 0.4:
        issues.append("Possible multi-column layout — ATS may misread text order")
        score -= 20

    weird_chars = re.findall(r'[●◦▪️➤→]', raw_text)
    if len(weird_chars) > 10:
        issues.append("Heavy use of special bullet symbols — use standard '-' or '•'")
        score -= 10

    if len(raw_text.strip()) < 500:
        issues.append("Very little extractable text — resume may be image-based (not ATS-readable)")
        score -= 30

    tab_lines = sum(1 for l in lines if "\t" in l)
    if tab_lines > 5:
        issues.append("Possible table formatting detected — tables often confuse ATS parsers")
        score -= 15

    return {"score": max(score, 0), "issues": issues}


def score_sections(sections: Dict[str, str]) -> Dict:
    found = [s for s in REQUIRED_SECTIONS if s in sections and sections[s].strip()]
    missing = [s for s in REQUIRED_SECTIONS if s not in found]
    score = (len(found) / len(REQUIRED_SECTIONS)) * 100
    return {"score": round(score, 1), "found_sections": found, "missing_sections": missing}


def score_action_verbs(raw_text: str) -> Dict:
    text_lower = raw_text.lower()
    found_verbs = set()
    for verb in ACTION_VERBS:
        if verb in text_lower:
            found_verbs.add(verb)
    score = min(len(found_verbs) / 8 * 100, 100)
    return {"score": round(score, 1), "verbs_found": sorted(found_verbs), "verb_count": len(found_verbs)}


def score_quantification(raw_text: str) -> Dict:
    patterns = [
        r'\d+%',
        r'\$[\d,]+',
        r'\b\d+x\b',
        r'\b\d{2,}\+?\s*(users|customers|requests|records|hours|days|projects|engineers|people)\b',
        r'\b\d+[kKmMbB]\b',
    ]
    matches = []
    for pattern in patterns:
        matches.extend(re.findall(pattern, raw_text, re.IGNORECASE))

    score = min(len(matches) / 5 * 100, 100)
    return {"score": round(score, 1), "metrics_found": matches[:10], "metric_count": len(matches)}


def keyword_match_score(resume_skills: List[str], job_description: str) -> Dict:
    job_text_lower = job_description.lower()
    resume_skills_lower = [s.lower() for s in resume_skills]

    matched = [s for s in resume_skills_lower if s in job_text_lower]

    from app.services.embedder import SKILL_TO_CATEGORY
    job_skills = set()
    for skill in SKILL_TO_CATEGORY:
        if skill in job_text_lower:
            job_skills.add(skill)

    missing = [s for s in job_skills if s not in resume_skills_lower]
    score = (len(matched) / len(job_skills) * 100) if job_skills else 0

    return {"score": round(min(score, 100), 1), "matched_keywords": matched, "missing_keywords": sorted(missing)[:10]}


def calculate_ats_score(raw_text: str, sections: Dict[str, str], resume_skills: List[str], job_description: str = "") -> Dict:
    formatting = score_formatting(raw_text, sections)
    section_score = score_sections(sections)
    verbs = score_action_verbs(raw_text)
    quant = score_quantification(raw_text)

    keyword = None
    if job_description:
        keyword = keyword_match_score(resume_skills, job_description)

    weights = {"formatting": 0.20, "sections": 0.20, "verbs": 0.15, "quant": 0.15, "keyword": 0.30}

    if keyword:
        overall = (
            formatting["score"] * weights["formatting"]
            + section_score["score"] * weights["sections"]
            + verbs["score"] * weights["verbs"]
            + quant["score"] * weights["quant"]
            + keyword["score"] * weights["keyword"]
        )
    else:
        remaining = 1 - weights["keyword"]
        overall = (
            formatting["score"] * (weights["formatting"] / remaining)
            + section_score["score"] * (weights["sections"] / remaining)
            + verbs["score"] * (weights["verbs"] / remaining)
            + quant["score"] * (weights["quant"] / remaining)
        )

    suggestions = []
    suggestions.extend(formatting["issues"])

    if section_score["missing_sections"]:
        suggestions.append(f"Add missing sections: {', '.join(section_score['missing_sections'])}")

    if verbs["verb_count"] < 5:
        suggestions.append("Use more action verbs (e.g. 'built', 'optimized', 'led') to start bullet points")

    if quant["metric_count"] < 3:
        suggestions.append("Add quantified results (e.g. 'reduced latency by 40%', 'managed team of 5')")

    if keyword and keyword["missing_keywords"]:
        suggestions.append(f"Consider adding these keywords from the job description: {', '.join(keyword['missing_keywords'][:5])}")

    return {
        "overall_score": round(overall, 1),
        "formatting": formatting,
        "sections": section_score,
        "action_verbs": verbs,
        "quantification": quant,
        "keyword_match": keyword,
        "suggestions": suggestions,
    }