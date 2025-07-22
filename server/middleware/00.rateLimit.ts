// Global rate limiting middleware for AI endpoints
// This runs before API routes to enforce rate limits

import { createRateLimit } from '~/server/api/middleware/rateLimit'

// Create rate limiter for AI endpoints: 5 requests per minute
export default createRateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (event) => {
    // Use IP address for rate limiting
    const forwarded = getHeader(event, 'x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               getHeader(event, 'x-real-ip') || 
               event.node.req.socket?.remoteAddress || 
               'unknown'
    
    return `ai_rate_limit:${ip}`
  }
})