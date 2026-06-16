import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Durable rate limiting via Upstash Redis (shared across all serverless
// instances). Falls back to a per-instance in-memory limiter when Upstash
// env vars are absent — e.g. local dev — so the app still works offline.
//
// Vercel's Upstash Marketplace integration provisions UPSTASH_REDIS_REST_*.
// Older Vercel KV used KV_REST_API_* — support both.
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

// One Ratelimit instance per (limit, window) pair, cached so we don't rebuild
// the sliding-window config on every request.
const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms` as `${number} ms`),
      prefix: 'balible-rl',
      analytics: false,
    })
    limiters.set(cacheKey, limiter)
  }
  return limiter
}

// ── In-memory fallback (per-instance) ─────────────────────────────────────────
const memStore = new Map<string, { count: number; resetAt: number }>()

function memoryCheck(key: string, limit: number, windowMs: number): { allowed: boolean } {
  const now = Date.now()
  const entry = memStore.get(key)
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }
  if (entry.count >= limit) return { allowed: false }
  entry.count++
  return { allowed: true }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean }> {
  if (!redis) return memoryCheck(key, limit, windowMs)
  try {
    const { success } = await getLimiter(limit, windowMs).limit(key)
    return { allowed: success }
  } catch {
    // If Redis is unreachable, fail over to the in-memory limiter rather than
    // blocking all traffic.
    return memoryCheck(key, limit, windowMs)
  }
}
