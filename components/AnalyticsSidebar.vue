<template>
  <div class="flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-4 border-b border-border bg-card/50">
      <h2 
        v-if="!collapsed" 
        class="text-sm font-medium text-muted-foreground uppercase tracking-wide"
      >
        Flowductiv
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

      <!-- Productivity Overview -->
      <div class="space-y-3">
        <ProductivityOverview 
          :collapsed="false"
          :loading="loading"
          @day-selected="handleDaySelected" 
        />
      </div>

      <!-- Tag Filters -->
      <TagFilters
        v-if="props.tagData.length > 0"
        :top-tags="props.tagData"
        :selected-tags="props.selectedTags"
        title="Tags"
        :max-display="10"
        @tag-selected="handleTagSelected"
        @tag-deselected="handleTagDeselected"
        @tags-cleared="handleTagsCleared"
        @selection-changed="handleTagSelectionChanged"
        @tag-favorite="handleTagFavorite"
        @tag-edit="handleTagEdit"
        @tag-remove="handleTagRemove"
      />

      <!-- AI Insights (Collapsible) -->
      <div class="space-y-3">
        <button
          @click="showInsights = !showInsights"
          class="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>AI Insights</span>
          <ChevronDown 
            :class="{
              'w-3 h-3 transition-transform duration-200': true,
              'rotate-180': showInsights
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
          <div v-if="showInsights" class="space-y-2">
            <DailySummary :compact="true" />
          </div>
        </Transition>
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
import DailySummary from '~/components/DailySummary.vue'
import PatternInsights from '~/components/PatternInsights.vue'
import ProductivityOverview from '~/components/ProductivityOverview.vue'
import TagFilters from '~/components/TagFilters.vue'

interface TagData {
  name: string
  count: number
  totalTime: number
  isFavorite: boolean
}

interface Props {
  collapsed?: boolean
  loading?: boolean
  tagData?: TagData[]
  selectedTags?: Set<string>
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
  (e: 'tag-selected', tag: string): void
  (e: 'tag-deselected', tag: string): void
  (e: 'tags-cleared'): void
  (e: 'selection-changed', selectedTags: Set<string>): void
  (e: 'tag-favorite', tag: TagData): void
  (e: 'tag-edit', tag: TagData): void
  (e: 'tag-remove', tag: TagData, includeActivities: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  loading: false,
  tagData: () => [],
  selectedTags: () => new Set<string>()
})

const emit = defineEmits<Emits>()

// Local state
const showPatterns = ref(false)
const showInsights = ref(false) // Collapsed by default to save space

// Actions
const handleDaySelected = (day: any) => {
  emit('day-selected', day)
}

const refreshData = () => {
  emit('refresh-data')
}

// Tag filter event handlers - forward to parent
const handleTagSelected = (tag: string) => {
  emit('tag-selected', tag)
}

const handleTagDeselected = (tag: string) => {
  emit('tag-deselected', tag)
}

const handleTagsCleared = () => {
  emit('tags-cleared')
}

const handleTagSelectionChanged = (selectedTags: Set<string>) => {
  emit('selection-changed', selectedTags)
}

const handleTagFavorite = (tag: TagData) => {
  emit('tag-favorite', tag)
}

const handleTagEdit = (tag: TagData) => {
  emit('tag-edit', tag)
}

const handleTagRemove = (tag: TagData, includeActivities: boolean) => {
  emit('tag-remove', tag, includeActivities)
}
</script>