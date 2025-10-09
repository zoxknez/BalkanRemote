"""
Remote.co scraper - Remote jobs
"""
from crawlee_playwright import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import calculate_quality_score, clean_text

logger = Logger("remoteco")


async def scrape_remoteco(max_jobs: int = 200) -> List[Dict[str, Any]]:
    """
    Scrape remote jobs from Remote.co
    
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
            await page.wait_for_selector('.job', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job items
        job_items = await page.query_selector_all('.job')
        
        for item in job_items[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Title
                title_el = await item.query_selector('.job_title a')
                if not title_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                url = await title_el.get_attribute('href')
                
                # Company
                company_el = await item.query_selector('.company')
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                
                if not title or not url:
                    continue
                
                # Generate external_id
                job_id = url.split('/')[-1].split('?')[0]
                external_id = f"remoteco-{job_id}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'Remote.co',
                    'title': title,
                    'company_name': company,
                    'location': 'Remote',
                    'work_type': 'remote',
                    'country_code': None,
                    'region': 'GLOBAL',
                    'category': 'software-engineering',
                    'description': f"{title} at {company}",
                    'application_url': f"https://remote.co{url}",
                    'source_website': 'https://remote.co',
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
                logger.error("Failed to parse job item", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=10,
    )
    
    # Start scraping
    start_url = "https://remote.co/remote-jobs/developer/"
    
    try:
        logger.info(f"Starting Remote.co scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"Remote.co completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("Remote.co scraper failed", e)
    
    return jobs
