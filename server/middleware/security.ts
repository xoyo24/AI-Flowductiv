// Simple security headers middleware
export default defineEventHandler(async (event) => {
  // Set basic security headers
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-XSS-Protection', '1; mode=block')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS headers for API routes
  if (event.node.req.url?.startsWith('/api/')) {
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Handle preflight OPTIONS requests
  if (event.node.req.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
