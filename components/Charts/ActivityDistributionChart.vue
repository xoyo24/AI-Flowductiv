<template>
  <div class="w-full h-64">
    <Doughnut 
      v-if="chartData && chartOptions" 
      :data="chartData" 
      :options="chartOptions" 
    />
    <div v-else class="flex items-center justify-center h-full text-muted-foreground">
      <div class="text-center">
        <Target class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Add tags to see activity distribution</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Target } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { computed } from 'vue'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

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
  maxCategories?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCategories: 6
})

// Predefined color palette for consistent colors
const colorPalette = [
  'rgb(59, 130, 246)',   // blue-500
  'rgb(16, 185, 129)',   // emerald-500
  'rgb(245, 158, 11)',   // amber-500
  'rgb(239, 68, 68)',    // red-500
  'rgb(139, 92, 246)',   // violet-500
  'rgb(236, 72, 153)',   // pink-500
  'rgb(20, 184, 166)',   // teal-500
  'rgb(251, 146, 60)',   // orange-400
  'rgb(132, 204, 22)',   // lime-500
  'rgb(168, 85, 247)',   // purple-500
]

// Computed chart data
const chartData = computed(() => {
  if (!props.activities.length) return null

  // Calculate tag distribution
  const tagMap = new Map<string, number>()
  let totalTime = 0

  props.activities.forEach((activity) => {
    totalTime += activity.durationMs
    if (activity.tags && activity.tags.length > 0) {
      activity.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + activity.durationMs)
      })
    } else {
      // Activities without tags
      tagMap.set('Untagged', (tagMap.get('Untagged') || 0) + activity.durationMs)
    }
  })

  if (tagMap.size === 0) return null

  // Sort by time spent and limit to top categories
  const sortedCategories = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, props.maxCategories)

  // If there are more categories, group the rest as "Other"
  const remainingCategories = Array.from(tagMap.entries())
    .slice(props.maxCategories)
    
  if (remainingCategories.length > 0) {
    const otherTime = remainingCategories.reduce((sum, [_, time]) => sum + time, 0)
    if (otherTime > 0) {
      sortedCategories.push(['Other', otherTime])
    }
  }

  const labels = sortedCategories.map(([tag]) => `#${tag}`)
  const dataValues = sortedCategories.map(([_, time]) => Math.round(time / (1000 * 60))) // Convert to minutes
  const colors = sortedCategories.map((_, index) => colorPalette[index % colorPalette.length])
  const backgroundColors = colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)'))

  return {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: colors,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }
    ]
  }
})

// Chart configuration
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12
        },
        color: '#6b7280'
      }
    },
    title: {
      display: true,
      text: 'Activity Distribution by Tags',
      font: {
        size: 14,
        weight: 'bold' as const
      },
      color: '#6b7280'
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed
          const dataset = context.dataset
          const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value}m (${percentage}%)`
        }
      }
    }
  },
  cutout: '40%', // Makes it a doughnut chart
  elements: {
    arc: {
      borderRadius: 4
    }
  }
}))
</script>