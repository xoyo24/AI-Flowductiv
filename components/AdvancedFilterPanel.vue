<template>
  <div 
    class="space-y-4 p-4 border rounded-lg bg-card"
    data-testid="advanced-filter-panel"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-foreground">Advanced Filters</h3>
      <div class="flex items-center space-x-2">
        <!-- Filter Count Badge -->
        <span 
          v-if="advancedFilterCount > 0"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
          data-testid="filter-count-badge"
        >
          {{ advancedFilterCount }}
        </span>
        
        <!-- Clear All Button -->
        <button
          v-if="hasAdvancedFilters"
          @click="clearAllAdvancedFilters"
          class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="clear-advanced-filters"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Filter Presets -->
    <div class="space-y-2">
      <label class="text-xs font-medium text-muted-foreground">Quick Filters</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="preset in filterPresets"
          :key="preset.key"
          @click="applyFilterPreset(preset.key)"
          class="p-2 text-left text-xs border rounded hover:bg-accent transition-colors"
          :data-testid="`preset-${preset.key}`"
        >
          <div class="font-medium">{{ preset.name }}</div>
          <div class="text-muted-foreground text-xs">{{ preset.description }}</div>
        </button>
      </div>
    </div>

    <!-- Priority Filter -->
    <div class="space-y-2">
      <label class="text-xs font-medium text-muted-foreground">Priority Level</label>
      <div class="flex space-x-1">
        <button
          v-for="priority in [1, 2, 3, 4, 5]"
          :key="priority"
          @click="togglePriorityFilter(priority)"
          :class="[
            'px-3 py-1.5 text-xs rounded border transition-colors',
            currentFilters.priority?.includes(priority)
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
              : 'border-border hover:bg-accent'
          ]"
          :data-testid="`priority-${priority}`"
        >
          ⭐ {{ priority }}
        </button>
      </div>
    </div>

    <!-- Focus Rating Filter -->
    <div class="space-y-2">
      <label class="text-xs font-medium text-muted-foreground">Focus Rating</label>
      <div class="flex space-x-1">
        <button
          v-for="rating in [1, 2, 3, 4, 5]"
          :key="rating"
          @click="toggleFocusRatingFilter(rating)"
          :class="[
            'px-3 py-1.5 text-xs rounded border transition-colors',
            currentFilters.focusRating?.includes(rating)
              ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
              : 'border-border hover:bg-accent'
          ]"
          :data-testid="`focus-${rating}`"
        >
          🎯 {{ rating }}
        </button>
      </div>
    </div>

    <!-- Energy Level Filter -->
    <div class="space-y-2">
      <label class="text-xs font-medium text-muted-foreground">Energy Level</label>
      <div class="flex space-x-1">
        <button
          v-for="level in energyLevels"
          :key="level.value"
          @click="toggleEnergyLevelFilter(level.value)"
          :class="[
            'px-3 py-1.5 text-xs rounded border transition-colors flex items-center space-x-1',
            currentFilters.energyLevel?.includes(level.value)
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'border-border hover:bg-accent'
          ]"
          :data-testid="`energy-${level.value}`"
        >
          <span>{{ level.icon }}</span>
          <span>{{ level.label }}</span>
        </button>
      </div>
    </div>

    <!-- Duration Range Filter -->
    <div class="space-y-2">
      <label class="text-xs font-medium text-muted-foreground">Duration Range</label>
      <div class="space-y-3">
        <!-- Quick Duration Buttons -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="duration in quickDurations"
            :key="duration.key"
            @click="setDurationRangeFilter(duration.min, duration.max)"
            :class="[
              'p-2 text-xs rounded border transition-colors',
              isDurationRangeActive(duration.min, duration.max)
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                : 'border-border hover:bg-accent'
            ]"
            :data-testid="`duration-${duration.key}`"
          >
            <div class="font-medium">{{ duration.label }}</div>
            <div class="text-muted-foreground text-xs">{{ duration.description }}</div>
          </button>
        </div>

        <!-- Custom Duration Inputs -->
        <div class="flex items-center space-x-2 pt-2 border-t">
          <div class="flex-1">
            <label class="text-xs text-muted-foreground">Min (minutes)</label>
            <input
              v-model.number="customMinDuration"
              type="number"
              min="0"
              step="5"
              placeholder="0"
              class="w-full mt-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="custom-min-duration"
            />
          </div>
          <div class="flex-1">
            <label class="text-xs text-muted-foreground">Max (minutes)</label>
            <input
              v-model.number="customMaxDuration"
              type="number"
              min="0"
              step="5"
              placeholder="∞"
              class="w-full mt-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="custom-max-duration"
            />
          </div>
          <button
            @click="applyCustomDuration"
            :disabled="!isCustomDurationValid"
            class="px-3 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            data-testid="apply-custom-duration"
          >
            Apply
          </button>
        </div>

        <!-- Clear Duration Filter -->
        <button
          v-if="currentFilters.minDuration !== undefined || currentFilters.maxDuration !== undefined"
          @click="clearDurationRangeFilter"
          class="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="clear-duration-filter"
        >
          Clear Duration Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import type { EnergyLevel, FilterPreset } from '~/composables/useAdvancedFilters'

// Composables
const {
  hasAdvancedFilters,
  advancedFilterCount,
  togglePriorityFilter,
  toggleFocusRatingFilter,
  toggleEnergyLevelFilter,
  setDurationRangeFilter,
  clearDurationRangeFilter,
  clearAllAdvancedFilters,
  getCurrentFilters,
  applyFilterPreset
} = useAdvancedFilters()

// Reactive state
const customMinDuration = ref<number | null>(null)
const customMaxDuration = ref<number | null>(null)

// Current filter state
const currentFilters = computed(() => getCurrentFilters())

// Configuration data
const filterPresets = [
  {
    key: 'high-performance' as FilterPreset,
    name: '🚀 High Performance',
    description: 'Focus 4-5, High energy, 30+ min'
  },
  {
    key: 'deep-work' as FilterPreset,
    name: '🧠 Deep Work',
    description: 'Focus 5, 60+ min sessions'
  },
  {
    key: 'quick-tasks' as FilterPreset,
    name: '⚡ Quick Tasks',
    description: 'Priority 1-2, Under 15 min'
  },
  {
    key: 'low-energy' as FilterPreset,
    name: '🔋 Low Energy',
    description: 'Low energy, Under 30 min'
  }
]

const energyLevels = [
  { value: 'low' as EnergyLevel, label: 'Low', icon: '🔋' },
  { value: 'medium' as EnergyLevel, label: 'Medium', icon: '⚡' },
  { value: 'high' as EnergyLevel, label: 'High', icon: '🚀' }
]

const quickDurations = [
  {
    key: 'short',
    label: 'Short',
    description: '≤ 15 min',
    min: undefined,
    max: 900000 // 15 minutes
  },
  {
    key: 'medium',
    label: 'Medium',
    description: '15-60 min',
    min: 900000, // 15 minutes
    max: 3600000 // 60 minutes
  },
  {
    key: 'long',
    label: 'Long',
    description: '≥ 60 min',
    min: 3600000, // 60 minutes
    max: undefined
  },
  {
    key: 'focused',
    label: 'Focused',
    description: '30-120 min',
    min: 1800000, // 30 minutes
    max: 7200000 // 120 minutes
  },
  {
    key: 'micro',
    label: 'Micro',
    description: '≤ 5 min',
    min: undefined,
    max: 300000 // 5 minutes
  },
  {
    key: 'extended',
    label: 'Extended',
    description: '≥ 2 hours',
    min: 7200000, // 2 hours
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

// Methods
const isDurationRangeActive = (min?: number, max?: number) => {
  return (
    currentFilters.value.minDuration === min &&
    currentFilters.value.maxDuration === max
  )
}

const applyCustomDuration = () => {
  if (!isCustomDurationValid.value) return
  
  const minMs = customMinDuration.value !== null ? customMinDuration.value * 60 * 1000 : undefined
  const maxMs = customMaxDuration.value !== null ? customMaxDuration.value * 60 * 1000 : undefined
  
  setDurationRangeFilter(minMs, maxMs)
  
  // Clear inputs after applying
  customMinDuration.value = null
  customMaxDuration.value = null
}
</script>