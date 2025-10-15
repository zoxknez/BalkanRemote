// Redis cache utility for better performance
// In production, this would connect to a real Redis instance
// For now, we'll use in-memory cache with TTL

interface CacheEntry<T> {
  value: T
  expires: number
}

class RedisCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 300000 // 5 minutes

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    if (entry.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  del(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Invalidate cache entries matching a pattern
  invalidatePattern(pattern: string): void {
    // Convert glob pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`[redis-cache] Invalidated ${keysToDelete.length} keys matching ${pattern}`)
    }
  }
}

// Singleton instance
export const redisCache = new RedisCache()

// Cache key generators
export const cacheKeys = {
  hybridJobs: (filters: any) => `hybrid-jobs:${JSON.stringify(filters)}`,
  hybridJobSuggestions: (query: string) => `hybrid-suggestions:${query}`,
  hybridJobStats: () => 'hybrid-stats',
  portalJobs: (filters: any) => `portal-jobs:${JSON.stringify(filters)}`,
  portalJobSuggestions: (query: string) => `portal-suggestions:${query}`,
  portalJobStats: () => 'portal-stats'
}

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 60000,    // 1 minute
  MEDIUM: 300000,  // 5 minutes
  LONG: 1800000,   // 30 minutes
  VERY_LONG: 3600000 // 1 hour
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  redisCache.cleanup()
}, 300000)

