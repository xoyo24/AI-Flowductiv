<template>
  <div class="space-y-4">
    <!-- Individual Activity Cards (Flomo Style) -->
    <div v-if="activities.length > 0" class="space-y-4">
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        class="content-card activity-card p-5 group cursor-pointer"
        @click="$emit('activity-click', activity)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-foreground font-medium text-base leading-relaxed mb-3">{{ activity.title }}</p>
            <div class="flex items-center space-x-3 mb-3">
              <span class="text-sm font-medium text-foreground">{{ formatDuration(activity.durationMs) }}</span>
              <span class="text-xs text-muted-foreground">•</span>
              <span class="text-xs text-muted-foreground">{{ formatRelativeTime(activity.endTime) }}</span>
              <span v-if="activity.startTime && activity.endTime" class="text-xs text-muted-foreground">•</span>
              <span v-if="activity.startTime && activity.endTime" class="text-xs text-muted-foreground">
                {{ formatTimeRange(activity.startTime, activity.endTime) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <!-- Left side: Tags and Priority -->
              <div class="flex items-center space-x-2">
                <!-- Tags -->
                <div class="flex space-x-2">
                  <span v-for="tag in activity.tags" :key="tag" class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    #{{ tag }}
                  </span>
                </div>
                
                <!-- Priority -->
                <span v-if="activity.priority" class="text-xs px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-md font-medium">
                  !{{ activity.priority }}
                </span>
              </div>

              <!-- Right side: Focus Rating Stars -->
              <div @click.stop class="flex items-center space-x-1">
                <span class="text-xs text-muted-foreground mr-1">Focus:</span>
                <button
                  v-for="star in 5"
                  :key="star"
                  :data-testid="`activity-${activity.id}-star-${star}`"
                  type="button"
                  :class="{
                    'text-yellow-400': star <= (activity.focusRating || 0),
                    'text-gray-300 hover:text-yellow-300': star > (activity.focusRating || 0)
                  }"
                  class="p-0.5 transition-colors duration-150"
                  @click="handleFocusRating(activity, star)"
                  :title="`Rate focus: ${star} star${star > 1 ? 's' : ''}`"
                >
                  <Star
                    :class="{
                      'fill-current': star <= (activity.focusRating || 0)
                    }"
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </div>
          <div @click.stop class="ml-3">
            <ActivityMenuDropdown
              :activity="activity"
              @edit="$emit('activity-edit', activity)"
              @delete="$emit('activity-delete', activity)"
            />
          </div>
        </div>
      </div>
      
      <!-- Load More Button -->
      <div v-if="hasMoreActivities" class="flex justify-center pt-4">
        <button
          @click="$emit('load-more')"
          :disabled="loading"
          class="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          data-testid="load-more-activities"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Load More</span>
        </button>
      </div>
    </div>
    
    <!-- Empty State Card -->
    <div v-else-if="!loading" class="content-card p-8 text-center">
      <p class="text-muted-foreground text-sm">{{ emptyMessage }}</p>
    </div>
    
    <!-- Loading State -->
    <div v-else class="content-card p-8 text-center">
      <p class="text-muted-foreground text-sm">Loading activities...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import ActivityMenuDropdown from '~/components/Activity/MenuDropdown.vue'

interface Activity {
  id: string
  title: string
  durationMs: number
  startTime: string
  endTime: string
  tags: string[]
  priority?: number | null
  focusRating?: number | null
}

interface Props {
  activities: Activity[]
  hasMoreActivities: boolean
  loading: boolean
  emptyMessage: string
  formatDuration: (ms: number) => string
  formatRelativeTime: (time: string) => string
  formatTimeRange: (start: string, end: string) => string
}

interface Emits {
  (e: 'activity-click', activity: Activity): void
  (e: 'activity-edit', activity: Activity): void
  (e: 'activity-delete', activity: Activity): void
  (e: 'activity-focus-rating', activity: Activity, rating: number): void
  (e: 'load-more'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Focus rating handler
const handleFocusRating = (activity: Activity, rating: number) => {
  emit('activity-focus-rating', activity, rating)
}
</script>