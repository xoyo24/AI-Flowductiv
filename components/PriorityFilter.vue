<template>
  <div class="space-y-3">
    <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</label>
    <div class="flex space-x-2">
      <button
        v-for="priority in [1, 2, 3, 4, 5]"
        :key="priority"
        @click="togglePriority(priority)"
        :class="[
          'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
          currentFilters.priority?.includes(priority)
            ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200 shadow-sm dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-800'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
        ]"
        :data-testid="`priority-${priority}`"
      >
        {{ priority }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'

interface Emits {
  (e: 'priority-toggle', priority: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { togglePriorityFilter, getCurrentFilters } = useAdvancedFilters()

// Current filter state
const currentFilters = computed(() => getCurrentFilters())

// Methods
const togglePriority = (priority: number) => {
  togglePriorityFilter(priority)
  emit('priority-toggle', priority)
}
</script>