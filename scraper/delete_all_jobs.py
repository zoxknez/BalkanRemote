#!/usr/bin/env python3
"""Delete all jobs from both tables"""
import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment
load_dotenv('../.env.local')

# Create Supabase client
sb = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print('🗑️  Deleting all remote jobs from jobs table...')
try:
    # jobs table uses stable_key as primary key
    r1 = sb.table('jobs').delete().neq('stable_key', 'dummy').execute()
    count1 = len(r1.data) if r1.data else 0
    print(f'✓ Deleted {count1} remote jobs')
except Exception as e:
    print(f'✗ Error deleting remote jobs: {e}')

print('🗑️  Deleting all onsite jobs from hybrid_jobs table...')
try:
    # hybrid_jobs uses id as primary key
    r2 = sb.table('hybrid_jobs').delete().neq(
        'id', '00000000-0000-0000-0000-000000000000'
    ).execute()
    count2 = len(r2.data) if r2.data else 0
    print(f'✓ Deleted {count2} onsite jobs')
except Exception as e:
    print(f'✗ Error deleting onsite jobs: {e}')

print('\n✅ All jobs deleted! Ready for fresh scrape.')
