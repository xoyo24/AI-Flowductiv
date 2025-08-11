<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col
                md:max-h-[85vh] sm:mx-2 sm:max-w-[calc(100vw-1rem)]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-border">
        <div class="flex items-center space-x-3">
          <BarChart3 class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">Analytics & Insights</h2>
        </div>
        <button
          @click="closeDialog"
          class="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-4 sm:px-6 pt-4">
        <nav class="flex space-x-1 border-b border-border overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <!-- Analytics & Trends Tab -->
        <div v-if="activeTab === 'analytics'" class="space-y-4 sm:space-y-6">
          <!-- Quick Stats Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

          <!-- Charts Section -->
          <div class="space-y-6">
            <!-- Activity Trends -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Daily Activity Chart -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <DailyActivityChart :activities="allActivities" :days="30" />
              </div>

              <!-- Focus Trend Chart -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <FocusTrendChart :activities="allActivities" :days="30" />
              </div>
            </div>

            <!-- Activity Distribution -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <ActivityDistributionChart :activities="allActivities" />
            </div>
          </div>

          <!-- Smart Insights Summary -->
          <div v-if="getRecommendations.length > 0" class="bg-secondary/20 rounded-lg p-4">
            <h3 class="text-base font-semibold flex items-center space-x-2 mb-3">
              <Brain class="w-4 h-4 text-primary" />
              <span>Smart Insights</span>
              <span v-if="peakHours.length > 0" class="text-xs text-muted-foreground ml-auto">
                Peak: {{ peakHours.join(', ') }}
              </span>
            </h3>
            
            <div class="space-y-2">
              <div 
                v-for="(rec, index) in getRecommendations.slice(0, 3)" 
                :key="index"
                class="flex items-center space-x-3 p-2 rounded border-l-2"
                :class="getPriorityColorCompact(rec.priority)"
              >
                <div class="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {{ index + 1 }}
                </div>
                <p class="text-sm flex-1">{{ rec.message }}</p>
                <span class="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">{{ rec.priority }}</span>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="!allActivities.length" class="text-center py-12">
            <BarChart3 class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">No Data Yet</h3>
            <p class="text-muted-foreground">
              Start tracking activities to see beautiful analytics and insights.
            </p>
          </div>
        </div>


        <!-- AI Insights & Chat Tab -->
        <div v-else class="space-y-4">
          <div>
            <div class="mb-4">
              <h3 class="text-lg font-semibold flex items-center space-x-2">
                <Brain class="w-5 h-5 text-primary" />
                <span>AI Insights & Chat</span>
              </h3>
            </div>
            
            <div class="space-y-4">
              <!-- AI Report Generation -->
              <div class="bg-secondary/20 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <Brain class="w-4 h-4 text-primary" />
                    <span class="text-sm font-medium">AI Analysis</span>
                    <button 
                      v-if="isAIEnabled"
                      @click="$emit('view-ai-history')"
                      class="px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      History
                    </button>
                  </div>
                  <button 
                    @click="generateAIReport"
                    :disabled="!isAIEnabled || reportLoading || !allActivities.length"
                    class="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div v-if="reportLoading" class="flex items-center space-x-1">
                      <div class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span class="text-xs">Analyzing...</span>
                    </div>
                    <span v-else class="text-xs">Generate</span>
                  </button>
                </div>
                
                <!-- Report Content -->
                <div v-if="aiReport" class="space-y-3">
                  <div class="prose prose-sm max-w-none dark:prose-invert max-h-48 overflow-y-auto">
                    <div class="whitespace-pre-line text-sm" v-html="formatAIContent(aiReport.content)"></div>
                  </div>
                  
                  <div class="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                    <span>{{ getProviderDisplayName(aiReport.provider) }}{{ aiReport.tokensUsed ? ` • ${aiReport.tokensUsed} tokens` : '' }}</span>
                    <span>{{ formatTimestamp(aiReport.generatedAt) }}</span>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div v-else-if="!reportLoading" class="text-center py-4">
                  <p class="text-sm text-muted-foreground">
                    {{ !allActivities.length 
                      ? 'Track activities to generate insights'
                      : 'Generate AI report about your productivity'
                    }}
                  </p>
                </div>
              </div>

              <!-- Chat Interface -->
              <div v-if="aiReport" class="bg-secondary/20 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium flex items-center space-x-2">
                    <Brain class="w-4 h-4 text-primary" />
                    <span>Follow-up Questions</span>
                  </span>
                  <button 
                    @click="$emit('open-settings')"
                    class="px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Settings
                  </button>
                </div>
                
                <!-- Chat Messages -->
                <div v-if="chatMessages.length > 0" class="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  <div 
                    v-for="message in chatMessages" 
                    :key="message.id"
                    class="flex space-x-2"
                    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
                  >
                    <div 
                      :class="[
                        'max-w-[80%] px-2 py-1 rounded text-sm',
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      ]"
                    >
                      <div class="whitespace-pre-line" v-html="formatAIContent(message.content)"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Chat Input -->
                <div class="flex space-x-2">
                  <input
                    v-model="chatInput"
                    @keydown.enter="sendChatMessage"
                    :disabled="!isAIEnabled || chatLoading"
                    placeholder="Ask about your productivity..."
                    class="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background disabled:opacity-50"
                  />
                  <button
                    @click="sendChatMessage"
                    :disabled="!isAIEnabled || chatLoading || !chatInput.trim()"
                    class="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <div v-if="chatLoading" class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span v-else class="text-xs">Send</span>
                  </button>
                </div>
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
  History,
  Tag, 
  Target, 
  TrendingUp,
  X 
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useActivities } from '~/composables/useActivities'
import { useAISettings } from '~/composables/useAISettings'
import DailyActivityChart from '~/components/Charts/DailyActivityChart.vue'
import FocusTrendChart from '~/components/Charts/FocusTrendChart.vue'
import ActivityDistributionChart from '~/components/Charts/ActivityDistributionChart.vue'
import PeakHoursChart from '~/components/Charts/PeakHoursChart.vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'open-settings'): void
  (e: 'view-ai-history'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getActivities } = useActivities()
const { isEnabled: isAIEnabled } = useAISettings()

// State
const activeTab = ref('analytics')

// Watch AI enabled state and switch tab if needed
watch(isAIEnabled, (newValue) => {
  if (!newValue && activeTab.value === 'ai-insights') {
    activeTab.value = 'analytics'
  }
})
const loading = ref(false)
const allActivities = ref<any[]>([])

// AI State
const reportLoading = ref(false)
const chatLoading = ref(false)
const aiReport = ref<{
  content: string
  provider: string
  tokensUsed: number
  generatedAt: string
} | null>(null)
const chatMessages = ref<{
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}[]>([])
const chatInput = ref('')

// Stats
const todayStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const weekStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const totalStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const peakHours = ref<string[]>([])
const focusPattern = ref<string>('')
const topCategories = ref<Array<{ name: string; percentage: number; totalTime: number }>>([])

// Tab configuration
const tabs = computed(() => {
  const baseTabs = [
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 }
  ]
  
  if (isAIEnabled.value) {
    baseTabs.push({ id: 'ai-insights', label: 'AI Insights & Chat', icon: Brain })
  }
  
  return baseTabs
})

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

// Helper methods
const getRecommendations = computed(() => {
  const recommendations = []
  
  if (todayStats.value.avgFocus > 0 && todayStats.value.avgFocus < 3) {
    recommendations.push({
      type: 'focus',
      priority: 'high',
      message: 'Consider minimizing distractions - your average focus today is below 3/5'
    })
  }
  
  if (peakHours.value.length > 0) {
    recommendations.push({
      type: 'schedule',
      priority: 'medium', 
      message: `Schedule important tasks during your peak hours: ${peakHours.value.join(', ')}`
    })
  }
  
  if (topCategories.value.length > 0) {
    const topCategory = topCategories.value[0]
    if (topCategory && topCategory.percentage > 40) {
      recommendations.push({
        type: 'balance',
        priority: 'medium',
        message: `Consider diversifying - ${topCategory.percentage}% of time spent on #${topCategory.name}`
      })
    }
  }
  
  return recommendations
})

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' 
    case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20 border-gray-200'
  }
}

const getPriorityColorCompact = (priority: string): string => {
  switch (priority) {
    case 'high': return 'border-red-400'
    case 'medium': return 'border-yellow-400' 
    case 'low': return 'border-blue-400'
    default: return 'border-gray-400'
  }
}

// AI Methods
const generateAIReport = async () => {
  if (!isAIEnabled.value || !allActivities.value.length || reportLoading.value) return
  
  reportLoading.value = true
  try {
    const response = await $fetch('/api/ai/daily-summary', {
      method: 'POST',
      body: {
        activities: allActivities.value
      }
    })
    
    aiReport.value = {
      content: response.data.content,
      provider: response.data.provider,
      tokensUsed: response.usage?.tokens || 0,
      generatedAt: new Date().toISOString()
    }
    
    // Clear chat messages when new report is generated
    chatMessages.value = []
    
  } catch (error) {
    console.error('Failed to generate AI report:', error)
    // You could add error handling UI here
  } finally {
    reportLoading.value = false
  }
}

const sendChatMessage = async () => {
  if (!isAIEnabled.value || !chatInput.value.trim() || !aiReport.value || chatLoading.value) return
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user' as const,
    content: chatInput.value.trim(),
    timestamp: new Date().toISOString()
  }
  
  chatMessages.value.push(userMessage)
  const currentInput = chatInput.value
  chatInput.value = ''
  chatLoading.value = true
  
  try {
    // Create new API endpoint for chat
    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        message: currentInput,
        context: {
          report: aiReport.value.content,
          activities: allActivities.value
        }
      }
    })
    
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: response.content,
      timestamp: new Date().toISOString()
    }
    
    chatMessages.value.push(assistantMessage)
    
  } catch (error) {
    console.error('Failed to send chat message:', error)
    // Add error message to chat
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: 'Sorry, I encountered an error while processing your message. Please try again.',
      timestamp: new Date().toISOString()
    }
    chatMessages.value.push(errorMessage)
  } finally {
    chatLoading.value = false
  }
}

const formatAIContent = (content: string): string => {
  // Simple formatting for AI content
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-xs">$1</code>')
}

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getProviderDisplayName = (provider: string): string => {
  const names: Record<string, string> = {
    claude: 'Claude',
    openai: 'OpenAI',
    gemini: 'Gemini',
    ollama: 'Ollama'
  }
  return names[provider] || provider
}

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
    allActivities.value = activities
    
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