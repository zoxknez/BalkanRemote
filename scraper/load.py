"""
Load scraped jobs into Supabase.
Reads NDJSON output and inserts/updates database.
"""
import os
import json
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

# Pokušaj da pokupiš i .env.local ako standardna .env nije pronađena
if not os.getenv('SUPABASE_URL') and not os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    env_local = Path(__file__).resolve().parents[1] / '.env.local'
    if env_local.exists():
        load_dotenv(dotenv_path=env_local, override=False)


def get_supabase_client() -> Client:
    """Get Supabase client."""
    url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        raise ValueError("Missing Supabase credentials in .env")
    
    return create_client(url, key)


def load_jobs_from_ndjson(filepath: str = 'out/jobs.ndjson') -> List[Dict]:
    """Load jobs from NDJSON file."""
    jobs = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                jobs.append(json.loads(line))
    
    return jobs


def split_by_remote_type(
    jobs: List[Dict[str, Any]]
) -> tuple[List[Dict], List[Dict]]:
    """
    Split jobs into remote and hybrid/onsite tables.
    
    Jobs with 'stable_key' go to 'jobs' table (remote).
    Jobs without 'stable_key' go to 'hybrid_jobs' table.
    
    Returns:
        (remote_jobs, hybrid_jobs)
    """
    remote = []
    hybrid = []
    
    for job in jobs:
        # Check if it has stable_key (jobs table) or not (hybrid_jobs table)
        if 'stable_key' in job:
            remote.append(job)
        else:
            hybrid.append(job)
    
    return remote, hybrid


def upsert_jobs(
    client: Client,
    jobs: List[Dict[str, Any]],
    table: str
) -> int:
    """
    Upsert jobs to Supabase table.
    
    Args:
        client: Supabase client
        jobs: List of job dicts
        table: Table name ('jobs' or 'hybrid_jobs')
    
    Returns:
        Number of jobs inserted
    """
    if not jobs:
        return 0
    
    # Batch upsert
    batch_size = 100
    total = 0
    
    for i in range(0, len(jobs), batch_size):
        batch = jobs[i:i+batch_size]
        
        try:
            # Upsert with appropriate conflict target
            conflict_col = 'stable_key' if table == 'jobs' else 'external_id'
            
            client.table(table).upsert(
                batch,
                on_conflict=conflict_col
            ).execute()

            total += len(batch)
            print(f"  ✅ Inserted {len(batch)} jobs to {table}")
        
        except Exception as e:
            print(f"  ❌ Failed batch {i//batch_size + 1}: {e}")
    
    return total


def main():
    print("\n📥 Loading jobs from NDJSON...\n")
    
    # Load jobs
    jobs = load_jobs_from_ndjson()
    print(f"Loaded {len(jobs)} total jobs")
    
    # Split by remote type
    remote, hybrid = split_by_remote_type(jobs)
    print(f"  Remote: {len(remote)}")
    print(f"  Hybrid/Onsite: {len(hybrid)}")
    
    # Get Supabase client
    print("\n📡 Connecting to Supabase...")
    client = get_supabase_client()
    
    # Upsert to tables
    print("\n💾 Upserting to database...\n")
    
    if remote:
        print(f"Inserting {len(remote)} remote jobs...")
        upsert_jobs(client, remote, 'jobs')
    
    if hybrid:
        print(f"\nInserting {len(hybrid)} hybrid/onsite jobs...")
        upsert_jobs(client, hybrid, 'hybrid_jobs')
    
    print("\n✅ Done!\n")


if __name__ == '__main__':
    main()
