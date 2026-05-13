const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now()

  // Lazy cleanup: remove a batch of expired entries on each call
  if (store.size > 500) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
