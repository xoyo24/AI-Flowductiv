<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Favorites</label>
      <button
        v-if="!showSaveForm && hasAnyActiveFilters"
        @click="showSaveForm = true"
        class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        data-testid="show-save-form"
      >
        + Save
      </button>
    </div>

    <!-- Save Form -->
    <div v-if="showSaveForm" class="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
      <div class="flex items-center space-x-2">
        <input
          v-model="saveFormName"
          type="text"
          placeholder="Filter name..."
          maxlength="50"
          class="flex-1 px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
          data-testid="save-combination-name"
          @keyup.enter="saveCombination"
          @keyup.escape="cancelSave"
        />
        <button
          @click="saveCombination"
          :disabled="!saveFormName.trim()"
          class="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          data-testid="save-combination-btn"
        >
          Save
        </button>
        <button
          @click="cancelSave"
          class="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
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
        class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors group"
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
            class="px-2 py-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            :data-testid="`apply-combination-${combination.id}`"
            title="Apply filters"
          >
            Apply
          </button>
          <button
            @click="startEditingCombination(combination.id, combination.name)"
            class="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            :data-testid="`edit-combination-${combination.id}`"
            title="Rename"
          >
            ✏️
          </button>
          <button
            @click="deleteCombination(combination.id)"
            class="px-2 py-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
            :data-testid="`delete-combination-${combination.id}`"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="editingCombination" class="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
      <div class="flex items-center space-x-2">
        <input
          v-model="editFormName"
          type="text"
          placeholder="New name..."
          maxlength="50"
          class="flex-1 px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
          data-testid="edit-combination-name"
          @keyup.enter="saveEditedCombination"
          @keyup.escape="cancelEdit"
        />
        <button
          @click="saveEditedCombination"
          :disabled="!editFormName.trim()"
          class="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          data-testid="save-edit-btn"
        >
          Save
        </button>
        <button
          @click="cancelEdit"
          class="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
          data-testid="cancel-edit-btn"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="savedCombinations.length === 0 && !showSaveForm" class="text-xs text-muted-foreground text-center py-2">
      No saved filters yet
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useActivities } from '~/composables/useActivities'

interface Emits {
  (e: 'apply-combination', combinationId: string): void
}

const emit = defineEmits<Emits>()

// Composables
const {
  savedCombinations,
  saveCurrentFilterCombination,
  applySavedFilterCombination,
  deleteSavedFilterCombination,
  renameSavedFilterCombination,
  getCurrentFilters
} = useAdvancedFilters()

const { activeFilters } = useActivities()

// Filter combination form state
const showSaveForm = ref(false)
const saveFormName = ref('')
const editingCombination = ref<string | null>(null)
const editFormName = ref('')

// Filter combination computed properties
const hasAnyActiveFilters = computed(() => {
  const current = getCurrentFilters()
  return (
    (current.priority && current.priority.length > 0) ||
    (current.focusRating && current.focusRating.length > 0) ||
    current.minDuration !== undefined ||
    current.maxDuration !== undefined ||
    (activeFilters.value.tags && activeFilters.value.tags.length > 0) ||
    activeFilters.value.dateRange !== undefined
  )
})

// Methods
const getActiveFiltersDescription = () => {
  const current = getCurrentFilters()
  const parts: string[] = []
  
  if (current.priority?.length) {
    parts.push(`Priority: ${current.priority.join(', ')}`)
  }
  if (current.focusRating?.length) {
    parts.push(`Focus: ${current.focusRating.join(', ')}`)
  }
  if (current.minDuration || current.maxDuration) {
    const min = current.minDuration ? `${Math.round(current.minDuration / 60000)}min` : '0'
    const max = current.maxDuration ? `${Math.round(current.maxDuration / 60000)}min` : '∞'
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