import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print("\n[DATABASE] Job Counts:\n")

# Count jobs table
jobs_result = supabase.table('jobs').select('*', count='exact').execute()
print(f"jobs table: {jobs_result.count} jobs")

# Count hybrid_jobs table
hybrid_result = supabase.table('hybrid_jobs').select('*', count='exact').execute()
print(f"hybrid_jobs table: {hybrid_result.count} jobs")

# Count by source in hybrid_jobs
sources_result = supabase.table('hybrid_jobs').select('source_name').execute()
sources = {}
for job in sources_result.data:
    source = job.get('source_name', 'unknown')
    sources[source] = sources.get(source, 0) + 1

print("\nBy source in hybrid_jobs:")
for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
    print(f"  {source}: {count}")

print()
