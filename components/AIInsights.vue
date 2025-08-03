<template>
  <div class="space-y-3">
    <div class="flex items-center space-x-2 mb-2">
      <Brain class="w-4 h-4 text-muted-foreground" />
      <span class="text-sm font-medium text-foreground">AI Insights</span>
      <span v-if="loading" class="px-2 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground">
        <Loader2 class="w-3 h-3 animate-spin mr-1 inline" />
        Analyzing...
      </span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-destructive/10 rounded-lg p-3">
      <div class="text-xs text-destructive">
        {{ error }}
      </div>
    </div>

    <!-- No Insights Yet -->
    <div v-else-if="!hasInsights && !loading" class="bg-secondary/20 rounded-lg p-3">
      <div class="text-xs text-muted-foreground">
        Track more activities to unlock personalized insights
      </div>
    </div>

    <!-- Peak Hours Insight -->
    <div v-if="insights.peakHours" class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <Clock class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Peak Hours</span>
        <span 
          :class="insights.peakHours.confidence > 0.7 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'"
          class="px-2 py-1 text-xs font-medium rounded-md"
        >
          {{ Math.round(insights.peakHours.confidence * 100) }}%
        </span>
      </div>
      <div class="text-xs text-muted-foreground mb-2">
        {{ insights.peakHours.recommendation }}
      </div>
      <div class="flex items-center space-x-4 text-xs">
        <span class="text-foreground font-medium">{{ insights.peakHours.timeRange }}</span>
        <span class="text-muted-foreground">
          {{ insights.peakHours.avgFocus.toFixed(1) }}/5 avg focus
        </span>
      </div>
    </div>

    <!-- Focus Pattern Insight -->
    <div v-if="insights.focusPattern" class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <TrendingUp 
          v-if="insights.focusPattern.trend === 'improving'" 
          class="w-3 h-3 text-green-500" 
        />
        <TrendingDown 
          v-else-if="insights.focusPattern.trend === 'declining'" 
          class="w-3 h-3 text-red-500" 
        />
        <Minus 
          v-else 
          class="w-3 h-3 text-muted-foreground" 
        />
        <span class="text-xs font-medium text-foreground">Focus Trend</span>
        <span 
          :class="insights.focusPattern.trend === 'improving' ? 'bg-green-500 text-white' : 
                   insights.focusPattern.trend === 'declining' ? 'bg-red-500 text-white' : 'bg-secondary text-secondary-foreground'" 
          class="px-2 py-1 text-xs font-medium rounded-md"
        >
          {{ insights.focusPattern.trend }}
        </span>
      </div>
      <div class="text-xs text-muted-foreground mb-2">
        {{ insights.focusPattern.suggestion }}
      </div>
      <div class="flex items-center space-x-4 text-xs">
        <span class="text-foreground font-medium">
          Recent: {{ insights.focusPattern.recentAverage.toFixed(1) }}/5
        </span>
        <span class="text-muted-foreground">
          Overall: {{ insights.focusPattern.overallAverage.toFixed(1) }}/5
        </span>
      </div>
    </div>

    <!-- Tag Combination Insight -->
    <div v-if="insights.tagCombinations" class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <Tags class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Best Tag Combo</span>
      </div>
      <div class="text-xs text-muted-foreground mb-2">
        {{ insights.tagCombinations.recommendation }}
      </div>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="tag in insights.tagCombinations.bestCombination" 
          :key="tag" 
          class="px-2 py-1 text-xs font-medium rounded-md border border-border bg-background text-foreground"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Actionable Recommendations -->
    <div v-if="insights.recommendations && insights.recommendations.length > 0" class="space-y-2">
      <div class="flex items-center space-x-2">
        <Lightbulb class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Recommendations</span>
      </div>
      <div 
        v-for="(rec, index) in insights.recommendations.slice(0, 3)" 
        :key="index"
        class="bg-secondary/20 rounded-lg p-3"
      >
        <div class="flex items-start space-x-2">
          <AlertCircle 
            v-if="rec.priority === 'high'" 
            class="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" 
          />
          <Info 
            v-else 
            class="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" 
          />
          <div class="text-xs text-muted-foreground leading-relaxed">
            {{ rec.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- Refresh Button -->
    <button
      @click="refreshInsights"
      :disabled="loading"
      class="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-secondary/20 disabled:opacity-50"
      data-testid="refresh-insights"
    >
      <div class="flex items-center justify-center space-x-1">
        <RefreshCw :class="{ 'animate-spin': loading }" class="w-3 h-3" />
        <span>{{ loading ? 'Analyzing...' : 'Refresh Insights' }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { 
  AlertCircle, 
  Brain, 
  Clock, 
  Info, 
  Lightbulb, 
  Loader2, 
  Minus, 
  RefreshCw, 
  Tags, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-vue-next'
// Using custom badge classes like other components
import { useInsights } from '~/composables/useInsights'
import { useActivities } from '~/composables/useActivities'

interface Props {
  compact?: boolean
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  autoRefresh: true
})

const { 
  insights, 
  loading, 
  error, 
  hasInsights, 
  generateInsights 
} = useInsights()

const { getActivities } = useActivities()

// Refresh insights with latest activity data
const refreshInsights = async () => {
  try {
    const activities = await getActivities(1, 100) // Get recent 100 activities
    await generateInsights(activities)
  } catch (err) {
    console.error('Failed to refresh insights:', err)
  }
}

// Initialize insights on mount
onMounted(() => {
  if (props.autoRefresh) {
    refreshInsights()
  }
})

// Auto-refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', refreshInsights)
  window.addEventListener('activity-updated', refreshInsights)
  window.addEventListener('activity-deleted', refreshInsights)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('activity-saved', refreshInsights)
    window.removeEventListener('activity-updated', refreshInsights)
    window.removeEventListener('activity-deleted', refreshInsights)
  }
})
</script>