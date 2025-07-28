<template>
  <div class="flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-4 border-b border-border bg-card/50">
      <h2 
        v-if="!collapsed" 
        class="text-sm font-medium text-muted-foreground uppercase tracking-wide"
      >
        Analytics Hub
      </h2>
      <div class="flex items-center space-x-2">
        <slot name="theme-toggle" />
        <button
          @click="$emit('toggle-collapse')"
          class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          :aria-label="collapsed ? 'Expand analytics sidebar' : 'Collapse analytics sidebar'"
        >
          <ChevronLeft 
            :class="{
              'w-4 h-4 transition-transform duration-200': true,
              'rotate-180': collapsed
            }" 
          />
        </button>
      </div>
    </div>

    <!-- Analytics Content -->
    <div 
      v-if="!collapsed" 
      class="flex-1 overflow-y-auto p-4 space-y-6"
    >
      <!-- Overall Summary (replaces QuickStats) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Overview
          </h3>
          <button 
            @click="refreshData"
            class="p-1 rounded hover:bg-muted/50 transition-colors"
            title="Refresh analytics"
          >
            <RotateCw class="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        <OverallSummary :loading="loading" />
      </div>

      <!-- Productivity Heatmap -->
      <div class="space-y-3">
        <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Activity Pattern
        </h3>
        <ProductivityHeatmap 
          @day-selected="handleDaySelected" 
          :compact="true"
        />
      </div>

      <!-- AI Insights -->
      <div class="space-y-3">
        <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          AI Insights
        </h3>
        <DailySummary :compact="true" />
      </div>

      <!-- Quick Patterns (Expandable) -->
      <div class="space-y-3">
        <button
          @click="showPatterns = !showPatterns"
          class="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>Patterns</span>
          <ChevronDown 
            :class="{
              'w-3 h-3 transition-transform duration-200': true,
              'rotate-180': showPatterns
            }"
          />
        </button>
        
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showPatterns" class="space-y-2">
            <PatternInsights :compact="true" />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Collapsed State - Icons Only -->
    <div v-else class="flex-1 p-2 space-y-3">
      <button
        @click="$emit('show-analytics-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View analytics"
      >
        <BarChart3 class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
      
      <button
        @click="$emit('show-heatmap-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View activity heatmap"
      >
        <Calendar class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
      
      <button
        @click="$emit('show-insights-modal')"
        class="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        title="View AI insights"
      >
        <Brain class="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground" />
      </button>
    </div>

    <!-- Bottom Navigation (Tertiary Features) -->
    <div 
      :class="{
        'border-t border-border p-4 space-y-2': !collapsed,
        'border-t border-border p-2 space-y-2': collapsed
      }"
    >
      <template v-if="!collapsed">
        <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Settings
        </h3>
        <button
          @click="$emit('navigate-to-settings')"
          class="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
        >
          <Settings class="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button
          @click="$emit('navigate-to-history')"
          class="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
        >
          <Clock class="w-4 h-4" />
          <span>Full History</span>
        </button>
      </template>
      
      <template v-else>
        <button
          @click="$emit('navigate-to-settings')"
          class="w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
          title="Settings"
        >
          <Settings class="w-4 h-4 mx-auto text-muted-foreground" />
        </button>
        <button
          @click="$emit('navigate-to-history')"
          class="w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
          title="Full History"
        >
          <Clock class="w-4 h-4 mx-auto text-muted-foreground" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarChart3,
  Brain,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  RotateCw,
  Settings,
} from 'lucide-vue-next'

interface Props {
  collapsed?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'toggle-collapse'): void
  (e: 'day-selected', date: Date): void
  (e: 'refresh-data'): void
  (e: 'navigate-to-settings'): void
  (e: 'navigate-to-history'): void
  (e: 'show-analytics-modal'): void
  (e: 'show-heatmap-modal'): void
  (e: 'show-insights-modal'): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  loading: false,
})

const emit = defineEmits<Emits>()

// Local state
const showPatterns = ref(false)

// Actions
const handleDaySelected = (date: Date) => {
  emit('day-selected', date)
}

const refreshData = () => {
  emit('refresh-data')
}
</script>