import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return (forwarded?.split(',')[0] || real || '127.0.0.1').trim()
}

export function rateLimit(
  request: NextRequest,
  type: 'auth' | 'api'
): Response | null {
  cleanupExpiredEntries()

  const ip = getIp(request)
  const key = `${type}:${ip}`
  const now = Date.now()

  const config =
    type === 'auth'
      ? { max: 10, window: 15 * 60 * 1000 } // 10 req / 15 min
      : { max: 60, window: 60 * 1000 } // 60 req / 1 min

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.window })
    return null
  }

  entry.count++

  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': retryAfter.toString() },
    })
  }

  return null
}

// NOTE: In-memory store resets on cold start.
// For multi-instance production, use @upstash/ratelimit + Redis
