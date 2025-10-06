"""
Database utility for upserting scraped jobs to Supabase.
"""
import os
from typing import List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        
        self.client: Client = create_client(url, key)
    
    def upsert_jobs(self, jobs: List[Dict[str, Any]], table: str = "jobs") -> Dict[str, Any]:
        """
        Upsert jobs to Supabase table.
        
        Args:
            jobs: List of job dictionaries
            table: Table name ('jobs' for remote, 'hybrid_jobs' for hybrid/onsite)
        
        Returns:
            Dictionary with insert stats
        """
        if not jobs:
            return {"inserted": 0, "skipped": 0}
        
        try:
            # Upsert with on_conflict on external_id
            response = self.client.table(table).upsert(
                jobs,
                on_conflict="external_id"
            ).execute()
            
            return {
                "inserted": len(response.data) if response.data else 0,
                "skipped": len(jobs) - (len(response.data) if response.data else 0)
            }
        
        except Exception as e:
            print(f"❌ Database error: {e}")
            return {"inserted": 0, "skipped": len(jobs), "error": str(e)}
    
    def check_existing(self, external_ids: List[str], table: str = "jobs") -> List[str]:
        """
        Check which external_ids already exist in database.
        
        Returns:
            List of existing external_ids
        """
        try:
            response = self.client.table(table).select("external_id").in_(
                "external_id", external_ids
            ).execute()
            
            return [row["external_id"] for row in response.data] if response.data else []
        
        except Exception as e:
            print(f"❌ Check existing error: {e}")
            return []
