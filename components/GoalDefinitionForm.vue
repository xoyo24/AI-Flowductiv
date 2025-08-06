<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-foreground">
        {{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}
      </h3>
      <button 
        type="button"
        @click="$emit('close')"
        class="p-1 rounded-md hover:bg-muted transition-colors"
        data-testid="close-goal-form"
        aria-label="Close dialog"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Title -->
      <div class="space-y-2">
        <label for="goal-title" class="block text-sm font-medium">Goal Title</label>
        <input
          id="goal-title"
          v-model="form.title"
          type="text"
          placeholder="e.g., Deep work sessions daily"
          maxlength="100"
          required
          data-testid="goal-title-input"
          class="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          :class="{ 'border-red-500': errors.title }"
        />
        <p v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</p>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label for="goal-description" class="block text-sm font-medium">Description (Optional)</label>
        <textarea
          id="goal-description"
          v-model="form.description"
          placeholder="Add more details about this goal..."
          maxlength="500"
          rows="2"
          data-testid="goal-description-input"
          class="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <!-- Goal Type & Period Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Goal Type -->
        <div class="space-y-2">
          <label for="goal-type" class="block text-sm font-medium">Goal Type</label>
          <select
            id="goal-type"
            v-model="form.type"
            data-testid="goal-type-select"
            class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select goal type</option>
            <option value="time">Time-based</option>
            <option value="activity_count">Activity Count</option>
            <option value="streak">Streak</option>
            <option value="focus_rating">Focus Rating</option>
          </select>
          <p v-if="errors.type" class="text-sm text-red-500">{{ errors.type }}</p>
        </div>

        <!-- Goal Period -->
        <div class="space-y-2">
          <label for="goal-period" class="block text-sm font-medium">Period</label>
          <select
            id="goal-period"
            v-model="form.period"
            data-testid="goal-period-select"
            class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select period</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p v-if="errors.period" class="text-sm text-red-500">{{ errors.period }}</p>
        </div>
      </div>

      <!-- Target Value -->
      <div class="space-y-2">
        <label for="goal-target" class="block text-sm font-medium">Target {{ targetUnitDisplay }}</label>
        <div class="flex items-center space-x-2">
          <input
            id="goal-target"
            v-model.number="form.target"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="0"
            required
            data-testid="goal-target-input"
            class="flex-1 px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="{ 'border-red-500': errors.target }"
          />
          <span class="text-sm text-muted-foreground min-w-fit">
            {{ targetUnitDisplay }}
          </span>
        </div>
        <p v-if="errors.target" class="text-sm text-red-500">{{ errors.target }}</p>
      </div>

      <!-- Advanced Options (Collapsible) -->
      <div class="space-y-3">
        <button
          type="button"
          @click="showAdvanced = !showAdvanced"
          class="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="toggle-advanced-options"
        >
          <ChevronDown :class="{ 'rotate-180': showAdvanced }" class="h-4 w-4 transition-transform" />
          <span>Advanced Options</span>
        </button>

        <div v-if="showAdvanced" class="space-y-4 pl-4 border-l-2 border-border">
          <!-- Filter by Tags -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">Filter by Tags (Optional)</label>
            <input
              v-model="tagInput"
              type="text"
              placeholder="Type tag name and press Enter"
              @keyup.enter="addTag"
              data-testid="goal-tags-input"
              class="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
              >
                <span>{{ tag }}</span>
                <button
                  type="button"
                  @click="removeTag(tag)"
                  class="ml-1 hover:text-destructive"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Filter by Priority -->
          <div class="space-y-2">
            <label for="goal-priority" class="block text-sm font-medium">Filter by Priority (Optional)</label>
            <select
              id="goal-priority"
              v-model="form.priority"
              data-testid="goal-priority-select"
              class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option :value="null">Any priority</option>
              <option :value="1">Priority 1 (Highest)</option>
              <option :value="2">Priority 2</option>
              <option :value="3">Priority 3</option>
              <option :value="4">Priority 4</option>
              <option :value="5">Priority 5 (Lowest)</option>
            </select>
          </div>

          <!-- Goal Status -->
          <div class="space-y-2">
            <label for="goal-status" class="block text-sm font-medium">Status</label>
            <select
              id="goal-status"
              v-model="form.status"
              data-testid="goal-status-select"
              class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-2 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          data-testid="cancel-goal-button"
          class="px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          data-testid="save-goal-button"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {{ editingGoal ? 'Update Goal' : 'Create Goal' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, X } from 'lucide-vue-next'
import type { Goal, NewGoal } from '~/server/database/schema'

interface Props {
  editingGoal?: Goal | null
}

interface Emits {
  (e: 'close'): void
  (e: 'goal-saved', goal: Goal): void
}

const props = withDefaults(defineProps<Props>(), {
  editingGoal: null,
})

const emit = defineEmits<Emits>()

// Composables
const { createGoal, updateGoal } = useGoals()

// Reactive state
const loading = ref(false)
const showAdvanced = ref(false)
const tagInput = ref('')
const errors = ref<Record<string, string>>({})

// Form data
const form = ref<NewGoal & { priority?: number | null; status: string }>({
  title: '',
  description: '',
  type: 'time',
  period: 'daily',
  target: 1,
  targetUnit: '',
  status: 'active',
  tags: [],
  priority: null,
})

// Methods
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    type: 'time',
    period: 'daily',
    target: 1,
    targetUnit: '',
    status: 'active',
    tags: [],
    priority: null,
  }
  errors.value = {}
  showAdvanced.value = false
}

// Initialize form with editing data
watch(
  () => props.editingGoal,
  (goal) => {
    if (goal) {
      form.value = {
        title: goal.title,
        description: goal.description || '',
        type: goal.type as any,
        period: goal.period as any,
        target: goal.target,
        targetUnit: goal.targetUnit || '',
        status: goal.status,
        tags: [...(goal.tags || [])],
        priority: goal.priority,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Computed properties
const targetUnitDisplay = computed(() => {
  switch (form.value.type) {
    case 'time':
      return 'hours'
    case 'activity_count':
      return 'activities'
    case 'streak':
      return 'days'
    case 'focus_rating':
      return 'average rating'
    default:
      return 'units'
  }
})

const _isFormValid = computed(() => {
  return (
    form.value.title.trim().length > 0 &&
    form.value.type &&
    form.value.period &&
    form.value.target > 0
  )
})

const _addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const _removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  } else if (form.value.title.length > 100) {
    errors.value.title = 'Title is too long'
  }

  if (!form.value.type) {
    errors.value.type = 'Goal type is required'
  }

  if (!form.value.period) {
    errors.value.period = 'Period is required'
  }

  if (!form.value.target || form.value.target <= 0) {
    errors.value.target = 'Target must be a positive number'
  }

  return Object.keys(errors.value).length === 0
}

const _handleSubmit = async () => {
  if (!validateForm()) return

  try {
    loading.value = true

    // Set target unit based on type
    form.value.targetUnit = targetUnitDisplay.value

    // Prepare form data
    const goalData = {
      ...form.value,
      priority: form.value.priority || undefined,
    }

    let result: Goal | null = null

    if (props.editingGoal) {
      result = await updateGoal(props.editingGoal.id, goalData)
    } else {
      result = await createGoal(goalData)
    }

    if (result) {
      emit('goal-saved', result)
      emit('close')
      resetForm()
    }
  } catch (error) {
    console.error('Failed to save goal:', error)
  } finally {
    loading.value = false
  }
}
</script>