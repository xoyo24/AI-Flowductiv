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
        :class="[
          'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
          currentFilters.priority?.includes(priority)
            ? 'bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border cursor-pointer'
        ]"
        :data-testid="`priority-${priority}`"
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
const { activeFilters } = useActivities()

// Current filter state
const currentFilters = computed(() => activeFilters.value)

// Methods
const togglePriority = (priority: number) => {
  togglePriorityFilter(priority)
}
</script>