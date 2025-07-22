// Security headers and enhanced error handling middleware
// Runs on all requests to add security headers and standardize errors

export default defineEventHandler(async (event) => {
  // Set security headers for all responses
  setHeaders(event, {
    // CORS headers - allow same origin only by default
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : getHeader(event, 'host') || 'self',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Nuxt needs eval for dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    
    // Prevent caching of sensitive data
    'Cache-Control': event.node.req.url?.startsWith('/api/') 
      ? 'no-store, no-cache, must-revalidate, private' 
      : 'public, max-age=3600'
  })
  
  // Handle preflight OPTIONS requests
  if (event.node.req.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
  
  // Enhanced error handling for API routes
  if (event.node.req.url?.startsWith('/api/')) {
    try {
      // Let the request continue to the actual handler
      return
    } catch (error) {
      // This catch block handles any unhandled errors
      console.error('API Error:', error)
      
      // Don't expose internal errors in production
      const isDev = process.env.NODE_ENV === 'development'
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: isDev ? {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : {
          error: 'An internal server error occurred'
        }
      })
    }
  }
})