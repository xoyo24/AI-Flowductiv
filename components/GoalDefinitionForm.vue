<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-foreground">
        {{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}
      </h3>
      <Button 
        variant="ghost" 
        size="sm" 
        @click="$emit('close')"
        data-testid="close-goal-form"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Title -->
      <div class="space-y-2">
        <Label for="goal-title">Goal Title</Label>
        <Input
          id="goal-title"
          v-model="form.title"
          type="text"
          placeholder="e.g., Deep work sessions daily"
          maxlength="100"
          required
          data-testid="goal-title-input"
          :class="{ 'border-destructive': errors.title }"
        />
        <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <Label for="goal-description">Description (Optional)</Label>
        <Textarea
          id="goal-description"
          v-model="form.description"
          placeholder="Add more details about this goal..."
          maxlength="500"
          rows="2"
          data-testid="goal-description-input"
        />
      </div>

      <!-- Goal Type & Period Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Goal Type -->
        <div class="space-y-2">
          <Label for="goal-type">Goal Type</Label>
          <Select v-model="form.type" data-testid="goal-type-select">
            <SelectTrigger>
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time-based</SelectItem>
              <SelectItem value="activity_count">Activity Count</SelectItem>
              <SelectItem value="streak">Streak</SelectItem>
              <SelectItem value="focus_rating">Focus Rating</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
        </div>

        <!-- Goal Period -->
        <div class="space-y-2">
          <Label for="goal-period">Period</Label>
          <Select v-model="form.period" data-testid="goal-period-select">
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.period" class="text-sm text-destructive">{{ errors.period }}</p>
        </div>
      </div>

      <!-- Target Value -->
      <div class="space-y-2">
        <Label for="goal-target">Target {{ targetUnitDisplay }}</Label>
        <div class="flex items-center space-x-2">
          <Input
            id="goal-target"
            v-model.number="form.target"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="0"
            required
            data-testid="goal-target-input"
            :class="{ 'border-destructive': errors.target }"
          />
          <span class="text-sm text-muted-foreground min-w-fit">
            {{ targetUnitDisplay }}
          </span>
        </div>
        <p v-if="errors.target" class="text-sm text-destructive">{{ errors.target }}</p>
      </div>

      <!-- Advanced Options (Collapsible) -->
      <div class="space-y-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          @click="showAdvanced = !showAdvanced"
          class="flex items-center space-x-2 text-sm"
          data-testid="toggle-advanced-options"
        >
          <ChevronDown :class="{ 'rotate-180': showAdvanced }" class="h-4 w-4 transition-transform" />
          <span>Advanced Options</span>
        </Button>

        <div v-if="showAdvanced" class="space-y-4 pl-4 border-l-2 border-border">
          <!-- Filter by Tags -->
          <div class="space-y-2">
            <Label>Filter by Tags (Optional)</Label>
            <Input
              v-model="tagInput"
              type="text"
              placeholder="Type tag name and press Enter"
              @keyup.enter="addTag"
              data-testid="goal-tags-input"
            />
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <Badge
                v-for="tag in form.tags"
                :key="tag"
                variant="secondary"
                class="flex items-center space-x-1"
              >
                <span>{{ tag }}</span>
                <X class="h-3 w-3 cursor-pointer" @click="removeTag(tag)" />
              </Badge>
            </div>
          </div>

          <!-- Filter by Priority -->
          <div class="space-y-2">
            <Label for="goal-priority">Filter by Priority (Optional)</Label>
            <Select v-model="form.priority" data-testid="goal-priority-select">
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Any priority</SelectItem>
                <SelectItem :value="1">Priority 1 (Highest)</SelectItem>
                <SelectItem :value="2">Priority 2</SelectItem>
                <SelectItem :value="3">Priority 3</SelectItem>
                <SelectItem :value="4">Priority 4</SelectItem>
                <SelectItem :value="5">Priority 5 (Lowest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Goal Status -->
          <div class="space-y-2">
            <Label for="goal-status">Status</Label>
            <Select v-model="form.status" data-testid="goal-status-select">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          @click="$emit('close')"
          data-testid="cancel-goal-button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
          data-testid="save-goal-button"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ editingGoal ? 'Update Goal' : 'Create Goal' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { X, ChevronDown, Loader2 } from 'lucide-vue-next'
import type { Goal, NewGoal } from '~/server/database/schema'

interface Props {
  editingGoal?: Goal | null
}

interface Emits {
  (e: 'close'): void
  (e: 'goal-saved', goal: Goal): void
}

const props = withDefaults(defineProps<Props>(), {
  editingGoal: null
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
const form = ref<NewGoal & { priority?: number | null, status: string }>({
  title: '',
  description: '',
  type: 'time',
  period: 'daily',
  target: 1,
  targetUnit: '',
  status: 'active',
  tags: [],
  priority: null
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
    priority: null
  }
  errors.value = {}
  showAdvanced.value = false
}

// Initialize form with editing data
watch(() => props.editingGoal, (goal) => {
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
      priority: goal.priority
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Computed properties
const targetUnitDisplay = computed(() => {
  switch (form.value.type) {
    case 'time': return 'hours'
    case 'activity_count': return 'activities'
    case 'streak': return 'days'
    case 'focus_rating': return 'average rating'
    default: return 'units'
  }
})

const isFormValid = computed(() => {
  return form.value.title.trim().length > 0 &&
         form.value.type &&
         form.value.period &&
         form.value.target > 0
})

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
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

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    loading.value = true
    
    // Set target unit based on type
    form.value.targetUnit = targetUnitDisplay.value
    
    // Prepare form data
    const goalData = {
      ...form.value,
      priority: form.value.priority || undefined
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