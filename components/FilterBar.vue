<template>
  <div 
    v-if="filterMetadata.hasActiveFilters" 
    class="bg-card rounded-lg border border-border p-4 space-y-3"
    data-testid="filter-bar"
  >
    <!-- Filter Summary -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="text-sm font-medium text-foreground">
          Showing {{ filterMetadata.filteredCount }} of {{ filterMetadata.totalActivities }} activities
        </div>
        <div 
          v-if="filterMetadata.hiddenCount > 0"
          class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
        >
          {{ filterMetadata.hiddenCount }} hidden
        </div>
      </div>
      
      <button
        @click="clearAllFilters"
        class="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        data-testid="clear-all-filters"
      >
        Clear all filters
      </button>
    </div>

    <!-- Active Filter Chips -->
    <div class="flex flex-wrap gap-2">
      <!-- Tag Filters -->
      <div 
        v-for="tag in activeFilters.tags || []"
        :key="`tag-${tag}`"
        class="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
        data-testid="filter-chip-tag"
      >
        <span class="text-primary/70 mr-1">#</span>{{ tag }}
        <button
          @click="removeTagFilter(tag)"
          class="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          aria-label="Remove tag filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Date Range Filter -->
      <div 
        v-if="activeFilters.dateRange"
        class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
        data-testid="filter-chip-date"
      >
        <span class="mr-1">📅</span>
        {{ formatDateRange(activeFilters.dateRange) }}
        <button
          @click="clearDateRangeFilter"
          class="ml-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-full p-0.5 transition-colors"
          aria-label="Remove date filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Priority Filters -->
      <div 
        v-for="priority in activeFilters.priority || []"
        :key="`priority-${priority}`"
        class="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-full text-sm border border-yellow-200 dark:border-yellow-800"
        data-testid="filter-chip-priority"
      >
        <span class="mr-1">⭐</span>Priority {{ priority }}
        <button
          @click="removePriorityFilter(priority)"
          class="ml-2 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 rounded-full p-0.5 transition-colors"
          aria-label="Remove priority filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Focus Rating Filters -->
      <div 
        v-for="focus in activeFilters.focusRating || []"
        :key="`focus-${focus}`"
        class="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-800"
        data-testid="filter-chip-focus"
      >
        <span class="mr-1">🎯</span>Focus {{ focus }}
        <button
          @click="removeFocusFilter(focus)"
          class="ml-2 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-full p-0.5 transition-colors"
          aria-label="Remove focus filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Duration Filters -->
      <div 
        v-if="activeFilters.minDuration !== undefined || activeFilters.maxDuration !== undefined"
        class="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-800"
        data-testid="filter-chip-duration"
      >
        <span class="mr-1">⏱️</span>
        {{ formatDurationFilter() }}
        <button
          @click="clearDurationFilters"
          class="ml-2 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-full p-0.5 transition-colors"
          aria-label="Remove duration filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityFilters } from '~/composables/useActivities'

interface Props {
  activeFilters: ActivityFilters
  filterMetadata: {
    totalActivities: number
    filteredCount: number
    hasActiveFilters: boolean
    hiddenCount: number
  }
}

interface Emits {
  (e: 'remove-tag-filter', tag: string): void
  (e: 'remove-priority-filter', priority: number): void
  (e: 'remove-focus-filter', focus: number): void
  (e: 'clear-date-range-filter'): void
  (e: 'clear-duration-filters'): void
  (e: 'clear-all-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { formatDuration } = useActivities()

// Methods
const removeTagFilter = (tag: string) => {
  emit('remove-tag-filter', tag)
}

const removePriorityFilter = (priority: number) => {
  emit('remove-priority-filter', priority)
}

const removeFocusFilter = (focus: number) => {
  emit('remove-focus-filter', focus)
}

const clearDateRangeFilter = () => {
  emit('clear-date-range-filter')
}

const clearDurationFilters = () => {
  emit('clear-duration-filters')
}

const clearAllFilters = () => {
  emit('clear-all-filters')
}

const formatDateRange = (dateRange: { start: Date; end: Date }) => {
  const start = dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${start} - ${end}`
}

const formatDurationFilter = () => {
  const { minDuration, maxDuration } = props.activeFilters
  
  if (minDuration !== undefined && maxDuration !== undefined) {
    return `${formatDuration(minDuration)} - ${formatDuration(maxDuration)}`
  } else if (minDuration !== undefined) {
    return `≥ ${formatDuration(minDuration)}`
  } else if (maxDuration !== undefined) {
    return `≤ ${formatDuration(maxDuration)}`
  }
  
  return 'Duration'
}
</script>