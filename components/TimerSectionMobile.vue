<template>
  <div
    data-testid="mobile-timer-container"
    class="min-h-screen w-full flex flex-col bg-background"
  >
    <!-- Header with Navigation Menu -->
    <header class="flex items-center justify-between px-4 py-3 pt-safe border-b border-border bg-card/50 backdrop-blur-sm">
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        data-testid="mobile-menu-button"
      >
        <Menu class="w-6 h-6" />
      </button>
      
      <h1 class="text-lg font-semibold text-foreground">Flowductiv</h1>
      
      <div class="w-10 h-10"></div> <!-- Spacer for centering -->
    </header>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="showMobileMenu"
      class="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
      @click="showMobileMenu = false"
    >
      <div class="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border pt-safe">
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Menu</h2>
        </div>
        <nav class="p-4 space-y-2">
          <button
            @click="navigateToSettings"
            class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
            data-testid="nav-settings"
          >
            <Settings class="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            @click="navigateToHistory"
            class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
            data-testid="nav-history"
          >
            <Clock class="w-5 h-5" />
            <span>History</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content - Scrollable -->
    <main class="flex-1 overflow-y-auto pb-safe px-safe">
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

      <!-- Quick Actions -->
      <div class="space-y-3">
        <div class="text-center text-sm text-muted-foreground">Quick starts:</div>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="handleQuickStart('Deep work #focus')"
            data-testid="quick-deep-work"
            class="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
          >
            <Lightbulb class="w-6 h-6 mb-1 text-primary" />
            <span class="text-xs text-center font-medium">Deep Work</span>
          </button>
          
          <button
            @click="handleQuickStart('Meeting #meeting')"
            data-testid="quick-meeting"
            class="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
          >
            <Users class="w-6 h-6 mb-1 text-primary" />
            <span class="text-xs text-center font-medium">Meeting</span>
          </button>
          
          <button
            @click="handleQuickStart('Break #break')"
            data-testid="quick-break"
            class="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
          >
            <Moon class="w-6 h-6 mb-1 text-primary" />
            <span class="text-xs text-center font-medium">Break</span>
          </button>
          
          <button
            @click="handleQuickStart('Learning #development')"
            data-testid="quick-learning"
            class="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
          >
            <BookOpen class="w-6 h-6 mb-1 text-primary" />
            <span class="text-xs text-center font-medium">Learning</span>
          </button>
        </div>
      </div>

      <!-- Start Button (for custom input) -->
      <button
        data-testid="mobile-start-button"
        @click="handleStart"
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
          aria-label="Pause timer"
          class="flex-1 h-12 bg-yellow-500 text-white text-base font-semibold rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-all duration-200 touch-manipulation"
        >
          Pause
        </button>
        <button
          data-testid="mobile-reset-button"
          @click="handleReset"
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
          aria-label="Resume timer"
          class="flex-1 h-12 bg-green-500 text-white text-base font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 touch-manipulation"
        >
          Resume
        </button>
        <button
          data-testid="mobile-finish-button"
          @click="handleFinish"
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
        aria-label="Reset timer"
        class="h-12 px-6 bg-red-500 text-white text-base font-semibold rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 touch-manipulation"
      >
        Reset
      </button>
    </div>

      <!-- Scrollable Content Below (when timer is stopped) -->
      <div v-if="!isRunning && !isPaused" class="px-4 pb-20">
        <!-- Scroll Hint -->
        <div class="text-center py-8">
          <div class="text-sm text-muted-foreground flex items-center justify-center space-x-2">
            <span>More below</span>
            <ChevronDown class="w-4 h-4" />
          </div>
        </div>

        <!-- AI Insights Section -->
        <div class="space-y-4 mb-8">
          <h2 class="text-lg font-semibold text-foreground">AI Insights</h2>
          <div class="bg-card rounded-lg border border-border p-4">
            <DailySummary />
          </div>
        </div>

        <!-- Quick Stats Section -->
        <div class="space-y-4 mb-8">
          <h2 class="text-lg font-semibold text-foreground">Today's Progress</h2>
          <div class="bg-card rounded-lg border border-border p-4">
            <QuickStats />
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="border-t border-border bg-card/50 backdrop-blur-sm pb-safe">
      <div class="flex items-center justify-around px-4 py-2">
        <button
          @click="navigateToHome"
          :class="[
            'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
            $route.path === '/' 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          ]"
          data-testid="bottom-nav-home"
        >
          <Home class="w-5 h-5 mb-1" />
          <span class="text-xs">Home</span>
        </button>
        
        <button
          @click="navigateToHistory"
          :class="[
            'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
            $route.path === '/history' 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          ]"
          data-testid="bottom-nav-history"
        >
          <Clock class="w-5 h-5 mb-1" />
          <span class="text-xs">History</span>
        </button>
        
        <button
          @click="navigateToSettings"
          :class="[
            'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
            $route.path === '/settings' 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          ]"
          data-testid="bottom-nav-settings"
        >
          <Settings class="w-5 h-5 mb-1" />
          <span class="text-xs">Settings</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  ChevronDown,
  Clock,
  Home,
  Lightbulb,
  Menu,
  Moon,
  Settings,
  Users,
} from 'lucide-vue-next'
import { ref } from 'vue'

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
const showMobileMenu = ref(false)

// Haptic feedback utility
const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
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

// Quick action handler - auto-fills input and starts timer immediately
const handleQuickStart = (activity: string) => {
  activityInput.value = activity
  if (startTimer(activity)) {
    vibrate([100]) // Strong feedback for timer start
  }
}

// Navigation handler
const navigateAndCloseMenu = (path: string) => {
  showMobileMenu.value = false
  navigateTo(path)
}

// Navigation helpers
const navigateToHome = () => navigateAndCloseMenu('/')
const navigateToHistory = () => navigateAndCloseMenu('/history')
const navigateToSettings = () => navigateAndCloseMenu('/settings')
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