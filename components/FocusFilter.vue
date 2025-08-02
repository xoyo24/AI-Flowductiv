<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Target class="w-4 h-4 text-muted-foreground" />
        <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Focus</label>
      </div>
      <div class="flex space-x-2">
      <button
        v-for="rating in [1, 2, 3, 4, 5]"
        :key="rating"
        @click="toggleFocus(rating)"
        :class="[
          'w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center',
          currentFilters.focusRating?.includes(rating)
            ? 'bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
        ]"
        :data-testid="`focus-${rating}`"
      >
        {{ rating }}
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Target } from 'lucide-vue-next'
import { useAdvancedFilters } from '~/composables/useAdvancedFilters'
import { useActivities } from '~/composables/useActivities'

interface Emits {
  (e: 'focus-toggle', focus: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { toggleFocusRatingFilter } = useAdvancedFilters()
const { activeFilters } = useActivities()

// Current filter state
const currentFilters = computed(() => activeFilters.value)

// Methods
const toggleFocus = (focus: number) => {
  toggleFocusRatingFilter(focus)
  // Note: No need to emit since we handle it directly
}
</script>