import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deleteInfostudJobs() {
  console.log('Deleting old Infostud jobs from hybrid_jobs...')
  
  const { error, count } = await supabase
    .from('hybrid_jobs')
    .delete({ count: 'exact' })
    .eq('source_name', 'infostud')
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`✅ Deleted ${count} Infostud jobs`)
  }
}

deleteInfostudJobs()
