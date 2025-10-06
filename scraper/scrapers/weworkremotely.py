"""
WeWorkRemotely.com scraper - Remote jobs
"""
from crawlee.playwright_crawler import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import calculate_quality_score, clean_text

logger = Logger("weworkremotely")


async def scrape_weworkremotely(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape remote jobs from WeWorkRemotely.com
    
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
            await page.wait_for_selector('li.feature', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job items
        job_items = await page.query_selector_all('li.feature')
        
        for item in job_items[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Title
                title_el = await item.query_selector('.title')
                if not title_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                
                # Company
                company_el = await item.query_selector('.company')
                company = clean_text(
                    await company_el.inner_text()
                ) if company_el else "Unknown Company"
                
                # Link
                link_el = await item.query_selector('a')
                url = await link_el.get_attribute(
                    'href'
                ) if link_el else None
                
                # Region/Category
                region_el = await item.query_selector('.region')
                region_text = clean_text(
                    await region_el.inner_text()
                ) if region_el else ""
                
                if not title or not url:
                    continue
                
                # Generate external_id
                job_id = url.split('/')[-1]
                external_id = f"weworkremotely-{job_id}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'WeWorkRemotely',
                    'title': title,
                    'company_name': company,
                    'location': 'Remote',
                    'work_type': 'remote',
                    'country_code': None,
                    'region': 'GLOBAL',
                    'category': 'software-engineering',
                    'description': f"{title} at {company} - {region_text}",
                    'application_url': f"https://weworkremotely.com{url}",
                    'source_website': 'https://weworkremotely.com',
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
        max_requests_per_crawl=3,
    )
    
    # Start scraping
    start_url = "https://weworkremotely.com/categories/remote-programming-jobs"
    
    try:
        logger.info(
            f"Starting WeWorkRemotely scraper (max: {max_jobs} jobs)"
        )
        await crawler.run([start_url])
        logger.success(f"WeWorkRemotely completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("WeWorkRemotely scraper failed", e)
    
    return jobs
