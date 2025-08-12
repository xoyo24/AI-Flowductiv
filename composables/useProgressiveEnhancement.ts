import { onMounted, reactive, readonly, ref } from 'vue'

interface FeatureState {
  loaded: boolean
  loading: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  component?: any
}

export const useProgressiveEnhancement = () => {
  // Track feature loading state
  const features = reactive<Record<string, FeatureState>>({
    // Critical - Load immediately
    timer: { loaded: false, loading: false, priority: 'critical' },
    activities: { loaded: false, loading: false, priority: 'critical' },
    
    // High priority - Load on first interaction or after 2s
    analytics: { loaded: false, loading: false, priority: 'high' },
    filters: { loaded: false, loading: false, priority: 'high' },
    
    // Medium priority - Load when user navigates to feature
    settings: { loaded: false, loading: false, priority: 'medium' },
    goals: { loaded: false, loading: false, priority: 'medium' },
    
    // Low priority - Load on demand or when idle
    aiHistory: { loaded: false, loading: false, priority: 'low' },
    charts: { loaded: false, loading: false, priority: 'low' }
  })

  // User interaction tracking
  const userInteractions = ref({
    hasStartedTimer: false,
    hasViewedAnalytics: false,
    hasUsedFilters: false,
    hasOpenedSettings: false,
    idleTime: 0
  })

  // Progressive feature loading based on priority
  const loadFeature = async (featureName: string): Promise<void> => {
    const feature = features[featureName]
    if (!feature || feature.loaded || feature.loading) return

    feature.loading = true
    console.log(`📦 Loading feature: ${featureName}`)

    try {
      switch (featureName) {
        case 'analytics':
          feature.component = await import('~/components/AnalyticsDialog.vue')
          break
        case 'charts':
          // Load charts only when analytics is accessed
          await Promise.all([
            import('~/components/Charts/DailyActivityChart.vue'),
            import('~/components/Charts/FocusTrendChart.vue'),
            import('~/components/Charts/ActivityDistributionChart.vue'),
            import('~/components/Charts/PeakHoursChart.vue')
          ])
          break
        case 'settings':
          feature.component = await import('~/components/SettingsDialog.vue')
          break
        case 'aiHistory':
          feature.component = await import('~/components/AIHistoryDialog.vue')
          break
        case 'filters':
          await Promise.all([
            import('~/components/FilterBar.vue'),
            import('~/components/TagFilters.vue'),
            import('~/components/PriorityFilter.vue'),
            import('~/components/FocusFilter.vue')
          ])
          break
        case 'goals':
          feature.component = await import('~/components/GoalDefinitionForm.vue')
          break
      }

      feature.loaded = true
      console.log(`✅ Feature loaded: ${featureName}`)
    } catch (error) {
      console.error(`❌ Failed to load feature ${featureName}:`, error)
    } finally {
      feature.loading = false
    }
  }

  // Load features based on priority and user behavior
  const loadFeaturesByPriority = async () => {
    // Critical features - load immediately
    const criticalFeatures = Object.entries(features)
      .filter(([, feature]) => feature.priority === 'critical')
      .map(([name]) => name)

    await Promise.all(criticalFeatures.map(loadFeature))

    // High priority features - load after short delay
    setTimeout(async () => {
      const highPriorityFeatures = Object.entries(features)
        .filter(([, feature]) => feature.priority === 'high')
        .map(([name]) => name)

      await Promise.all(highPriorityFeatures.map(loadFeature))
    }, 2000)

    // Medium priority - load based on user interactions
    // (This will be triggered by user actions)

    // Low priority - load when idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const lowPriorityFeatures = Object.entries(features)
          .filter(([, feature]) => feature.priority === 'low')
          .map(([name]) => name)

        // Load one low-priority feature at a time to avoid blocking
        lowPriorityFeatures.forEach((name, index) => {
          setTimeout(() => loadFeature(name), index * 1000)
        })
      }, { timeout: 10000 })
    }
  }

  // User interaction handlers
  const onTimerStart = () => {
    userInteractions.value.hasStartedTimer = true
    // No additional loading needed - timer is critical
  }

  const onAnalyticsOpen = async () => {
    userInteractions.value.hasViewedAnalytics = true
    await loadFeature('analytics')
    await loadFeature('charts') // Load charts when analytics is opened
  }

  const onFiltersOpen = async () => {
    userInteractions.value.hasUsedFilters = true
    await loadFeature('filters')
  }

  const onSettingsOpen = async () => {
    userInteractions.value.hasOpenedSettings = true
    await loadFeature('settings')
  }

  // Preload based on user behavior patterns
  const preloadBasedOnBehavior = () => {
    // If user has started timer, they're likely to want analytics
    if (userInteractions.value.hasStartedTimer && !features.analytics.loaded) {
      setTimeout(() => loadFeature('analytics'), 3000)
    }

    // If user has viewed analytics, they might want to adjust settings
    if (userInteractions.value.hasViewedAnalytics && !features.settings.loaded) {
      setTimeout(() => loadFeature('settings'), 5000)
    }
  }

  // Idle detection for low-priority loading
  const trackIdleTime = () => {
    let idleTimer: NodeJS.Timeout
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      userInteractions.value.idleTime = 0
      
      idleTimer = setTimeout(() => {
        userInteractions.value.idleTime = Date.now()
        // Load low-priority features when user is idle
        if (!features.aiHistory.loaded) {
          loadFeature('aiHistory')
        }
      }, 30000) // 30 seconds idle
    }

    // Reset idle timer on user activity
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        window.addEventListener(event, resetIdleTimer, { passive: true })
      })
      
      resetIdleTimer()
    }
  }

  // Initialize progressive enhancement
  onMounted(() => {
    console.log('🎯 Initializing progressive enhancement...')
    
    // Start priority-based loading
    loadFeaturesByPriority()
    
    // Start idle tracking
    trackIdleTime()
    
    // Watch for behavior patterns
    setInterval(preloadBasedOnBehavior, 10000) // Check every 10 seconds
  })

  return {
    features: readonly(features),
    userInteractions: readonly(userInteractions),
    loadFeature,
    onTimerStart,
    onAnalyticsOpen,
    onFiltersOpen,
    onSettingsOpen
  }
}

// Feature flags for A/B testing performance optimizations
export const useFeatureFlags = () => {
  const flags = reactive({
    useVirtualScrolling: true,
    useProgressiveLoading: true,
    useServiceWorker: true,
    useWebP: true,
    enablePreloading: true
  })

  // Could be loaded from API or localStorage in real app
  const loadFeatureFlags = () => {
    const stored = localStorage.getItem('featureFlags')
    if (stored) {
      try {
        Object.assign(flags, JSON.parse(stored))
      } catch {
        // Use defaults if parsing fails
      }
    }
  }

  onMounted(() => {
    loadFeatureFlags()
  })

  return {
    flags: readonly(flags)
  }
}