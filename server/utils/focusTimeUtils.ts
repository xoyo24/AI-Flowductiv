// Pure utility functions for focus time calculations
// Extracted for easier testing without database dependencies

/**
 * Configuration for focus time gates
 */
export const FOCUS_TIME_CONFIG = {
  MIN_FOCUS_TIME_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  MIN_ACTIVITY_COUNT: 3, // Minimum activities before allowing summary
} as const

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Human-readable duration string
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0 minutes'

  const minutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${minutes} minutes`
  }
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
}

/**
 * Generate user-friendly error message for rate limiting
 * @param focusAnalysis - Result from calculateNewFocusTime
 * @returns Error object for API response
 */
export function createRateLimitError(focusAnalysis: any) {
  const reasons = []

  if (!focusAnalysis.hasMinimumFocusTime) {
    reasons.push(`Track ${focusAnalysis.timeToNextSummary} more focus time`)
  }

  if (!focusAnalysis.hasMinimumActivities) {
    const needed = focusAnalysis.requiredActivityCount - focusAnalysis.activityCount
    reasons.push(`Complete ${needed} more activities`)
  }

  return {
    statusCode: 429,
    statusMessage: 'Track more focus time to unlock AI summary',
    data: {
      error: 'Focus time gate not met',
      reasons,
      progress: {
        focusTimePercent: focusAnalysis.progressPercent,
        activitiesNeeded: Math.max(
          0,
          focusAnalysis.requiredActivityCount - focusAnalysis.activityCount
        ),
        timeRemaining: focusAnalysis.timeToNextSummary,
      },
      requirements: {
        minimumFocusTime: formatDuration(focusAnalysis.requiredFocusTime),
        minimumActivities: focusAnalysis.requiredActivityCount,
      },
      current: {
        focusTime: formatDuration(focusAnalysis.totalNewFocusTime),
        activities: focusAnalysis.activityCount,
      },
    },
  }
}
