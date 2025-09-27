#!/usr/bin/env tsx

import Parser from 'rss-parser'
import crypto from 'node:crypto'

import { jobFeedSources } from '@/data/job-feeds'
import { upsertPortalJobs } from '@/lib/job-portal-repository'
import type { PortalJobInsert } from '@/types/jobs'
import { logger } from '@/lib/logger'
import { detectContractType, detectExperienceLevel, coerceDate } from '@/lib/job-feed-classifiers'

const parser = new Parser({
  customFields: {
    item: ['category', 'categories', 'contentSnippet']
  }
})

const MAX_ITEMS_PER_FEED = 50

function toHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

// (detectContractType, detectExperienceLevel, coerceDate) moved to '@/lib/job-feed-classifiers'

async function collectFeed(sourceId: string): Promise<PortalJobInsert[]> {
  const source = jobFeedSources.find((item) => item.id === sourceId)
  if (!source) {
    throw new Error(`Unknown job feed source: ${sourceId}`)
  }

  logger.info(`🔄 Fetching ${source.name}`)

  if (source.type === 'rss') {
    const feed = await parser.parseURL(source.url)
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

async function main() {
  logger.event('job_sync_start', { at: new Date().toISOString() })
  const allListings: PortalJobInsert[] = []

  for (const source of jobFeedSources) {
    try {
      const listings = await collectFeed(source.id)
      allListings.push(...listings)
      logger.event('job_source_collected', { source: source.id, count: listings.length })
    } catch (error) {
      logger.event('job_source_error', { source: source.id, error: (error as Error).message })
    }
  }

  if (allListings.length === 0) {
    logger.warn('No listings collected. Aborting upsert.')
    return
  }

  // Sort newest first and limit total volume
  const sorted = allListings.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
  const dedupedMap = new Map<string, PortalJobInsert>()

  for (const listing of sorted) {
    const key = `${listing.source_id}:${listing.external_id}`
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, listing)
    }
  }

  const deduped = Array.from(dedupedMap.values())
  logger.event('job_upsert_begin', { count: deduped.length })

  await upsertPortalJobs(deduped)

  logger.event('job_sync_complete', { total: deduped.length })
}

main().catch((error) => {
  logger.event('job_sync_fatal', { error: (error as Error).message })
  process.exitCode = 1
})
