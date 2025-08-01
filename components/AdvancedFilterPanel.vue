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

    <!-- Saved Filter Combinations -->
    <div v-if="savedCombinations.length > 0 || showSaveForm" class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium text-muted-foreground">Saved Combinations</label>
        <button
          v-if="!showSaveForm && hasAnyActiveFilters"
          @click="showSaveForm = true"
          class="text-xs text-primary hover:text-primary/80 transition-colors"
          data-testid="show-save-form"
        >
          + Save Current
        </button>
      </div>

      <!-- Save Form -->
      <div v-if="showSaveForm" class="p-3 border rounded bg-accent/5 space-y-2">
        <div class="flex items-center space-x-2">
          <input
            v-model="saveFormName"
            type="text"
            placeholder="Combination name..."
            maxlength="50"
            class="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="save-combination-name"
            @keyup.enter="saveCombination"
            @keyup.escape="cancelSave"
          />
          <button
            @click="saveCombination"
            :disabled="!saveFormName.trim()"
            class="px-3 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            data-testid="save-combination-btn"
          >
            Save
          </button>
          <button
            @click="cancelSave"
            class="px-3 py-1 text-xs rounded border hover:bg-accent transition-colors"
            data-testid="cancel-save-btn"
          >
            Cancel
          </button>
        </div>
        <div class="text-xs text-muted-foreground">
          Current filters: {{ getActiveFiltersDescription() }}
        </div>
      </div>

      <!-- Saved Combinations List -->
      <div v-if="savedCombinations.length > 0" class="space-y-1">
        <div
          v-for="combination in savedCombinations"
          :key="combination.id"
          class="flex items-center justify-between p-2 border rounded hover:bg-accent/5 transition-colors group"
        >
          <div class="flex-1 min-w-0">
            <div class="text-xs font-medium text-foreground truncate">
              {{ combination.name }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ formatCombinationDate(combination.createdAt) }}
            </div>
          </div>
          <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="applySavedFilterCombination(combination.id)"
              class="p-1 text-xs text-primary hover:text-primary/80 transition-colors"
              :data-testid="`apply-combination-${combination.id}`"
              title="Apply filters"
            >
              Apply
            </button>
            <button
              @click="startEditingCombination(combination.id, combination.name)"
              class="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              :data-testid="`edit-combination-${combination.id}`"
              title="Rename"
            >
              ✏️
            </button>
            <button
              @click="deleteCombination(combination.id)"
              class="p-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
              :data-testid="`delete-combination-${combination.id}`"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="editingCombination" class="p-3 border rounded bg-accent/5 space-y-2">
        <div class="flex items-center space-x-2">
          <input
            v-model="editFormName"
            type="text"
            placeholder="New name..."
            maxlength="50"
            class="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="edit-combination-name"
            @keyup.enter="saveEditedCombination"
            @keyup.escape="cancelEdit"
          />
          <button
            @click="saveEditedCombination"
            :disabled="!editFormName.trim()"
            class="px-3 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            data-testid="save-edit-btn"
          >
            Save
          </button>
          <button
            @click="cancelEdit"
            class="px-3 py-1 text-xs rounded border hover:bg-accent transition-colors"
            data-testid="cancel-edit-btn"
          >
            Cancel
          </button>
        </div>
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
import { useActivities } from '~/composables/useActivities'
import type { EnergyLevel, FilterPreset } from '~/composables/useAdvancedFilters'

// Composables
const {
  hasAdvancedFilters,
  advancedFilterCount,
  savedCombinations,
  togglePriorityFilter,
  toggleFocusRatingFilter,
  toggleEnergyLevelFilter,
  setDurationRangeFilter,
  clearDurationRangeFilter,
  clearAllAdvancedFilters,
  getCurrentFilters,
  applyFilterPreset,
  saveCurrentFilterCombination,
  applySavedFilterCombination,
  deleteSavedFilterCombination,
  renameSavedFilterCombination
} = useAdvancedFilters()

const { activeFilters } = useActivities()

// Reactive state
const customMinDuration = ref<number | null>(null)
const customMaxDuration = ref<number | null>(null)

// Filter combination form state
const showSaveForm = ref(false)
const saveFormName = ref('')
const editingCombination = ref<string | null>(null)
const editFormName = ref('')

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

// Filter combination computed properties
const hasAnyActiveFilters = computed(() => {
  return hasAdvancedFilters.value || 
    (activeFilters.value.tags && activeFilters.value.tags.length > 0) ||
    activeFilters.value.dateRange !== undefined
})

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

// Filter combination methods
const getActiveFiltersDescription = () => {
  const parts: string[] = []
  
  if (currentFilters.value.priority?.length) {
    parts.push(`Priority: ${currentFilters.value.priority.join(', ')}`)
  }
  if (currentFilters.value.focusRating?.length) {
    parts.push(`Focus: ${currentFilters.value.focusRating.join(', ')}`)
  }
  if (currentFilters.value.energyLevel?.length) {
    parts.push(`Energy: ${currentFilters.value.energyLevel.join(', ')}`)
  }
  if (currentFilters.value.minDuration || currentFilters.value.maxDuration) {
    const min = currentFilters.value.minDuration ? `${Math.round(currentFilters.value.minDuration / 60000)}min` : '0'
    const max = currentFilters.value.maxDuration ? `${Math.round(currentFilters.value.maxDuration / 60000)}min` : '∞'
    parts.push(`Duration: ${min} - ${max}`)
  }
  if (activeFilters.value.tags?.length) {
    parts.push(`Tags: ${activeFilters.value.tags.join(', ')}`)
  }
  if (activeFilters.value.dateRange) {
    parts.push('Date range selected')
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No filters'
}

const saveCombination = () => {
  if (!saveFormName.value.trim()) return
  
  try {
    saveCurrentFilterCombination(saveFormName.value.trim())
    saveFormName.value = ''
    showSaveForm.value = false
  } catch (error) {
    console.error('Failed to save filter combination:', error)
  }
}

const cancelSave = () => {
  saveFormName.value = ''
  showSaveForm.value = false
}

const startEditingCombination = (id: string, currentName: string) => {
  editingCombination.value = id
  editFormName.value = currentName
}

const saveEditedCombination = () => {
  if (!editFormName.value.trim() || !editingCombination.value) return
  
  try {
    renameSavedFilterCombination(editingCombination.value, editFormName.value.trim())
    cancelEdit()
  } catch (error) {
    console.error('Failed to rename filter combination:', error)
  }
}

const cancelEdit = () => {
  editingCombination.value = null
  editFormName.value = ''
}

const deleteCombination = (id: string) => {
  if (confirm('Are you sure you want to delete this filter combination?')) {
    try {
      deleteSavedFilterCombination(id)
    } catch (error) {
      console.error('Failed to delete filter combination:', error)
    }
  }
}

const formatCombinationDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>