"""
Quick test script - runs only 2 scrapers for faster testing.
"""
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

# Import only 2 scrapers for quick test
from scrapers.infostud import scrape_infostud
from scrapers.remoteok import scrape_remoteok

from utils.database import Database
from utils.logger import Logger

load_dotenv()

logger = Logger("test")


async def main():
    """Quick test entry point."""
    logger.info("=" * 60)
    logger.info("🧪 QUICK TEST - 2 Scrapers Only")
    logger.info("=" * 60)
    
    start_time = datetime.now()
    
    # Test with small limits
    max_jobs = 10
    dry_run = True  # Always dry run for tests
    
    logger.info(f"Max jobs per source: {max_jobs}")
    logger.info(f"Dry run mode: {dry_run}")
    logger.info("")
    
    all_jobs = {
        'remote': [],
        'hybrid': []
    }
    
    # Test Infostud (Hybrid)
    logger.info("🇷🇸 Testing Infostud...")
    try:
        infostud_jobs = await scrape_infostud(max_jobs)
        all_jobs['hybrid'].extend(infostud_jobs)
        logger.success(f"Infostud: {len(infostud_jobs)} jobs scraped")
    except Exception as e:
        logger.error("Infostud scraper failed", e)
    
    logger.info("")
    
    # Test RemoteOK (Remote)
    logger.info("🌐 Testing RemoteOK...")
    try:
        remoteok_jobs = await scrape_remoteok(max_jobs)
        all_jobs['remote'].extend(remoteok_jobs)
        logger.success(f"RemoteOK: {len(remoteok_jobs)} jobs scraped")
    except Exception as e:
        logger.error("RemoteOK scraper failed", e)
    
    # Summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total HYBRID jobs: {len(all_jobs['hybrid'])}")
    logger.info(f"Total REMOTE jobs: {len(all_jobs['remote'])}")
    logger.info("")
    
    # Show sample jobs
    if all_jobs['hybrid']:
        logger.info("Sample HYBRID job:")
        job = all_jobs['hybrid'][0]
        logger.info(f"  Title: {job['title']}")
        logger.info(f"  Company: {job['company_name']}")
        logger.info(f"  Location: {job['location']}")
        logger.info("")
    
    if all_jobs['remote']:
        logger.info("Sample REMOTE job:")
        job = all_jobs['remote'][0]
        logger.info(f"  Title: {job['title']}")
        logger.info(f"  Company: {job['company_name']}")
        logger.info(f"  Location: {job['location']}")
        logger.info("")
    
    duration = (datetime.now() - start_time).total_seconds()
    logger.info("=" * 60)
    logger.success(f"✅ Test completed in {duration:.2f}s")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
