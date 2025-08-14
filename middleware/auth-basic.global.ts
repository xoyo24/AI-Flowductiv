// Basic authentication middleware for personal access control
export default defineNuxtRouteMiddleware((to) => {
  // Only run in production and if password protection is enabled
  if (process.server || process.env.NODE_ENV !== 'production') {
    return
  }

  // Skip auth for API routes (they handle their own auth if needed)
  if (to.path.startsWith('/api/')) {
    return
  }

  // Simple password protection - can be customized
  const isAuthenticated = process.client ? 
    sessionStorage.getItem('flowductiv-auth') === 'authenticated' : 
    false

  // If not authenticated and not on login page, redirect to simple login
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})