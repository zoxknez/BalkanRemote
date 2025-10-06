"""
Main scraper orchestrator.
Runs all scrapers and upserts data to Supabase.
"""
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

# Import scrapers
from scrapers.infostud import scrape_infostud
from scrapers.remoteok import scrape_remoteok
# TODO: Add more scrapers:
# from scrapers.halooglasi import scrape_halooglasi
# from scrapers.mojposao import scrape_mojposao
# from scrapers.posaoba import scrape_posaoba
# from scrapers.mojedelo import scrape_mojedelo
# from scrapers.weworkremotely import scrape_weworkremotely

from utils.database import Database
from utils.logger import Logger

load_dotenv()

logger = Logger("main")


async def main():
    """Main scraper entry point."""
    logger.info("=" * 60)
    logger.info("🚀 Balkan Jobs Scraper Started")
    logger.info("=" * 60)
    
    start_time = datetime.now()
    
    # Get config from env
    max_jobs = int(os.getenv("MAX_JOBS_PER_SOURCE", "50"))
    dry_run = os.getenv("DRY_RUN", "false").lower() == "true"
    
    logger.info(f"Max jobs per source: {max_jobs}")
    logger.info(f"Dry run mode: {dry_run}")
    logger.info("")
    
    # Initialize database
    db = None if dry_run else Database()
    
    all_jobs = {
        'remote': [],
        'hybrid': []
    }
    
    # ==========================================
    # HYBRID/ONSITE SCRAPERS (hybrid_jobs table)
    # ==========================================
    
    logger.info("📍 Scraping HYBRID/ONSITE jobs...")
    logger.info("")
    
    # Infostud (Srbija)
    try:
        logger.info("🇷🇸 Scraping Infostud...")
        infostud_jobs = await scrape_infostud(max_jobs)
        all_jobs['hybrid'].extend(infostud_jobs)
        logger.success(
            f"Infostud: {len(infostud_jobs)} jobs scraped"
        )
    except Exception as e:
        logger.error("Infostud scraper failed", e)
    
    logger.info("")
    
    # TODO: Add more hybrid scrapers
    # Halo Oglasi (Srbija)
    # MojPosao (Hrvatska)
    # Posao.ba (BiH)
    # MojeDelo (Slovenija)
    
    # ==========================================
    # REMOTE SCRAPERS (jobs table)
    # ==========================================
    
    logger.info("🌍 Scraping REMOTE jobs...")
    logger.info("")
    
    # RemoteOK
    try:
        logger.info("🌐 Scraping RemoteOK...")
        remoteok_jobs = await scrape_remoteok(max_jobs)
        all_jobs['remote'].extend(remoteok_jobs)
        logger.success(
            f"RemoteOK: {len(remoteok_jobs)} jobs scraped"
        )
    except Exception as e:
        logger.error("RemoteOK scraper failed", e)
    
    logger.info("")
    
    # TODO: Add more remote scrapers
    # WeWorkRemotely
    # RemoteWoman
    # Remotive
    # Remotehub
    
    # ==========================================
    # DATABASE UPSERT
    # ==========================================
    
    logger.info("=" * 60)
    logger.info("📊 SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total HYBRID jobs scraped: {len(all_jobs['hybrid'])}")
    logger.info(f"Total REMOTE jobs scraped: {len(all_jobs['remote'])}")
    logger.info("")
    
    if dry_run:
        logger.warn("DRY RUN MODE - Not writing to database")
    else:
        logger.info("💾 Upserting to database...")
        
        # Upsert hybrid jobs
        if all_jobs['hybrid']:
            result = db.upsert_jobs(all_jobs['hybrid'], 'hybrid_jobs')
            logger.success(
                f"Hybrid jobs: {result['inserted']} inserted, "
                f"{result['skipped']} skipped"
            )
        
        # Upsert remote jobs
        if all_jobs['remote']:
            result = db.upsert_jobs(all_jobs['remote'], 'jobs')
            logger.success(
                f"Remote jobs: {result['inserted']} inserted, "
                f"{result['skipped']} skipped"
            )
    
    # Done
    duration = (datetime.now() - start_time).total_seconds()
    logger.info("")
    logger.info("=" * 60)
    logger.success(f"✅ Scraper completed in {duration:.2f}s")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
