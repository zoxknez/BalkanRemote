"""
JustRemote.co scraper - Remote jobs
"""
from crawlee.playwright_crawler import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import calculate_quality_score, clean_text

logger = Logger("justremote")


async def scrape_justremote(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape remote jobs from JustRemote.co
    
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
            await page.wait_for_selector('.job-card', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job cards
        job_cards = await page.query_selector_all('.job-card')
        
        for card in job_cards[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Title
                title_el = await card.query_selector('h3 a')
                if not title_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                url = await title_el.get_attribute('href')
                
                # Company
                company_el = await card.query_selector('.company-name')
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                
                # Location (usually "Remote" but might have region)
                location_el = await card.query_selector('.location')
                location = clean_text(
                    await location_el.inner_text()
                ) if location_el else "Remote"
                
                if not title or not url:
                    continue
                
                # Generate external_id
                job_id = url.split('/')[-1].split('?')[0]
                external_id = f"justremote-{job_id}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'JustRemote',
                    'title': title,
                    'company_name': company,
                    'location': location,
                    'work_type': 'remote',
                    'country_code': None,
                    'region': 'GLOBAL',
                    'category': 'software-engineering',
                    'description': f"{title} at {company}",
                    'application_url': (
                        f"https://justremote.co{url}"
                        if url.startswith('/')
                        else url
                    ),
                    'source_website': 'https://justremote.co',
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
                logger.error("Failed to parse job card", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=3,
    )
    
    # Start scraping
    start_url = "https://justremote.co/remote-developer-jobs"
    
    try:
        logger.info(f"Starting JustRemote scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"JustRemote completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("JustRemote scraper failed", e)
    
    return jobs
