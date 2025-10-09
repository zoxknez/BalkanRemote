"""
Config-driven job scraper runner.
Supports API, RSS, and HTML (with JSON-LD + CSS fallback).
"""
import json
import time
from time import perf_counter
from pathlib import Path
from typing import Dict, Iterable, List, Any, Optional, Set

import yaml
import requests
import feedparser
from bs4 import BeautifulSoup

from normalize import normalize_job, normalize_hybrid_job, sanitize_html
from dotenv import load_dotenv

load_dotenv()


class JobRunner:
    def __init__(self, config_path: str = 'config/jobsites.yaml'):
        """Initialize runner with config."""
        self.config_path = config_path
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f) or {}

        self.defaults = self.config.get('defaults', {})
        self.sources = self.config.get('sources', [])
        self.jobs: List[Dict[str, Any]] = []
        self.seen_ids: Set[str] = set()
        self.source_stats: List[Dict[str, Any]] = []
        self.errors: List[Dict[str, str]] = []

        # Create output dir
        Path('out').mkdir(exist_ok=True)

    def list_sources(self) -> List[Dict[str, Any]]:
        """Return metadata about configured sources."""
        sources = []
        for src in self.sources:
            sources.append({
                'id': src['id'],
                'enabled': src.get('enabled', True),
                'kind': src.get('kind', 'unknown'),
                'remote_type': src.get('derive', {}).get(
                    'remote_type', 'UNKNOWN'
                ),
                'region': src.get('derive', {}).get('region', 'GLOBAL'),
                'url': src.get('url') or src.get('start_url', ''),
            })
        return sources
    
    def run(
        self,
        only_sources: Optional[Iterable[str]] = None,
        skip_disabled: bool = True,
        limit_per_source: Optional[int] = None,
        include_remote: bool = True,
        include_hybrid: bool = True,
    ) -> List[Dict[str, Any]]:
        """Run configured sources and collect jobs."""

        selected_ids: Optional[Set[str]] = None
        if only_sources:
            selected_ids = {s.strip() for s in only_sources}

        selected_sources: List[Dict[str, Any]] = []
        for source in self.sources:
            if selected_ids and source['id'] not in selected_ids:
                continue
            if skip_disabled and not source.get('enabled', True):
                continue
            selected_sources.append(source)

        if not selected_sources:
            print("⚠️  No sources selected. Nothing to do.")
            self.jobs = []
            self.source_stats = []
            return []

        print(
            "\n🚀 Starting scraper run with "
            f"{len(selected_sources)} sources\n"
        )

        self.jobs = []
        self.seen_ids = set()
        self.source_stats = []
        self.errors = []

        for source in selected_sources:
            source_id = source['id']
            kind = source.get('kind', 'unknown')
            start_time = perf_counter()
            raw_jobs: List[Dict[str, Any]] = []
            duplicates = 0
            kept = 0
            error_message: Optional[str] = None

            try:
                print(f"📡 [{source_id}] Fetching ({kind})...")
                if kind == 'api':
                    raw_jobs = self.fetch_api(source)
                elif kind == 'rss':
                    raw_jobs = self.fetch_rss(source)
                elif kind == 'html':
                    raw_jobs = self.fetch_html(source)
                else:
                    raise ValueError(f"Unknown source kind '{kind}'")

                if limit_per_source is not None:
                    raw_jobs = raw_jobs[:limit_per_source]

                print(f"✅ [{source_id}] Retrieved {len(raw_jobs)} records")

                remote_type_source = source.get('derive', {}).get(
                    'remote_type', 'UNKNOWN'
                )

                for job in raw_jobs:
                    target_remote_type = remote_type_source
                    if remote_type_source == 'REMOTE':
                        if not include_remote:
                            continue
                        normalized = normalize_job(job, source)
                        job_id = normalized.get('stable_key')
                    else:
                        if not include_hybrid:
                            continue
                        normalized = normalize_hybrid_job(job, source)
                        job_id = normalized.get('external_id')
                        target_remote_type = normalized.get(
                            'remote_type', target_remote_type
                        )

                    if not job_id:
                        duplicates += 1
                        continue

                    if job_id in self.seen_ids:
                        duplicates += 1
                        continue

                    self.seen_ids.add(job_id)
                    normalized['remote_type'] = normalized.get(
                        'remote_type', target_remote_type
                    )
                    self.jobs.append(normalized)
                    kept += 1

                rate_limit = source.get(
                    'rate_limit', self.defaults.get('rate_limit_per_host', 1.0)
                )
                if rate_limit:
                    time.sleep(max(0.0, 1.0 / float(rate_limit)))

            except Exception as exc:  # noqa: BLE001 - report the exact failure
                error_message = str(exc)
                self.errors.append(
                    {'source': source_id, 'error': error_message}
                )
                print(f"❌ [{source_id}] Error: {error_message}")

            duration = perf_counter() - start_time
            self.source_stats.append({
                'id': source_id,
                'kind': kind,
                'raw': len(raw_jobs),
                'kept': kept,
                'duplicates': duplicates,
                'duration': duration,
                'enabled': source.get('enabled', True),
                'error': error_message,
            })

        total_jobs = len(self.jobs)

        print("\n📋 Source summary:")
        header = (
            f"{'Source':<15} {'Kind':<6} {'Raw':>5} {'Saved':>6} "
            f"{'Dupes':>6} {'Time(s)':>8} Status"
        )
        print(header)
        print('-' * len(header))
        for stat in self.source_stats:
            status = 'OK'
            if stat['error']:
                status = 'ERROR'
            elif stat['kept'] == 0:
                status = 'EMPTY'
            print(
                f"{stat['id']:<15} {stat['kind']:<6} {stat['raw']:>5} "
                f"{stat['kept']:>6} {stat['duplicates']:>6} "
                f"{stat['duration']:>8.1f} {status}"
            )

        remote_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'REMOTE'
        )
        hybrid_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'HYBRID'
        )
        onsite_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'ONSITE'
        )

        print(f"\n✅ Total unique jobs collected: {total_jobs}")
        print(f"   Remote: {remote_count}")
        print(f"   Hybrid: {hybrid_count}")
        print(f"   Onsite: {onsite_count}\n")

        return self.jobs

    def save_ndjson(self, filepath: str = 'out/jobs.ndjson') -> Path:
        """Persist scraped jobs to an NDJSON file."""
        output_path = Path(filepath)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open('w', encoding='utf-8') as handle:
            for job in self.jobs:
                handle.write(json.dumps(job, ensure_ascii=False) + '\n')
        print(f"💾 Saved to {output_path}")
        return output_path

    def summary(self) -> Dict[str, Any]:
        """Return aggregate counts for the last run."""
        remote_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'REMOTE'
        )
        hybrid_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'HYBRID'
        )
        onsite_count = sum(
            1 for job in self.jobs if job.get('remote_type') == 'ONSITE'
        )
        return {
            'total': len(self.jobs),
            'remote': remote_count,
            'hybrid': hybrid_count,
            'onsite': onsite_count,
            'sources': self.source_stats,
            'errors': self.errors,
        }
    
    def fetch_api(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch jobs from API endpoint."""
        url = source['url']
        mapping = source.get('mapping', {})
        
        headers = {
            'User-Agent': self.defaults.get(
                'user_agent', 'RemoteBalkan/1.0'
            )
        }

        timeout = source.get(
            'timeout', self.defaults.get('timeout_sec', 30)
        )
        
        resp = requests.get(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        
        data = resp.json()
        
        # Extract jobs array using list_path
        list_path = mapping.get('list_path', 'jobs')
        if list_path == '$':
            # Root is array
            items = data if isinstance(data, list) else [data]
        else:
            # Extract nested key
            items = data.get(list_path, [])
        
        # Skip first item if it's metadata (remoteok.com specific)
        if isinstance(items, list) and len(items) > 0:
            first = items[0]
            if isinstance(first, dict) and 'legal_url' in first:
                items = items[1:]
        
        # Map fields
        field_mapping = mapping.get('fields', {})
        
        jobs = []
        for item in items:
            if not isinstance(item, dict):
                continue
            
            job = {}
            for our_field, their_field in field_mapping.items():
                value = item.get(their_field)
                if value is not None:
                    job[our_field] = value
            
            # Ensure URL field exists
            if 'url' not in job and 'external_id' in job:
                job['url'] = f"{url}/{job['external_id']}"
            
            jobs.append(job)
        
        return jobs
    
    def fetch_rss(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch jobs from RSS feed."""
        url = source['url']
        
        feed = feedparser.parse(url)
        
        jobs = []
        for entry in feed.entries:
            job = {
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'description': sanitize_html(
                    entry.get('summary', '') or entry.get('description', '')
                ),
                'posted_at': entry.get('published', ''),
                'company': entry.get('author', ''),
            }
            
            # Extract tags from categories
            tags = [
                tag.get('term')
                for tag in entry.get('tags', [])
                if 'term' in tag
            ]
            if tags:
                job['tags'] = tags
            
            jobs.append(job)
        
        return jobs
    
    def fetch_html(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch jobs from HTML page (JSON-LD + CSS fallback)."""
        url = source.get('start_url') or source.get('url', '')
        
        headers = {
            'User-Agent': self.defaults.get(
                'user_agent', 'RemoteBalkan/1.0'
            )
        }
        
        timeout = source.get('timeout', self.defaults.get('timeout', 30))
        
        resp = requests.get(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        
        html = resp.text
        soup = BeautifulSoup(html, 'html.parser')
        
        jobs = []
        
        # Extract HTML config
        html_config = source.get('html', {})
        prefer_jsonld = html_config.get('prefer_jsonld', False)
        
        # Try JSON-LD first if preferred
        if prefer_jsonld:
            jsonld_jobs = self.extract_jsonld(soup)
            if jsonld_jobs:
                return jsonld_jobs
        
        # Fallback to CSS selectors
        selectors = html_config.get('selectors', {})
        if not selectors:
            return []
        
        job_selector = selectors.get('job')
        if not job_selector:
            return []
        
        job_elements = soup.select(job_selector)
        
        for elem in job_elements:
            job = {}
            
            # Extract each field using selectors
            for field, selector in selectors.items():
                if field == 'job':
                    continue
                
                try:
                    found = elem.select_one(selector)
                    if found:
                        if field == 'url':
                            job[field] = found.get('href', '')
                        else:
                            job[field] = sanitize_html(found.get_text())
                except Exception:
                    pass
            
            if job.get('title'):
                jobs.append(job)
        
        return jobs
    
    def extract_jsonld(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract JobPosting from JSON-LD structured data."""
        jobs = []
        
        scripts = soup.find_all('script', type='application/ld+json')
        
        for script in scripts:
            try:
                data = json.loads(script.string)
                
                # Handle @graph wrapper
                if isinstance(data, dict) and '@graph' in data:
                    data = data['@graph']
                
                # Handle single JobPosting
                if isinstance(data, dict):
                    data = [data]
                
                # Extract JobPosting items
                for item in data:
                    if not isinstance(item, dict):
                        continue
                    
                    item_type = item.get('@type', '')
                    if 'JobPosting' not in item_type:
                        continue
                    
                    # Extract fields
                    job = {
                        'title': item.get('title', ''),
                        'company': self._extract_org_name(
                            item.get('hiringOrganization')
                        ),
                        'location': self._extract_location(
                            item.get('jobLocation')
                        ),
                        'description': sanitize_html(
                            item.get('description', '')
                        ),
                        'posted_at': item.get('datePosted', ''),
                        'url': item.get('url', ''),
                        'employment_type': item.get('employmentType', ''),
                    }
                    
                    # Salary
                    salary = item.get('baseSalary')
                    if isinstance(salary, dict):
                        value = salary.get('value', {})
                        if isinstance(value, dict):
                            job['salary_min'] = value.get('minValue')
                            job['salary_max'] = value.get('maxValue')
                            job['salary_currency'] = value.get('currency')
                    
                    jobs.append(job)
            
            except Exception as e:
                print(f"  ⚠️  Failed to parse JSON-LD: {e}")
        
        return jobs
    
    def _extract_org_name(self, org: Any) -> str:
        """Extract organization name from various formats."""
        if isinstance(org, str):
            return org
        if isinstance(org, dict):
            return org.get('name', '')
        return ''
    
    def _extract_location(self, loc: Any) -> str:
        """Extract location from various formats."""
        if isinstance(loc, str):
            return loc
        if isinstance(loc, dict):
            addr = loc.get('address', {})
            if isinstance(addr, dict):
                return addr.get('addressLocality', '') or \
                       addr.get('addressCountry', '')
            return loc.get('name', '')
        if isinstance(loc, list) and loc:
            return self._extract_location(loc[0])
        return ''


def main():
    runner = JobRunner()
    jobs = runner.run()
    
    # Print stats
    remote = sum(1 for j in jobs if j.get('remote_type') == 'REMOTE')
    hybrid = sum(1 for j in jobs if j.get('remote_type') == 'HYBRID')
    onsite = sum(1 for j in jobs if j.get('remote_type') == 'ONSITE')
    
    print("\n📊 Stats:")
    print(f"   Remote: {remote}")
    print(f"   Hybrid: {hybrid}")
    print(f"   Onsite: {onsite}")
    print(f"   Total:  {len(jobs)}")

    output_path = runner.save_ndjson()
    print(f"   NDJSON: {output_path}\n")


if __name__ == '__main__':
    main()
