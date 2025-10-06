"""
RemoteOK.com scraper - Remote jobs
"""
from crawlee.playwright_crawler import PlaywrightCrawler, PlaywrightCrawlingContext
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import calculate_quality_score, clean_text

logger = Logger("remoteok")


async def scrape_remoteok(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape remote jobs from RemoteOK.com
    
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
            await page.wait_for_selector('tr.job', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job rows
        job_rows = await page.query_selector_all('tr.job')
        
        for row in job_rows[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Extract data-id for external_id
                job_id = await row.get_attribute('data-id')
                if not job_id:
                    continue
                
                # Title
                title_el = await row.query_selector('h2')
                title = clean_text(
                    await title_el.inner_text()
                ) if title_el else None
                
                # Company
                company_el = await row.query_selector('.company')
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                
                # Location/Tags
                location_el = await row.query_selector('.location')
                location = clean_text(
                    await location_el.inner_text()
                ) if location_el else "Remote"
                
                if not title:
                    continue
                
                # URL
                url = f"https://remoteok.com/remote-jobs/{job_id}"
                
                # Create job object
                job = {
                    'external_id': f"remoteok-{job_id}",
                    'source_name': 'RemoteOK',
                    'title': title,
                    'company_name': company,
                    'location': location,
                    'work_type': 'remote',
                    'country_code': None,
                    'region': 'GLOBAL',
                    'category': 'software-engineering',
                    'description': f"{title} at {company}",
                    'application_url': url,
                    'source_website': 'https://remoteok.com',
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
                logger.error(f"Failed to parse job row", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=3,
    )
    
    # Start scraping
    start_url = "https://remoteok.com/"
    
    try:
        logger.info(f"Starting RemoteOK scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"RemoteOK scraper completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("RemoteOK scraper failed", e)
    
    return jobs
