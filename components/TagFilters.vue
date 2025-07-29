<template>
  <div v-if="topTags.length > 0" class="space-y-1">
    <!-- Section Title -->
    <div class="flex items-center justify-between px-3 py-2">
      <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {{ title }}
      </h3>
      <button
        v-if="selectedTags.size > 0"
        @click="clearAll"
        class="text-xs text-muted-foreground hover:text-foreground"
        data-testid="clear-all-tags"
      >
        Clear
      </button>
    </div>

    <!-- Vertical Tag List -->
    <div class="space-y-0.5">
      <div
        v-for="tag in displayTags"
        :key="tag.name"
        class="relative group"
        @mouseenter="handleTagHover(tag, $event)"
        @mouseleave="hideUsageTooltip"
      >
        <button
          :class="[
            'w-full flex items-center justify-between px-3 py-2 text-left transition-colors rounded-md',
            'hover:bg-muted/50 focus:outline-none focus:bg-muted/70',
            isSelected(tag.name) 
              ? 'bg-primary/10 text-primary' 
              : 'text-foreground hover:text-foreground'
          ]"
          @click="toggleTag(tag.name)"
          @contextmenu.prevent="showContextMenu(tag, $event)"
          :data-testid="`tag-filter-${tag.name}`"
        >
          <div class="flex items-center">
            <span class="text-muted-foreground mr-2">#</span>
            <span class="text-sm font-medium">{{ tag.name }}</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs text-muted-foreground">{{ tag.count || 0 }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
              @click.stop="showContextMenu(tag, $event)"
              aria-label="Tag options"
            >
              <svg class="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </button>
      </div>

      <!-- Show More/Less Toggle -->
      <button
        v-if="topTags.length > maxDisplay"
        @click="showAll = !showAll"
        class="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-md"
        :data-testid="showAll ? 'show-less-tags' : 'show-more-tags'"
      >
        {{ showAll ? 'Show Less' : `+${topTags.length - maxDisplay} more` }}
      </button>
    </div>

    <!-- Usage Tooltip -->
    <div
      v-if="usageTooltip.visible"
      :style="{ 
        position: 'fixed', 
        left: usageTooltip.x + 'px', 
        top: usageTooltip.y + 'px',
        zIndex: 50
      }"
      class="bg-popover text-popover-foreground border border-border rounded-md shadow-md px-3 py-2 text-xs pointer-events-none"
      data-testid="tag-usage-tooltip"
    >
      <div class="font-medium">#{{ usageTooltip.tag.name }}</div>
      <div>{{ usageTooltip.tag.count }} activities</div>
      <div>{{ formatDuration(usageTooltip.tag.totalTime) }} total</div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      :style="{ 
        position: 'fixed', 
        left: contextMenu.x + 'px', 
        top: contextMenu.y + 'px',
        zIndex: 60
      }"
      class="bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1 min-w-[160px]"
      data-testid="tag-context-menu"
    >
      <button
        @click="favoriteTag(contextMenu.tag)"
        class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
      >
        {{ contextMenu.tag.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}
      </button>
      <button
        @click="editTag(contextMenu.tag)"
        class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
      >
        Edit tag
      </button>
      <div class="border-t border-border my-1"></div>
      <button
        @click="removeTag(contextMenu.tag, false)"
        class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
      >
        Remove tag only
      </button>
      <button
        @click="removeTag(contextMenu.tag, true)"
        class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Remove tag and activities
      </button>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="selectedTags.size > 0" class="px-3 py-2 text-xs text-muted-foreground border-t border-border">
      Filtering by {{ selectedTags.size }} {{ selectedTags.size === 1 ? 'tag' : 'tags' }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface TagData {
  name: string
  totalTime: number
  count?: number
  isFavorite?: boolean
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
  (e: 'tag-favorite', tag: TagData): void
  (e: 'tag-edit', tag: TagData): void
  (e: 'tag-remove', tag: TagData, includeActivities: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Top Tags',
  maxDisplay: 10,
  selectedTags: () => new Set<string>()
})

const emit = defineEmits<Emits>()

// Composable for duration formatting
const { formatDuration } = useActivities()

// Local state
const showAll = ref(false)
const selectedTags = ref(new Set(props.selectedTags))

// Tooltip state
const usageTooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  tag: {} as TagData
})

// Context menu state
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tag: {} as TagData
})

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

// Tooltip methods
const handleTagHover = (tag: TagData, event: MouseEvent) => {
  usageTooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY - 10,
    tag
  }
}

const hideUsageTooltip = () => {
  usageTooltip.value.visible = false
}

// Context menu methods
const showContextMenu = (tag: TagData, event: MouseEvent) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tag
  }
  
  // Hide context menu when clicking outside
  nextTick(() => {
    document.addEventListener('click', hideContextMenu, { once: true })
  })
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
}

const favoriteTag = (tag: TagData) => {
  emit('tag-favorite', tag)
  hideContextMenu()
}

const editTag = (tag: TagData) => {
  emit('tag-edit', tag)
  hideContextMenu()
}

const removeTag = (tag: TagData, includeActivities: boolean) => {
  emit('tag-remove', tag, includeActivities)
  hideContextMenu()
}

// Watch for external changes to selectedTags prop
watch(() => props.selectedTags, (newSelectedTags) => {
  selectedTags.value = new Set(newSelectedTags)
}, { deep: true })
</script>