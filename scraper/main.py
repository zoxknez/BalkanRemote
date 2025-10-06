"""
Main scraper orchestrator.
Runs all scrapers and upserts data to Supabase.
"""
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

# Import scrapers - HYBRID/ONSITE (Balkan)
from scrapers.infostud import scrape_infostud
from scrapers.halooglasi import scrape_halooglasi
from scrapers.mojposao import scrape_mojposao
from scrapers.posaoba import scrape_posaoba
from scrapers.mojedelo import scrape_mojedelo

# Import scrapers - REMOTE (Global)
from scrapers.remoteok import scrape_remoteok
from scrapers.weworkremotely import scrape_weworkremotely
from scrapers.remotive import scrape_remotive
from scrapers.justremote import scrape_justremote

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
    
    # Halo Oglasi (Srbija)
    try:
        logger.info("🇷🇸 Scraping Halo Oglasi...")
        halo_jobs = await scrape_halooglasi(max_jobs)
        all_jobs['hybrid'].extend(halo_jobs)
        logger.success(f"Halo Oglasi: {len(halo_jobs)} jobs scraped")
    except Exception as e:
        logger.error("Halo Oglasi scraper failed", e)
    
    logger.info("")
    
    # MojPosao (Hrvatska)
    try:
        logger.info("🇭🇷 Scraping MojPosao...")
        mojposao_jobs = await scrape_mojposao(max_jobs)
        all_jobs['hybrid'].extend(mojposao_jobs)
        logger.success(f"MojPosao: {len(mojposao_jobs)} jobs scraped")
    except Exception as e:
        logger.error("MojPosao scraper failed", e)
    
    logger.info("")
    
    # Posao.ba (BiH)
    try:
        logger.info("🇧🇦 Scraping Posao.ba...")
        posaoba_jobs = await scrape_posaoba(max_jobs)
        all_jobs['hybrid'].extend(posaoba_jobs)
        logger.success(f"Posao.ba: {len(posaoba_jobs)} jobs scraped")
    except Exception as e:
        logger.error("Posao.ba scraper failed", e)
    
    logger.info("")
    
    # MojeDelo (Slovenija)
    try:
        logger.info("🇸🇮 Scraping MojeDelo...")
        mojedelo_jobs = await scrape_mojedelo(max_jobs)
        all_jobs['hybrid'].extend(mojedelo_jobs)
        logger.success(f"MojeDelo: {len(mojedelo_jobs)} jobs scraped")
    except Exception as e:
        logger.error("MojeDelo scraper failed", e)
    
    logger.info("")
    
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
    
    # WeWorkRemotely
    try:
        logger.info("🌐 Scraping WeWorkRemotely...")
        wwr_jobs = await scrape_weworkremotely(max_jobs)
        all_jobs['remote'].extend(wwr_jobs)
        logger.success(f"WeWorkRemotely: {len(wwr_jobs)} jobs scraped")
    except Exception as e:
        logger.error("WeWorkRemotely scraper failed", e)
    
    logger.info("")
    
    # Remotive
    try:
        logger.info("🌐 Scraping Remotive...")
        remotive_jobs = await scrape_remotive(max_jobs)
        all_jobs['remote'].extend(remotive_jobs)
        logger.success(f"Remotive: {len(remotive_jobs)} jobs scraped")
    except Exception as e:
        logger.error("Remotive scraper failed", e)
    
    logger.info("")
    
    # JustRemote
    try:
        logger.info("🌐 Scraping JustRemote...")
        justremote_jobs = await scrape_justremote(max_jobs)
        all_jobs['remote'].extend(justremote_jobs)
        logger.success(f"JustRemote: {len(justremote_jobs)} jobs scraped")
    except Exception as e:
        logger.error("JustRemote scraper failed", e)
    
    logger.info("")
    
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
