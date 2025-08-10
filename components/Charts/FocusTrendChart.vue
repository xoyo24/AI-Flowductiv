<template>
  <div class="w-full h-64">
    <Line 
      v-if="chartData && chartOptions" 
      :data="chartData" 
      :options="chartOptions" 
    />
    <div v-else class="flex items-center justify-center h-full text-muted-foreground">
      <div class="text-center">
        <Brain class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Rate activities to see focus trends</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Brain } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { computed } from 'vue'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

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
  days?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: 30
})

// Computed chart data
const chartData = computed(() => {
  // Filter activities with focus ratings
  const ratedActivities = props.activities.filter(a => 
    a.focusRating !== null && a.focusRating !== undefined
  )
  
  if (!ratedActivities.length) return null

  // Group by day and calculate daily average
  const today = new Date()
  const days = []
  for (let i = props.days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }

  const dailyFocusData = days.map(date => {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)
    
    const dayActivities = ratedActivities.filter(activity => {
      const activityDate = new Date(activity.startTime)
      return activityDate >= date && activityDate < nextDay
    })
    
    if (dayActivities.length === 0) {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: null
      }
    }
    
    const avgFocus = dayActivities.reduce((sum, activity) => {
      return sum + (activity.focusRating || 0)
    }, 0) / dayActivities.length
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(avgFocus * 10) / 10 // Round to 1 decimal
    }
  })

  // Filter out null values for the chart, but keep the gaps
  const chartLabels = dailyFocusData.map(d => d.date)
  const chartValues = dailyFocusData.map(d => d.value)

  return {
    labels: chartLabels,
    datasets: [
      {
        label: 'Daily Focus Average',
        data: chartValues,
        borderColor: 'rgb(139, 69, 19)', // orange-700
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(139, 69, 19)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true // Connect lines across null values
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
      display: false
    },
    title: {
      display: true,
      text: `Focus Trend (${props.days} days)`,
      font: {
        size: 14,
        weight: 'bold' as const
      },
      color: '#6b7280' // gray-500
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 5,
      title: {
        display: true,
        text: 'Focus Rating (1-5)',
        color: '#9ca3af'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)'
      },
      ticks: {
        color: '#9ca3af',
        stepSize: 1,
        callback: function(value: any) {
          return value + '/5'
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Date',
        color: '#9ca3af'
      },
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af',
        maxTicksLimit: 10
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}))
</script>