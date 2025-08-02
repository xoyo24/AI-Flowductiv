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
        <!-- Save Filters Button -->
        <button
          @click="showSaveDialog = true"
          class="text-primary hover:text-primary/80 transition-colors text-xs font-medium"
          data-testid="save-current-filters"
        >
          + Save
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

    <!-- Save Filter Dialog -->
    <div
      v-if="showSaveDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      @click="cancelSave"
    >
      <div
        class="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-foreground mb-4">Save Filter Combination</h3>
        <div class="mb-4">
          <input
            v-model="saveFilterName"
            type="text"
            placeholder="Enter filter name..."
            maxlength="50"
            class="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            data-testid="save-filter-name-input"
            @keyup.enter="saveCurrentFilters"
            @keyup.escape="cancelSave"
          />
        </div>
        <div class="text-xs text-muted-foreground mb-4">
          Current filters: {{ getActiveFiltersDescription() }}
        </div>
        <div class="flex justify-end space-x-2">
          <button
            @click="cancelSave"
            class="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveCurrentFilters"
            :disabled="!saveFilterName.trim()"
            class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
const { saveCurrentFilterCombination } = useAdvancedFilters()

// Save dialog state
const showSaveDialog = ref(false)
const saveFilterName = ref('')

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
  
  const formatMs = (ms: number) => {
    const minutes = Math.round(ms / 60000)
    if (minutes < 60) {
      return `${minutes}min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMins = minutes % 60
      return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`
    }
  }
  
  if (minDuration !== undefined && maxDuration !== undefined) {
    return `${formatMs(minDuration)} - ${formatMs(maxDuration)}`
  } else if (minDuration !== undefined) {
    return `≥ ${formatMs(minDuration)}`
  } else if (maxDuration !== undefined) {
    return `≤ ${formatMs(maxDuration)}`
  }
  
  return 'Duration'
}

// Save filter methods
const saveCurrentFilters = () => {
  if (!saveFilterName.value.trim()) return
  
  try {
    saveCurrentFilterCombination(saveFilterName.value.trim())
    cancelSave()
  } catch (error) {
    console.error('Failed to save filter combination:', error)
  }
}

const cancelSave = () => {
  saveFilterName.value = ''
  showSaveDialog.value = false
}

const getActiveFiltersDescription = () => {
  const parts: string[] = []
  
  if (props.activeFilters.priority?.length) {
    parts.push(`Priority: ${props.activeFilters.priority.join(', ')}`)
  }
  if (props.activeFilters.focusRating?.length) {
    parts.push(`Focus: ${props.activeFilters.focusRating.join(', ')}`)
  }
  if (props.activeFilters.minDuration || props.activeFilters.maxDuration) {
    const min = props.activeFilters.minDuration ? `${Math.round(props.activeFilters.minDuration / 60000)}min` : '0'
    const max = props.activeFilters.maxDuration ? `${Math.round(props.activeFilters.maxDuration / 60000)}min` : '∞'
    parts.push(`Duration: ${min} - ${max}`)
  }
  if (props.activeFilters.tags?.length) {
    parts.push(`Tags: ${props.activeFilters.tags.join(', ')}`)
  }
  if (props.activeFilters.dateRange) {
    parts.push('Date range selected')
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No filters'
}

</script>