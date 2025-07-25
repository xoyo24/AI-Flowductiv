<template>
  <div class="bg-card rounded-lg border border-border p-4">
    <h2 data-testid="heatmap-title" class="text-base font-semibold text-foreground mb-4">
      Last 30 Days
    </h2>

    <!-- Loading State -->
    <div 
      v-if="loading" 
      data-testid="heatmap-loading"
      class="text-center py-8 text-muted-foreground"
    >
      <div class="mb-2">Loading productivity data...</div>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="heatmapData.length === 0" 
      data-testid="heatmap-empty-state"
      class="text-center py-8 text-muted-foreground"
    >
      <div class="mb-2">No activity data yet</div>
      <div class="text-sm">Your productivity heatmap will appear as you track activities</div>
    </div>

    <!-- Heatmap Grid -->
    <div v-else class="space-y-3">
      <!-- Main Grid: 6 rows x 5 columns for 30 days -->
      <div 
        data-testid="heatmap-grid" 
        class="grid grid-cols-5 gap-1 md:gap-2"
      >
        <div
          v-for="(day, index) in gridDays"
          :key="`${day.date}-${index}`"
          :data-testid="`heatmap-day-${day.date}`"
          :data-date="day.date"
          :class="[
            'w-4 h-4 md:w-5 md:h-5 rounded-sm cursor-pointer transition-all duration-200',
            'hover:ring-1 hover:ring-primary hover:ring-offset-1',
            day.count === 0 
              ? 'bg-secondary opacity-20' 
              : 'bg-primary',
            getIntensityClass(day.productivityScore)
          ]"
          :title="`${formatDate(day.date)}: ${day.count} activities, ${formatDuration(day.totalTime)}`"
          @click="handleDayClick(day)"
          @mouseenter="showTooltip($event, day)"
          @mouseleave="hideTooltip"
        />
      </div>

      <!-- Legend -->
      <div data-testid="heatmap-legend" class="flex items-center justify-between text-xs text-muted-foreground mt-3">
        <span>Less</span>
        <div class="flex items-center space-x-1">
          <div
            v-for="(intensity, index) in legendIntensities"
            :key="index"
            :data-testid="`legend-intensity-${index}`"
            :class="`w-3 h-3 rounded-sm bg-primary ${intensity}`"
          />
        </div>
        <span>More</span>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      data-testid="heatmap-tooltip"
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

// Define emits
interface Emits {
  (e: 'day-selected', day: HeatmapDay): void
}

const emit = defineEmits<Emits>()

// Composable
const { getHeatmapData, formatDuration, loading } = useActivities()

// Reactive state
const heatmapData = ref<HeatmapDay[]>([])
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  day: {} as HeatmapDay
})

// Computed properties
const gridDays = computed(() => {
  // Return exactly 30 days
  if (!heatmapData.value || heatmapData.value.length === 0) {
    // Return empty days for initial state
    return Array(30).fill(null).map(() => ({
      date: '',
      count: 0,
      totalTime: 0,
      productivityScore: 0
    }))
  }
  
  const days = [...heatmapData.value]
  
  // Ensure exactly 30 days
  while (days.length < 30) {
    days.push({
      date: '',
      count: 0,
      totalTime: 0,
      productivityScore: 0
    })
  }
  
  return days.slice(0, 30) // Exactly 30 days
})

const legendIntensities = ['opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100']

// Methods
const getIntensityClass = (score: number): string => {
  if (score === 0) return 'opacity-0'
  if (score <= 0.25) return 'opacity-30'
  if (score <= 0.5) return 'opacity-60'
  if (score <= 0.8) return 'opacity-80'  // Changed to include 0.8 
  return 'opacity-100'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const handleDayClick = (day: HeatmapDay) => {
  if (day.date) {
    emit('day-selected', day)
  }
}

const showTooltip = (event: MouseEvent, day: HeatmapDay) => {
  if (!day.date) return
  
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    day
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

// Load data on mount
onMounted(async () => {
  heatmapData.value = await getHeatmapData()
})
</script>