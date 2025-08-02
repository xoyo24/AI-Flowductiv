<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Flame class="w-4 h-4 text-muted-foreground" />
        <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</label>
      </div>
      <div class="flex space-x-2">
      <button
        v-for="priority in [1, 2, 3, 4, 5]"
        :key="priority"
        @click="togglePriority(priority)"
        :disabled="!isPriorityAvailable(priority)"
        :class="[
          'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
          currentFilters.priority?.includes(priority)
            ? 'bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm'
            : isPriorityAvailable(priority)
              ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border cursor-pointer'
              : 'bg-muted/30 text-muted-foreground/30 border border-border/30 cursor-not-allowed opacity-50'
        ]"
        :data-testid="`priority-${priority}`"
        :title="!isPriorityAvailable(priority) ? 'No activities with this priority' : undefined"
      >
        {{ priority }}
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flame } from 'lucide-vue-next'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useActivities } from '~/composables/useActivities'

interface Emits {
  (e: 'priority-toggle', priority: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { togglePriorityFilter } = useAdvancedFilters()
const { activeFilters, activities } = useActivities()

// Current filter state
const currentFilters = computed(() => activeFilters.value)

// Smart filter availability
const availablePriorities = computed(() => {
  const priorities = new Set<number>()
  activities.value.forEach(activity => {
    if (activity.priority !== null) {
      priorities.add(activity.priority)
    }
  })
  return priorities
})

// Methods
const isPriorityAvailable = (priority: number) => {
  return availablePriorities.value.has(priority)
}

const togglePriority = (priority: number) => {
  if (isPriorityAvailable(priority)) {
    togglePriorityFilter(priority)
  }
  // Note: No need to emit since we handle it directly
}
</script>