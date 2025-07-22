// Rate limiting middleware for API endpoints
// Simple in-memory rate limiter - for production use Redis or similar

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyGenerator?: (event: any) => string
}

export function createRateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs, keyGenerator = getDefaultKey } = options

  return defineEventHandler(async (event) => {
    // Skip rate limiting for non-matching routes
    if (!event.node.req.url?.startsWith('/api/ai/')) {
      return
    }

    const key = keyGenerator(event)
    const now = Date.now()
    
    let record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // Create new or reset expired record
      record = {
        count: 0,
        resetTime: now + windowMs
      }
      rateLimitStore.set(key, record)
    }
    
    record.count++
    
    // Set rate limit headers
    setHeader(event, 'X-RateLimit-Limit', maxRequests.toString())
    setHeader(event, 'X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
    setHeader(event, 'X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    
    if (record.count > maxRequests) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          error: 'Rate limit exceeded',
          limit: maxRequests,
          window: `${windowMs / 1000}s`,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        }
      })
    }
  })
}

function getDefaultKey(event: any): string {
  // Use IP address as default key
  // In production, consider using user ID if authenticated
  const forwarded = getHeader(event, 'x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             getHeader(event, 'x-real-ip') || 
             event.node.req.socket?.remoteAddress || 
             'unknown'
  
  return `rate_limit:${ip}`
}