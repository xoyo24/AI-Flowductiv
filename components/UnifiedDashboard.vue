<template>
  <div class="min-h-screen w-full flex bg-background">
    
    <!-- Desktop Sidebar (always visible on lg+) -->
    <aside 
      :class="{
        'hidden lg:flex': true,
        'lg:w-80': !sidebarCollapsed,
        'lg:w-16': sidebarCollapsed
      }"
      class="flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h1 v-if="!sidebarCollapsed" class="text-lg font-semibold text-foreground">Flowductiv</h1>
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          data-testid="sidebar-toggle"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Analytics Section in Sidebar -->
      <div v-if="!sidebarCollapsed" class="flex-1 p-4 space-y-6 overflow-y-auto">
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
      
      <!-- Collapsed sidebar content -->
      <div v-else class="flex-1 p-2 space-y-2">
        <button
          @click="navigateToSettings"
          class="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
          data-testid="nav-settings-collapsed"
          title="Settings"
        >
          <Settings class="w-5 h-5 mx-auto" />
        </button>
        <button
          @click="navigateToHistory"
          class="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
          data-testid="nav-history-collapsed"
          title="History"
        >
          <Clock class="w-5 h-5 mx-auto" />
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      
      <!-- Mobile Header (only visible on mobile) -->
      <header class="lg:hidden flex items-center justify-between px-4 py-3 pt-safe border-b border-border bg-card/50 backdrop-blur-sm">
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

      <!-- Mobile Menu Overlay (only on mobile) -->
      <div
        v-if="showMobileMenu"
        class="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        @click="showMobileMenu = false"
      >
        <div class="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border pt-safe overflow-y-auto">
          <div class="p-4 border-b border-border">
            <h2 class="text-lg font-semibold text-foreground">Menu</h2>
          </div>
          
          <!-- Analytics Section in Mobile Menu -->
          <div class="p-4 space-y-6">
            <div class="space-y-3">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Analytics</h3>
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
      <main class="flex-1 overflow-y-auto pb-safe px-safe lg:px-0">
        <div class="max-w-4xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        <!-- Contextual Status Bar (Flomo-Style) -->
        <div 
          class="bg-card border border-border rounded-lg overflow-hidden"
          data-testid="contextual-status"
        >
          <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-900 font-semibold text-base">{{ contextualMessage }}</p>
                <p v-if="motivationalInsight" class="text-blue-700 text-sm mt-1">
                  {{ motivationalInsight }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-blue-900 font-bold text-2xl leading-none">{{ recentActivities.length }}</div>
                <div class="text-blue-600 text-sm mt-1">activities</div>
              </div>
            </div>
          </div>
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

        <!-- Combined Timer + Input Card (Flomo-Style) -->
        <div class="bg-card rounded-lg border border-border p-6">
          <div class="space-y-4">
            
            <!-- Activity Input with Auto-complete -->
            <div class="space-y-2">
              <label for="unified-activity-input" class="text-sm font-medium text-foreground">
                What are you working on?
              </label>
              
              <!-- Extracted Tags Display (Above Input) -->
              <div v-if="extractedTags.length > 0" class="flex flex-wrap gap-2 min-h-[24px]">
                <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  <span class="text-primary/70 mr-1">#</span>{{ tag }}
                </span>
              </div>
              
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
              </div>
              
              <!-- Helper Text -->
              <div class="text-xs text-muted-foreground text-center">
                <span>Use <span class="text-primary font-medium">#tags</span> to categorize your activities</span>
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

        <!-- Recent Activities Section (Individual Cards) -->
        <div class="space-y-4">
          <!-- Individual Activity Cards (Flomo Style) -->
          <div v-if="recentActivities.length > 0" class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="bg-card rounded-lg border border-border p-5 group hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-foreground font-medium text-base leading-relaxed mb-3">{{ activity.title }}</p>
                  <div class="flex items-center space-x-3 mb-3">
                    <span class="text-sm font-medium text-foreground">{{ formatDuration(activity.durationMs) }}</span>
                    <span class="text-xs text-muted-foreground">•</span>
                    <span class="text-xs text-muted-foreground">{{ formatRelativeTime(activity.endTime) }}</span>
                  </div>
                  <div class="flex space-x-2">
                    <span v-for="tag in activity.tags" :key="tag" class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                <button class="p-2 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                  <svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty State Card -->
          <div v-else class="bg-card rounded-lg border border-border p-8 text-center">
            <p class="text-muted-foreground text-sm">{{ recentActivitiesMessage }}</p>
          </div>
        </div>

        </div>
      </main>
    </div>
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
const sidebarCollapsed = ref(false)

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