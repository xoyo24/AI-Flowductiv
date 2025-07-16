<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <div class="space-y-6">
      <!-- Activity Input -->
      <div class="space-y-2">
        <label for="activity-input" class="text-sm font-medium text-foreground">
          What are you working on?
        </label>
        <div class="relative">
          <input
            id="activity-input"
            v-model="activityInput"
            type="text"
            placeholder="Enter activity name (use #tags and !1-3 for priority)"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            :disabled="isRunning || isPaused"
            @keyup.enter="handleStart"
            data-testid="activity-input"
          />
          <div v-if="activityInput" class="absolute right-2 top-2 flex space-x-1">
            <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              #{{ tag }}
            </span>
            <span v-if="extractedPriority" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              !{{ extractedPriority }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timer Display -->
      <div class="text-center space-y-4">
        <div class="text-6xl font-mono font-bold text-foreground tracking-tight" data-testid="timer-display">
          {{ formattedTime }}
        </div>
        
        <div v-if="currentActivity" class="text-lg text-muted-foreground">
          {{ currentActivity }}
        </div>

        <!-- Timer Status -->
        <div class="flex items-center justify-center space-x-2">
          <div 
            :class="{
              'w-3 h-3 rounded-full': true,
              'bg-green-500 animate-pulse': isRunning,
              'bg-yellow-500': isPaused,
              'bg-gray-300': !isRunning && !isPaused
            }"
            data-testid="timer-status"
          />
          <span class="text-sm text-muted-foreground">
            {{ timerStatus }}
          </span>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex justify-center space-x-4">
        <button
          v-if="canStart"
          @click="handleStart"
          :disabled="!activityInput.trim()"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          data-testid="start-timer"
        >
          Start Timer
        </button>

        <button
          v-if="canPause"
          @click="handlePause"
          class="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium transition-colors"
          data-testid="pause-timer"
        >
          Pause
        </button>

        <button
          v-if="canResume"
          @click="handleResume"
          class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium transition-colors"
          data-testid="resume-timer"
        >
          Resume
        </button>

        <button
          v-if="canFinish"
          @click="handleFinish"
          class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition-colors"
          data-testid="finish-timer"
        >
          Finish
        </button>

        <button
          v-if="isRunning || isPaused"
          @click="handleReset"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium transition-colors"
          data-testid="reset-timer"
        >
          Reset
        </button>
      </div>

      <!-- Quick Actions -->
      <div v-if="!isRunning && !isPaused" class="border-t border-border pt-4">
        <div class="text-sm text-muted-foreground mb-2">Quick Start:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="activityInput = suggestion"
            class="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  isRunning,
  isPaused,
  currentActivity,
  formattedTime,
  canStart,
  canPause,
  canResume,
  canFinish,
  startTimer,
  pauseTimer,
  resumeTimer,
  finishTimer,
  resetTimer
} = useTimer()

// Local reactive state
const activityInput = ref('')

// Computed values
const timerStatus = computed(() => {
  if (isRunning.value) return 'Running'
  if (isPaused.value) return 'Paused'
  return 'Stopped'
})

const extractedTags = computed(() => {
  const tagRegex = /#(\w+)/g
  return Array.from(activityInput.value.matchAll(tagRegex), match => match[1])
})

const extractedPriority = computed(() => {
  const priorityMatch = activityInput.value.match(/!([1-3])/)
  return priorityMatch ? parseInt(priorityMatch[1]) : null
})

const quickSuggestions = ref([
  'Deep work #focus !3',
  'Meeting #work !2',
  'Code review #development !2',
  'Learning #education !1',
  'Planning #strategic !3'
])

// Actions
const handleStart = () => {
  if (activityInput.value.trim() && startTimer(activityInput.value)) {
    // Successfully started
  }
}

const handlePause = () => {
  pauseTimer()
}

const handleResume = () => {
  resumeTimer()
}

const handleFinish = async () => {
  const success = await finishTimer()
  if (success) {
    activityInput.value = ''
    // Optional: Show success notification
  }
}

const handleReset = () => {
  if (confirm('Are you sure you want to reset the timer? This will discard the current session.')) {
    resetTimer()
    activityInput.value = ''
  }
}

// Watch for timer state changes to clear input when appropriate
watch([isRunning, isPaused], ([running, paused]) => {
  if (!running && !paused) {
    // Timer has been reset or finished
    nextTick(() => {
      if (activityInput.value && !currentActivity.value) {
        // Keep input if timer was just finished/reset but activity is different
      }
    })
  }
})
</script>