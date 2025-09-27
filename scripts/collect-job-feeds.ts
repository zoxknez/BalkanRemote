#!/usr/bin/env tsx

import Parser from 'rss-parser'
import crypto from 'node:crypto'

import { jobFeedSources } from '@/data/job-feeds'
import { upsertPortalJobs, markFeedSuccess, markFeedError } from '@/lib/job-portal-repository'
import type { PortalJobInsert } from '@/types/jobs'
import { logger } from '@/lib/logger'
import { detectContractType, detectExperienceLevel, coerceDate } from '@/lib/job-feed-classifiers'

const parser = new Parser({
  customFields: {
    item: ['category', 'categories', 'contentSnippet']
  }
})

const FEED_TIMEOUT_MS = parseInt(process.env.FEED_TIMEOUT_MS || '15000', 10)
const FEED_MAX_RETRIES = parseInt(process.env.FEED_MAX_RETRIES || '2', 10)

const MAX_ITEMS_PER_FEED = 50
const JOB_MAX_AGE_DAYS = parseInt(process.env.JOB_MAX_AGE_DAYS || '45', 10)
const JOB_MAX_AGE_MS = JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

function toHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function filterStaleListings(listings: PortalJobInsert[]): PortalJobInsert[] {
  const cutoffTs = Date.now() - JOB_MAX_AGE_MS
  return listings.filter((listing) => {
    const postedTs = new Date(listing.posted_at).getTime()
    if (Number.isNaN(postedTs)) return false
    return postedTs >= cutoffTs
  })
}

type DedupeKeyFn = (listing: PortalJobInsert) => string

function dedupeListings(listings: PortalJobInsert[], makeKey?: DedupeKeyFn): PortalJobInsert[] {
  const dedupedMap = new Map<string, PortalJobInsert>()
  for (const listing of listings) {
    const key = makeKey ? makeKey(listing) : `${listing.source_id}:${listing.external_id}`
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, listing)
    }
  }
  return Array.from(dedupedMap.values())
}

function buildGlobalKey(listing: PortalJobInsert): string {
  const primaryUrl = listing.url || listing.source_url || ''
  if (primaryUrl) {
    const withoutHash = primaryUrl.split('#')[0] ?? primaryUrl
    const normalized = withoutHash.replace(/\/$/, '').toLowerCase()
    if (normalized) {
      return normalized
    }
  }
  const fallback = `${listing.title}|${listing.company}|${listing.experience_level ?? ''}|${listing.remote_type ?? ''}`
  return fallback.toLowerCase()
}

// (detectContractType, detectExperienceLevel, coerceDate) moved to '@/lib/job-feed-classifiers'

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function loadFeedXML(url: string): Promise<string> {
  let attempt = 0
  let lastErr: unknown = null
  while (attempt <= FEED_MAX_RETRIES) {
    try {
      if (attempt > 0) {
        const backoff = 500 * attempt
        await new Promise(r => setTimeout(r, backoff))
      }
      const xml = await fetchWithTimeout(url, FEED_TIMEOUT_MS)
      return xml
    } catch (err) {
      lastErr = err
      if ((err as Error).name === 'AbortError') {
        logger.event('job_source_timeout', { url, attempt })
      } else {
        logger.event('job_source_retry', { url, attempt, error: (err as Error).message })
      }
      attempt += 1
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Unknown feed error')
}

async function collectFeed(sourceId: string): Promise<PortalJobInsert[]> {
  const source = jobFeedSources.find((item) => item.id === sourceId)
  if (!source) {
    throw new Error(`Unknown job feed source: ${sourceId}`)
  }

  logger.info(`🔄 Fetching ${source.name}`)

  if (source.type === 'rss') {
    const xml = await loadFeedXML(source.url)
    const feed = await parser.parseString(xml)
    const items = (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED)

    return items
      .map((item): PortalJobInsert | null => {
        const title = item.title?.trim()
        const link = item.link?.trim()
        if (!title || !link) return null

        const rawCategories = Array.isArray(item.categories)
          ? (item.categories as string[])
          : item.category
            ? [item.category as string]
            : []

        if (source.filters?.include?.length) {
          const matchesInclude = source.filters.include.some((regex) => regex.test(title) || regex.test(item.contentSnippet ?? ''))
          if (!matchesInclude) {
            return null
          }
        }

        if (source.filters?.exclude?.length) {
          const matchesExclude = source.filters.exclude.some((regex) => regex.test(title) || regex.test(item.contentSnippet ?? ''))
          if (matchesExclude) {
            return null
          }
        }

        const combinedCategoryHints = [
          ...(rawCategories || []),
          item.contentSnippet ?? '',
          item.content ?? '',
        ].join(' ').toLowerCase()

        const contractType = detectContractType(combinedCategoryHints)
        const experienceLevel = detectExperienceLevel(combinedCategoryHints)

        const listing: PortalJobInsert = {
          source_id: source.id,
          external_id: item.guid ? String(item.guid) : toHash(link),
          title,
          company: item.creator?.split(' at ').pop()?.trim() || feed.title || source.name,
          company_logo: null,
          location: null,
          type: contractType,
          category: (source.category ?? null) as PortalJobInsert['category'],
          description: item.contentSnippet ?? item.content ?? null,
          requirements: null,
          benefits: null,
          salary_min: null,
          salary_max: null,
          currency: null,
          is_remote: true,
          remote_type: 'fully-remote',
          experience_level: experienceLevel,
          posted_at: coerceDate(item.isoDate || item.pubDate),
          deadline: null,
          url: link,
          source_url: link,
          featured: false,
          tags: [...new Set([...(source.tags ?? []), ...rawCategories.map((c) => c.toLowerCase())])],
          metadata: {
            feedTitle: feed.title,
            feedLink: feed.link,
          },
        }

        return listing
      })
      .filter((listing): listing is PortalJobInsert => listing !== null)
  }

  throw new Error(`Unsupported feed type: ${source.type}`)
}

type SourceSummary = {
  ok: boolean
  fetched: number
  fresh: number
  unique: number
  dedupeRatio: number
  staleFiltered: number
  error?: string
}

async function main() {
  const dryRun = process.env.JOB_SYNC_DRY_RUN === '1' || process.env.JOB_SYNC_DRY_RUN === 'true'
  logger.event('job_sync_start', { at: new Date().toISOString(), dryRun })
  const allListings: PortalJobInsert[] = []
  const perSource: Record<string, SourceSummary> = {}

  for (const source of jobFeedSources) {
    try {
      const listings = await collectFeed(source.id)
      const freshListings = filterStaleListings(listings)
  const uniqueListings = dedupeListings(freshListings)
      const dedupeRatio = listings.length === 0 ? 0 : Number((uniqueListings.length / listings.length).toFixed(4))
      const staleFiltered = listings.length - freshListings.length
      allListings.push(...uniqueListings)
      perSource[source.id] = {
        ok: true,
        fetched: listings.length,
        fresh: freshListings.length,
        unique: uniqueListings.length,
        dedupeRatio,
        staleFiltered,
      }
      logger.event('job_source_collected', {
        source: source.id,
        fetched: listings.length,
        staleFiltered,
        unique: uniqueListings.length,
        dedupe_ratio: dedupeRatio,
        dryRun,
      })
      if (!dryRun) {
        await markFeedSuccess(source.id)
      }
    } catch (error) {
      const message = (error as Error).message
      perSource[source.id] = {
        ok: false,
        fetched: 0,
        fresh: 0,
        unique: 0,
        dedupeRatio: 0,
        staleFiltered: 0,
        error: message,
      }
      logger.event('job_source_error', { source: source.id, error: message, dryRun })
      if (!dryRun) {
        try { await markFeedError(source.id, message) } catch (err) { logger.event('job_source_error_mark_failed', { source: source.id, error: (err as Error).message }) }
      }
    }
  }

  const sourceSummaries = Object.values(perSource)
  const totalFetched = sourceSummaries.reduce((sum, entry) => sum + entry.fetched, 0)
  const totalFresh = sourceSummaries.reduce((sum, entry) => sum + entry.fresh, 0)
  const totalUniqueBeforeGlobal = allListings.length
  const staleFilteredTotal = totalFetched - totalFresh

  if (totalUniqueBeforeGlobal === 0) {
    logger.warn('No listings remaining after filtering/dedupe. ' + (dryRun ? 'Dry run finished.' : 'Aborting upsert.'))
    logger.event('job_sync_summary', {
      dryRun,
      totalFetched,
      totalFresh,
      totalAfterSourceDedupe: totalUniqueBeforeGlobal,
      crossSourceRemoved: 0,
      ratio: 0,
      staleFilteredTotal,
      sources: perSource,
    })
    return
  }

  // Sort newest first and dedupe globally
  const sorted = allListings.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
  const deduped = dedupeListings(sorted, buildGlobalKey)
  const crossSourceRemoved = totalUniqueBeforeGlobal - deduped.length
  const ratio = totalUniqueBeforeGlobal === 0 ? 0 : Number((deduped.length / totalUniqueBeforeGlobal).toFixed(4))

  if (dryRun) {
    logger.event('job_sync_dry_run_complete', {
      totalFetched,
      totalFresh,
      totalAfterSourceDedupe: totalUniqueBeforeGlobal,
      totalAfterGlobalDedupe: deduped.length,
      ratio,
      crossSourceRemoved,
      staleFilteredTotal,
      sources: perSource,
    })
    return
  }

  logger.event('job_upsert_begin', {
    count: deduped.length,
    ratio,
    totalFetched,
    staleFilteredTotal,
    crossSourceRemoved,
  })
  await upsertPortalJobs(deduped)
  logger.event('job_sync_complete', {
    total: deduped.length,
    ratio,
    totalFetched,
    staleFilteredTotal,
    crossSourceRemoved,
    sources: perSource,
  })
}

main().catch((error) => {
  logger.event('job_sync_fatal', { error: (error as Error).message })
  process.exitCode = 1
})
