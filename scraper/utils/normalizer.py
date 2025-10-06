"""
Data normalization utilities for scraped jobs.
"""
from datetime import datetime
from typing import Optional, Dict, Any
import re


def normalize_work_type(work_type: str) -> str:
    """Normalize work type to standard values."""
    wt = work_type.lower().strip()
    
    if any(x in wt for x in ['remote', 'daljinsk', 'удаљен']):
        return 'remote'
    elif any(x in wt for x in ['hybrid', 'hibrid', 'хибридн']):
        return 'hybrid'
    elif any(x in wt for x in ['onsite', 'office', 'kancelarij', 'канцеларијск']):
        return 'onsite'
    elif any(x in wt for x in ['flexible', 'fleksibil']):
        return 'flexible'
    
    return 'hybrid'  # default


def normalize_employment_type(emp_type: str) -> str:
    """Normalize employment type."""
    et = emp_type.lower().strip()
    
    if any(x in et for x in ['full', 'puno', 'пуно']):
        return 'full-time'
    elif any(x in et for x in ['part', 'skraćen', 'скраћен']):
        return 'part-time'
    elif any(x in et for x in ['contract', 'ugovor', 'уговор']):
        return 'contract'
    elif any(x in et for x in ['freelance', 'slobodn']):
        return 'freelance'
    
    return 'full-time'  # default


def normalize_experience_level(exp: str) -> str:
    """Normalize experience level."""
    e = exp.lower().strip()
    
    if any(x in e for x in ['junior', 'entry', 'početn', 'почетн']):
        return 'junior'
    elif any(x in e for x in ['senior', 'starij', 'старији']):
        return 'senior'
    elif any(x in e for x in ['lead', 'principal', 'architect']):
        return 'senior'
    
    return 'mid'  # default


def extract_salary(
    text: str
) -> tuple[Optional[int], Optional[int], str]:
    """
    Extract salary range from text.
    
    Returns:
        (min_salary, max_salary, currency)
    """
    if not text:
        return None, None, 'EUR'
    
    # Try to find EUR amounts
    eur_pattern = r'(\d{1,5})\s*-\s*(\d{1,5})\s*€|€\s*(\d{1,5})\s*-\s*(\d{1,5})'
    match = re.search(eur_pattern, text)
    if match:
        groups = [g for g in match.groups() if g]
        if len(groups) >= 2:
            return int(groups[0]), int(groups[1]), 'EUR'
    
    # Try USD
    usd_pattern = r'\$(\d{1,6})\s*-\s*\$?(\d{1,6})'
    match = re.search(usd_pattern, text)
    if match:
        return int(match.group(1)), int(match.group(2)), 'USD'
    
    return None, None, 'EUR'


def calculate_quality_score(job: Dict[str, Any]) -> int:
    """
    Calculate quality score for a job (0-100).
    Higher score = better quality data.
    """
    score = 50  # base score
    
    # Has salary info (+20)
    if job.get('salary_min') and job.get('salary_max'):
        score += 20
    
    # Has company name (+10)
    if job.get('company_name') and len(job.get('company_name', '')) > 2:
        score += 10
    
    # Has good description (+10)
    desc = job.get('description', '')
    if len(desc) > 100:
        score += 10
    
    # Has skills (+5)
    if job.get('skills') and len(job.get('skills', [])) > 0:
        score += 5
    
    # Has experience level (+5)
    if job.get('experience_level'):
        score += 5
    
    return min(score, 100)


def is_recent(date_str: str, hours_back: int = 24) -> bool:
    """
    Check if a date string is within the last N hours.
    
    Args:
        date_str: ISO format date string
        hours_back: Number of hours to look back
    
    Returns:
        True if date is recent enough
    """
    try:
        job_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        now = datetime.now(job_date.tzinfo)
        diff = (now - job_date).total_seconds() / 3600
        return diff <= hours_back
    except Exception:
        return True  # If we can't parse, include it


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    return text.strip()
