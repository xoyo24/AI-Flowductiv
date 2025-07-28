<template>
  <div v-if="topTags.length > 0" class="space-y-2">
    <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {{ title }}
    </div>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="tag in displayTags"
        :key="tag.name"
        :class="[
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors',
          'hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary',
          isSelected(tag.name) 
            ? 'bg-primary/20 text-primary border border-primary/30' 
            : 'bg-primary/10 text-primary border border-primary/20'
        ]"
        @click="toggleTag(tag.name)"
        :data-testid="`tag-filter-${tag.name}`"
      >
        <span class="text-primary/70 mr-1">#</span>{{ tag.name }}
        <span class="ml-1 text-muted-foreground">{{ formatDuration(tag.totalTime) }}</span>
        <span v-if="isSelected(tag.name)" class="ml-1 text-primary">✓</span>
      </button>
      
      <!-- Show More/Less Toggle -->
      <button
        v-if="topTags.length > maxDisplay"
        @click="showAll = !showAll"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        :data-testid="showAll ? 'show-less-tags' : 'show-more-tags'"
      >
        {{ showAll ? 'Show Less' : `+${topTags.length - maxDisplay} more` }}
      </button>
      
      <!-- Clear All Button -->
      <button
        v-if="selectedTags.size > 0"
        @click="clearAll"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        data-testid="clear-all-tags"
      >
        Clear All
      </button>
    </div>
    
    <!-- Active Filters Summary -->
    <div v-if="selectedTags.size > 0" class="mt-2 text-xs text-muted-foreground">
      Filtering by {{ selectedTags.size }} {{ selectedTags.size === 1 ? 'tag' : 'tags' }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface TagData {
  name: string
  totalTime: number
  count?: number
}

interface Props {
  topTags: TagData[]
  title?: string
  maxDisplay?: number
  selectedTags?: Set<string>
}

interface Emits {
  (e: 'tag-selected', tag: string): void
  (e: 'tag-deselected', tag: string): void
  (e: 'tags-cleared'): void
  (e: 'selection-changed', selectedTags: Set<string>): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Top Tags',
  maxDisplay: 3,
  selectedTags: () => new Set<string>()
})

const emit = defineEmits<Emits>()

// Composable for duration formatting
const { formatDuration } = useActivities()

// Local state
const showAll = ref(false)
const selectedTags = ref(new Set(props.selectedTags))

// Computed properties
const displayTags = computed(() => {
  if (showAll.value) {
    return props.topTags
  }
  return props.topTags.slice(0, props.maxDisplay)
})

// Methods
const isSelected = (tagName: string): boolean => {
  return selectedTags.value.has(tagName)
}

const toggleTag = (tagName: string) => {
  if (selectedTags.value.has(tagName)) {
    selectedTags.value.delete(tagName)
    emit('tag-deselected', tagName)
  } else {
    selectedTags.value.add(tagName)
    emit('tag-selected', tagName)
  }
  
  // Emit the updated selection
  emit('selection-changed', new Set(selectedTags.value))
}

const clearAll = () => {
  selectedTags.value.clear()
  emit('tags-cleared')
  emit('selection-changed', new Set(selectedTags.value))
}

// Watch for external changes to selectedTags prop
watch(() => props.selectedTags, (newSelectedTags) => {
  selectedTags.value = new Set(newSelectedTags)
}, { deep: true })
</script>