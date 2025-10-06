"""
Halo Oglasi scraper (Srbija) - Hybrid/Onsite jobs
"""
from crawlee.playwright_crawler import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from datetime import datetime
from typing import List, Dict, Any
from utils.logger import Logger
from utils.normalizer import (
    normalize_work_type,
    calculate_quality_score,
    clean_text,
    extract_salary
)

logger = Logger("halooglasi")


async def scrape_halooglasi(max_jobs: int = 50) -> List[Dict[str, Any]]:
    """
    Scrape hybrid/onsite jobs from HaloOglasi.rs
    
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
            await page.wait_for_selector('.product-item', timeout=10000)
        except Exception as e:
            logger.error("Failed to load job listings", e)
            return
        
        # Extract job cards
        job_cards = await page.query_selector_all('.product-item')
        
        for card in job_cards[:max_jobs]:
            if len(jobs) >= max_jobs:
                break
            
            try:
                # Title and link
                title_el = await card.query_selector('h3.product-title a')
                if not title_el:
                    continue
                
                title = clean_text(await title_el.inner_text())
                url = await title_el.get_attribute('href')
                
                # Company (sometimes in description)
                company = "Unknown Company"
                desc_el = await card.query_selector('.product-description')
                if desc_el:
                    desc = await desc_el.inner_text()
                    # Try to extract company from description
                    if 'kompanija' in desc.lower():
                        company = clean_text(desc.split('\n')[0])
                
                # Location
                location_el = await card.query_selector('.product-location')
                location = clean_text(
                    await location_el.inner_text()
                ) if location_el else "Beograd, Srbija"
                
                # Price/Salary
                price_el = await card.query_selector('.product-price')
                salary_min, salary_max, currency = None, None, 'RSD'
                if price_el:
                    price_text = await price_el.inner_text()
                    salary_min, salary_max, currency = extract_salary(
                        price_text
                    )
                
                if not title or not url:
                    continue
                
                # Generate external_id
                external_id = f"halooglasi-{url.split('/')[-1].split('?')[0]}"
                
                # Create job object
                job = {
                    'external_id': external_id,
                    'source_name': 'Halo Oglasi',
                    'title': title,
                    'company_name': company,
                    'location': location,
                    'work_type': 'hybrid',
                    'country_code': 'RS',
                    'region': 'BALKAN',
                    'category': 'software-engineering',
                    'description': f"{title} pozicija.",
                    'application_url': f"https://www.halooglasi.rs{url}",
                    'source_website': 'https://www.halooglasi.rs',
                    'experience_level': 'mid',
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
                logger.info(f"Scraped: {title}")
                
            except Exception as e:
                logger.error("Failed to parse job card", e)
                continue
    
    # Create crawler
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True,
        max_requests_per_crawl=5,
    )
    
    # Start scraping
    start_url = "https://www.halooglasi.rs/poslovi"
    
    try:
        logger.info(f"Starting Halo Oglasi scraper (max: {max_jobs} jobs)")
        await crawler.run([start_url])
        logger.success(f"Halo Oglasi completed: {len(jobs)} jobs")
    except Exception as e:
        logger.error("Halo Oglasi scraper failed", e)
    
    return jobs
