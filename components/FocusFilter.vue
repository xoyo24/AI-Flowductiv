<template>
  <div class="space-y-3">
    <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Focus</label>
    <div class="flex space-x-2">
      <button
        v-for="rating in [1, 2, 3, 4, 5]"
        :key="rating"
        @click="toggleFocus(rating)"
        :class="[
          'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
          currentFilters.focusRating?.includes(rating)
            ? 'bg-green-100 text-green-800 ring-2 ring-green-200 shadow-sm dark:bg-green-900/20 dark:text-green-300 dark:ring-green-800'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
        ]"
        :data-testid="`focus-${rating}`"
      >
        {{ rating }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'

interface Emits {
  (e: 'focus-toggle', focus: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { toggleFocusRatingFilter, getCurrentFilters } = useAdvancedFilters()

// Current filter state
const currentFilters = computed(() => getCurrentFilters())

// Methods
const toggleFocus = (focus: number) => {
  toggleFocusRatingFilter(focus)
  emit('focus-toggle', focus)
}
</script>