"""
Normalization utilities for job data.
Maps various source formats to unified schema.
"""
import re
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional


def sanitize_html(text: str) -> str:
    """Remove HTML tags from text."""
    if not text:
        return ''
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def norm_remote_type(text: str) -> str:
    """
    Normalize remote type from text.
    
    Returns: REMOTE | HYBRID | ONSITE | UNKNOWN
    """
    if not text:
        return 'UNKNOWN'
    
    t = text.lower()
    
    # Remote keywords
    if any(x in t for x in ['remote', 'daljinsk', 'удаљен', 'rad od kuće', 'rad od kuce']):
        return 'REMOTE'
    
    # Hybrid keywords
    if any(x in t for x in ['hybrid', 'hibrid', 'хибридн', 'fleksibil']):
        return 'HYBRID'
    
    # Onsite keywords
    if any(x in t for x in ['onsite', 'on-site', 'on site', 'office', 'kancelarij', 'канцеларијск', 'na lokaciji']):
        return 'ONSITE'
    
    return 'UNKNOWN'


def make_job_id(source: str, url: str, title: str, company: str) -> str:
    """
    Generate unique job ID from key fields.
    
    Uses SHA1 hash to ensure consistency.
    """
    key = f"{source}\u241f{url}\u241f{title}\u241f{company}"
    return hashlib.sha1(key.encode('utf-8')).hexdigest()


def parse_date(date_str: Optional[str]) -> Optional[str]:
    """
    Parse various date formats to ISO 8601.
    
    Returns ISO string or None.
    """
    if not date_str:
        return None
    
    try:
        # Try common formats
        from dateutil import parser
        dt = parser.parse(date_str)
        return dt.isoformat()
    except Exception:
        return None


def normalize_job(raw: Dict[str, Any], source_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize raw job data for 'jobs' table (remote jobs).
    
    Args:
        raw: Raw job data from scraper
        source_config: Source configuration with derive rules
    
    Returns:
        Normalized job dictionary for jobs table
    """
    # Extract derived fields
    derive = source_config.get('derive', {})
    
    # Base fields
    source = source_config['id']
    url = raw.get('url', '') or ''
    title = raw.get('title', '') or 'Untitled Position'
    company = raw.get('company', '') or 'Unknown Company'
    location = raw.get('location', '') or ''
    
    # Salary
    salary_min = raw.get('salary_min')
    salary_max = raw.get('salary_max')
    
    # Posted date
    posted_at = raw.get('posted_at')
    if posted_at:
        posted_at = parse_date(str(posted_at))
    if not posted_at:
        posted_at = datetime.now().isoformat()
    
    # Build normalized job for 'jobs' table (Remote jobs)
    job = {
        'stable_key': make_job_id(source, url, title, company),
        'source_id': source,
        'source_name': source_config.get('name', source),
        'title': title,
        'company': company,
        'location': location,
        'remote': True,  # All jobs in 'jobs' table are remote
    'remote_type': derive.get('remote_type', 'REMOTE'),
        'posted_at': posted_at,
        'apply_url': url,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'salary_currency': raw.get('salary_currency', 'EUR'),
        'salary_min_eur': salary_min,  # Assume already in EUR
        'salary_max_eur': salary_max,
        'raw': raw  # Store complete raw data
    }
    
    return job


def normalize_hybrid_job(
    raw: Dict[str, Any],
    source_config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Normalize raw job data for 'hybrid_jobs' table.
    
    Args:
        raw: Raw job data from scraper
        source_config: Source configuration with derive rules
    
    Returns:
        Normalized job dictionary for hybrid_jobs table
    """
    # Extract derived fields
    derive = source_config.get('derive', {})
    
    # Base fields
    source = source_config['id']
    url = raw.get('url', '') or ''
    title = raw.get('title', '') or 'Untitled Position'
    company = raw.get('company', '') or 'Unknown Company'
    location = raw.get('location', '') or ''
    description = sanitize_html(raw.get('description', '')) or ''
    
    # Remote type
    remote_type = derive.get('remote_type', 'UNKNOWN')
    if remote_type == 'UNKNOWN':
        # Try to detect from title/description
        combined = f"{title} {description} {location}".lower()
        remote_type = norm_remote_type(combined)
    
    # Map to work_type
    work_type_map = {
        'REMOTE': 'remote',
        'HYBRID': 'hybrid',
        'ONSITE': 'onsite',
        'UNKNOWN': 'onsite'
    }
    work_type = work_type_map.get(remote_type, 'onsite')
    
    # Salary
    salary_min = raw.get('salary_min')
    salary_max = raw.get('salary_max')
    
    # Tags
    tags = raw.get('tags', [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',') if t.strip()]
    
    # Posted date
    posted_at = raw.get('posted_at')
    if posted_at:
        posted_at = parse_date(str(posted_at))
    if not posted_at:
        posted_at = datetime.now().isoformat()
    
    # Build normalized job for 'hybrid_jobs' table
    job = {
        'title': title,
        'description': description,
        'company_name': company,
        'location': location,
        'country_code': derive.get('country_code'),
        'region': derive.get('region', 'GLOBAL'),
        'work_type': work_type,
        'remote_type': remote_type,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'salary_currency': raw.get('salary_currency', 'EUR'),
        'experience_level': 'mid',  # Default
        'employment_type': 'full-time',  # Default
        'skills': tags,
        'technologies': tags,
        'application_url': url,
        'external_id': make_job_id(source, url, title, company),
        'source_name': source,
        'source_website': source_config.get(
            'start_url', source_config.get('url', '')
        ),
        'scraped_at': datetime.now().isoformat(),
        'posted_date': posted_at,
        'quality_score': calculate_quality_score({
            'salary_min': salary_min,
            'salary_max': salary_max,
            'company_name': company,
            'description': description,
            'skills': tags
        })
    }
    
    return job


def calculate_quality_score(job: Dict[str, Any]) -> int:
    """
    Calculate quality score for a job (0-100).
    Higher score = better quality data.
    """
    score = 50  # base
    
    # Has salary (+20)
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
    
    return min(score, 100)
