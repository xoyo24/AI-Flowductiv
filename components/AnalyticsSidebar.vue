<template>
  <div class="flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-4" v-if="!mobileMode">
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
      :class="{
        'flex-1 overflow-y-auto space-y-4': true,
        'px-4 py-3': !mobileMode,
        'px-0 py-0 space-y-6': mobileMode
      }"
    >
      <!-- Mobile header integrated into content -->
      <div v-if="mobileMode" class="flex items-center justify-between mb-6">
        <UserDropdown 
          :collapsed="false"
          @navigate-to-settings="$emit('navigate-to-settings')"
          @navigate-to-history="$emit('navigate-to-history')"
        />
        <button
          @click="$emit('toggle-collapse')"
          class="p-3 rounded-lg hover:bg-muted/50 transition-colors touch-target"
          aria-label="Close menu"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <!-- 🔍 INSIGHT AREA -->
      
      <!-- Productivity Overview (Heatmap) -->
      <ProductivityOverview 
        :collapsed="false"
        :loading="loading"
        :mobile-mode="mobileMode"
        :selected-date-filter="activeDateFilter"
        @day-selected="handleDaySelected"
        @open-goal-management="handleOpenGoalManagement"
        @open-analytics-dialog="handleOpenAnalyticsDialog"
      />

      <!-- Insights -->
      <InsightsPanel 
        ref="insightsPanelRef"
        :compact="!mobileMode" 
        :mobile-mode="mobileMode"
        @open-settings="$emit('open-settings')"
        @view-ai-history="$emit('view-ai-history')"
      />



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
            :initial-goal-type="selectedGoalType"
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
  ChevronLeft,
  X,
} from 'lucide-vue-next'
import DurationSlider from '~/components/DurationSlider.vue'
import FocusFilter from '~/components/FocusFilter.vue'
import GoalDefinitionForm from '~/components/GoalDefinitionForm.vue'
import InsightsPanel from '~/components/InsightsPanel.vue'
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
  activeDateFilter?: string | null | undefined
  mobileMode?: boolean
}

interface Emits {
  (e: 'toggle-collapse'): void
  (e: 'day-selected', date: Date): void
  (e: 'refresh-data'): void
  (e: 'navigate-to-settings'): void
  (e: 'navigate-to-history'): void
  (e: 'open-settings'): void
  (e: 'view-ai-history'): void
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
  selectedTags: () => new Set<string>(),
  mobileMode: false,
})

const emit = defineEmits<Emits>()

// Local state
const showGoalForm = ref(false)
const insightsPanelRef = ref()
const selectedGoalType = ref<'activity_count' | 'time' | 'focus_rating' | null>(null)
const editingGoal = ref<Goal | null>(null)

// Goal management
const { getGoals, calculateGoalProgress } = useGoals()
const activeGoals = ref<Goal[]>([])
const goalProgresses = ref<Record<string, GoalProgress>>({})
const loadingProgresses = ref<Record<string, boolean>>({})

// Actions
const handleDaySelected = (day: any) => {
  emit('day-selected', day)
}

const handleOpenGoalManagement = (goalType: 'activity_count' | 'time' | 'focus_rating') => {
  // Find existing goal for this specific type
  const existingGoal = activeGoals.value.find(goal => goal.type === goalType)
  
  if (existingGoal) {
    // Edit existing goal
    editingGoal.value = existingGoal
  } else {
    // Create new goal with type pre-filled - we'll pass this to the form
    editingGoal.value = null
    // Store the goal type for the form to use
    selectedGoalType.value = goalType
  }
  showGoalForm.value = true
}

const handleOpenAnalyticsDialog = () => {
  // Call the InsightsPanel's openAnalyticsDialog method directly
  if (insightsPanelRef.value?.openAnalyticsDialog) {
    insightsPanelRef.value.openAnalyticsDialog()
  }
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


const handleGoalSaved = (goal: Goal) => {
  if (editingGoal.value) {
    // Update existing goal
    const index = activeGoals.value.findIndex((g) => g.id === goal.id)
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
  selectedGoalType.value = null
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