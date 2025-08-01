<template>
  <div 
    v-if="filterMetadata.hasActiveFilters" 
    class="space-y-2"
    data-testid="filter-bar"
  >
    <!-- Inline Filter Info and Chips -->
    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <div class="flex items-center space-x-1">
        <span>Showing {{ filterMetadata.filteredCount }} of {{ filterMetadata.totalActivities }}</span>
        <span v-if="filterMetadata.hiddenCount > 0" class="text-muted-foreground/70">
          ({{ filterMetadata.hiddenCount }} hidden)
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Advanced Filters Toggle - only show when basic filters are active -->
        <button
          v-if="hasBasicFilters"
          @click="showAdvancedFilters = !showAdvancedFilters"
          :class="[
            'text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1',
            showAdvancedFilters ? 'text-foreground' : ''
          ]"
          data-testid="toggle-advanced-filters"
        >
          <span>{{ hasAdvancedFilters ? `Advanced (${advancedFilterCount})` : 'More filters' }}</span>
          <svg 
            :class="[
              'w-3 h-3 transition-transform',
              showAdvancedFilters ? 'rotate-180' : ''
            ]"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Clear All Button -->
        <button
          @click="clearAllFilters"
          class="text-muted-foreground hover:text-foreground transition-colors"
          data-testid="clear-all-filters"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Active Filter Chips -->
    <div class="flex flex-wrap gap-1">
      <!-- Tag Filters -->
      <div 
        v-for="tag in activeFilters.tags || []"
        :key="`tag-${tag}`"
        class="inline-flex items-center px-2 py-0.5 bg-primary/5 text-primary/80 rounded text-xs"
        data-testid="filter-chip-tag"
      >
        <span class="text-primary/70 mr-1">#</span>{{ tag }}
        <button
          @click="removeTagFilter(tag)"
          class="ml-1.5 hover:bg-primary/10 rounded p-0.5 transition-colors"
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
        class="inline-flex items-center px-2 py-0.5 bg-blue-500/5 text-blue-600/80 dark:text-blue-400/80 rounded text-xs"
        data-testid="filter-chip-date"
      >
        <span class="mr-1">📅</span>
        {{ formatDateRange(activeFilters.dateRange) }}
        <button
          @click="clearDateRangeFilter"
          class="ml-1.5 hover:bg-blue-500/10 rounded p-0.5 transition-colors"
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
        class="inline-flex items-center px-2 py-0.5 bg-yellow-500/5 text-yellow-600/80 dark:text-yellow-400/80 rounded text-xs"
        data-testid="filter-chip-priority"
      >
        <span class="mr-1">⭐</span>Priority {{ priority }}
        <button
          @click="removePriorityFilter(priority)"
          class="ml-1.5 hover:bg-yellow-500/10 rounded p-0.5 transition-colors"
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
        class="inline-flex items-center px-2 py-0.5 bg-green-500/5 text-green-600/80 dark:text-green-400/80 rounded text-xs"
        data-testid="filter-chip-focus"
      >
        <span class="mr-1">🎯</span>Focus {{ focus }}
        <button
          @click="removeFocusFilter(focus)"
          class="ml-1.5 hover:bg-green-500/10 rounded p-0.5 transition-colors"
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
        class="inline-flex items-center px-2 py-0.5 bg-purple-500/5 text-purple-600/80 dark:text-purple-400/80 rounded text-xs"
        data-testid="filter-chip-duration"
      >
        <span class="mr-1">⏱️</span>
        {{ formatDurationFilter() }}
        <button
          @click="clearDurationFilters"
          class="ml-1.5 hover:bg-purple-500/10 rounded p-0.5 transition-colors"
          aria-label="Remove duration filter"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Advanced Filters Panel (expanded within FilterBar) -->
    <div 
      v-if="showAdvancedFilters"
      class="pt-2 border-t border-border"
      data-testid="advanced-filters-expansion"
    >
      <AdvancedFilterPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdvancedFilterPanel from '~/components/AdvancedFilterPanel.vue'
import type { ActivityFilters } from '~/composables/useActivities'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'

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
const { hasAdvancedFilters, advancedFilterCount } = useAdvancedFilters()

// Local state
const showAdvancedFilters = ref(false)

// Computed properties
const hasBasicFilters = computed(() => {
  const { tags, dateRange } = props.activeFilters
  return (tags && tags.length > 0) || dateRange !== undefined
})

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
  // Also close advanced filters when clearing all
  showAdvancedFilters.value = false
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