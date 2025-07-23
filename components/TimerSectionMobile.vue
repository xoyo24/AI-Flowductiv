<template>
  <div
    data-testid="mobile-timer-container"
    class="min-h-screen w-full flex flex-col bg-background pt-safe pb-safe px-safe"
  >
    <!-- Timer Stopped State - Minimal Interface -->
    <div v-if="!isRunning && !isPaused" class="flex-1 flex flex-col justify-center space-y-8 px-4">
      <!-- Activity Input -->
      <div class="space-y-4">
        <label for="mobile-activity-input" class="block text-center text-lg font-medium text-foreground">
          What are you working on?
        </label>
        <input
          id="mobile-activity-input"
          v-model="activityInput"
          data-testid="mobile-activity-input"
          type="text"
          placeholder="Enter your activity"
          class="w-full text-base px-4 py-4 border-2 border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-center"
          @keyup.enter="handleStart"
        />
      </div>

      <!-- Large Start Button -->
      <button
        data-testid="mobile-start-button"
        @click="handleStart"
        @touchstart="handleTouchFeedback"
        :disabled="!activityInput.trim()"
        :aria-label="`Start timer for ${activityInput || 'activity'}`"
        class="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold rounded-xl hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
      >
        Start Timer
      </button>
    </div>

    <!-- Timer Running State -->
    <div v-else-if="isRunning" class="flex-1 flex flex-col justify-center items-center space-y-8 px-4">
      <!-- Large Timer Display -->
      <div class="text-center space-y-4">
        <div
          data-testid="mobile-timer-display"
          aria-live="polite"
          class="text-6xl sm:text-7xl font-mono font-bold text-foreground tracking-tight"
        >
          {{ formattedTime }}
        </div>
        <div class="text-xl text-muted-foreground px-4 text-center">
          {{ currentActivity }}
        </div>
      </div>

      <!-- Timer Controls -->
      <div class="flex space-x-4 w-full max-w-sm">
        <button
          data-testid="mobile-pause-button"
          @click="handlePause"
          @touchstart="handleTouchFeedback"
          aria-label="Pause timer"
          class="flex-1 h-12 bg-yellow-500 text-white text-base font-semibold rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-all duration-200 touch-manipulation"
        >
          Pause
        </button>
        <button
          data-testid="mobile-reset-button"
          @click="handleReset"
          @touchstart="handleTouchFeedback"
          aria-label="Reset timer"
          class="h-12 px-4 bg-red-500 text-white text-base font-semibold rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 touch-manipulation"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Timer Paused State -->
    <div v-else-if="isPaused" class="flex-1 flex flex-col justify-center items-center space-y-8 px-4">
      <!-- Timer Display -->
      <div class="text-center space-y-4">
        <div
          data-testid="mobile-timer-display"
          aria-live="polite"
          class="text-6xl sm:text-7xl font-mono font-bold text-foreground tracking-tight"
        >
          {{ formattedTime }}
        </div>
        <div class="text-xl text-muted-foreground px-4 text-center">
          {{ currentActivity }}
        </div>
        <div class="text-sm text-yellow-600 font-medium">
          PAUSED
        </div>
      </div>

      <!-- Paused Controls -->
      <div class="flex space-x-4 w-full max-w-sm">
        <button
          data-testid="mobile-resume-button"
          @click="handleResume"
          @touchstart="handleTouchFeedback"
          aria-label="Resume timer"
          class="flex-1 h-12 bg-green-500 text-white text-base font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 touch-manipulation"
        >
          Resume
        </button>
        <button
          data-testid="mobile-finish-button"
          @click="handleFinish"
          @touchstart="handleTouchFeedback"
          aria-label="Finish timer session"
          class="flex-1 h-12 bg-blue-500 text-white text-base font-semibold rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 touch-manipulation"
        >
          Finish
        </button>
      </div>
      
      <!-- Reset Button -->
      <button
        data-testid="mobile-reset-button"
        @click="handleReset"
        @touchstart="handleTouchFeedback"
        aria-label="Reset timer"
        class="h-12 px-6 bg-red-500 text-white text-base font-semibold rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 touch-manipulation"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const {
  isRunning,
  isPaused,
  currentActivity,
  formattedTime,
  startTimer,
  pauseTimer,
  resumeTimer,
  finishTimer,
  resetTimer,
} = useTimer()

// Local reactive state
const activityInput = ref('')

// Haptic feedback utility
const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Touch feedback for immediate visual response
const handleTouchFeedback = () => {
  // Provide haptic feedback on touch
  vibrate([10]) // Light feedback for touch
}

// Timer actions with haptic feedback
const handleStart = () => {
  if (activityInput.value.trim() && startTimer(activityInput.value)) {
    vibrate([100]) // Strong feedback for timer start
  }
}

const handlePause = () => {
  pauseTimer()
  vibrate([50, 50]) // Double tap feedback for pause
}

const handleResume = () => {
  resumeTimer()
  vibrate([100]) // Strong feedback for resume
}

const handleFinish = async () => {
  const success = await finishTimer()
  if (success) {
    activityInput.value = ''
    vibrate([200]) // Long feedback for completion
  }
}

const handleReset = () => {
  if (confirm('Reset timer? This will discard the current session.')) {
    resetTimer()
    activityInput.value = ''
    vibrate([50, 100, 50]) // Triple pattern for reset
  }
}
</script>

<style scoped>
/* iOS Safe Area Support */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.px-safe {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Enhanced touch targets for mobile */
.touch-manipulation {
  touch-action: manipulation;
}

/* Prevent zoom on iOS input focus */
input {
  transform: scale(1);
}

@supports (-webkit-touch-callout: none) {
  /* iOS specific styles */
  input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>