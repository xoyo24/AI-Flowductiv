<template>
  <div 
    class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    data-testid="advanced-filter-panel"
  >
    <!-- Header -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">Advanced Filters</h3>
        <div class="flex items-center space-x-2">
          <!-- Filter Count Badge -->
          <span 
            v-if="advancedFilterCount > 0"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            data-testid="filter-count-badge"
          >
            {{ advancedFilterCount }} active
          </span>
          
          <!-- Clear All Button -->
          <button
            v-if="hasAdvancedFilters"
            @click="clearAllAdvancedFilters"
            class="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
            data-testid="clear-advanced-filters"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- Filter Presets -->
      <div class="space-y-3">
        <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick Filters</label>
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="preset in filterPresets"
            :key="preset.key"
            @click="applyFilterPreset(preset.key)"
            :class="[
              'p-3 text-left border rounded-lg transition-all duration-200',
              isPresetActive(preset.key) 
                ? 'border-blue-200 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
            :data-testid="`preset-${preset.key}`"
          >
            <div class="flex items-center space-x-3">
              <span class="text-lg">{{ preset.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">{{ preset.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ preset.description }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Priority and Focus Rating Filters -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Priority Filter -->
        <div class="space-y-3">
          <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Priority</label>
          <div class="flex space-x-2">
            <button
              v-for="priority in [1, 2, 3, 4, 5]"
              :key="priority"
              @click="togglePriorityFilter(priority)"
              :class="[
                'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
                currentFilters.priority?.includes(priority)
                  ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              ]"
              :data-testid="`priority-${priority}`"
            >
              {{ priority }}
            </button>
          </div>
        </div>

        <!-- Focus Rating Filter -->
        <div class="space-y-3">
          <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Focus</label>
          <div class="flex space-x-2">
            <button
              v-for="rating in [1, 2, 3, 4, 5]"
              :key="rating"
              @click="toggleFocusRatingFilter(rating)"
              :class="[
                'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
                currentFilters.focusRating?.includes(rating)
                  ? 'bg-green-100 text-green-800 ring-2 ring-green-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              ]"
              :data-testid="`focus-${rating}`"
            >
              {{ rating }}
            </button>
          </div>
        </div>
      </div>

      <!-- Duration Filter -->
      <div class="space-y-3">
        <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Duration</label>
        
        <!-- Quick Duration Buttons -->
        <div class="flex space-x-2">
          <button
            v-for="duration in quickDurations"
            :key="duration.key"
            @click="setDurationRangeFilter(duration.min, duration.max)"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 text-center',
              isDurationRangeActive(duration.min, duration.max)
                ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            ]"
            :data-testid="`duration-${duration.key}`"
          >
            <div class="font-medium">{{ duration.label }}</div>
            <div class="text-xs opacity-75 mt-0.5">{{ duration.description }}</div>
          </button>
        </div>
        
        <!-- Custom Duration Range -->
        <details class="mt-3">
          <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors select-none">
            Custom Range
          </summary>
          <div class="mt-3 space-y-3 pl-0">
            <div class="flex items-center space-x-2">
              <input
                v-model.number="customMinDuration"
                type="number"
                placeholder="Min (minutes)"
                class="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="custom-min-duration"
              />
              <span class="text-xs text-gray-400">to</span>
              <input
                v-model.number="customMaxDuration"
                type="number"
                placeholder="Max (minutes)"
                class="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="custom-max-duration"
              />
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="applyCustomDuration"
                :disabled="!isCustomDurationValid"
                class="px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                data-testid="apply-custom-duration"
              >
                Apply
              </button>
              <button
                v-if="currentFilters.minDuration !== undefined || currentFilters.maxDuration !== undefined"
                @click="clearDurationRangeFilter"
                class="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="clear-duration-filter"
              >
                Clear
              </button>
            </div>
          </div>
        </details>
      </div>

      <!-- Saved Filter Combinations -->
      <div v-if="savedCombinations.length > 0 || showSaveForm" class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Saved Combinations</label>
          <button
            v-if="!showSaveForm && hasAnyActiveFilters"
            @click="showSaveForm = true"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            data-testid="show-save-form"
          >
            + Save Current
          </button>
        </div>

        <!-- Save Form -->
        <div v-if="showSaveForm" class="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
          <div class="flex items-center space-x-2">
            <input
              v-model="saveFormName"
              type="text"
              placeholder="Combination name..."
              maxlength="50"
              class="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="save-combination-name"
              @keyup.enter="saveCombination"
              @keyup.escape="cancelSave"
            />
            <button
              @click="saveCombination"
              :disabled="!saveFormName.trim()"
              class="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              data-testid="save-combination-btn"
            >
              Save
            </button>
            <button
              @click="cancelSave"
              class="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="cancel-save-btn"
            >
              Cancel
            </button>
          </div>
          <div class="text-xs text-gray-500">
            Current filters: {{ getActiveFiltersDescription() }}
          </div>
        </div>

        <!-- Saved Combinations List -->
        <div v-if="savedCombinations.length > 0" class="space-y-1">
          <div
            v-for="combination in savedCombinations"
            :key="combination.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-gray-900 truncate">
                {{ combination.name }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatCombinationDate(combination.createdAt) }}
              </div>
            </div>
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="applySavedFilterCombination(combination.id)"
                class="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                :data-testid="`apply-combination-${combination.id}`"
                title="Apply filters"
              >
                Apply
              </button>
              <button
                @click="startEditingCombination(combination.id, combination.name)"
                class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                :data-testid="`edit-combination-${combination.id}`"
                title="Rename"
              >
                ✏️
              </button>
              <button
                @click="deleteCombination(combination.id)"
                class="px-2 py-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                :data-testid="`delete-combination-${combination.id}`"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-if="editingCombination" class="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
          <div class="flex items-center space-x-2">
            <input
              v-model="editFormName"
              type="text"
              placeholder="New name..."
              maxlength="50"
              class="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="edit-combination-name"
              @keyup.enter="saveEditedCombination"
              @keyup.escape="cancelEdit"
            />
            <button
              @click="saveEditedCombination"
              :disabled="!editFormName.trim()"
              class="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              data-testid="save-edit-btn"
            >
              Save
            </button>
            <button
              @click="cancelEdit"
              class="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="cancel-edit-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useActivities } from '~/composables/useActivities'
import type { FilterPreset } from '~/composables/useAdvancedFilters'

// Composables
const {
  hasAdvancedFilters,
  advancedFilterCount,
  savedCombinations,
  togglePriorityFilter,
  toggleFocusRatingFilter,
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
    name: 'High Performance',
    icon: '🚀',
    description: 'Focus 4-5 stars, 30+ minutes'
  },
  {
    key: 'deep-work' as FilterPreset,
    name: 'Deep Work',
    icon: '🧠',
    description: 'Focus 5 stars, 60+ minutes'
  },
  {
    key: 'quick-tasks' as FilterPreset,
    name: 'Quick Tasks',
    icon: '⚡',
    description: 'Priority 1-2, under 15 minutes'
  }
]

const quickDurations = [
  {
    key: 'short',
    label: 'Short',
    description: '≤15m',
    min: undefined,
    max: 900000 // 15 minutes
  },
  {
    key: 'medium',
    label: 'Medium',
    description: '15m-1h',
    min: 900000, // 15 minutes
    max: 3600000 // 60 minutes
  },
  {
    key: 'long',
    label: 'Long',
    description: '≥1h',
    min: 3600000, // 60 minutes
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

const isPresetActive = (presetKey: FilterPreset) => {
  const current = currentFilters.value
  
  switch (presetKey) {
    case 'high-performance':
      return current.focusRating?.includes(4) && current.focusRating?.includes(5) && 
             current.minDuration === 1800000
    case 'deep-work':
      return current.focusRating?.includes(5) && current.minDuration === 3600000
    case 'quick-tasks':
      return current.priority?.includes(1) && current.priority?.includes(2) && 
             current.maxDuration === 900000
    default:
      return false
  }
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