import type { Goal, NewGoal } from '~/server/database/schema'
import type { GoalProgress, GoalMetrics, GoalSuggestion } from '~/types/goal'

interface GoalFilters {
  status?: 'active' | 'completed' | 'paused' | 'archived'
  type?: 'time' | 'activity_count' | 'streak' | 'focus_rating'
  period?: 'daily' | 'weekly' | 'monthly'
}

export const useGoals = () => {
  // Reactive state
  const goals = ref<Goal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all goals with optional filtering
  const getGoals = async (filters: GoalFilters = {}, limit = 50, offset = 0): Promise<Goal[]> => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...filters
      })

      const response = await $fetch<{ data: Goal[] }>(`/api/goals?${queryParams}`)
      goals.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch goals'
      console.error('Failed to fetch goals:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get single goal by ID
  const getGoal = async (id: string): Promise<Goal | null> => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{ data: Goal }>(`/api/goals/${id}`)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch goal'
      console.error('Failed to fetch goal:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create new goal
  const createGoal = async (goalData: NewGoal): Promise<Goal | null> => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{ data: Goal }>('/api/goals', {
        method: 'POST',
        body: goalData
      })

      // Add to local state
      goals.value.unshift(response.data)
      
      // Emit event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('goal-created', { detail: response.data }))
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create goal'
      console.error('Failed to create goal:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update existing goal
  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{ data: Goal }>(`/api/goals/${id}`, {
        method: 'PUT',
        body: updates
      })

      // Update local state
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = response.data
      }

      // Emit event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('goal-updated', { detail: response.data }))
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update goal'
      console.error('Failed to update goal:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete goal
  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      await $fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      })

      // Remove from local state
      goals.value = goals.value.filter(g => g.id !== id)

      // Emit event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('goal-deleted', { detail: { id } }))
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete goal'
      console.error('Failed to delete goal:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Calculate goal progress based on current activities
  const calculateGoalProgress = async (goal: Goal): Promise<GoalProgress> => {
    const { getActivities } = useActivities()
    
    // Get period boundaries
    const now = new Date()
    let periodStart = new Date(goal.startDate)
    let periodEnd = goal.endDate ? new Date(goal.endDate) : new Date()

    // Adjust for current period if goal is recurring
    if (goal.period === 'daily') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      periodEnd = new Date(periodStart)
      periodEnd.setDate(periodEnd.getDate() + 1)
    } else if (goal.period === 'weekly') {
      const dayOfWeek = now.getDay()
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - dayOfWeek)
      periodStart.setHours(0, 0, 0, 0)
      periodEnd = new Date(periodStart)
      periodEnd.setDate(periodEnd.getDate() + 7)
    } else if (goal.period === 'monthly') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }

    // Get activities for the period
    const activities = await getActivities(1, 1000) // Get enough activities
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.endTime)
      if (activityDate < periodStart || activityDate >= periodEnd) return false
      
      // Filter by tags if specified
      if (goal.tags && goal.tags.length > 0) {
        const hasMatchingTag = goal.tags.some(tag => activity.tags.includes(tag))
        if (!hasMatchingTag) return false
      }
      
      // Filter by priority if specified
      if (goal.priority && activity.priority !== goal.priority) return false
      
      return true
    })

    // Calculate current value based on goal type
    let currentValue = 0
    switch (goal.type) {
      case 'time':
        currentValue = filteredActivities.reduce((sum, a) => sum + a.durationMs, 0) / (1000 * 60 * 60) // Convert to hours
        break
      case 'activity_count':
        currentValue = filteredActivities.length
        break
      case 'streak':
        // Calculate consecutive days with activities
        currentValue = calculateStreak(filteredActivities, periodStart, periodEnd)
        break
      case 'focus_rating':
        const activitiesWithRating = filteredActivities.filter(a => a.focusRating !== null)
        if (activitiesWithRating.length > 0) {
          currentValue = activitiesWithRating.reduce((sum, a) => sum + (a.focusRating || 0), 0) / activitiesWithRating.length
        }
        break
    }

    const progressPercentage = Math.min((currentValue / goal.target) * 100, 100)
    const isCompleted = currentValue >= goal.target

    return {
      goalId: goal.id,
      currentValue,
      targetValue: goal.target,
      progressPercentage,
      isCompleted,
      periodStart,
      periodEnd,
      lastUpdated: new Date()
    }
  }

  // Calculate streak of consecutive days with activities
  const calculateStreak = (activities: any[], periodStart: Date, periodEnd: Date): number => {
    const daysWithActivity = new Set()
    
    activities.forEach(activity => {
      const date = new Date(activity.endTime).toDateString()
      daysWithActivity.add(date)
    })
    
    let streak = 0
    const currentDate = new Date(periodEnd)
    currentDate.setDate(currentDate.getDate() - 1) // Start from yesterday
    
    while (currentDate >= periodStart) {
      if (daysWithActivity.has(currentDate.toDateString())) {
        streak++
      } else {
        break
      }
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }

  // Calculate goal metrics for analytics
  const calculateGoalMetrics = async (): Promise<GoalMetrics> => {
    const allGoals = await getGoals()
    const activeGoals = allGoals.filter(g => g.status === 'active')
    const completedGoals = allGoals.filter(g => g.status === 'completed')
    
    let totalProgress = 0
    for (const goal of activeGoals) {
      const progress = await calculateGoalProgress(goal)
      totalProgress += progress.progressPercentage
    }
    
    const averageProgress = activeGoals.length > 0 ? totalProgress / activeGoals.length : 0
    const completionRate = allGoals.length > 0 ? (completedGoals.length / allGoals.length) * 100 : 0
    
    // Calculate current streak (simplified)
    const { getActivities } = useActivities()
    const recentActivities = await getActivities(1, 100)
    const streakDays = calculateCurrentStreak(recentActivities)
    
    return {
      totalGoals: allGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      completionRate,
      averageProgress,
      streakDays
    }
  }

  // Calculate current overall streak
  const calculateCurrentStreak = (activities: any[]): number => {
    const today = new Date()
    const daysWithActivity = new Set()
    
    activities.forEach(activity => {
      const date = new Date(activity.endTime).toDateString()
      daysWithActivity.add(date)
    })
    
    let streak = 0
    const currentDate = new Date(today)
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      if (daysWithActivity.has(currentDate.toDateString())) {
        streak++
      } else if (i > 0) { // Allow today to be empty
        break
      }
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }

  // Format duration helper
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Readonly state exposure
  return {
    // State
    goals: readonly(goals),
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    calculateGoalProgress,
    calculateGoalMetrics,
    
    // Utilities
    formatDuration
  }
}