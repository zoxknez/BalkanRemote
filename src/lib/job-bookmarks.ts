import { createSupabaseServer, createSupabaseBrowser } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

export interface BookmarkRecord {
  user_id: string
  listing_id: string
  created_at: string
}

// Server-side helpers
export async function addBookmarkServer(userId: string, listingId: string) {
  const supabase = createSupabaseServer()
  const { error } = await supabase
    .schema('public')
    .from('job_portal_bookmarks')
    .upsert({ user_id: userId, listing_id: listingId })
  if (error) throw new Error(error.message)
}

export async function removeBookmarkServer(userId: string, listingId: string) {
  const supabase = createSupabaseServer()
  const { error } = await supabase
    .schema('public')
    .from('job_portal_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId)
  if (error) throw new Error(error.message)
}

export async function listBookmarksServer(userId: string) {
  const supabase = createSupabaseServer()
  const { data, error } = await supabase
    .schema('public')
    .from('job_portal_bookmarks')
    .select('listing_id')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return (data || []).map(r => r.listing_id)
}

// Client helper (graceful null if no anon key)
export function getSupabaseClientBrowser() {
  try {
    return createSupabaseBrowser()
  } catch (e) {
    logger.warn('Supabase browser client unavailable', e)
    return null
  }
}
