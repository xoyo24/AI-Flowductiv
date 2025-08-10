<template>
  <div class="w-full">
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-500 mb-2">Peak Performance Hours</h4>
    </div>
    
    <div v-if="hourlyData.length > 0" class="space-y-3">
      <!-- Hours Grid -->
      <div class="grid grid-cols-8 gap-2 text-xs">
        <div 
          v-for="hour in hours" 
          :key="hour.value"
          class="flex flex-col items-center space-y-1"
        >
          <div class="text-gray-500 font-medium">{{ hour.label }}</div>
          <div 
            class="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium transition-all hover:scale-105"
            :class="getIntensityClass(hour.intensity)"
            :title="`${hour.label}: ${hour.minutes}m (${hour.activities} activities)`"
          >
            {{ hour.minutes }}
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>Less</span>
        <div class="flex space-x-1">
          <div class="w-3 h-3 rounded bg-gray-100 border"></div>
          <div class="w-3 h-3 rounded bg-blue-200"></div>
          <div class="w-3 h-3 rounded bg-blue-400"></div>
          <div class="w-3 h-3 rounded bg-blue-600"></div>
          <div class="w-3 h-3 rounded bg-blue-800"></div>
        </div>
        <span>More</span>
      </div>
      
      <!-- Top Hours Summary -->
      <div class="mt-4 p-3 bg-secondary/20 rounded-lg">
        <div class="text-sm font-medium mb-2">Most Productive Hours</div>
        <div class="space-y-1">
          <div 
            v-for="(hour, index) in topHours.slice(0, 3)" 
            :key="hour.value"
            class="flex justify-between text-sm"
          >
            <span class="text-muted-foreground">{{ index + 1 }}. {{ hour.label }}</span>
            <span class="font-medium">{{ hour.minutes }}m ({{ hour.activities }} activities)</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="flex items-center justify-center h-32 text-muted-foreground">
      <div class="text-center">
        <Clock class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Track more activities to see peak hours</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { computed } from 'vue'

interface Activity {
  id: string
  title: string
  durationMs: number
  startTime: string
  endTime: string
  tags?: string[]
  priority?: number
  focusRating?: number
}

interface Props {
  activities: Activity[]
}

const props = defineProps<Props>()

// Generate all 24 hours
const allHours = Array.from({ length: 24 }, (_, i) => i)

// Compute hourly activity data
const hourlyData = computed(() => {
  const hourMap = new Map<number, { minutes: number; activities: number }>()
  
  // Initialize all hours with 0
  allHours.forEach(hour => {
    hourMap.set(hour, { minutes: 0, activities: 0 })
  })
  
  // Calculate activity data per hour
  props.activities.forEach(activity => {
    const startHour = new Date(activity.startTime).getHours()
    const minutes = Math.round(activity.durationMs / (1000 * 60))
    const current = hourMap.get(startHour) || { minutes: 0, activities: 0 }
    
    hourMap.set(startHour, {
      minutes: current.minutes + minutes,
      activities: current.activities + 1
    })
  })
  
  return Array.from(hourMap.entries())
})

// Calculate intensity levels (0-4)
const maxMinutes = computed(() => {
  return Math.max(...hourlyData.value.map(([_, data]) => data.minutes), 1)
})

// Generate hours with intensity and labels
const hours = computed(() => {
  return hourlyData.value.map(([hour, data]) => {
    const intensity = Math.ceil((data.minutes / maxMinutes.value) * 4)
    
    let label = ''
    if (hour === 0) label = '12A'
    else if (hour === 12) label = '12P'
    else if (hour < 12) label = `${hour}A`
    else label = `${hour - 12}P`
    
    return {
      value: hour,
      label,
      minutes: data.minutes,
      activities: data.activities,
      intensity: data.minutes > 0 ? intensity : 0
    }
  })
})

// Top productive hours
const topHours = computed(() => {
  return hours.value
    .filter(hour => hour.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
})

// Get CSS class for intensity level
const getIntensityClass = (intensity: number): string => {
  switch (intensity) {
    case 0: return 'bg-gray-100 text-gray-400 border border-gray-200'
    case 1: return 'bg-blue-200 text-blue-800'
    case 2: return 'bg-blue-400 text-white'
    case 3: return 'bg-blue-600 text-white'
    case 4: return 'bg-blue-800 text-white'
    default: return 'bg-gray-100 text-gray-400 border border-gray-200'
  }
}
</script>