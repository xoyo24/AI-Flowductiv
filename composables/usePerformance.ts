import { onMounted, readonly, ref } from 'vue'

interface PerformanceMetric {
  name: string
  duration: number
  startTime: number
  endTime: number
}

interface PerformanceReport {
  bundleSize: {
    totalJS: number
    totalCSS: number
    initialChunk: number
  }
  timing: {
    domContentLoaded: number
    firstPaint: number
    firstContentfulPaint: number
    largestContentfulPaint: number
  }
  interactions: {
    timerStart: number
    activitySave: number
    filterApply: number
  }
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetric[]>([])
  const isMonitoring = ref(false)

  // Start performance measurement
  const startMeasurement = (name: string) => {
    if (!isMonitoring.value) return
    performance.mark(`${name}-start`)
  }

  // End performance measurement
  const endMeasurement = (name: string) => {
    if (!isMonitoring.value) return
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measurement = performance.getEntriesByName(name)[0]
    if (measurement) {
      metrics.value.push({
        name,
        duration: measurement.duration,
        startTime: measurement.startTime,
        endTime: measurement.startTime + measurement.duration
      })
    }
  }

  // Get Core Web Vitals
  const getCoreWebVitals = (): Promise<PerformanceReport> => {
    return new Promise((resolve) => {
      const report: PerformanceReport = {
        bundleSize: {
          totalJS: 0,
          totalCSS: 0,
          initialChunk: 0
        },
        timing: {
          domContentLoaded: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0
        },
        interactions: {
          timerStart: 0,
          activitySave: 0,
          filterApply: 0
        }
      }

      // Get navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navTiming) {
        report.timing.domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          report.timing.firstPaint = entry.startTime
        } else if (entry.name === 'first-contentful-paint') {
          report.timing.firstContentfulPaint = entry.startTime
        }
      })

      // Get resource sizes
      const resources = performance.getEntriesByType('resource')
      resources.forEach((resource) => {
        const res = resource as PerformanceResourceTiming
        if (res.name.includes('.js')) {
          report.bundleSize.totalJS += res.encodedBodySize || res.transferSize || 0
        } else if (res.name.includes('.css')) {
          report.bundleSize.totalCSS += res.encodedBodySize || res.transferSize || 0
        }
      })

      // Calculate interaction metrics from our custom measurements
      metrics.value.forEach(metric => {
        if (metric.name.includes('timer-start')) {
          report.interactions.timerStart = metric.duration
        } else if (metric.name.includes('activity-save')) {
          report.interactions.activitySave = metric.duration
        } else if (metric.name.includes('filter-apply')) {
          report.interactions.filterApply = metric.duration
        }
      })

      resolve(report)
    })
  }

  // Get performance budget warnings
  const getBudgetWarnings = async () => {
    const report = await getCoreWebVitals()
    const warnings: string[] = []

    // Bundle size budgets
    const totalBundleSize = report.bundleSize.totalJS + report.bundleSize.totalCSS
    if (totalBundleSize > 500 * 1024) { // 500KB
      warnings.push(`Bundle size (${Math.round(totalBundleSize / 1024)}KB) exceeds 500KB budget`)
    }

    // Timing budgets
    if (report.timing.firstContentfulPaint > 1500) { // 1.5s
      warnings.push(`First Contentful Paint (${Math.round(report.timing.firstContentfulPaint)}ms) exceeds 1500ms budget`)
    }

    // Interaction budgets
    if (report.interactions.timerStart > 200) { // 200ms
      warnings.push(`Timer start (${Math.round(report.interactions.timerStart)}ms) exceeds 200ms budget`)
    }

    return warnings
  }

  // Log performance report to console (dev only)
  const logPerformanceReport = async () => {
    if (process.env.NODE_ENV !== 'development') return

    const report = await getCoreWebVitals()
    const warnings = await getBudgetWarnings()

    console.group('🚀 Performance Report')
    console.log('Bundle Sizes:', {
      'Total JS': `${Math.round(report.bundleSize.totalJS / 1024)}KB`,
      'Total CSS': `${Math.round(report.bundleSize.totalCSS / 1024)}KB`,
      'Total Bundle': `${Math.round((report.bundleSize.totalJS + report.bundleSize.totalCSS) / 1024)}KB`
    })
    
    console.log('Core Web Vitals:', {
      'First Paint': `${Math.round(report.timing.firstPaint)}ms`,
      'First Contentful Paint': `${Math.round(report.timing.firstContentfulPaint)}ms`,
      'DOM Content Loaded': `${Math.round(report.timing.domContentLoaded)}ms`
    })

    console.log('Interaction Performance:', report.interactions)

    if (warnings.length > 0) {
      console.warn('⚠️ Performance Budget Warnings:', warnings)
    } else {
      console.log('✅ All performance budgets met')
    }

    console.log('Recent Measurements:', metrics.value.slice(-5))
    console.groupEnd()
  }

  // Enable performance monitoring
  const enableMonitoring = () => {
    isMonitoring.value = true
    console.log('🔍 Performance monitoring enabled')
  }

  // Production-aware performance monitoring
  const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
  
  // Initialize performance monitoring
  onMounted(() => {
    // Always enable monitoring, but adjust reporting
    enableMonitoring()
    
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      // Development: Frequent reporting with warnings about dev overhead
      console.warn('🔧 Development Performance Monitoring: Metrics include dev server overhead')
      setTimeout(logPerformanceReport, 2000)
      setInterval(logPerformanceReport, 30000)
    } else {
      // Production: Log once after load for real metrics
      setTimeout(logPerformanceReport, 1000)
    }
  })

  return {
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),
    startMeasurement,
    endMeasurement,
    getCoreWebVitals,
    getBudgetWarnings,
    logPerformanceReport,
    enableMonitoring
  }
}