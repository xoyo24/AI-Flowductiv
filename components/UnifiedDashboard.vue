<template>
  <div class="min-h-screen w-full flex bg-background">
    
    <!-- Desktop Analytics Sidebar (always visible on lg+) -->
    <aside 
      :class="{
        'hidden lg:flex': true,
        'lg:w-80': !sidebarCollapsed,
        'lg:w-16': sidebarCollapsed
      }"
      class="flex-col transition-all duration-300"
    >
      <AnalyticsSidebar
        :collapsed="sidebarCollapsed"
        :loading="analyticsLoading"
        :tag-data="tagData"
        :selected-tags="selectedTags"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @day-selected="handleDaySelected"
        @refresh-data="refreshAnalytics"
        @navigate-to-settings="navigateToSettings"
        @navigate-to-history="navigateToHistory"
        @show-analytics-modal="showAnalyticsModal = true"
        @show-heatmap-modal="showHeatmapModal = true"
        @show-insights-modal="showInsightsModal = true"
        @tag-selected="handleTagSelected"
        @tag-deselected="handleTagDeselected"
        @tags-cleared="handleTagsCleared"
        @selection-changed="handleTagSelectionChanged"
        @tag-favorite="handleTagFavorite"
        @tag-edit="handleTagEdit"
        @tag-remove="handleTagRemove"
      />
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
        
        <ThemeToggle />
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
            <AnalyticsSidebar
              :collapsed="false"
              :loading="analyticsLoading"
              :tag-data="tagData"
              :selected-tags="selectedTags"
              @day-selected="handleDaySelected"
              @refresh-data="refreshAnalytics"
              @navigate-to-settings="navigateToSettings"
              @navigate-to-history="navigateToHistory"
              @toggle-collapse="() => {}"
              @show-analytics-modal="() => {}"
              @show-heatmap-modal="() => {}"
              @show-insights-modal="() => {}"
              @tag-selected="handleTagSelected"
              @tag-deselected="handleTagDeselected"
              @tags-cleared="handleTagsCleared"
              @selection-changed="handleTagSelectionChanged"
              @tag-favorite="handleTagFavorite"
              @tag-edit="handleTagEdit"
              @tag-remove="handleTagRemove"
            />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto pb-safe px-safe lg:px-0">
        <!-- Main Area Header (Desktop/Mobile Consistency) -->
        <div class="hidden lg:block border-b border-border bg-background">
          <div class="max-w-4xl mx-auto px-4 lg:px-8 py-3">
            <div class="flex items-center justify-between">
              <h1 class="text-lg font-semibold text-foreground">FLOWDUCTIV</h1>
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <input
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search activities and tags..."
                    class="w-64 px-3 py-1.5 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
                    @input="handleSearchInput"
                    @focus="handleSearchFocus"
                    @blur="handleSearchBlur"
                    @keydown.escape="clearSearch"
                  />
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                    ⌘K
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
        
        <div class="max-w-4xl mx-auto px-4 lg:px-8 py-4 space-y-4">
        
        <!-- Contextual Status Bar (Flomo-Style) -->
        <StatusCallout 
          :activities="activities"
        />

        <!-- Combined Timer + Input Card (Flomo-Style following mockup design) -->
        <div class="content-card p-4">
          <div class="space-y-4">
            
            <!-- Timer Display Section -->
            <div class="text-center space-y-2">
              <div 
                class="text-5xl lg:text-6xl timer-display font-bold text-foreground tracking-tight"
                data-testid="unified-timer-display"
                aria-live="polite"
              >
                {{ formattedTime }}
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
                <span class="text-xs text-muted-foreground">
                  {{ timerStatus }}
                </span>
              </div>
            </div>

            <!-- Activity Input Section (Centered for desktop) -->
            <div class="max-w-2xl mx-auto space-y-3">
              
              <!-- Extracted Tags Display (Above Input) -->
              <div v-if="extractedTags.length > 0" class="flex flex-wrap gap-2 min-h-[24px] justify-center">
                <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <span class="text-primary/70 mr-1">#</span>{{ tag }}
                </span>
              </div>
              
              <div ref="dropdownContainer" class="relative">
                <input
                  id="unified-activity-input"
                  v-model="activityInput"
                  type="text"
                  placeholder="Enter activity or click for suggestions"
                  class="w-full px-4 py-2.5 text-base border-2 border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
              
              <!-- Quick Actions Grid -->
              <div v-if="!isRunning && !isPaused" class="flex space-x-2 text-xs justify-center">
                <button
                  @click="handleQuickStart('Deep work #focus')"
                  data-testid="quick-deep-work"
                  class="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                >
                  💡 Deep work
                </button>
                <button
                  @click="handleQuickStart('Meeting #meeting')"
                  data-testid="quick-meeting"
                  class="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                >
                  👥 Meeting
                </button>
                <button
                  @click="handleQuickStart('Learning #development')"
                  data-testid="quick-learning"
                  class="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
                >
                  📚 Learning
                </button>
              </div>
              
            </div>

            <!-- Timer Control Buttons -->
            <div class="flex justify-center space-x-3">
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

        <!-- Filter Bar (positioned between input and activities) -->
        <FilterBar
          :active-filters="activeFilters"
          :filter-metadata="filterMetadata"
          @remove-tag-filter="handleRemoveTagFilter"
          @clear-all-filters="handleClearAllFilters"
          @clear-date-range-filter="handleClearDateRangeFilter"
          @remove-priority-filter="(priority) => console.log('Remove priority filter:', priority)"
          @remove-focus-filter="(focus) => console.log('Remove focus filter:', focus)"
          @clear-duration-filters="() => console.log('Clear duration filters')"
        />

        <!-- Activities Section (Individual Cards) -->
        <div class="space-y-4">
          <!-- Individual Activity Cards (Flomo Style) -->
          <div v-if="recentActivities.length > 0" class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="content-card activity-card p-5 group cursor-pointer"
              @click="handleActivityClick(activity)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-foreground font-medium text-base leading-relaxed mb-3">{{ activity.title }}</p>
                  <div class="flex items-center space-x-3 mb-3">
                    <span class="text-sm font-medium text-foreground">{{ formatDuration(activity.durationMs) }}</span>
                    <span class="text-xs text-muted-foreground">•</span>
                    <span class="text-xs text-muted-foreground">{{ formatRelativeTime(activity.endTime) }}</span>
                    <span v-if="activity.startTime && activity.endTime" class="text-xs text-muted-foreground">•</span>
                    <span v-if="activity.startTime && activity.endTime" class="text-xs text-muted-foreground">
                      {{ formatTimeRange(activity.startTime, activity.endTime) }}
                    </span>
                  </div>
                  <div class="flex space-x-2">
                    <span v-for="tag in activity.tags" :key="tag" class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                <button 
                  class="p-2 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ml-3"
                  @click.stop="handleActivityMenu(activity)"
                  aria-label="Activity options"
                >
                  <svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Load More Button -->
            <div v-if="hasMoreActivities" class="flex justify-center pt-4">
              <button
                @click="loadMoreActivities"
                :disabled="activitiesLoading"
                class="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                data-testid="load-more-activities"
              >
                <span v-if="activitiesLoading">Loading...</span>
                <span v-else>Load More</span>
              </button>
            </div>
          </div>
          
          <!-- Empty State Card -->
          <div v-else-if="!activitiesLoading" class="content-card p-8 text-center">
            <p class="text-muted-foreground text-sm">{{ recentActivitiesMessage }}</p>
          </div>
          
          <!-- Loading State -->
          <div v-else class="content-card p-8 text-center">
            <p class="text-muted-foreground text-sm">Loading activities...</p>
          </div>
        </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Clock, Lightbulb, Menu, Moon, Settings, Users } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, triggerRef, watch } from 'vue'
import AnalyticsSidebar from '~/components/AnalyticsSidebar.vue'
import FilterBar from '~/components/FilterBar.vue'
import StatusCallout from '~/components/StatusCallout.vue'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import type { HeatmapDay } from '~/composables/useActivities'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { useContextualStatus } from '~/composables/useContextualStatus'
import { useInputParser } from '~/composables/useInputParser'

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

const {
  activities,
  formatDuration,
  formatRelativeTime,
  getActivities,
  getActivityStats,
  filteredActivities,
  activeFilters,
  filterMetadata,
  addTagFilter,
  removeTagFilter,
  clearAllFilters,
  clearDateRangeFilter,
  loading: activitiesLoading,
} = useActivities()

// Computed properties for tag data
const tagData = computed(() => {
  const stats = getActivityStats.value
  return Object.entries(stats.tagStats).map(([name, data]) => ({
    name,
    count: data.count,
    totalTime: data.totalTime,
    isFavorite: false // TODO: implement favorites
  })).sort((a, b) => b.count - a.count) // Sort by usage
})

const selectedTags = computed(() => new Set(activeFilters.value.tags || []))

// Contextual status service - but we'll override contextualMessage to use local data
const { recentActivitiesMessage, motivationalInsight } = useContextualStatus()


// Pagination state
const currentPage = ref(1)
const hasMoreActivities = ref(true)

// Use filtered activities for display with search
const recentActivities = computed(() => {
  let activities = filteredActivities.value
  
  // Apply search filter if search query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    activities = activities.filter(activity => {
      // Search in title
      if (activity.title.toLowerCase().includes(query)) return true
      
      // Search in tags
      if (activity.tags?.some(tag => tag.toLowerCase().includes(query))) return true
      
      return false
    })
  }
  
  return activities
})

// Timer status display
const timerStatus = computed(() => {
  if (isRunning.value) return 'Running'
  if (isPaused.value) return 'Paused'
  return 'Stopped'
})

// Local reactive state
const activityInput = ref('')
const searchQuery = ref('')
const showMobileMenu = ref(false)
const sidebarCollapsed = ref(false)
const analyticsLoading = ref(false)
const showAnalyticsModal = ref(false)
const showHeatmapModal = ref(false)
const showInsightsModal = ref(false)

// Search functionality
const searchInput = ref(null)

// Input parsing and auto-complete
const {
  tags: extractedTags,
  priority: extractedPriority,
  cleanText,
} = useInputParser(activityInput)

const {
  suggestions,
  isLoading: suggestionsLoading,
  selectedIndex,
  selectNext,
  selectPrevious,
  selectCurrent,
  selectIndex,
  performSearch,
  getInitialSuggestions,
} = useAutoComplete(activityInput, { debounceMs: 300, maxSuggestions: 8 })

// Dropdown state management
const inputFocused = ref(false)
const dropdownVisible = ref(false)
const justSelectedSuggestion = ref(false)

const showSuggestions = computed(
  () =>
    inputFocused.value &&
    dropdownVisible.value &&
    (suggestions.value.length > 0 || suggestionsLoading.value)
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

// Search functionality handlers
const handleSearchInput = () => {
  // The computed property recentActivities will automatically update
  // when searchQuery changes due to Vue's reactivity
}

const handleSearchFocus = () => {
  // Optional: Could implement search suggestions
}

const handleSearchBlur = () => {
  // Optional: Could hide search suggestions
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearchInput()
}

// Keyboard shortcut handler for ⌘+K
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // ⌘+K (Mac) or Ctrl+K (Windows/Linux) to focus search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    if (searchInput.value) {
      searchInput.value.focus()
    }
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
      activityInput.value = currentText
        ? `${currentText} #${suggestion.text}`
        : `#${suggestion.text}`
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

// Analytics handlers
const refreshAnalytics = async () => {
  analyticsLoading.value = true
  try {
    // Trigger refresh of analytics components
    window.dispatchEvent(new CustomEvent('refresh-analytics'))
  } catch (error) {
    console.error('Failed to refresh analytics:', error)
  } finally {
    analyticsLoading.value = false
  }
}

// Tag filtering handlers - now using universal filter system
const handleTagSelected = (tag: string) => {
  addTagFilter(tag)
}

const handleTagDeselected = (tag: string) => {
  removeTagFilter(tag)
}

const handleTagsCleared = () => {
  // Clear only tag filters, keep other filters intact
  if (activeFilters.value.tags) {
    activeFilters.value.tags.forEach(tag => removeTagFilter(tag))
  }
}

const handleTagSelectionChanged = (newSelectedTags: Set<string>) => {
  // Clear existing tag filters first
  if (activeFilters.value.tags) {
    [...activeFilters.value.tags].forEach(tag => removeTagFilter(tag))
  }
  
  // Add new tag filters
  newSelectedTags.forEach(tag => addTagFilter(tag))
}

// FilterBar event handlers
const handleRemoveTagFilter = (tag: string) => {
  removeTagFilter(tag)
}

const handleClearAllFilters = () => {
  clearAllFilters()
}

const handleClearDateRangeFilter = () => {
  clearDateRangeFilter()
}

const handleTagFavorite = (tag: any) => {
  console.log('Toggle favorite for tag:', tag.name)
  // TODO: Implement tag favorite functionality
}

const handleTagEdit = (tag: any) => {
  console.log('Edit tag:', tag.name)
  // TODO: Open tag edit modal/dialog
}

const handleTagRemove = (tag: any, includeActivities: boolean) => {
  console.log('Remove tag:', tag.name, 'Include activities:', includeActivities)
  // TODO: Implement tag removal functionality
}

// Click outside to dismiss dropdown
const dropdownContainer = ref(null)

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    hideDropdown()
  }
}

// Load more activities
const loadMoreActivities = async () => {
  if (activitiesLoading.value || !hasMoreActivities.value) return

  currentPage.value++
  const newActivities = await getActivities(currentPage.value, 10)

  // If we got fewer than 10, we've reached the end
  if (newActivities.length < 10) {
    hasMoreActivities.value = false
  }
}

// Refresh activities (reset to page 1)
const refreshActivities = async () => {
  currentPage.value = 1
  hasMoreActivities.value = true
  await getActivities(1, 10)
}

// Activity interaction handlers
const handleActivityClick = (activity) => {
  // For future: implement activity detail view or inline editing
  console.log('Activity clicked:', activity)
}

const handleActivityMenu = (activity) => {
  // For future: implement context menu with edit/delete options
  console.log('Activity menu:', activity)
}

// Format time range helper
const formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  return `${formatTime(start)} - ${formatTime(end)}`
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyboardShortcuts)
  
  // Load first page of activities on component mount
  await refreshActivities()

  // Listen for activity saved events to refresh the list
  window.addEventListener('activity-saved', refreshActivities)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyboardShortcuts)
  window.removeEventListener('activity-saved', refreshActivities)
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