import { computed, ref } from 'vue'
import { useActivities } from './useActivities'

interface UserState {
  totalActivities: number
  todayActivities: number
  todayTime: string
  currentStreak: number
  lastActivityDate: Date | null
  isFirstTime: boolean
  hasRecentActivity: boolean
}

export const useContextualStatus = () => {
  const { activities, getTodaysActivities, formatDuration } = useActivities()
  
  // Calculate user state for contextual messaging
  const userState = computed((): UserState => {
    const todayActivities = activities.value.filter(activity => {
      const activityDate = new Date(activity.endTime)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    })
    const totalActivities = activities.value.length
    
    // Calculate today's total time
    const todayTimeMs = todayActivities.reduce((total, activity) => total + activity.durationMs, 0)
    const todayTime = formatDuration(todayTimeMs)
    
    // Calculate streak (simplified - consecutive days with activities)
    const currentStreak = calculateStreak()
    
    // Get last activity date
    const lastActivityDate = activities.value.length > 0 
      ? new Date(activities.value[0].endTime) 
      : null
    
    // Check if user has recent activity (within last 7 days)
    const hasRecentActivity = lastActivityDate 
      ? (Date.now() - lastActivityDate.getTime()) < 7 * 24 * 60 * 60 * 1000
      : false
    
    return {
      totalActivities,
      todayActivities: todayActivities.length,
      todayTime,
      currentStreak,
      lastActivityDate,
      isFirstTime: totalActivities === 0,
      hasRecentActivity
    }
  })
  
  // Progressive contextual messaging based on user journey stage
  const contextualMessage = computed((): string => {
    const state = userState.value
    
    // First-time user
    if (state.isFirstTime) {
      return "Welcome! Track your first activity to unlock insights"
    }
    
    // User with very few activities (building habit)
    if (state.totalActivities < 3) {
      return "Great start! Track a few more to see patterns emerge"
    }
    
    // User returning after break
    if (!state.hasRecentActivity) {
      return "Welcome back! Ready to restart your tracking?"
    }
    
    // Active user but no activities today
    if (state.todayActivities === 0) {
      return "Ready for today? Start tracking your first activity"
    }
    
    // User on a streak (motivational)
    if (state.currentStreak >= 3) {
      return `🔥 ${state.currentStreak}-day streak! ${state.todayTime} today`
    }
    
    // Active user with today's activities
    if (state.todayActivities > 0) {
      const sessionText = state.todayActivities === 1 ? 'session' : 'sessions'
      return `Today: ${state.todayTime} across ${state.todayActivities} ${sessionText}`
    }
    
    // Default fallback
    return "Ready to track your productivity?"
  })
  
  // Calculate consecutive day streak
  const calculateStreak = (): number => {
    if (activities.value.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let checkDate = new Date(today)
    
    // Check last 30 days maximum for performance
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const hasActivityOnDay = activities.value.some(activity => {
        const activityDate = new Date(activity.endTime)
        return activityDate >= dayStart && activityDate <= dayEnd
      })
      
      if (hasActivityOnDay) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // If today has no activities, we can still have a streak from yesterday
        if (i === 0 && activities.value.filter(activity => {
          const activityDate = new Date(activity.endTime)
          const today = new Date()
          return activityDate.toDateString() === today.toDateString()
        }).length === 0) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
    }
    
    return streak
  }
  
  // Message for recent activities section when empty
  const recentActivitiesMessage = computed((): string => {
    const state = userState.value
    
    if (state.isFirstTime) {
      return "Your activities will appear here. Start your first timer above!"
    }
    
    if (state.todayActivities === 0 && state.hasRecentActivity) {
      return "No activities today yet. Time to get started!"
    }
    
    if (!state.hasRecentActivity) {
      return "Ready to restart your tracking journey?"
    }
    
    return "Start tracking to see your recent activities here"
  })
  
  // Motivational insights for accomplished users
  const motivationalInsight = computed((): string | null => {
    const state = userState.value
    
    if (state.currentStreak >= 7) {
      return `Amazing! You've been consistent for ${state.currentStreak} days`
    }
    
    if (state.totalActivities >= 20) {
      return `You've tracked ${state.totalActivities} activities - great progress!`
    }
    
    if (state.todayActivities >= 5) {
      return "Productive day! You're building great habits"
    }
    
    return null
  })
  
  return {
    userState: readonly(userState),
    contextualMessage: readonly(contextualMessage),
    recentActivitiesMessage: readonly(recentActivitiesMessage),
    motivationalInsight: readonly(motivationalInsight)
  }
}