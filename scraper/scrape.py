#!/usr/bin/env python3
"""
Simple wrapper script for running scraper with common commands.

Usage:
  python scrape.py              # Run all enabled sources
  python scrape.py --remote     # Remote jobs only
  python scrape.py --balkan     # Balkan jobs only
  python scrape.py --test       # Test run (no save)
  python scrape.py --load       # Load to Supabase
"""
import sys
import subprocess
import argparse


def main():
    parser = argparse.ArgumentParser(
        description="RemoteBalkan Job Scraper - Simple Wrapper"
    )
    parser.add_argument(
        '--remote',
        action='store_true',
        help='Scrape only remote jobs (API/RSS sources)'
    )
    parser.add_argument(
        '--balkan',
        action='store_true',
        help='Scrape only Balkan jobs (HTML sources)'
    )
    parser.add_argument(
        '--test',
        action='store_true',
        help='Test run - scrape but do not save to file'
    )
    parser.add_argument(
        '--load',
        action='store_true',
        help='Load scraped jobs to Supabase database'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=200,
        help='Limit jobs per source (default: 200)'
    )
    parser.add_argument(
        '--check',
        action='store_true',
        help='Check database job counts'
    )
    
    args = parser.parse_args()
    
    # Check database
    if args.check:
        print("\n[INFO] Checking database counts...\n")
        result = subprocess.run([sys.executable, 'check_db_counts.py'])
        if result.returncode != 0:
            print("[ERROR] Failed to check database. Make sure .env is configured.")
        return
    
    # Load to database
    if args.load:
        print("\n[INFO] Loading jobs to Supabase...\n")
        result = subprocess.run([sys.executable, 'load.py'])
        if result.returncode != 0:
            print("[ERROR] Failed to load jobs. Check out/jobs.ndjson exists and .env is configured.")
        return
    
    # Build runner.py command
    cmd = [sys.executable, 'runner.py', '--limit', str(args.limit)]
    
    if args.test:
        cmd.append('--no-save')
    
    if args.remote:
        cmd.append('--remote-only')
        print("\n[INFO] Scraping REMOTE jobs only...\n")
    elif args.balkan:
        cmd.append('--hybrid-only')
        print("\n[INFO] Scraping BALKAN jobs only...\n")
    else:
        print("\n[INFO] Scraping ALL enabled sources...\n")
    
    # Run scraper
    subprocess.run(cmd)
    
    # Show next steps
    if not args.test:
        print("\n" + "="*60)
        print("[NEXT STEPS]")
        print("="*60)
        print("1. Review scraped jobs: out/jobs.ndjson")
        print("2. Load to database:    python scrape.py --load")
        print("3. Check counts:        python scrape.py --check")
        print("="*60 + "\n")


if __name__ == '__main__':
    main()

