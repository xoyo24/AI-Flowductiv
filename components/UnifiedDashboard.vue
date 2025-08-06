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
        :tags-loading="tagsLoading"
        :tag-data="tagData"
        :selected-tags="selectedTags"
        :active-date-filter="activeDateFilter"
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
        @apply-filter-combination="handleApplyFilterCombination"
        @priority-toggle="handlePriorityToggle"
        @focus-toggle="handleFocusToggle"
        @duration-changed="handleDurationChanged"
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
        
        <div class="flex items-center space-x-2">
          <button
            @click="showMobileAnalyticsPanel = true"
            class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            data-testid="mobile-analytics-button"
            aria-label="Open analytics"
          >
            <BarChart class="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <!-- Mobile Menu Overlay (only on mobile) -->
      <div
        v-if="showMobileMenu"
        class="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        @click="showMobileMenu = false"
      >
        <div class="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border pt-safe overflow-y-auto" @click.stop>
          <!-- Analytics Section in Mobile Menu -->
          <div class="p-4 space-y-8">
            <AnalyticsSidebar
              :collapsed="false"
              :mobile-mode="true"
              :loading="analyticsLoading"
              :tags-loading="tagsLoading"
              :tag-data="tagData"
              :selected-tags="selectedTags"
              :active-date-filter="activeDateFilter"
              @day-selected="handleDaySelected"
              @refresh-data="refreshAnalytics"
              @navigate-to-settings="navigateToSettings"
              @navigate-to-history="navigateToHistory"
              @toggle-collapse="showMobileMenu = false"
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
              @apply-filter-combination="handleApplyFilterCombination"
              @priority-toggle="handlePriorityToggle"
              @focus-toggle="handleFocusToggle"
              @duration-changed="handleDurationChanged"
            />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto pb-safe px-safe lg:px-0">
        <!-- Main Area Header (Desktop/Mobile Consistency) -->
        <div class="hidden lg:block bg-background">
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
                    class="w-64 px-3 py-1.5 text-sm border border-muted rounded-lg bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent focus:bg-background"
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

        <!-- Combined Timer + Input Card (Clean Integrated Design) -->
        <div class="content-card p-6">
          <div class="space-y-6">
            
            <!-- Timer Display Section -->
            <TimerDisplay
              :formatted-time="formattedTime"
              :is-running="isRunning"
              :is-paused="isPaused"
            />

            <!-- Input Section (No Nested Card) -->
            <InputComposer
              v-model="activityInput"
              :is-running="isRunning"
              :is-paused="isPaused"
              :quick-start-hidden="quickStartHidden"
              :suggestions="suggestions"
              :suggestions-loading="suggestionsLoading"
              :selected-index="selectedIndex"
              :extracted-tags="extractedTags"
              :extracted-priority="extractedPriority"
              @quick-start="handleQuickStart"
              @show-quick-start="quickStartHidden = false"
              @start-timer="handleStart"
              @pause-timer="handlePause"
              @resume-timer="handleResume"
              @finish-timer="handleFinish"
              @suggestion-select="handleSuggestionSelect"
              @keydown="handleKeydown"
              @input-focus="handleInputFocus"
              @input-blur="handleInputBlur"
              @enter-key="handleEnterKey"
              @select-index="selectIndex"
              @hide-dropdown="hideDropdown"
            />
            
          </div>
        </div>

        
        <!-- Filter Bar (positioned between advanced filters and activities) -->
        <FilterBar
          :active-filters="activeFilters"
          :filter-metadata="filterMetadata"
          @remove-tag-filter="handleRemoveTagFilter"
          @clear-all-filters="handleClearAllFilters"
          @clear-date-range-filter="handleClearDateRangeFilter"
          @remove-priority-filter="togglePriorityFilter"
          @remove-focus-filter="toggleFocusRatingFilter"
          @remove-energy-filter="toggleEnergyLevelFilter"
          @clear-duration-filters="clearDurationRangeFilter"
        />


        <!-- Activities Section -->
        <ActivityList
          :activities="recentActivities"
          :has-more-activities="hasMoreActivities"
          :loading="activitiesLoading"
          :empty-message="recentActivitiesMessage"
          :format-duration="formatDuration"
          :format-relative-time="formatRelativeTime"
          :format-time-range="formatTimeRange"
          @activity-click="handleActivityClick"
          @activity-edit="handleActivityEdit"
          @activity-delete="handleActivityDelete"
          @activity-focus-rating="handleActivityFocusRating"
          @load-more="loadMoreActivities"
        />

        </div>
      </main>
    </div>
  </div>

  <!-- Activity Edit Dialog -->
  <div 
    v-if="isEditDialogOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="isEditDialogOpen = false"
  >
    <div 
      class="content-card p-6 max-w-md w-full mx-4"
      @click.stop
    >
      <h3 class="text-lg font-semibold mb-4">Edit Activity</h3>
      <ActivitySmartEditInput
        :activity="selectedActivity"
        @update="handleEditUpdate"
        @save="handleEditSave"
      />
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          @click="isEditDialogOpen = false"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button 
          @click="saveEdit"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>

  <!-- Activity Delete Confirmation Dialog -->
  <div 
    v-if="isDeleteDialogOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="cancelDelete"
  >
    <div 
      class="content-card p-6 max-w-md w-full mx-4"
      @click.stop
    >
      <h3 class="text-lg font-semibold mb-4">Delete Activity</h3>
      <p class="text-muted-foreground mb-6">
        Are you sure you want to delete "{{ selectedActivity?.title }}"? This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancelDelete"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button 
          @click="confirmDelete"
          class="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90"
        >
          Delete
        </button>
      </div>
    </div>
  </div>

  <!-- Focus Rating Modal -->
  <FocusRatingModal
    :is-open="showFocusRatingModal"
    :activity="focusRatingActivity"
    @save="handleFocusRatingSave"
    @skip="handleFocusRatingSkip"
    @close="handleFocusRatingClose"
  />

  <!-- Mobile Analytics Panel -->
  <MobileAnalyticsPanel
    :is-open="showMobileAnalyticsPanel"
    :heatmap-data="mobileHeatmapData"
    :tag-data="tagData"
    :selected-date="activeDateFilter"
    :today-stats="mobileTodayStats"
    :active-goals="mobileActiveGoals"
    @close="showMobileAnalyticsPanel = false"
    @day-selected="handleMobileDaySelected"
    @tag-selected="handleMobileTagSelected"
    @show-heatmap-modal="showHeatmapModal = true; showMobileAnalyticsPanel = false"
    @show-goals-modal="showGoalsModal = true; showMobileAnalyticsPanel = false"
    @show-insights-modal="showInsightsModal = true; showMobileAnalyticsPanel = false"
    @refresh-data="handleMobileRefreshData"
  />
</template>

<script setup lang="ts">
import { BarChart, BookOpen, Clock, Lightbulb, Menu, Moon, Settings, Users } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, triggerRef, watch } from 'vue'
import ActivitySmartEditInput from '~/components/Activity/SmartEditInput.vue'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'
import ActivityList from '~/components/ActivityList.vue'
import AnalyticsSidebar from '~/components/AnalyticsSidebar.vue'
import FilterBar from '~/components/FilterBar.vue'
import FocusRatingModal from '~/components/FocusRatingModal.vue'
import InputComposer from '~/components/InputComposer.vue'
import MobileAnalyticsPanel from '~/components/MobileAnalyticsPanel.vue'
import StatusCallout from '~/components/StatusCallout.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import TimerDisplay from '~/components/TimerDisplay.vue'
import type { HeatmapDay } from '~/composables/useActivities'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { useContextualStatus } from '~/composables/useContextualStatus'
import { useFocusRating } from '~/composables/useFocusRating'
import { useInputParser } from '~/composables/useInputParser'
import { useTagManagement } from '~/composables/useTagManagement'

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
  setDateRangeFilter,
  clearAllFilters,
  clearDateRangeFilter,
  loading: activitiesLoading,
} = useActivities()

// Advanced filters
const {
  togglePriorityFilter,
  toggleFocusRatingFilter,
  toggleEnergyLevelFilter,
  setDurationRangeFilter,
  clearDurationRangeFilter,
  clearAllAdvancedFilters,
} = useAdvancedFilters()

// Focus rating system
const {
  showModal: showFocusRatingModal,
  pendingActivity: focusRatingActivity,
  promptForRating,
  saveRating: saveFocusRating,
  skipRating: skipFocusRating,
  closeModal: closeFocusRatingModal,
} = useFocusRating()

// Tag management
const { allTags, getAllTags, loading: tagsLoading } = useTagManagement()

// Computed properties for tag data - transformed to match existing interface
const _tagData = computed(() => {
  const stats = getActivityStats.value
  return allTags.value
    .map((tagName) => {
      const tagStats = stats.tagStats[tagName]
      return {
        name: tagName,
        count: tagStats?.count || 0,
        totalTime: tagStats?.totalTime || 0,
        isFavorite: false, // TODO: implement favorites
      }
    })
    .sort((a, b) => b.count - a.count) // Sort by usage
})

const _selectedTags = computed(() => new Set(activeFilters.value.tags || []))

// Extract selected date from active date range filter
const _activeDateFilter = computed(() => {
  const dateRange = activeFilters.value.dateRange
  if (!dateRange) return null

  // Check if it's a single day filter (start and end are on the same day)
  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)

  // Reset hours to compare dates only
  const startDate = new Date(start)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(end)
  endDate.setHours(0, 0, 0, 0)

  if (startDate.getTime() === endDate.getTime()) {
    // It's a single day filter, return the date in YYYY-MM-DD format
    return start.toISOString().split('T')[0]
  }

  return null // Multi-day range, don't show as selected
})

// Contextual status service - but we'll override contextualMessage to use local data
const { motivationalInsight } = useContextualStatus()

// Context-aware empty message for activities
const _recentActivitiesMessage = computed((): string => {
  const hasAnyActivities = activities.value.length > 0
  const hasFiltersActive = filterMetadata.value.hasActiveFilters
  const hasSearchQuery = searchQuery.value.trim().length > 0

  // No activities at all in database
  if (!hasAnyActivities) {
    return 'Your activities will appear here. Start your first timer above!'
  }

  // Has activities but search query returns no results
  if (hasSearchQuery && recentActivities.value.length === 0) {
    return `No activities match "${searchQuery.value}". Try a different search term.`
  }

  // Has activities but filters hide them all
  if (hasFiltersActive && recentActivities.value.length === 0) {
    return 'No activities match your current filters. Try adjusting or clearing filters above.'
  }

  // Has activities but none shown (shouldn't happen in current logic)
  if (recentActivities.value.length === 0) {
    return 'No recent activities to display.'
  }

  // This shouldn't be reached since this message is only shown when list is empty
  return 'Start tracking to see your activities here.'
})

// Pagination state
const currentPage = ref(1)
const hasMoreActivities = ref(true)

// Use filtered activities for display with search
const recentActivities = computed(() => {
  let activities = filteredActivities.value

  // Apply search filter if search query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    activities = activities.filter((activity) => {
      // Search in title
      if (activity.title.toLowerCase().includes(query)) return true

      // Search in tags
      if (activity.tags?.some((tag) => tag.toLowerCase().includes(query))) return true

      return false
    })
  }

  return activities
})

// Mobile analytics computed properties
const _mobileHeatmapData = computed(() => {
  // Transform activities data into heatmap format for last 28 days
  const days = []
  const today = new Date()

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Get activities for this date
    const dayActivities = activities.value.filter((activity) => {
      const activityDate = new Date(activity.startTime).toISOString().split('T')[0]
      return activityDate === dateStr
    })

    const totalTime = dayActivities.reduce((sum, activity) => sum + (activity.durationMs || 0), 0)
    const activityCount = dayActivities.length
    const avgFocus =
      dayActivities.length > 0
        ? dayActivities.reduce((sum, activity) => sum + (activity.focusRating || 0), 0) /
          dayActivities.length
        : 0

    days.push({
      date: dateStr,
      totalTime,
      activityCount,
      avgFocus,
    })
  }

  return days
})

const _mobileTodayStats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayActivities = activities.value.filter((activity) => {
    const activityDate = new Date(activity.startTime).toISOString().split('T')[0]
    return activityDate === today
  })

  const totalTime = todayActivities.reduce((sum, activity) => sum + (activity.durationMs || 0), 0)
  const activityCount = todayActivities.length
  const avgFocus =
    todayActivities.length > 0
      ? todayActivities.reduce((sum, activity) => sum + (activity.focusRating || 0), 0) /
        todayActivities.length
      : 0

  return {
    totalTime: formatDuration(totalTime),
    activityCount,
    avgFocus: avgFocus.toFixed(1),
  }
})

const _mobileActiveGoals = computed(() => {
  // TODO: Implement goals system
  // For now, return empty array
  return []
})

// Local reactive state
const activityInput = ref('')
const searchQuery = ref('')
const showMobileMenu = ref(false)
const showMobileAnalyticsPanel = ref(false)
const _sidebarCollapsed = ref(false)
const analyticsLoading = ref(false)
const _showAnalyticsModal = ref(false)
const _showHeatmapModal = ref(false)
const _showInsightsModal = ref(false)
const _showGoalsModal = ref(false)
const quickStartHidden = ref(false)

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
    // Clear input when starting a completely new timer (not resuming)
    if (!isRunning.value && !isPaused.value) {
      // This is a fresh start, keep current input as is
    }
    vibrate([100])
    hideDropdown()
  }
}

const _handlePause = () => {
  pauseTimer()
  vibrate([50, 50])
}

const _handleResume = () => {
  resumeTimer()
  vibrate([100])
}

const _handleFinish = async () => {
  const result = await finishTimer()
  if (result.success) {
    // Clear the activity input to provide clean slate for next timer
    activityInput.value = ''
    quickStartHidden.value = false // Show quick start again
    vibrate([200])

    // If an activity was saved (not skipped due to short duration), prompt for focus rating
    if (result.activity) {
      promptForRating(result.activity)
    }
  }
}

const _handleReset = () => {
  if (confirm('Reset timer? This will discard the current session.')) {
    resetTimer()
    activityInput.value = ''
    quickStartHidden.value = false // Show quick start again
    vibrate([50, 100, 50])
  }
}

// Quick start handler - set activity and start timer immediately
const _handleQuickStart = (activity: string) => {
  activityInput.value = activity
  if (startTimer(activity)) {
    quickStartHidden.value = true // Hide quick start section
    vibrate([100]) // Haptic feedback
  }
}

// Search functionality handlers
const handleSearchInput = () => {
  // The computed property recentActivities will automatically update
  // when searchQuery changes due to Vue's reactivity
}

const _handleSearchFocus = () => {
  // Optional: Could implement search suggestions
}

const _handleSearchBlur = () => {
  // Optional: Could hide search suggestions
}

const _clearSearch = () => {
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

const _handleKeydown = (event) => {
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
        // Only handle Enter for suggestions, not for starting timer
        if (selectedIndex.value >= 0) {
          event.preventDefault()
          const selected = selectCurrent()
          if (selected) {
            handleSuggestionSelect(selected)
          }
          return
        }
        hideDropdown()
        break
      case 'Escape':
        event.preventDefault()
        hideDropdown()
        break
      case 'Tab':
        hideDropdown()
        break
    }
  } else {
    // Only trigger suggestions for regular typing, not Enter
    if (event.key.length === 1 && event.key !== 'Enter') {
      nextTick(() => {
        if (suggestions.value.length > 0) {
          showDropdown()
        }
      })
    }
  }
}

const _handleInputFocus = () => {
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

const _handleInputBlur = () => {
  setTimeout(() => {
    if (!justSelectedSuggestion.value) {
      inputFocused.value = false
      hideDropdown()
    }
  }, 150)
}

const _handleEnterKey = (event: KeyboardEvent) => {
  if (justSelectedSuggestion.value) {
    return
  }

  // In textarea: Enter starts timer (Flomo-style), Shift+Enter creates new line
  if (!event.shiftKey) {
    event.preventDefault()
    handleStart()
  }
  // Shift+Enter allows normal new line behavior
}

// Navigation handlers
const navigateAndCloseMenu = (path: string) => {
  showMobileMenu.value = false
  navigateTo(path)
}

const _navigateToSettings = () => navigateAndCloseMenu('/settings')
const _navigateToHistory = () => navigateAndCloseMenu('/history')

// Handle heatmap day selection
const handleDaySelected = (day: HeatmapDay) => {
  if (!day.date) return

  // Create date range for the selected day (full day in UTC)
  const selectedDate = new Date(`${day.date}T00:00:00.000Z`)
  const startOfDay = new Date(selectedDate)
  startOfDay.setUTCHours(0, 0, 0, 0)

  const endOfDay = new Date(selectedDate)
  endOfDay.setUTCHours(23, 59, 59, 999)

  // Apply date filter using the universal filter system
  setDateRangeFilter(startOfDay, endOfDay)

  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false

  // Haptic feedback for mobile
  vibrate([100])
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
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handleTagDeselected = (tag: string) => {
  removeTagFilter(tag)
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handleTagsCleared = () => {
  // Clear only tag filters, keep other filters intact
  if (activeFilters.value.tags) {
    activeFilters.value.tags.forEach((tag) => removeTagFilter(tag))
  }
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handleTagSelectionChanged = (newSelectedTags: Set<string>) => {
  // Clear existing tag filters first
  if (activeFilters.value.tags) {
    ;[...activeFilters.value.tags].forEach((tag) => removeTagFilter(tag))
  }

  // Add new tag filters
  newSelectedTags.forEach((tag) => addTagFilter(tag))
}

// FilterBar event handlers
const _handleRemoveTagFilter = (tag: string) => {
  removeTagFilter(tag)
}

const _handleClearAllFilters = () => {
  clearAllFilters()
}

const _handleClearDateRangeFilter = () => {
  clearDateRangeFilter()
}

const _handleTagFavorite = async (tag: any) => {
  console.log('Toggle favorite for tag:', tag.name)
  // Tag favorite operation is handled within TagFilters component
  // No need for additional refresh as it's just UI state
}

const _handleTagEdit = async (tag: any) => {
  console.log('Tag edited:', tag.name)
  // After tag rename, refresh activities and analytics
  await refreshActivities()
  await refreshAnalytics()
}

const _handleTagRemove = async (tag: any, includeActivities: boolean) => {
  console.log('Tag removed:', tag.name, 'Include activities:', includeActivities)
  // After tag removal, refresh activities and analytics
  await refreshActivities()
  await refreshAnalytics()
}

// Filter event handlers for sidebar components
const _handleApplyFilterCombination = (combinationId: string) => {
  // This will be handled by the useAdvancedFilters composable through applySavedFilterCombination
  console.log('Apply filter combination:', combinationId)
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handlePriorityToggle = (priority: number) => {
  togglePriorityFilter(priority)
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handleFocusToggle = (focus: number) => {
  toggleFocusRatingFilter(focus)
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

const _handleDurationChanged = (minDuration?: number, maxDuration?: number) => {
  setDurationRangeFilter(minDuration, maxDuration)
  // Close mobile menu after filter action so user can see results
  showMobileMenu.value = false
}

// Dropdown management (simplified since moved to InputComposer)
const handleClickOutside = (_event) => {
  // Most dropdown logic now handled by InputComposer
}

// Load more activities
const _loadMoreActivities = async () => {
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
const _handleActivityClick = (activity) => {
  // For future: implement activity detail view or inline editing
  console.log('Activity clicked:', activity)
}

const _handleActivityFocusRating = async (activity, rating: number) => {
  try {
    const { updateActivity } = useActivities()
    await updateActivity(activity.id, { focusRating: rating })

    // Refresh activities to reflect the changes
    await refreshActivities()

    // Haptic feedback for successful rating
    vibrate([100])
  } catch (error) {
    console.error('Failed to update focus rating:', error)
  }
}

const selectedActivity = ref(null)
const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const editData = ref({
  title: '',
  tags: [],
  priority: null,
})

const _handleActivityEdit = (activity) => {
  selectedActivity.value = activity
  editData.value = {
    title: activity.title,
    tags: [...(activity.tags || [])],
    priority: activity.priority || null,
  }
  isEditDialogOpen.value = true
}

const _handleEditUpdate = (data) => {
  editData.value = data
}

const _handleEditSave = () => {
  // Save when Enter is pressed in the smart input
  saveEdit()
}

const _handleActivityDelete = (activity) => {
  selectedActivity.value = activity
  isDeleteDialogOpen.value = true
}

const _confirmDelete = async () => {
  if (!selectedActivity.value) return

  try {
    await $fetch(`/api/activities/${selectedActivity.value.id}`, {
      method: 'DELETE',
    })

    // Refresh activities to reflect the deletion
    await refreshActivities()
    isDeleteDialogOpen.value = false
    selectedActivity.value = null
  } catch (error) {
    console.error('Failed to delete activity:', error)
  }
}

const _cancelDelete = () => {
  isDeleteDialogOpen.value = false
  selectedActivity.value = null
}

const saveEdit = async () => {
  if (!selectedActivity.value) return

  try {
    const updateData = {
      title: editData.value.title,
      tags: editData.value.tags,
      priority: editData.value.priority,
    }

    await $fetch(`/api/activities/${selectedActivity.value.id}`, {
      method: 'PATCH',
      body: updateData,
    })

    // Refresh activities to reflect the changes
    await refreshActivities()
    isEditDialogOpen.value = false
    selectedActivity.value = null
  } catch (error) {
    console.error('Failed to update activity:', error)
  }
}

// Focus Rating Modal Handlers
const _handleFocusRatingSave = async (rating: number) => {
  try {
    const success = await saveFocusRating(rating)
    if (success) {
      // Refresh activities to show the updated rating
      await refreshActivities()
      vibrate([100, 50, 100]) // Success haptic pattern
    }
  } catch (error) {
    console.error('Failed to save focus rating:', error)
  }
}

const _handleFocusRatingSkip = () => {
  skipFocusRating()
  vibrate([50]) // Light haptic feedback
}

const _handleFocusRatingClose = () => {
  closeFocusRatingModal()
}

// Mobile Analytics Panel Handlers
const _handleMobileDaySelected = (day: any) => {
  // Reuse existing day selection logic (already closes mobile menu)
  handleDaySelected(day)
  showMobileAnalyticsPanel.value = false // Close panel after selection
  vibrate([100])
}

const _handleMobileTagSelected = (tag: string) => {
  // Reuse existing tag selection logic (already closes mobile menu)
  handleTagSelected(tag)
  showMobileAnalyticsPanel.value = false // Close panel after selection
  vibrate([50])
}

const _handleMobileRefreshData = () => {
  // Reuse existing refresh logic
  refreshAnalytics()
  vibrate([100])
}

// Format time range helper
const _formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return `${formatTime(start)} - ${formatTime(end)}`
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyboardShortcuts)

  // Load first page of activities and all tags concurrently
  await Promise.all([refreshActivities(), getAllTags()])

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