import { ref, readonly, computed } from 'vue'
import type { Activity } from '~/server/database/schema'

export interface PeakHoursInsight {
  timeRange: string
  confidence: number
  recommendation: string
  avgFocus: number
  totalHours: number
}

export interface FocusPatternInsight {
  trend: 'improving' | 'declining' | 'stable'
  suggestion: string
  recentAverage: number
  overallAverage: number
}

export interface TagCombinationInsight {
  bestCombination: string[]
  averageFocus: number
  totalTime: number
  recommendation: string
}

export interface ActionableRecommendation {
  type: 'schedule' | 'focus' | 'break' | 'tag-combination'
  message: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

export interface InsightsData {
  peakHours?: PeakHoursInsight
  focusPattern?: FocusPatternInsight
  tagCombinations?: TagCombinationInsight
  recommendations: ActionableRecommendation[]
}

// Global state for insights
const insights = ref<InsightsData>({
  recommendations: []
})

const loading = ref(false)
const error = ref<string | null>(null)

export const useInsights = () => {
  
  // Calculate confidence score based on data quantity and pattern strength
  const calculateConfidence = (dataPoints: number, patternStrength: number): number => {
    // Base confidence on data quantity (more data = higher confidence)
    const dataConfidence = Math.min(dataPoints / 50, 1) * 0.6 // Max 60% from data quantity
    
    // Pattern strength contributes remaining 40%
    const patternConfidence = patternStrength * 0.4
    
    return Math.min(dataConfidence + patternConfidence, 1)
  }

  // Check if we have enough data for reliable insights
  const hasEnoughDataForInsights = (activities: Activity[]): boolean => {
    return activities.length >= 3 // Minimum 3 activities for basic insights
  }

  // Generate peak hours insight
  const generatePeakHoursInsight = async (activities: Activity[]): Promise<void> => {
    if (!hasEnoughDataForInsights(activities)) {
      insights.value.peakHours = undefined
      return
    }

    const hourMap = new Map<number, { totalTime: number, totalFocus: number, count: number }>()

    // Aggregate data by hour
    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours()
      const existing = hourMap.get(hour) || { totalTime: 0, totalFocus: 0, count: 0 }
      
      hourMap.set(hour, {
        totalTime: existing.totalTime + activity.durationMs,
        totalFocus: existing.totalFocus + (activity.focusRating || 0),
        count: existing.count + 1
      })
    })

    // Find peak productivity hours (combination of time and focus)
    let bestHour = -1
    let bestScore = 0
    
    for (const [hour, data] of hourMap.entries()) {
      const avgFocus = data.count > 0 ? data.totalFocus / data.count : 0
      const totalHours = data.totalTime / (1000 * 60 * 60)
      
      // Score combines time spent and average focus
      const score = totalHours * avgFocus
      
      if (score > bestScore) {
        bestScore = score
        bestHour = hour
      }
    }

    if (bestHour !== -1) {
      const bestData = hourMap.get(bestHour)!
      const avgFocus = bestData.totalFocus / bestData.count
      const totalHours = bestData.totalTime / (1000 * 60 * 60)
      
      // Determine time range (peak hour ± 1)
      const startHour = Math.max(0, bestHour - 1)
      const endHour = Math.min(23, bestHour + 1)
      
      const formatHour = (h: number) => {
        if (h === 0) return '12 AM'
        if (h === 12) return '12 PM'
        if (h < 12) return `${h} AM`
        return `${h - 12} PM`
      }

      const timeRange = `${formatHour(startHour)}-${formatHour(endHour)}`
      const confidence = calculateConfidence(activities.length, avgFocus / 5)

      insights.value.peakHours = {
        timeRange,
        confidence,
        recommendation: `Your peak focus time is ${timeRange}. Consider scheduling important tasks during this window.`,
        avgFocus,
        totalHours
      }
    }
  }

  // Generate focus pattern insight
  const generateFocusPatternInsight = async (activities: Activity[]): Promise<void> => {
    const ratedActivities = activities.filter(a => a.focusRating !== null)
    
    if (ratedActivities.length < 3) {
      insights.value.focusPattern = undefined
      return
    }

    // Sort by end time (most recent first)
    ratedActivities.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())

    // Calculate recent average (last 1/3 of activities)
    const recentCount = Math.max(1, Math.floor(ratedActivities.length / 3))
    const recentActivities = ratedActivities.slice(0, recentCount)
    const recentAverage = recentActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / recentCount

    // Calculate overall average
    const overallAverage = ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable'
    let suggestion: string

    const difference = recentAverage - overallAverage

    if (difference > 0.5) {
      trend = 'improving'
      suggestion = 'Great progress! Your focus is improving. Keep up the current routine.'
    } else if (difference < -0.5) {
      trend = 'declining'
      suggestion = 'Focus has been declining recently. Consider taking breaks or adjusting your environment.'
    } else {
      trend = 'stable'
      suggestion = `Consistent ${overallAverage.toFixed(1)}/5 focus. Consider experimenting with new techniques to boost performance.`
    }

    insights.value.focusPattern = {
      trend,
      suggestion,
      recentAverage,
      overallAverage
    }
  }

  // Generate tag combination insights
  const generateTagInsights = async (activities: Activity[]): Promise<void> => {
    const taggedActivities = activities.filter(a => a.tags && a.tags.length > 0 && a.focusRating !== null)
    
    if (taggedActivities.length < 3) {
      insights.value.tagCombinations = undefined
      return
    }

    const combinations = new Map<string, { totalFocus: number, totalTime: number, count: number }>()

    // Analyze all tag combinations
    taggedActivities.forEach(activity => {
      const tags = activity.tags!.sort()
      const key = tags.join(' + ')
      const existing = combinations.get(key) || { totalFocus: 0, totalTime: 0, count: 0 }

      combinations.set(key, {
        totalFocus: existing.totalFocus + (activity.focusRating || 0),
        totalTime: existing.totalTime + activity.durationMs,
        count: existing.count + 1
      })
    })

    // Find best combination (minimum 2 activities)
    let bestCombination: string[] = []
    let bestScore = 0

    for (const [key, data] of combinations.entries()) {
      if (data.count >= 2) {
        const avgFocus = data.totalFocus / data.count
        const score = avgFocus * data.count // Weight by frequency
        
        if (score > bestScore) {
          bestScore = score
          bestCombination = key.split(' + ')
        }
      }
    }

    if (bestCombination.length > 0) {
      const bestData = combinations.get(bestCombination.join(' + '))!
      const averageFocus = bestData.totalFocus / bestData.count

      insights.value.tagCombinations = {
        bestCombination,
        averageFocus,
        totalTime: bestData.totalTime,
        recommendation: `Your most productive combination is ${bestCombination.join(' + ')} with ${averageFocus.toFixed(1)}/5 avg focus.`
      }
    }
  }

  // Generate actionable recommendations
  const generateActionableRecommendations = async (activities: Activity[]): Promise<void> => {
    const recommendations: ActionableRecommendation[] = []

    if (!hasEnoughDataForInsights(activities)) {
      recommendations.push({
        type: 'focus',
        message: 'Track more activities to unlock personalized insights',
        confidence: 1.0,
        priority: 'medium'
      })
      insights.value.recommendations = recommendations
      return
    }

    // Analyze session length patterns
    const shortSessions = activities.filter(a => a.durationMs < 30 * 60 * 1000) // < 30 minutes
    const longSessions = activities.filter(a => a.durationMs > 2 * 60 * 60 * 1000) // > 2 hours

    if (shortSessions.length > activities.length * 0.6) {
      recommendations.push({
        type: 'schedule',
        message: 'Try longer focus sessions - aim for 45-90 minute blocks',
        confidence: 0.8,
        priority: 'high'
      })
    }

    if (longSessions.length > activities.length * 0.3) {
      recommendations.push({
        type: 'break',
        message: 'Consider breaking long sessions with 10-15 minute breaks',
        confidence: 0.7,
        priority: 'medium'
      })
    }

    // Focus rating recommendations
    const lowFocusActivities = activities.filter(a => a.focusRating !== null && a.focusRating < 3)
    if (lowFocusActivities.length > activities.length * 0.4) {
      recommendations.push({
        type: 'focus',
        message: 'High number of low-focus sessions. Try eliminating distractions or changing environment',
        confidence: 0.9,
        priority: 'high'
      })
    }

    insights.value.recommendations = recommendations
  }

  // Main insight generation function
  const generateInsights = async (activities: Activity[]): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        generatePeakHoursInsight(activities),
        generateFocusPatternInsight(activities),
        generateTagInsights(activities),
        generateActionableRecommendations(activities)
      ])
    } catch (err) {
      console.error('Failed to generate insights:', err)
      error.value = 'Failed to generate insights'
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const hasInsights = computed(() => {
    return !!(insights.value.peakHours || insights.value.focusPattern || insights.value.tagCombinations || insights.value.recommendations.length > 0)
  })

  return {
    // State (readonly)
    insights: readonly(insights),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    hasInsights,

    // Actions
    generateInsights,
    generatePeakHoursInsight,
    generateFocusPatternInsight,
    generateTagInsights,
    generateActionableRecommendations,

    // Utilities
    calculateConfidence,
    hasEnoughDataForInsights
  }
}