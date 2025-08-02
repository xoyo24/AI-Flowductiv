<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Clock class="w-4 h-4 text-muted-foreground" />
        <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</label>
      </div>
      <div class="flex space-x-1">
      <button
        v-for="duration in quickDurations"
        :key="duration.key"
        @click="setDurationRange(duration.min, duration.max)"
        :class="[
          'px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 text-center flex-1',
          isDurationRangeActive(duration.min, duration.max)
            ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
        ]"
        :data-testid="`duration-${duration.key}`"
      >
        <div class="font-medium">{{ duration.label }}</div>
      </button>
      </div>
    </div>
    
    <!-- Custom Duration Range -->
    <details class="mt-3" :open="showCustomRange">
      <summary 
        @click="showCustomRange = !showCustomRange"
        class="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none list-none"
      >
        <span class="inline-flex items-center">
          <svg 
            :class="[
              'w-3 h-3 mr-1 transition-transform',
              showCustomRange ? 'rotate-90' : ''
            ]"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Custom Range
        </span>
      </summary>
      <div class="mt-3 space-y-3 pl-0">
        <div class="flex items-center space-x-2">
          <input
            v-model.number="customMinDuration"
            type="number"
            placeholder="Min"
            min="0"
            class="flex-1 px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            data-testid="custom-min-duration"
          />
          <span class="text-xs text-muted-foreground">to</span>
          <input
            v-model.number="customMaxDuration"
            type="number"
            placeholder="Max"
            min="0"
            class="flex-1 px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            data-testid="custom-max-duration"
          />
          <span class="text-xs text-muted-foreground">min</span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="applyCustomDuration"
            :disabled="!isCustomDurationValid"
            class="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            data-testid="apply-custom-duration"
          >
            Apply
          </button>
          <button
            v-if="currentFilters.minDuration !== undefined || currentFilters.maxDuration !== undefined"
            @click="clearDuration"
            class="px-2 py-1 text-xs font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
            data-testid="clear-duration-filter"
          >
            Clear
          </button>
        </div>
      </div>
    </details>

    <!-- Active Duration Display -->
    <div v-if="hasActiveDuration" class="text-xs text-muted-foreground">
      Current: {{ formatActiveDuration() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useActivities } from '~/composables/useActivities'

interface Emits {
  (e: 'duration-changed', minDuration?: number, maxDuration?: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { setDurationRangeFilter, clearDurationRangeFilter } = useAdvancedFilters()
const { activeFilters } = useActivities()

// Reactive state
const customMinDuration = ref<number | null>(null)
const customMaxDuration = ref<number | null>(null)
const showCustomRange = ref(false)

// Current filter state
const currentFilters = computed(() => activeFilters.value)

// Configuration data
const quickDurations = [
  {
    key: 'short',
    label: '≤15m',
    min: undefined,
    max: 900000 // 15 minutes
  },
  {
    key: 'medium',
    label: '15m-1h',
    min: 900000, // 15 minutes
    max: 3600000 // 60 minutes
  },
  {
    key: 'long',
    label: '≥1h',
    min: 3600000, // 60 minutes
    max: undefined
  }
]

// Computed properties
const isCustomDurationValid = computed(() => {
  if (customMinDuration.value === null && customMaxDuration.value === null) {
    return false
  }
  if (customMinDuration.value !== null && customMinDuration.value < 0) {
    return false
  }
  if (customMaxDuration.value !== null && customMaxDuration.value < 0) {
    return false
  }
  if (
    customMinDuration.value !== null && 
    customMaxDuration.value !== null && 
    customMinDuration.value > customMaxDuration.value
  ) {
    return false
  }
  return true
})

const hasActiveDuration = computed(() => {
  return currentFilters.value.minDuration !== undefined || currentFilters.value.maxDuration !== undefined
})

// Methods
const isDurationRangeActive = (min?: number, max?: number) => {
  return (
    currentFilters.value.minDuration === min &&
    currentFilters.value.maxDuration === max
  )
}

const setDurationRange = (min?: number, max?: number) => {
  // Check if this range is already active - if so, clear it
  const isCurrentlyActive = isDurationRangeActive(min, max)
  
  if (isCurrentlyActive) {
    // Clear the filter
    setDurationRangeFilter(undefined, undefined)
  } else {
    // Set the new filter
    setDurationRangeFilter(min, max)
  }
  // Note: No need to emit since we handle it directly
}

const applyCustomDuration = () => {
  if (!isCustomDurationValid.value) return
  
  const minMs = customMinDuration.value !== null ? customMinDuration.value * 60 * 1000 : undefined
  const maxMs = customMaxDuration.value !== null ? customMaxDuration.value * 60 * 1000 : undefined
  
  setDurationRangeFilter(minMs, maxMs)
  emit('duration-changed', minMs, maxMs)
  
  // Clear inputs after applying
  customMinDuration.value = null
  customMaxDuration.value = null
  showCustomRange.value = false
}

const clearDuration = () => {
  clearDurationRangeFilter()
  emit('duration-changed', undefined, undefined)
}

const formatActiveDuration = () => {
  const { minDuration, maxDuration } = currentFilters.value
  
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
</script>