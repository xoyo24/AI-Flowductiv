<template>
  <div class="min-h-screen w-full flex flex-col bg-background">
    <!-- Header with Navigation -->
    <header class="flex items-center justify-between px-4 py-3 pt-safe border-b border-border bg-card/50 backdrop-blur-sm">
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        data-testid="hamburger-menu-button"
        aria-label="Open menu"
      >
        <Menu class="w-6 h-6" />
      </button>
      
      <h1 class="text-lg font-semibold text-foreground">Flowductiv</h1>
      
      <div class="w-10 h-10"></div> <!-- Spacer for centering -->
    </header>

    <!-- Hamburger Menu Overlay -->
    <div
      v-if="showMobileMenu"
      class="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
      @click="showMobileMenu = false"
    >
      <div class="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border pt-safe overflow-y-auto">
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Menu</h2>
        </div>
        
        <!-- Analytics Section in Menu -->
        <div class="p-4 space-y-6">
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Analytics</h3>
            <ProductivityHeatmap @day-selected="handleDaySelected" />
            <QuickStats />
            <DailySummary />
          </div>
          
          <!-- Navigation -->
          <nav class="space-y-2 border-t border-border pt-4">
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
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pb-safe px-safe">
      <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        <!-- Contextual Status Bar (Always Present) -->
        <div 
          class="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center"
          data-testid="contextual-status"
        >
          <p class="text-foreground font-medium">{{ contextualMessage }}</p>
          <p v-if="motivationalInsight" class="text-sm text-muted-foreground mt-1">
            {{ motivationalInsight }}
          </p>
        </div>

        <!-- Timer Display (Unified from Desktop) -->
        <div class="text-center space-y-4">
          <div 
            class="text-5xl sm:text-6xl md:text-7xl font-mono font-bold text-foreground tracking-tight"
            data-testid="unified-timer-display"
            aria-live="polite"
          >
            {{ formattedTime }}
          </div>
          
          <div v-if="currentActivity" class="text-lg text-muted-foreground">
            {{ currentActivity }}
          </div>

          <!-- Timer Status Indicator -->
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

        <!-- Unified Input Section -->
        <div class="bg-card rounded-lg border border-border p-6">
          <div class="space-y-4">
            
            <!-- Activity Input with Auto-complete -->
            <div class="space-y-2">
              <label for="unified-activity-input" class="text-sm font-medium text-foreground">
                What are you working on?
              </label>
              <div ref="dropdownContainer" class="relative">
                <input
                  id="unified-activity-input"
                  v-model="activityInput"
                  type="text"
                  placeholder="Enter activity or click for suggestions"
                  class="w-full px-4 py-3 text-base border-2 border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  :disabled="isRunning || isPaused"
                  @keyup.enter="handleEnterKey"
                  @keydown="handleKeydown"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                  data-testid="unified-activity-input"
                />
                
                <!-- Auto-complete Suggestions Dropdown -->
                <SuggestionDropdown
                  :suggestions="suggestions"
                  :visible="showSuggestions"
                  :selected-index="selectedIndex"
                  :loading="suggestionsLoading"
                  @select="handleSuggestionSelect"
                  @hover="selectIndex"
                  @close="hideDropdown"
                />
                
                <!-- Tag and Priority Display -->
                <div v-if="activityInput" class="absolute right-3 top-3 flex space-x-1">
                  <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    #{{ tag }}
                  </span>
                  <span v-if="extractedPriority" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    !{{ extractedPriority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Actions Grid (From Mobile) -->
            <div v-if="!isRunning && !isPaused" class="space-y-3">
              <div class="text-center text-sm text-muted-foreground">Quick starts:</div>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  @click="handleQuickStart('Deep work #focus')"
                  data-testid="quick-deep-work"
                  class="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
                >
                  <Lightbulb class="w-6 h-6 mb-2 text-primary" />
                  <span class="text-xs text-center font-medium">Deep Work</span>
                </button>
                
                <button
                  @click="handleQuickStart('Meeting #meeting')"
                  data-testid="quick-meeting"
                  class="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
                >
                  <Users class="w-6 h-6 mb-2 text-primary" />
                  <span class="text-xs text-center font-medium">Meeting</span>
                </button>
                
                <button
                  @click="handleQuickStart('Break #break')"
                  data-testid="quick-break"
                  class="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
                >
                  <Moon class="w-6 h-6 mb-2 text-primary" />
                  <span class="text-xs text-center font-medium">Break</span>
                </button>
                
                <button
                  @click="handleQuickStart('Learning #development')"
                  data-testid="quick-learning"
                  class="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 touch-manipulation"
                >
                  <BookOpen class="w-6 h-6 mb-2 text-primary" />
                  <span class="text-xs text-center font-medium">Learning</span>
                </button>
              </div>
            </div>

            <!-- Timer Control Buttons -->
            <div class="flex justify-center space-x-4">
              <button
                v-if="!isRunning && !isPaused"
                @click="handleStart"
                :disabled="!activityInput.trim()"
                class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-base touch-manipulation"
                data-testid="unified-start-button"
              >
                Start Timer
              </button>

              <button
                v-if="isRunning"
                @click="handlePause"
                class="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium transition-colors text-base touch-manipulation"
                data-testid="unified-pause-button"
              >
                Pause
              </button>

              <button
                v-if="isPaused"
                @click="handleResume"
                class="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-colors text-base touch-manipulation"
                data-testid="unified-resume-button"
              >
                Resume
              </button>

              <button
                v-if="isPaused"
                @click="handleFinish"
                class="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors text-base touch-manipulation"
                data-testid="unified-finish-button"
              >
                Finish
              </button>

              <button
                v-if="isRunning || isPaused"
                @click="handleReset"
                class="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors text-base touch-manipulation"
                data-testid="unified-reset-button"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Activities Section (Always Present) -->
        <div class="bg-card rounded-lg border border-border p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">Recent Activities</h2>
          
          <!-- Activities List or Contextual Message -->
          <div v-if="recentActivities.length > 0" class="space-y-3">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div class="flex-1">
                <p class="font-medium text-foreground">{{ activity.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDuration(activity.durationMs) }} • {{ formatRelativeTime(activity.endTime) }}
                </p>
              </div>
              <div class="flex space-x-1">
                <span v-for="tag in activity.tags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Empty State with Contextual Message -->
          <div v-else class="text-center py-8">
            <p class="text-muted-foreground">{{ recentActivitiesMessage }}</p>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, triggerRef } from 'vue'
import { Menu, Settings, Clock, Lightbulb, Users, Moon, BookOpen } from 'lucide-vue-next'
import { useInputParser } from '~/composables/useInputParser'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { useContextualStatus } from '~/composables/useContextualStatus'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'
import type { HeatmapDay } from '~/composables/useActivities'

// Timer and activities
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

const { activities, formatDuration, formatRelativeTime } = useActivities()

// Contextual status service
const { contextualMessage, recentActivitiesMessage, motivationalInsight } = useContextualStatus()

// Recent activities (last 5)
const recentActivities = computed(() => activities.value.slice(0, 5))

// Timer status display
const timerStatus = computed(() => {
  if (isRunning.value) return 'Running'
  if (isPaused.value) return 'Paused'
  return 'Stopped'
})

// Local reactive state
const activityInput = ref('')
const showMobileMenu = ref(false)

// Input parsing and auto-complete
const { tags: extractedTags, priority: extractedPriority, cleanText } = useInputParser(activityInput)

const {
  suggestions,
  isLoading: suggestionsLoading,
  selectedIndex,
  selectNext,
  selectPrevious,
  selectCurrent,
  selectIndex,
  performSearch,
  getInitialSuggestions
} = useAutoComplete(activityInput, { debounceMs: 300, maxSuggestions: 8 })

// Dropdown state management
const inputFocused = ref(false)
const dropdownVisible = ref(false)
const justSelectedSuggestion = ref(false)

const showSuggestions = computed(() => 
  inputFocused.value && dropdownVisible.value && (suggestions.value.length > 0 || suggestionsLoading.value)
)

// Haptic feedback utility
const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Timer actions with haptic feedback
const handleStart = () => {
  if (activityInput.value.trim() && startTimer(activityInput.value)) {
    vibrate([100])
    hideDropdown()
  }
}

const handlePause = () => {
  pauseTimer()
  vibrate([50, 50])
}

const handleResume = () => {
  resumeTimer()
  vibrate([100])
}

const handleFinish = async () => {
  const success = await finishTimer()
  if (success) {
    activityInput.value = ''
    vibrate([200])
  }
}

const handleReset = () => {
  if (confirm('Reset timer? This will discard the current session.')) {
    resetTimer()
    activityInput.value = ''
    vibrate([50, 100, 50])
  }
}

// Quick action handler
const handleQuickStart = (activity: string) => {
  activityInput.value = activity
  if (startTimer(activity)) {
    vibrate([100])
  }
}

// Auto-complete handling (from desktop TimerSection)
const showDropdown = () => {
  if (suggestions.value.length > 0 || suggestionsLoading.value) {
    dropdownVisible.value = true
  }
}

const hideDropdown = () => {
  dropdownVisible.value = false
}

const handleSuggestionSelect = (suggestion) => {
  if (suggestion.type === 'activity') {
    activityInput.value = suggestion.text
  } else {
    const currentText = activityInput.value.trim()
    const hasTag = currentText.includes(`#${suggestion.text}`)
    if (!hasTag) {
      activityInput.value = currentText ? `${currentText} #${suggestion.text}` : `#${suggestion.text}`
    }
  }
  
  triggerRef(activityInput)
  justSelectedSuggestion.value = true
  hideDropdown()
  
  nextTick(() => {
    const input = document.getElementById('unified-activity-input')
    if (input) {
      input.focus()
      input.value = activityInput.value
    }
    setTimeout(() => {
      justSelectedSuggestion.value = false
    }, 200)
  })
}

const handleKeydown = (event) => {
  if (showSuggestions.value) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        selectPrevious()
        break
      case 'Enter':
        if (selectedIndex.value >= 0) {
          event.preventDefault()
          const selected = selectCurrent()
          if (selected) {
            handleSuggestionSelect(selected)
          }
          return
        } else {
          hideDropdown()
        }
        break
      case 'Escape':
        event.preventDefault()
        hideDropdown()
        break
      case 'Tab':
        hideDropdown()
        break
    }
  }
  
  if (!showSuggestions.value && event.key.length === 1) {
    nextTick(() => {
      if (suggestions.value.length > 0) {
        showDropdown()
      }
    })
  }
}

const handleInputFocus = () => {
  inputFocused.value = true
  
  nextTick(() => {
    if (activityInput.value.trim()) {
      performSearch(activityInput.value.trim())
    } else {
      getInitialSuggestions()
    }
  })
  
  if (suggestions.value.length > 0) {
    showDropdown()
  }
}

const handleInputBlur = () => {
  setTimeout(() => {
    if (!justSelectedSuggestion.value) {
      inputFocused.value = false
      hideDropdown()
    }
  }, 150)
}

const handleEnterKey = () => {
  if (justSelectedSuggestion.value) {
    return
  }
  handleStart()
}

// Navigation handlers
const navigateAndCloseMenu = (path: string) => {
  showMobileMenu.value = false
  navigateTo(path)
}

const navigateToSettings = () => navigateAndCloseMenu('/settings')
const navigateToHistory = () => navigateAndCloseMenu('/history')

// Handle heatmap day selection
const handleDaySelected = (day: HeatmapDay) => {
  console.log('Selected day:', day)
  // TODO: Show detailed view for selected day
}

// Click outside to dismiss dropdown
const dropdownContainer = ref(null)

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    hideDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for suggestions and loading changes
watch(suggestions, (newSuggestions) => {
  if (inputFocused.value && newSuggestions.length > 0) {
    showDropdown()
  }
})

watch(suggestionsLoading, (loading) => {
  if (loading && inputFocused.value) {
    dropdownVisible.value = true
  }
})
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