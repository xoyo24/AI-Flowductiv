<template>
  <div class="space-y-3">
    <!-- Loading State -->
    <div 
      v-if="loading" 
      class="text-center py-8 text-muted-foreground text-xs"
    >
      <div class="mb-2">Loading productivity data...</div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-3">
      <!-- Key Metrics Row -->
      <div v-if="!collapsed" :class="{
        'grid grid-cols-3 gap-2 text-center': true,
        'text-xs': !mobileMode,
        'text-base': mobileMode
      }">
        <div>
          <div :class="{
            'font-bold text-foreground': true,
            'text-sm': !mobileMode,
            'text-2xl': mobileMode
          }">{{ metrics.activityCount }}</div>
          <div :class="{
            'text-muted-foreground': true,
            'text-xs': !mobileMode,
            'text-sm': mobileMode
          }">Activities</div>
        </div>
        <div>
          <div :class="{
            'font-bold text-foreground': true,
            'text-sm': !mobileMode,
            'text-2xl': mobileMode
          }">{{ formatDuration(metrics.totalTime) }}</div>
          <div :class="{
            'text-muted-foreground': true,
            'text-xs': !mobileMode,
            'text-sm': mobileMode
          }">Total Time</div>
        </div>
        <div>
          <div :class="{
            'font-bold text-foreground': true,
            'text-sm': !mobileMode,
            'text-2xl': mobileMode
          }">{{ metrics.averageFocus.toFixed(1) }}</div>
          <div :class="{
            'text-muted-foreground': true,
            'text-xs': !mobileMode,
            'text-sm': mobileMode
          }">Avg Focus</div>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="space-y-2">
        <!-- Main Grid: Consistent layout -->
        <div 
          class="grid grid-cols-12 gap-1"
          data-testid="productivity-heatmap-grid"
        >
          <div
            v-for="(day, index) in gridDays"
            :key="`${day.date}-${index}`"
            :data-testid="`heatmap-day-${day.date}`"
            :data-date="day.date"
            :class="[
              'cursor-pointer transition-all duration-200',
              'hover:scale-110 hover:shadow-sm',
              mobileMode ? 'w-5 h-5 rounded' : 'w-5 h-5 rounded-sm',
              // Selected state - keep square but add subtle highlight
              selectedDate === day.date ? 'ring-1 ring-primary/60 ring-offset-1 scale-105 shadow-md' : '',
              getColorClass(day.productivityScore)
            ]"
            :title="day.date ? `${formatDate(day.date)}: ${day.count} activities, ${formatDuration(day.totalTime)}` : ''"
            @click="handleDayClick(day)"
            @mouseenter="showTooltip($event, day)"
            @mouseleave="hideTooltip"
          />
        </div>

        <!-- Legend -->
        <div v-if="!collapsed" class="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Less</span>
          <div class="flex items-center space-x-1">
            <div
              v-for="(color, index) in legendColors"
              :key="index"
              :class="`w-3 h-3 rounded-sm ${color}`"
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      data-testid="productivity-tooltip"
      :style="{ 
        position: 'fixed', 
        left: tooltip.x + 'px', 
        top: tooltip.y + 'px',
        zIndex: 50,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      }"
      class="bg-popover text-popover-foreground border border-border rounded-md shadow-md px-3 py-2 text-sm pointer-events-none"
    >
      <div class="font-medium">{{ formatDate(tooltip.day.date) }}</div>
      <div>{{ tooltip.day.count }} {{ tooltip.day.count === 1 ? 'activity' : 'activities' }}</div>
      <div>{{ formatDuration(tooltip.day.totalTime) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeatmapDay } from '~/composables/useActivities'

interface Props {
  collapsed?: boolean
  loading?: boolean
  selectedDateFilter?: string | null
  mobileMode?: boolean
}

interface ActivityMetrics {
  totalTime: number
  activityCount: number
  averageFocus: number
  streakDays: number
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  loading: false,
  selectedDateFilter: null,
  mobileMode: false,
})

// Define emits
type Emits = (e: 'day-selected', day: HeatmapDay) => void
const emit = defineEmits<Emits>()

// Composable
const { getHeatmapData, formatDuration, getActivities } = useActivities()

// Reactive state
const heatmapData = ref<HeatmapDay[]>([])
const metrics = ref<ActivityMetrics>({
  totalTime: 0,
  activityCount: 0,
  averageFocus: 0,
  streakDays: 0,
})

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  day: {} as HeatmapDay,
})

// Track selected date for visual feedback
const selectedDate = ref<string | null>(null)

// Sync selected date with prop (when filter is cleared externally)
watch(
  () => props.selectedDateFilter,
  (newValue) => {
    selectedDate.value = newValue
  },
  { immediate: true }
)

// Computed properties
const _gridDays = computed(() => {
  // Return exactly 84 days (12 weeks)
  if (!heatmapData.value || heatmapData.value.length === 0) {
    // Return empty days for initial state
    return Array(84)
      .fill(null)
      .map(() => ({
        date: '',
        count: 0,
        totalTime: 0,
        productivityScore: 0,
      }))
  }

  const days = [...heatmapData.value]

  // Ensure exactly 84 days
  while (days.length < 84) {
    days.push({
      date: '',
      count: 0,
      totalTime: 0,
      productivityScore: 0,
    })
  }

  return days.slice(0, 84) // Exactly 84 days (12 weeks)
})

// Get current color mode for theme-aware colors
const colorMode = useColorMode()

const _legendColors = computed(() => {
  if (colorMode.value === 'dark') {
    return ['bg-gray-700', 'bg-green-800', 'bg-green-600', 'bg-green-500', 'bg-green-400']
  }
  return ['bg-gray-200', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500']
})

// Methods
const _getColorClass = (score: number): string => {
  if (colorMode.value === 'dark') {
    // Dark theme colors
    if (score === 0) return 'bg-gray-700' // Dark gray for empty days
    if (score <= 0.25) return 'bg-green-800' // Darkest green
    if (score <= 0.5) return 'bg-green-600' // Dark green
    if (score <= 0.8) return 'bg-green-500' // Medium green
    return 'bg-green-400' // Brightest green for high productivity
  }
  // Light theme colors
  if (score === 0) return 'bg-gray-200' // Light gray for empty days
  if (score <= 0.25) return 'bg-green-200' // Lightest green
  if (score <= 0.5) return 'bg-green-300' // Light green
  if (score <= 0.8) return 'bg-green-400' // Medium green
  return 'bg-green-500' // Darkest green for high productivity
}

const _formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const _handleDayClick = (day: HeatmapDay) => {
  if (day.date) {
    selectedDate.value = day.date
    emit('day-selected', day)
  }
}

const _showTooltip = (event: MouseEvent, day: HeatmapDay) => {
  if (!day.date) return

  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    day,
  }
}

const _hideTooltip = () => {
  tooltip.value.visible = false
}

const calculateMetrics = async (): Promise<ActivityMetrics> => {
  try {
    // Get all activities for calculations
    const allActivities = await getActivities(1, 1000)

    // Calculate metrics for last 12 weeks
    const twelveWeeksAgo = new Date()
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)

    const recentActivities = allActivities.filter(
      (activity) => new Date(activity.endTime) >= twelveWeeksAgo
    )

    const totalTime = recentActivities.reduce((sum, a) => sum + a.durationMs, 0)
    const activityCount = recentActivities.length

    const activitiesWithFocus = recentActivities.filter((a) => a.focusRating !== null)
    const averageFocus =
      activitiesWithFocus.length > 0
        ? activitiesWithFocus.reduce((sum, a) => sum + (a.focusRating || 0), 0) /
          activitiesWithFocus.length
        : 0

    // Simple streak calculation (consecutive days with activities)
    let streakDays = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)

      const nextDay = new Date(checkDate)
      nextDay.setDate(checkDate.getDate() + 1)

      const hasActivity = allActivities.some((activity) => {
        const activityDate = new Date(activity.endTime)
        return activityDate >= checkDate && activityDate < nextDay
      })

      if (hasActivity) {
        streakDays++
      } else if (i > 0) {
        // Allow today to be empty but still count streak from yesterday
        break
      }
    }

    return {
      totalTime,
      activityCount,
      averageFocus,
      streakDays,
    }
  } catch (error) {
    console.error('Failed to calculate metrics:', error)
    return {
      totalTime: 0,
      activityCount: 0,
      averageFocus: 0,
      streakDays: 0,
    }
  }
}

// Load data on mount
onMounted(async () => {
  try {
    // Load both heatmap data and metrics
    const [heatmapResult, metricsResult] = await Promise.all([getHeatmapData(), calculateMetrics()])

    heatmapData.value = heatmapResult
    metrics.value = metricsResult
  } catch (error) {
    console.error('Failed to load productivity overview data:', error)
  }
})

// Refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', async () => {
    const [heatmapResult, metricsResult] = await Promise.all([getHeatmapData(), calculateMetrics()])

    heatmapData.value = heatmapResult
    metrics.value = metricsResult
  })
}
</script>