const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit) return { allowed: false }

  entry.count++
  return { allowed: true }
}
