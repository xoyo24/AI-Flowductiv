<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <div class="flex items-center space-x-3">
          <BarChart3 class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">Analytics & Insights</h2>
        </div>
        <button
          @click="closeDialog"
          class="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-6 pt-4">
        <nav class="flex space-x-1 border-b border-border">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Today Stats -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Clock class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Today</span>
              </div>
              <div class="text-2xl font-bold">{{ todayTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ todayStats.activitiesCount }} activities
                <span v-if="todayStats.avgFocus > 0">
                  • {{ todayStats.avgFocus.toFixed(1) }}/5 focus
                </span>
              </div>
            </div>

            <!-- This Week -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">This Week</span>
              </div>
              <div class="text-2xl font-bold">{{ weekTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ weekStats.activitiesCount }} activities
              </div>
            </div>

            <!-- Total Tracked -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Target class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Total Tracked</span>
              </div>
              <div class="text-2xl font-bold">{{ totalTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ totalStats.activitiesCount }} activities
              </div>
            </div>
          </div>

          <!-- Quick Insights -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Quick Insights</h3>
            
            <!-- Peak Hours -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <TrendingUp class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Peak Performance Hours</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ peakHoursText }}
              </div>
            </div>

            <!-- Focus Pattern -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Brain class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Focus Patterns</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ focusPatternText }}
              </div>
            </div>

            <!-- Top Categories -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Tag class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Top Categories</span>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="category in topCategories.slice(0, 3)" 
                  :key="category.name"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-muted-foreground">#{{ category.name }}</span>
                  <span class="font-medium">{{ category.percentage }}%</span>
                </div>
                <div v-if="topCategories.length === 0" class="text-sm text-muted-foreground">
                  Add tags to see category breakdown
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Insights Tab -->
        <div v-else-if="activeTab === 'ai-insights'" class="space-y-6">
          <div class="text-center py-8">
            <Brain class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p class="text-muted-foreground mb-6 max-w-md mx-auto">
              Get personalized productivity coaching and smart recommendations based on your activity patterns.
            </p>
            
            <!-- AI Status -->
            <div v-if="hasAIInsights" class="space-y-4">
              <!-- Existing AI insights will be displayed here -->
              <div class="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div class="text-sm text-primary">
                  AI insights are available! More detailed analysis coming soon.
                </div>
              </div>
            </div>
            
            <!-- Enable AI Button -->
            <div v-else class="space-y-4">
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="text-sm text-muted-foreground">
                  Enable AI insights to get personalized productivity coaching and recommendations.
                </div>
              </div>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Enable AI Insights (Premium)
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-4">Analytics Settings</h3>
            
            <div class="space-y-4">
              <!-- Data Range -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Calendar class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Data Range</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Analytics are calculated from your last 100 activities or 30 days, whichever is more recent.
                </div>
              </div>

              <!-- AI Provider Settings -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Settings class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm font-medium">AI Provider</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Current provider: {{ aiProvider || 'Not configured' }}
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  Advanced AI settings and usage tracking coming soon.
                </div>
              </div>

              <!-- Export Options -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Download class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Export Data</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Export your productivity data and insights.
                </div>
                <button class="mt-2 px-3 py-1 text-xs bg-muted text-muted-foreground rounded border hover:bg-muted/80 transition-colors">
                  Export (Coming Soon)
                </button>
              </div>
            </div>
          </div>
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
  Clock, 
  Download, 
  Settings, 
  Tag, 
  Target, 
  TrendingUp,
  X 
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useActivities } from '~/composables/useActivities'
import { useInsights } from '~/composables/useInsights'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getActivities } = useActivities()
const { hasInsights: hasAIInsights } = useInsights()

// State
const activeTab = ref('overview')
const loading = ref(false)

// Stats
const todayStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const weekStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const totalStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const peakHours = ref<string[]>([])
const focusPattern = ref<string>('')
const topCategories = ref<Array<{ name: string; percentage: number; totalTime: number }>>([])

// Tab configuration
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings }
]

// Computed
const todayTimeFormatted = computed(() => formatTime(todayStats.value.totalTime))
const weekTimeFormatted = computed(() => formatTime(weekStats.value.totalTime))
const totalTimeFormatted = computed(() => formatTime(totalStats.value.totalTime))

const peakHoursText = computed(() => {
  if (peakHours.value.length === 0) {
    return 'Track more activities to identify your peak performance hours'
  }
  return `Most productive during: ${peakHours.value.join(', ')}`
})

const focusPatternText = computed(() => {
  return focusPattern.value || 'Rate your sessions to see focus patterns'
})

const aiProvider = computed(() => {
  return 'Claude' // TODO: Get from AI settings
})

// Methods
const closeDialog = () => {
  emit('close')
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const loadAnalytics = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const activities = await getActivities(1, 100)
    
    if (activities.length === 0) {
      loading.value = false
      return
    }

    // Calculate date ranges
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    // Filter activities by time periods
    const todayActivities = activities.filter(a => new Date(a.startTime) >= startOfToday)
    const weekActivities = activities.filter(a => new Date(a.startTime) >= startOfWeek)

    // Calculate stats for each period
    const calculateStats = (acts: typeof activities) => {
      const totalTime = acts.reduce((sum, a) => sum + a.durationMs, 0)
      const ratedActivities = acts.filter(a => a.focusRating !== null)
      const avgFocus = ratedActivities.length > 0 
        ? ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
        : 0
      
      return { totalTime, activitiesCount: acts.length, avgFocus }
    }

    todayStats.value = calculateStats(todayActivities)
    weekStats.value = calculateStats(weekActivities)
    totalStats.value = calculateStats(activities)

    // Calculate peak hours
    const hourMap = new Map<number, number>()
    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + activity.durationMs)
    })

    const sortedHours = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        if (hour < 12) return `${hour} AM`
        return `${hour - 12} PM`
      })

    peakHours.value = sortedHours

    // Calculate focus pattern
    const ratedActivities = activities.filter((a) => a.focusRating !== null)
    if (ratedActivities.length >= 3) {
      const averageFocus = ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
      const recentAvg = ratedActivities.slice(0, 10).reduce((sum, a) => sum + (a.focusRating || 0), 0) / Math.min(10, ratedActivities.length)

      if (recentAvg > averageFocus + 0.5) {
        focusPattern.value = 'Focus improving recently ↗'
      } else if (recentAvg < averageFocus - 0.5) {
        focusPattern.value = 'Focus declining lately ↘'
      } else {
        focusPattern.value = `Steady ${averageFocus.toFixed(1)}/5 focus avg`
      }
    } else {
      focusPattern.value = 'Rate your sessions to see focus patterns'
    }

    // Calculate top categories
    const tagMap = new Map<string, number>()
    let totalTime = 0

    activities.forEach((activity) => {
      totalTime += activity.durationMs
      activity.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + activity.durationMs)
      })
    })

    if (totalTime > 0) {
      const categories = Array.from(tagMap.entries())
        .map(([name, time]) => ({
          name,
          totalTime: time,
          percentage: Math.round((time / totalTime) * 100),
        }))
        .sort((a, b) => b.totalTime - a.totalTime)

      topCategories.value = categories
    } else {
      topCategories.value = []
    }

  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

// Load data when dialog opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadAnalytics()
  }
})

// Handle escape key to close dialog
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeDialog()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>