<template>
  <div class="flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-4">
      <div class="flex-1">
        <UserDropdown 
          :collapsed="collapsed"
          @navigate-to-settings="$emit('navigate-to-settings')"
          @navigate-to-history="$emit('navigate-to-history')"
        />
      </div>
      <button
        @click="$emit('toggle-collapse')"
        class="p-2 rounded-lg hover:bg-muted/50 transition-colors ml-2"
        :aria-label="collapsed ? 'Expand analytics sidebar' : 'Collapse analytics sidebar'"
      >
        <ChevronLeft 
          :class="{
            'w-4 h-4 transition-transform duration-200': true,
            'rotate-180': collapsed
          }" 
        />
      </button>
    </div>

    <!-- Analytics Content -->
    <div 
      v-if="!collapsed" 
      class="flex-1 overflow-y-auto px-4 py-3 space-y-4"
    >
      <!-- 🔍 INSIGHT AREA -->
      
      <!-- Productivity Overview (Heatmap) -->
      <ProductivityOverview 
        :collapsed="false"
        :loading="loading"
        :selected-date-filter="activeDateFilter"
        @day-selected="handleDaySelected" 
      />

      <!-- Patterns (Collapsible) -->
      <div class="space-y-2">
        <button
          @click="showPatterns = !showPatterns"
          class="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>Patterns</span>
          <ChevronDown 
            :class="{
              'w-3 h-3 transition-transform duration-200': true,
              'rotate-180': showPatterns
            }"
          />
        </button>
        
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showPatterns" class="space-y-2">
            <PatternInsights :compact="true" />
          </div>
        </Transition>
      </div>

      <!-- Goals (Collapsible) -->
      <div class="space-y-2">
        <button
          @click="showGoals = !showGoals"
          class="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>Goals</span>
          <div class="flex items-center space-x-1">
            <button
              @click.stop="showGoalForm = true"
              class="p-0.5 rounded hover:bg-muted/50 transition-colors"
              title="Add new goal"
            >
              <Plus class="w-3 h-3" />
            </button>
            <ChevronDown 
              :class="{
                'w-3 h-3 transition-transform duration-200': true,
                'rotate-180': showGoals
              }"
            />
          </div>
        </button>
        
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showGoals" class="space-y-3">
            <!-- Active Goals -->
            <div v-if="activeGoals.length > 0" class="space-y-2">
              <GoalProgressCard
                v-for="goal in activeGoals"
                :key="goal.id"
                :goal="goal"
                :progress="goalProgresses[goal.id]"
                :loading="loadingProgresses[goal.id]"
                @edit-goal="handleEditGoal"
                @delete-goal="handleDeleteGoal"
                @toggle-status="handleToggleGoalStatus"
                @mark-complete="handleMarkComplete"
                @view-details="handleViewGoalDetails"
              />
            </div>
            
            <!-- Empty State -->
            <div v-else class="text-center py-4">
              <Target class="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p class="text-sm text-muted-foreground mb-2">No active goals</p>
              <button
                @click="showGoalForm = true"
                class="inline-flex items-center px-3 py-1.5 text-xs border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Plus class="w-3 h-3 mr-1" />
                Create Goal
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- AI Insights (Collapsible) -->
      <div class="space-y-2">
        <button
          @click="showInsights = !showInsights"
          class="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>AI Insights</span>
          <ChevronDown 
            :class="{
              'w-3 h-3 transition-transform duration-200': true,
              'rotate-180': showInsights
            }"
          />
        </button>
        
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showInsights" class="space-y-2">
            <DailySummary :compact="true" />
          </div>
        </Transition>
      </div>

      <!-- ⚙️ FILTER AREA -->
      
      <!-- Filters (Always visible) -->
      <div class="space-y-3">
        <!-- Favorites - Saved Filter Combinations -->
        <SavedFilterCombinations 
          @apply-combination="handleApplyCombination"
        />

        <!-- Priority Filter -->
        <PriorityFilter 
          @priority-toggle="handlePriorityToggle"
        />

        <!-- Focus Filter -->
        <FocusFilter 
          @focus-toggle="handleFocusToggle"
        />

        <!-- Duration Filter -->
        <DurationSlider 
          @duration-changed="handleDurationChanged"
        />

        <!-- Tags Filter -->
        <TagFilters
          v-if="props.tagData.length > 0 || props.tagsLoading"
          :top-tags="props.tagData"
          :selected-tags="props.selectedTags"
          :loading="props.tagsLoading"
          title="Tags"
          :max-display="10"
          @tag-selected="handleTagSelected"
          @tag-deselected="handleTagDeselected"
          @tags-cleared="handleTagsCleared"
          @selection-changed="handleTagSelectionChanged"
          @tag-edit="handleTagEdit"
          @tag-remove="handleTagRemove"
        />
      </div>
    </div>

    <!-- Collapsed State - Icons Only -->
    <div v-else class="flex-1 p-2 space-y-3">
      <button
        @click="$emit('show-analytics-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View analytics"
      >
        <BarChart3 class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
      
      <button
        @click="$emit('show-heatmap-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View activity heatmap"
      >
        <Calendar class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
      
      <button
        @click="$emit('show-insights-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View AI insights"
      >
        <Brain class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
    </div>

    <!-- Goal Definition Form Modal -->
    <div v-if="showGoalForm" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="handleCloseGoalForm"
      />
      
      <!-- Dialog -->
      <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <GoalDefinitionForm
            :editing-goal="editingGoal"
            @goal-saved="handleGoalSaved"
            @close="handleCloseGoalForm"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  BarChart3,
  Brain,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  Plus,
  RotateCw,
  Settings,
  Target,
} from 'lucide-vue-next'
import DailySummary from '~/components/DailySummary.vue'
import DurationSlider from '~/components/DurationSlider.vue'
import FocusFilter from '~/components/FocusFilter.vue'
import GoalDefinitionForm from '~/components/GoalDefinitionForm.vue'
import GoalProgressCard from '~/components/GoalProgressCard.vue'
import PatternInsights from '~/components/PatternInsights.vue'
import PriorityFilter from '~/components/PriorityFilter.vue'
import ProductivityOverview from '~/components/ProductivityOverview.vue'
import SavedFilterCombinations from '~/components/SavedFilterCombinations.vue'
import TagFilters from '~/components/TagFilters.vue'
import UserDropdown from '~/components/UserDropdown.vue'
import type { Goal } from '~/server/database/schema'
import type { GoalProgress } from '~/types/goal'

interface TagData {
  name: string
  count: number
  totalTime: number
  isFavorite: boolean
}

interface Props {
  collapsed?: boolean
  loading?: boolean
  tagsLoading?: boolean
  tagData?: TagData[]
  selectedTags?: Set<string>
  activeDateFilter?: string | null
}

interface Emits {
  (e: 'toggle-collapse'): void
  (e: 'day-selected', date: Date): void
  (e: 'refresh-data'): void
  (e: 'navigate-to-settings'): void
  (e: 'navigate-to-history'): void
  (e: 'show-analytics-modal'): void
  (e: 'show-heatmap-modal'): void
  (e: 'show-insights-modal'): void
  (e: 'tag-selected', tag: string): void
  (e: 'tag-deselected', tag: string): void
  (e: 'tags-cleared'): void
  (e: 'selection-changed', selectedTags: Set<string>): void
  (e: 'tag-edit', tag: TagData): void
  (e: 'tag-remove', tag: TagData, includeActivities: boolean): void
  (e: 'apply-filter-combination', combinationId: string): void
  (e: 'priority-toggle', priority: number): void
  (e: 'focus-toggle', focus: number): void
  (e: 'duration-changed', minDuration?: number, maxDuration?: number): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  loading: false,
  tagsLoading: false,
  tagData: () => [],
  selectedTags: () => new Set<string>()
})

const emit = defineEmits<Emits>()

// Local state
const showPatterns = ref(false)
const showGoals = ref(true) // Show goals by default
const showInsights = ref(false) // Collapsed by default to save space
const showGoalForm = ref(false)
const editingGoal = ref<Goal | null>(null)

// Goal management
const { getGoals, updateGoal, deleteGoal, calculateGoalProgress } = useGoals()
const activeGoals = ref<Goal[]>([])
const goalProgresses = ref<Record<string, GoalProgress>>({})
const loadingProgresses = ref<Record<string, boolean>>({})

// Actions
const handleDaySelected = (day: any) => {
  emit('day-selected', day)
}

const refreshData = () => {
  emit('refresh-data')
}

// Tag filter event handlers - forward to parent
const handleTagSelected = (tag: string) => {
  emit('tag-selected', tag)
}

const handleTagDeselected = (tag: string) => {
  emit('tag-deselected', tag)
}

const handleTagsCleared = () => {
  emit('tags-cleared')
}

const handleTagSelectionChanged = (selectedTags: Set<string>) => {
  emit('selection-changed', selectedTags)
}


const handleTagEdit = (tag: TagData) => {
  emit('tag-edit', tag)
}

const handleTagRemove = (tag: TagData, includeActivities: boolean) => {
  emit('tag-remove', tag, includeActivities)
}

// Filter event handlers
const handleApplyCombination = (combinationId: string) => {
  // This will be handled by the useAdvancedFilters composable
  // We'll emit an event that the parent can handle
  emit('apply-filter-combination', combinationId)
}

const handlePriorityToggle = (priority: number) => {
  emit('priority-toggle', priority)
}

const handleFocusToggle = (focus: number) => {
  emit('focus-toggle', focus)
}

const handleDurationChanged = (minDuration?: number, maxDuration?: number) => {
  emit('duration-changed', minDuration, maxDuration)
}

// Goal management methods
const loadActiveGoals = async () => {
  try {
    const goals = await getGoals({ status: 'active' })
    activeGoals.value = goals
    
    // Load progress for each goal
    for (const goal of goals) {
      loadGoalProgress(goal)
    }
  } catch (error) {
    console.error('Failed to load active goals:', error)
  }
}

const loadGoalProgress = async (goal: Goal) => {
  try {
    loadingProgresses.value[goal.id] = true
    const progress = await calculateGoalProgress(goal)
    goalProgresses.value[goal.id] = progress
  } catch (error) {
    console.error(`Failed to load progress for goal ${goal.id}:`, error)
  } finally {
    loadingProgresses.value[goal.id] = false
  }
}

const handleEditGoal = (goal: Goal) => {
  editingGoal.value = goal
  showGoalForm.value = true
}

const handleDeleteGoal = async (goalId: string) => {
  try {
    const success = await deleteGoal(goalId)
    if (success) {
      activeGoals.value = activeGoals.value.filter(g => g.id !== goalId)
      delete goalProgresses.value[goalId]
      delete loadingProgresses.value[goalId]
    }
  } catch (error) {
    console.error('Failed to delete goal:', error)
  }
}

const handleToggleGoalStatus = async (goalId: string, newStatus: string) => {
  try {
    const goal = activeGoals.value.find(g => g.id === goalId)
    if (!goal) return
    
    const updated = await updateGoal(goalId, { status: newStatus as any })
    if (updated) {
      if (newStatus !== 'active') {
        // Remove from active goals if no longer active
        activeGoals.value = activeGoals.value.filter(g => g.id !== goalId)
        delete goalProgresses.value[goalId]
        delete loadingProgresses.value[goalId]
      }
    }
  } catch (error) {
    console.error('Failed to toggle goal status:', error)
  }
}

const handleMarkComplete = async (goalId: string) => {
  try {
    const updated = await updateGoal(goalId, { status: 'completed' })
    if (updated) {
      activeGoals.value = activeGoals.value.filter(g => g.id !== goalId)
      delete goalProgresses.value[goalId]
      delete loadingProgresses.value[goalId]
    }
  } catch (error) {
    console.error('Failed to mark goal complete:', error)
  }
}

const handleViewGoalDetails = (goal: Goal) => {
  // TODO: Implement goal details modal
  console.log('View goal details:', goal)
}

const handleGoalSaved = (goal: Goal) => {
  if (editingGoal.value) {
    // Update existing goal
    const index = activeGoals.value.findIndex(g => g.id === goal.id)
    if (index !== -1) {
      activeGoals.value[index] = goal
      loadGoalProgress(goal)
    }
    editingGoal.value = null
  } else {
    // Add new goal
    activeGoals.value.unshift(goal)
    loadGoalProgress(goal)
  }
  showGoalForm.value = false
}

const handleCloseGoalForm = () => {
  showGoalForm.value = false
  editingGoal.value = null
}

// Load goals on mount
onMounted(() => {
  loadActiveGoals()
})

// Listen for goal events from other components
if (typeof window !== 'undefined') {
  window.addEventListener('goal-created', () => {
    loadActiveGoals()
  })
  
  window.addEventListener('goal-updated', () => {
    loadActiveGoals()
  })
  
  window.addEventListener('activity-saved', () => {
    // Refresh goal progress when activities change
    for (const goal of activeGoals.value) {
      loadGoalProgress(goal)
    }
  })
}
</script>