<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
      @click="handleClose"
    >
      <!-- Slide-out Panel -->
      <div
        class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border pt-safe overflow-y-auto touch-manipulation"
        @click.stop
      >
        <!-- Panel Header -->
        <div class="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">Analytics</h2>
          <button
            @click="handleClose"
            class="p-2 rounded-lg hover:bg-muted/50 transition-colors touch-target"
            data-testid="close-analytics-panel"
            aria-label="Close analytics panel"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Panel Content -->
        <div class="p-4 space-y-6">
          
          <!-- Quick Stats Card -->
          <div class="content-card p-4 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground">Today's Focus</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center">
                <div class="text-lg font-semibold text-foreground">{{ todayStats.totalTime }}</div>
                <div class="text-xs text-muted-foreground">Total Time</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-foreground">{{ todayStats.activityCount }}</div>
                <div class="text-xs text-muted-foreground">Activities</div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-foreground">{{ todayStats.avgFocus }}/5</div>
              <div class="text-xs text-muted-foreground">Avg Focus</div>
            </div>
          </div>

          <!-- Condensed Heatmap -->
          <div class="content-card p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-muted-foreground">Activity Heatmap</h3>
              <button
                @click="handleModalAction('heatmap')"
                class="text-xs text-primary hover:text-primary/80 transition-colors touch-target"
                data-testid="expand-heatmap-button"
              >
                Expand
              </button>
            </div>
            
            <!-- 4-Week Condensed Grid -->
            <div class="space-y-1">
              <div
                v-for="week in condensedHeatmapWeeks"
                :key="week.week"
                class="flex space-x-1"
              >
                <div
                  v-for="day in week.days"
                  :key="day.date || `empty-${day.index}`"
                  class="touch-target-mini flex-1 aspect-square rounded-sm cursor-pointer transition-all duration-200"
                  :class="[
                    day.date ? getHeatmapDayClass(day) : 'bg-muted/30',
                    day.date && selectedDate === day.date ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  ]"
                  :title="day.date ? getHeatmapDayTooltip(day) : ''"
                  @click="day.date && handleDayClick(day)"
                >
                </div>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div class="flex space-x-1">
                <div class="w-2 h-2 rounded-sm bg-muted/30"></div>
                <div class="w-2 h-2 rounded-sm bg-primary/20"></div>
                <div class="w-2 h-2 rounded-sm bg-primary/40"></div>
                <div class="w-2 h-2 rounded-sm bg-primary/60"></div>
                <div class="w-2 h-2 rounded-sm bg-primary/80"></div>
                <div class="w-2 h-2 rounded-sm bg-primary"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          <!-- Top Tags -->
          <div class="content-card p-4 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground">Top Tags</h3>
            <div class="space-y-2">
              <div
                v-for="tag in topTags"
                :key="tag.name"
                class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 touch-target"
                @click="handleTagSelect(tag.name)"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-foreground">#{{ tag.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ tag.count }}</span>
                </div>
                <div class="text-xs text-muted-foreground">{{ formatDuration(tag.totalTime) }}</div>
              </div>
            </div>
          </div>

          <!-- Goals Progress -->
          <div class="content-card p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-muted-foreground">Goals</h3>
              <button
                @click="handleModalAction('goals')"
                class="text-xs text-primary hover:text-primary/80 transition-colors touch-target"
                data-testid="manage-goals-button"
              >
                Manage
              </button>
            </div>
            
            <div v-if="activeGoals.length === 0" class="text-center py-4">
              <div class="text-sm text-muted-foreground">No active goals</div>
              <button
                @click="handleModalAction('goals')"
                class="text-xs text-primary hover:text-primary/80 transition-colors mt-1 touch-target"
              >
                Create your first goal
              </button>
            </div>
            
            <div v-else class="space-y-2">
              <div
                v-for="goal in activeGoals.slice(0, 3)"
                :key="goal.id"
                class="space-y-1"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-foreground">{{ goal.title }}</span>
                  <span class="text-xs text-muted-foreground">{{ Math.round(goal.progress) }}%</span>
                </div>
                <div class="w-full bg-muted/30 rounded-full h-1.5">
                  <div
                    class="bg-primary rounded-full h-1.5 transition-all duration-300"
                    :style="{ width: `${Math.min(goal.progress, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="content-card p-4 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleModalAction('insights')"
                class="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors touch-target"
                data-testid="ai-insights-button"
              >
                <Lightbulb class="w-5 h-5 mb-1 text-primary" />
                <span class="text-xs font-medium text-foreground">AI Insights</span>
              </button>
              
              <button
                @click="handleRefresh"
                class="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors touch-target"
                data-testid="refresh-analytics-button"
              >
                <RefreshCw class="w-5 h-5 mb-1 text-primary" />
                <span class="text-xs font-medium text-foreground">Refresh</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Lightbulb, RefreshCw, X } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  heatmapData?: Array<{
    date: string
    totalTime: number
    activityCount: number
    avgFocus: number
  }>
  tagData?: Array<{
    name: string
    count: number
    totalTime: number
  }>
  selectedDate?: string | null
  todayStats?: {
    totalTime: string
    activityCount: number
    avgFocus: string
  }
  activeGoals?: Array<{
    id: string
    title: string
    progress: number
  }>
}

interface Emits {
  (e: 'close'): void
  (e: 'day-selected', day: any): void
  (e: 'tag-selected', tag: string): void
  (e: 'show-heatmap-modal'): void
  (e: 'show-goals-modal'): void
  (e: 'show-insights-modal'): void
  (e: 'refresh-data'): void
}

const props = withDefaults(defineProps<Props>(), {
  heatmapData: () => [],
  tagData: () => [],
  selectedDate: null,
  todayStats: () => ({
    totalTime: '0m',
    activityCount: 0,
    avgFocus: '0.0',
  }),
  activeGoals: () => [],
})

const emit = defineEmits<Emits>()

// Haptic feedback utility
const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Format duration helper
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Condensed heatmap for mobile (4 weeks instead of 12)
const _condensedHeatmapWeeks = computed(() => {
  if (!props.heatmapData.length) return []

  // Get last 28 days (4 weeks)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 27) // 28 days including today

  const weeks = []
  let currentWeek = []
  const currentDate = new Date(startDate)

  // Align to start of week (Sunday)
  const dayOfWeek = currentDate.getDay()
  currentDate.setDate(currentDate.getDate() - dayOfWeek)

  for (let i = 0; i < 35; i++) {
    // 5 weeks max to ensure we cover 28 days
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayData = props.heatmapData.find((d) => d.date === dateStr)

    // Only include days within our 28-day range
    const isInRange = currentDate >= startDate && currentDate <= today

    currentWeek.push({
      date: isInRange ? dateStr : null,
      totalTime: dayData?.totalTime || 0,
      activityCount: dayData?.activityCount || 0,
      avgFocus: dayData?.avgFocus || 0,
      index: i,
    })

    if (currentWeek.length === 7) {
      weeks.push({
        week: weeks.length,
        days: [...currentWeek],
      })
      currentWeek = []
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return weeks.slice(0, 4) // Only show 4 weeks
})

// Top 5 tags by usage
const _topTags = computed(() => {
  return [...props.tagData].sort((a, b) => b.totalTime - a.totalTime).slice(0, 5)
})

// Heatmap styling
const _getHeatmapDayClass = (day: any): string => {
  if (!day.totalTime) return 'bg-muted/30'

  // Calculate intensity based on total time (in minutes)
  const minutes = day.totalTime / (1000 * 60)

  if (minutes >= 240) return 'bg-primary' // 4+ hours
  if (minutes >= 180) return 'bg-primary/80' // 3-4 hours
  if (minutes >= 120) return 'bg-primary/60' // 2-3 hours
  if (minutes >= 60) return 'bg-primary/40' // 1-2 hours
  if (minutes >= 30) return 'bg-primary/20' // 30min-1hour

  return 'bg-muted/30'
}

const _getHeatmapDayTooltip = (day: any): string => {
  const date = new Date(day.date).toLocaleDateString()
  const duration = formatDuration(day.totalTime)
  const focus = day.avgFocus ? ` • ${day.avgFocus.toFixed(1)}/5 focus` : ''

  return `${date}: ${duration}${focus}`
}

// Event handlers with enhanced haptic feedback
const _handleDayClick = (day: any) => {
  // Stronger haptic for day selection (more important action)
  vibrate([100, 50, 100])
  emit('day-selected', day)
}

const _handleTagSelect = (tagName: string) => {
  // Light haptic for tag selection
  vibrate([50])
  emit('tag-selected', tagName)
}

const _handleModalAction = (modalType: string) => {
  // Medium haptic for modal opens
  vibrate([75])
  switch (modalType) {
    case 'heatmap':
      emit('show-heatmap-modal')
      break
    case 'goals':
      emit('show-goals-modal')
      break
    case 'insights':
      emit('show-insights-modal')
      break
  }
}

const _handleRefresh = () => {
  // Success pattern for refresh
  vibrate([100, 50, 50])
  emit('refresh-data')
}

const _handleClose = () => {
  // Light haptic for close
  vibrate([30])
  emit('close')
}
</script>

<style scoped>
/* Enhanced touch targets for mobile */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

.touch-target-mini {
  min-height: 24px;
  min-width: 24px;
  touch-action: manipulation;
}

/* iOS Safe Area Support */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}

/* Smooth panel slide animation */
.absolute {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Prevent zoom on iOS input focus */
@supports (-webkit-touch-callout: none) {
  /* iOS specific styles */
  input, button {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>