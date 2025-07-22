// Focus time calculator utility for application-level rate limiting
// Calculates new focus time since the last AI summary

import { eq } from 'drizzle-orm'
import { db, activities, aiSummaries } from '~/server/database'

/**
 * Configuration for focus time gates
 */
export const FOCUS_TIME_CONFIG = {
  MIN_FOCUS_TIME_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  MIN_ACTIVITY_COUNT: 3, // Minimum activities before allowing summary
} as const

/**
 * Calculate new focus time since the last AI summary
 * @param userId - User ID (null for Phase 1B - no auth yet)
 * @param currentActivities - Activities to be included in summary  
 * @returns Object with focus time analysis
 */
export async function calculateNewFocusTime(
  userId: string | null = null,
  currentActivities: any[] = []
) {
  try {
    // Get the most recent AI summary
    const lastSummary = await db
      .select()
      .from(aiSummaries)
      .where(userId ? eq(aiSummaries.userId, userId) : eq(aiSummaries.userId, null))
      .orderBy(aiSummaries.generatedAt)
      .limit(1)

    const lastSummaryDate = lastSummary.length > 0 
      ? new Date(lastSummary[0].generatedAt) 
      : new Date(0) // Beginning of time if no previous summary

    // Get all activities since the last summary
    const newActivities = await db
      .select()
      .from(activities)
      .where(userId ? eq(activities.userId, userId) : eq(activities.userId, null))

    // Filter activities that are newer than the last summary
    const activitiesSinceLastSummary = newActivities.filter(activity => 
      new Date(activity.endTime || activity.startTime) > lastSummaryDate
    )

    // Include current activities being submitted
    const allNewActivities = [
      ...activitiesSinceLastSummary,
      ...currentActivities.filter(a => a.durationMs > 0) // Only completed activities
    ]

    // Calculate total focus time
    const totalNewFocusTime = allNewActivities.reduce(
      (sum, activity) => sum + (activity.durationMs || 0), 
      0
    )

    // Activity count analysis
    const activityCount = allNewActivities.length
    const hasMinimumActivities = activityCount >= FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT

    // Time analysis
    const hasMinimumFocusTime = totalNewFocusTime >= FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS
    const remainingTimeNeeded = Math.max(0, FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS - totalNewFocusTime)

    return {
      // Time metrics
      totalNewFocusTime,
      requiredFocusTime: FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS,
      remainingTimeNeeded,
      hasMinimumFocusTime,
      
      // Activity metrics
      activityCount,
      requiredActivityCount: FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT,
      hasMinimumActivities,
      
      // Gate status
      canRequestSummary: hasMinimumFocusTime && hasMinimumActivities,
      
      // Metadata
      lastSummaryDate,
      activitiesSinceLastSummary: allNewActivities,
      
      // User feedback
      progressPercent: Math.min(100, Math.round((totalNewFocusTime / FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS) * 100)),
      timeToNextSummary: formatDuration(remainingTimeNeeded),
    }
  } catch (error) {
    console.error('Focus time calculation error:', error)
    
    // Fallback: allow summary if we can't calculate (graceful degradation)
    return {
      totalNewFocusTime: FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS,
      requiredFocusTime: FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS,
      remainingTimeNeeded: 0,
      hasMinimumFocusTime: true,
      activityCount: FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT,
      requiredActivityCount: FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT,
      hasMinimumActivities: true,
      canRequestSummary: true,
      lastSummaryDate: new Date(0),
      activitiesSinceLastSummary: currentActivities,
      progressPercent: 100,
      timeToNextSummary: '0 minutes',
      error: 'Calculation failed - allowing request'
    }
  }
}

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
  } else if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
  }
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
        activitiesNeeded: Math.max(0, focusAnalysis.requiredActivityCount - focusAnalysis.activityCount),
        timeRemaining: focusAnalysis.timeToNextSummary,
      },
      requirements: {
        minimumFocusTime: formatDuration(focusAnalysis.requiredFocusTime),
        minimumActivities: focusAnalysis.requiredActivityCount,
      },
      current: {
        focusTime: formatDuration(focusAnalysis.totalNewFocusTime),
        activities: focusAnalysis.activityCount,
      }
    }
  }
}