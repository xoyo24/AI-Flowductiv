import { nextTick, onMounted } from 'vue'

export const useResourceOptimization = () => {
  // Critical resources that should load immediately
  const CRITICAL_RESOURCES = [
    // Essential Vue components
    'UnifiedDashboard',
    'TimerDisplay', 
    'InputComposer',
    // Core composables
    'useTimer',
    'useActivities',
    // Essential styles
    'main.css'
  ]

  // Non-critical resources that can be deferred
  const DEFERRED_RESOURCES = [
    // Analytics (can load after initial interaction)
    'AnalyticsDialog',
    'AnalyticsSidebar', 
    'Charts/*',
    // Settings and modals (load on demand)
    'SettingsDialog',
    'AIHistoryDialog',
    'FocusRatingModal',
    // Heavy dependencies
    'chart.js',
    'vue-chartjs'
  ]

  // Preload critical resources
  const preloadCriticalResources = async () => {
    if (typeof window === 'undefined') return

    // Preload critical fonts/assets
    const criticalAssets = [
      // Add any critical fonts or images here
      '/fonts/inter-var.woff2', // If using custom fonts
    ].filter(Boolean) // Remove falsy values

    const preloadPromises = criticalAssets.map(asset => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = asset
        link.as = asset.includes('.woff') ? 'font' : 'fetch'
        if (asset.includes('.woff')) link.crossOrigin = 'anonymous'
        
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to preload ${asset}`))
        
        document.head.appendChild(link)
      })
    })

    try {
      await Promise.all(preloadPromises)
      console.log('✅ Critical resources preloaded')
    } catch (error) {
      console.warn('⚠️ Some critical resources failed to preload:', error)
    }
  }

  // Defer non-critical resources using requestIdleCallback
  const deferNonCriticalResources = () => {
    if (typeof window === 'undefined') return

    const deferExecution = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 5000 })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(callback, 100)
      }
    }

    // Defer non-critical JavaScript execution
    deferExecution(() => {
      // Lazy load analytics tracking
      console.log('📊 Loading non-critical analytics features...')
      
      // Preload analytics components when user is idle
      const preloadAnalytics = () => {
        // This will trigger the lazy loading of analytics components
        // when the user is idle, improving perceived performance
        import('~/components/AnalyticsDialog.vue').catch(() => {
          // Silently handle import errors
        })
        import('~/components/AnalyticsSidebar.vue').catch(() => {
          // Silently handle import errors  
        })
      }

      // Delay analytics preloading by 2 seconds after idle
      setTimeout(preloadAnalytics, 2000)
    })
  }

  // Resource loading priority management
  const optimizeResourceLoading = () => {
    if (typeof window === 'undefined') return

    // Set resource hints for browsers
    const addResourceHint = (url: string, rel: 'preload' | 'prefetch' | 'preconnect', as?: string) => {
      const link = document.createElement('link')
      link.rel = rel
      link.href = url
      if (as) link.setAttribute('as', as)
      document.head.appendChild(link)
    }

    // Preconnect to external domains if using external APIs
    // addResourceHint('https://api.openai.com', 'preconnect')
    // addResourceHint('https://api.anthropic.com', 'preconnect')

    // Prefetch likely-to-be-needed resources
    deferNonCriticalResources()
  }

  // Optimize third-party script loading
  const optimizeThirdPartyScripts = () => {
    if (typeof window === 'undefined') return
    
    // For any analytics or third-party scripts, load them with proper attributes
    const loadScriptAsync = (src: string, attributes: Record<string, string> = {}) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.defer = true
      
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value)
      })

      // Add to end of body to not block parsing
      document.body.appendChild(script)
    }

    // Example: Load analytics scripts after page is interactive
    if (document.readyState === 'complete') {
      // Load non-critical third-party scripts here
    } else {
      window.addEventListener('load', () => {
        // Defer third-party scripts until after page load
        setTimeout(() => {
          // Add any third-party scripts here
        }, 1000)
      })
    }
  }

  // Performance-focused initialization
  const initializeResourceOptimization = async () => {
    console.log('🚀 Initializing resource optimization...')
    
    // Critical path: Load essential resources first
    await preloadCriticalResources()
    
    // Secondary: Optimize resource loading strategy  
    optimizeResourceLoading()
    
    // Tertiary: Handle third-party scripts
    optimizeThirdPartyScripts()
  }

  // Initialize on mount
  onMounted(() => {
    nextTick(initializeResourceOptimization)
  })

  return {
    preloadCriticalResources,
    deferNonCriticalResources,
    optimizeResourceLoading,
    initializeResourceOptimization
  }
}

// Service Worker registration for caching optimization
export const useServiceWorkerOptimization = () => {
  const registerServiceWorker = async () => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        })
        
        console.log('✅ Service Worker registered successfully')
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update available')
        })
        
        return registration
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error)
      }
    }
  }

  onMounted(() => {
    registerServiceWorker()
  })

  return {
    registerServiceWorker
  }
}