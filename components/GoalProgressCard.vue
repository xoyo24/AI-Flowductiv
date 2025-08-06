<template>
  <div class="bg-card border border-border rounded-lg p-4 space-y-3">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-foreground truncate" :title="goal.title">
          {{ goal.title }}
        </h4>
        <p v-if="goal.description" class="text-sm text-muted-foreground mt-1 line-clamp-2">
          {{ goal.description }}
        </p>
      </div>
      
      <!-- Goal Status Badge -->
      <span 
        :class="statusBadgeClass" 
        class="ml-2 px-2 py-1 text-xs font-medium rounded-md"
        data-testid="goal-status-badge"
      >
        {{ goal.status }}
      </span>
    </div>

    <!-- Goal Details -->
    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span class="flex items-center space-x-1">
        <Calendar class="h-3 w-3" />
        <span>{{ periodDisplay }}</span>
      </span>
      <span class="flex items-center space-x-1">
        <Target class="h-3 w-3" />
        <span>{{ typeDisplay }}</span>
      </span>
    </div>

    <!-- Progress Section -->
    <div class="space-y-2" v-if="progress">
      <!-- Progress Bar -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Progress</span>
          <span class="font-medium text-foreground">
            {{ progress.progressPercentage.toFixed(0) }}%
          </span>
        </div>
        <div class="w-full bg-muted rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-300"
            :class="progressBarColor"
            :style="{ width: `${Math.min(progress.progressPercentage, 100)}%` }"
            data-testid="goal-progress-bar"
          />
        </div>
      </div>

      <!-- Current vs Target -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">
          {{ formatValue(progress.currentValue) }} / {{ formatValue(progress.targetValue) }}
          {{ goal.targetUnit }}
        </span>
        
        <!-- Completion Status -->
        <div class="flex items-center space-x-1">
          <div 
            :class="progress.isCompleted ? 'bg-green-500' : 'bg-muted'" 
            class="w-2 h-2 rounded-full"
          />
          <span :class="progress.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'">
            {{ progress.isCompleted ? 'Complete' : 'In Progress' }}
          </span>
        </div>
      </div>

      <!-- Time Remaining -->
      <div v-if="!progress.isCompleted && timeRemaining" class="text-xs text-muted-foreground">
        {{ timeRemaining }} remaining
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-2">
      <div class="animate-pulse">
        <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div class="h-2 bg-muted rounded w-full mb-1"></div>
        <div class="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <div class="flex items-center space-x-2">
        <!-- Quick Status Toggle -->
        <button
          v-if="goal.status === 'active'"
          @click="$emit('toggle-status', goal.id, 'paused')"
          data-testid="pause-goal-button"
          class="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Pause goal"
        >
          <Pause class="h-3 w-3" />
        </button>
        <button
          v-else-if="goal.status === 'paused'"
          @click="$emit('toggle-status', goal.id, 'active')"
          data-testid="resume-goal-button"
          class="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Resume goal"
        >
          <Play class="h-3 w-3" />
        </button>
        
        <!-- Mark Complete -->
        <button
          v-if="!progress?.isCompleted && goal.status === 'active'"
          @click="$emit('mark-complete', goal.id)"
          data-testid="complete-goal-button"
          class="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Mark as complete"
        >
          <CheckCircle class="h-3 w-3" />
        </button>
      </div>

      <!-- More Actions -->
      <div class="relative">
        <button
          @click="showDropdown = !showDropdown"
          data-testid="goal-actions-menu"
          class="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          title="More actions"
        >
          <MoreHorizontal class="h-3 w-3" />
        </button>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showDropdown"
          class="absolute right-0 top-8 w-40 bg-popover border border-border rounded-md shadow-lg z-50"
          @click="showDropdown = false"
        >
          <div class="py-1">
            <button
              @click="$emit('edit-goal', goal)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center"
            >
              <Edit class="mr-2 h-3 w-3" />
              Edit Goal
            </button>
            <button
              @click="$emit('view-details', goal)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center"
            >
              <Eye class="mr-2 h-3 w-3" />
              View Details
            </button>
            <hr class="my-1 border-border" />
            <button
              @click="$emit('delete-goal', goal.id)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center text-red-600 hover:text-red-700"
            >
              <Trash2 class="mr-2 h-3 w-3" />
              Delete Goal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Celebration Animation -->
    <div 
      v-if="progress?.isCompleted && showCelebration" 
      class="absolute inset-0 bg-green-500/10 rounded-lg flex items-center justify-center animate-pulse"
      data-testid="goal-celebration"
    >
      <div class="text-green-600 dark:text-green-400 font-medium text-sm">
        🎉 Goal Completed!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Target,
  Trash2,
} from 'lucide-vue-next'
import type { Goal } from '~/server/database/schema'
import type { GoalProgress } from '~/types/goal'

interface Props {
  goal: Goal
  progress?: GoalProgress | null
  loading?: boolean
  showCelebration?: boolean
}

interface Emits {
  (e: 'edit-goal', goal: Goal): void
  (e: 'delete-goal', goalId: string): void
  (e: 'view-details', goal: Goal): void
  (e: 'toggle-status', goalId: string, newStatus: string): void
  (e: 'mark-complete', goalId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  progress: null,
  loading: false,
  showCelebration: false,
})

const emit = defineEmits<Emits>()

// Local state
const showDropdown = ref(false)

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (_event: Event) => {
    if (showDropdown.value) {
      showDropdown.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Computed properties
const statusBadgeClass = computed(() => {
  switch (props.goal.status) {
    case 'active':
      return 'bg-primary text-primary-foreground'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'paused':
      return 'bg-secondary text-secondary-foreground'
    case 'archived':
      return 'bg-muted text-muted-foreground border border-border'
    default:
      return 'bg-primary text-primary-foreground'
  }
})

const periodDisplay = computed(() => {
  const period = props.goal.period.charAt(0).toUpperCase() + props.goal.period.slice(1)
  return period
})

const typeDisplay = computed(() => {
  switch (props.goal.type) {
    case 'time':
      return 'Time-based'
    case 'activity_count':
      return 'Activity Count'
    case 'streak':
      return 'Streak'
    case 'focus_rating':
      return 'Focus Rating'
    default:
      return props.goal.type
  }
})

const progressBarColor = computed(() => {
  if (!props.progress) return 'bg-primary'

  if (props.progress.isCompleted) {
    return 'bg-green-500'
  }
  if (props.progress.progressPercentage >= 80) {
    return 'bg-yellow-500'
  }
  if (props.progress.progressPercentage >= 50) {
    return 'bg-blue-500'
  }
  return 'bg-primary'
})

const timeRemaining = computed(() => {
  if (!props.progress) return null

  const now = new Date()
  const endTime = new Date(props.progress.periodEnd)
  const diffMs = endTime.getTime() - now.getTime()

  if (diffMs <= 0) return 'Period ended'

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return 'Less than 1 hour'
})

// Methods
const formatValue = (value: number): string => {
  if (props.goal.type === 'time') {
    return value.toFixed(1)
  }
  if (props.goal.type === 'focus_rating') {
    return value.toFixed(1)
  }
  return Math.round(value).toString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>