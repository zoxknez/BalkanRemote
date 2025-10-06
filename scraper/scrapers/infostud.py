"""
Infostud.com scraper (Srbija) - Hybrid/Onsite jobs
"""
from crawlee.playwright_crawler import PlaywrightCrawler, PlaywrightCrawlingContext
from datetime import datetime, timedelta
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import (
    normalize_work_type,
    normalize_employment_type,
    normalize_experience_level,
    extract_salary,
    calculate_quality_score,
    clean_text
)

logger = Logger("infostud")


async def scrape_infostud(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape hybrid/onsite jobs from Infostud.com
    
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
        
        # Wait for job listings to load
        try:
            await page.wait_for_selector('.job-list-item', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job cards
        job_cards = await page.query_selector_all('.job-list-item')
        
        for card in job_cards[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Extract basic info
                title_el = await card.query_selector('.job-title')
                company_el = await card.query_selector('.company-name')
                location_el = await card.query_selector('.location')
                link_el = await card.query_selector('a')
                
                if not title_el or not link_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                location = clean_text(
                    await location_el.inner_text()
                ) if location_el else "Beograd, Srbija"
                url = await link_el.get_attribute('href')
                
                if not url or not title:
                    continue
                
                # Generate external_id
                external_id = f"infostud-{url.split('/')[-1]}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'Poslovi Infostud',
                    'title': title,
                    'company_name': company,
                    'location': location,
                    'work_type': 'hybrid',  # Default for Infostud
                    'country_code': 'RS',
                    'region': 'BALKAN',
                    'category': 'software-engineering',
                    'description': f"{title} pozicija u {company}.",
                    'application_url': f"https://www.poslovi.infostud.com{url}",
                    'source_website': 'https://www.poslovi.infostud.com',
                    'experience_level': 'mid',
                    'employment_type': 'full-time',
                    'posted_date': datetime.now().isoformat(),
                    'scraped_at': datetime.now().isoformat(),
                }
                
                # Calculate quality score
                job['quality_score'] = calculate_quality_score(job)
                
                jobs.append(job)
                logger.info(f"Scraped: {title} at {company}")
                
            except Exception as e:
                logger.error(f"Failed to parse job card", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=5,
    )
    
    # Start scraping
    start_url = "https://www.poslovi.infostud.com/poslovi"
    
    try:
        logger.info(f"Starting Infostud scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"Infostud scraper completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("Infostud scraper failed", e)
    
    return jobs
