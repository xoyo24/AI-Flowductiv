<template>
  <div class="w-full h-64">
    <Line 
      v-if="chartData && chartOptions" 
      :data="chartData" 
      :options="chartOptions" 
    />
    <div v-else class="flex items-center justify-center h-full text-muted-foreground">
      <div class="text-center">
        <BarChart3 class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Loading activity trends...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { BarChart3 } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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
  Legend,
  TimeScale
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
  if (!props.activities.length) return null

  // Generate last N days
  const days = []
  const today = new Date()
  for (let i = props.days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }

  // Calculate daily totals
  const dailyData = days.map(date => {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)
    
    const dayActivities = props.activities.filter(activity => {
      const activityDate = new Date(activity.startTime)
      return activityDate >= date && activityDate < nextDay
    })
    
    const totalMinutes = dayActivities.reduce((sum, activity) => {
      return sum + (activity.durationMs / (1000 * 60))
    }, 0)
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(totalMinutes)
    }
  })

  return {
    labels: dailyData.map(d => d.date),
    datasets: [
      {
        label: 'Daily Activity (minutes)',
        data: dailyData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
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
      text: `Daily Activity Trend (${props.days} days)`,
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
      title: {
        display: true,
        text: 'Minutes',
        color: '#9ca3af'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)'
      },
      ticks: {
        color: '#9ca3af'
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