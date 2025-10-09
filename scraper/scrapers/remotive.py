"""
Remotive.io scraper - Remote jobs
"""
from crawlee_playwright import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import (
    calculate_quality_score,
    clean_text,
    extract_salary
)

logger = Logger("remotive")


async def scrape_remotive(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape remote jobs from Remotive.io
    
    Args:
        max_jobs: Maximum number of jobs to scrape
    
    Returns:
        List of job dictionaries
    """
    jobs = []
    
    async def request_handler(context: PlaywrightCrawlingContext) -> None:
        """Handle each page request."""
        logger.info(f"Scraping {context.request.url}")
        
        page = context.page
        
        # Wait for job listings
        try:
            await page.wait_for_selector('.job-tile', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job tiles
        job_tiles = await page.query_selector_all('.job-tile')
        
        for tile in job_tiles[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Title
                title_el = await tile.query_selector('.job-tile-title')
                if not title_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                
                # Company
                company_el = await tile.query_selector('.company')
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                
                # Link
                link_el = await tile.query_selector('a')
                url = await link_el.get_attribute(
                    'href'
                ) if link_el else None
                
                # Salary
                salary_el = await tile.query_selector('.salary')
                salary_min, salary_max, currency = None, None, 'USD'
                if salary_el:
                    salary_text = await salary_el.inner_text()
                    salary_min, salary_max, currency = extract_salary(
                        salary_text
                    )
                
                # Tags (for experience level)
                tags_el = await tile.query_selector('.tags')
                experience = 'mid'
                if tags_el:
                    tags_text = await tags_el.inner_text()
                    if 'senior' in tags_text.lower():
                        experience = 'senior'
                    elif 'junior' in tags_text.lower():
                        experience = 'junior'
                
                if not title or not url:
                    continue
                
                # Generate external_id
                job_id = url.split('/')[-1].split('?')[0]
                external_id = f"remotive-{job_id}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'Remotive',
                    'title': title,
                    'company_name': company,
                    'location': 'Remote',
                    'work_type': 'remote',
                    'country_code': None,
                    'region': 'GLOBAL',
                    'category': 'software-engineering',
                    'description': f"{title} at {company}",
                    'application_url': (
                        f"https://remotive.io{url}"
                        if url.startswith('/')
                        else url
                    ),
                    'source_website': 'https://remotive.io',
                    'experience_level': experience,
                    'employment_type': 'full-time',
                    'salary_min': salary_min,
                    'salary_max': salary_max,
                    'salary_currency': currency,
                    'posted_date': datetime.now().isoformat(),
                    'scraped_at': datetime.now().isoformat(),
                }
                
                # Calculate quality score
                job['quality_score'] = calculate_quality_score(job)
                
                jobs.append(job)
                logger.info(f"Scraped: {title} at {company}")
                
            except Exception as e:
                logger.error("Failed to parse job tile", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=3,
    )
    
    # Start scraping
    start_url = "https://remotive.io/remote-jobs/software-dev"
    
    try:
        logger.info(f"Starting Remotive scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"Remotive completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("Remotive scraper failed", e)
    
    return jobs
