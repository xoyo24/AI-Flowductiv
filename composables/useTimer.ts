export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  elapsedMs: number
  currentActivity: string
  startTime: Date | null
}

export const useTimer = () => {
  // Reactive state
  const isRunning = ref(false)
  const isPaused = ref(false)
  const elapsedMs = ref(0)
  const currentActivity = ref('')
  const startTime = ref<Date | null>(null)
  const pausedTime = ref(0) // Track accumulated paused time

  // Interval for updating elapsed time
  const { pause: pauseInterval, resume: resumeInterval } = useIntervalFn(
    () => {
      if (isRunning.value && startTime.value) {
        elapsedMs.value = Date.now() - startTime.value.getTime() - pausedTime.value
      }
    },
    1000,
    { immediate: false }
  )

  // Computed values
  const formattedTime = computed(() => {
    const totalSeconds = Math.floor(elapsedMs.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const canStart = computed(() => !isRunning.value && !isPaused.value && currentActivity.value.trim().length > 0)
  const canPause = computed(() => isRunning.value)
  const canResume = computed(() => isPaused.value)
  const canFinish = computed(() => isRunning.value || isPaused.value)

  // Actions
  const startTimer = (activity: string) => {
    if (!activity.trim()) return false

    currentActivity.value = activity.trim()
    startTime.value = new Date()
    elapsedMs.value = 0
    pausedTime.value = 0
    isRunning.value = true
    isPaused.value = false
    
    resumeInterval()
    
    // Save to localStorage for persistence
    saveTimerState()
    return true
  }

  const pauseTimer = () => {
    if (!isRunning.value) return false

    isRunning.value = false
    isPaused.value = true
    pauseInterval()
    
    saveTimerState()
    return true
  }

  const resumeTimer = () => {
    if (!isPaused.value || !startTime.value) return false

    // Calculate how long we were paused and add to pausedTime
    const pauseDuration = Date.now() - (startTime.value.getTime() + elapsedMs.value + pausedTime.value)
    pausedTime.value += pauseDuration

    isRunning.value = true
    isPaused.value = false
    resumeInterval()
    
    saveTimerState()
    return true
  }

  const finishTimer = async (): Promise<boolean> => {
    if (!isRunning.value && !isPaused.value) return false
    if (!startTime.value) return false

    // Calculate final duration
    const finalDuration = isRunning.value 
      ? Date.now() - startTime.value.getTime() - pausedTime.value
      : elapsedMs.value

    const endTime = new Date()

    // Create activity data
    const activityData = {
      title: currentActivity.value,
      durationMs: finalDuration,
      startTime: startTime.value,
      endTime: endTime,
      tags: extractTags(currentActivity.value),
      priority: extractPriority(currentActivity.value)
    }

    try {
      // Save activity to database
      const { saveActivity } = useActivities()
      await saveActivity(activityData)

      // Reset timer state
      resetTimer()
      return true
    } catch (error) {
      console.error('Failed to save activity:', error)
      return false
    }
  }

  const resetTimer = () => {
    pauseInterval()
    isRunning.value = false
    isPaused.value = false
    elapsedMs.value = 0
    currentActivity.value = ''
    startTime.value = null
    pausedTime.value = 0
    
    clearTimerState()
  }

  // Utility functions
  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g
    return Array.from(text.matchAll(tagRegex), match => match[1])
  }

  const extractPriority = (text: string): number | null => {
    const priorityMatch = text.match(/!([1-3])/)
    return priorityMatch ? parseInt(priorityMatch[1]) : null
  }

  // Persistence
  const saveTimerState = () => {
    if (typeof window === 'undefined') return

    const state: TimerState = {
      isRunning: isRunning.value,
      isPaused: isPaused.value,
      elapsedMs: elapsedMs.value,
      currentActivity: currentActivity.value,
      startTime: startTime.value
    }

    localStorage.setItem('flowductiv-timer-state', JSON.stringify(state))
  }

  const loadTimerState = () => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('flowductiv-timer-state')
      if (!saved) return

      const state: TimerState = JSON.parse(saved)
      
      currentActivity.value = state.currentActivity
      startTime.value = state.startTime ? new Date(state.startTime) : null
      
      if (state.isRunning && startTime.value) {
        // Calculate elapsed time since page was left
        const now = Date.now()
        const elapsed = now - startTime.value.getTime()
        
        elapsedMs.value = elapsed
        isRunning.value = true
        isPaused.value = false
        resumeInterval()
      } else if (state.isPaused) {
        elapsedMs.value = state.elapsedMs
        isRunning.value = false
        isPaused.value = true
      }
    } catch (error) {
      console.error('Failed to load timer state:', error)
      clearTimerState()
    }
  }

  const clearTimerState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flowductiv-timer-state')
    }
  }

  // Initialize on mount
  onMounted(() => {
    loadTimerState()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    pauseInterval()
    saveTimerState()
  })

  // Return readonly state and actions
  return {
    // State (readonly)
    isRunning: readonly(isRunning),
    isPaused: readonly(isPaused),
    elapsedMs: readonly(elapsedMs),
    currentActivity: readonly(currentActivity),
    formattedTime,
    
    // Computed state
    canStart,
    canPause,
    canResume,
    canFinish,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
    resetTimer
  }
}