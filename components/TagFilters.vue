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
            'w-full flex items-center justify-between px-3 py-2 text-left transition-colors rounded-md relative',
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
          
          <!-- Always visible count -->
          <span class="text-xs text-muted-foreground">{{ tag.count || 0 }}</span>
          
          <!-- Hover overlay menu button -->
          <div 
            class="absolute inset-0 flex items-center justify-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
            style="background: linear-gradient(to left, hsl(var(--muted)) 0%, hsl(var(--muted)) 40%, transparent 100%)"
          >
            <button
              class="p-1 hover:bg-muted-foreground/20 rounded transition-all pointer-events-auto"
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
        @click="editTag(contextMenu.tag)"
        class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
      >
        Edit tag
      </button>
      <div class="border-t border-border my-1"></div>
      <button
        @click="removeTagHandler(contextMenu.tag, false)"
        class="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
      >
        Remove tag only
      </button>
      <button
        @click="removeTagHandler(contextMenu.tag, true)"
        class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Remove tag and activities
      </button>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="selectedTags.size > 0" class="px-3 py-2 text-xs text-muted-foreground border-t border-border">
      Filtering by {{ selectedTags.size }} {{ selectedTags.size === 1 ? 'tag' : 'tags' }}
    </div>


    <!-- Tag Statistics Button -->
    <div class="border-t border-border pt-3">
      <button
        @click="showStatistics = true"
        class="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-md"
      >
        📊 View Tag Statistics
      </button>
    </div>
  </div>

  <!-- Tag Edit Dialog -->
  <TagEditDialog
    :is-open="showEditDialog"
    :tag="tagToEdit"
    @close="showEditDialog = false"
    @renamed="handleTagRenamed"
  />

  <!-- Tag Statistics Modal -->
  <TagStatisticsModal
    :is-open="showStatistics"
    @close="showStatistics = false"
  />

  <!-- Confirm Delete Dialog -->
  <ConfirmDialog
    :is-open="showDeleteConfirm"
    type="danger"
    :title="deleteConfirmTitle"
    :message="deleteConfirmMessage"
    :details="deleteConfirmDetails"
    confirm-text="Delete Tag"
    loading-text="Deleting..."
    @close="showDeleteConfirm = false"
    @confirm="handleConfirmDelete"
    ref="confirmDialogRef"
  />
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
  (e: 'tag-edit', tag: TagData): void
  (e: 'tag-remove', tag: TagData, includeActivities: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Top Tags',
  maxDisplay: 10,
  selectedTags: () => new Set<string>()
})

const emit = defineEmits<Emits>()

// Composables
const { formatDuration } = useActivities()
const { 
  renameTag, 
  removeTag
} = useTagManagement()

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

// Dialog states
const showEditDialog = ref(false)
const showStatistics = ref(false)
const showDeleteConfirm = ref(false)
const tagToEdit = ref<TagData | null>(null)
const tagToDelete = ref<TagData | null>(null)
const deleteIncludeActivities = ref(false)
const confirmDialogRef = ref<any>(null)

// Delete confirmation computed properties
const deleteConfirmTitle = computed(() => {
  return deleteIncludeActivities.value 
    ? 'Delete Tag and Activities' 
    : 'Remove Tag Only'
})

const deleteConfirmMessage = computed(() => {
  const tag = tagToDelete.value
  if (!tag) return ''
  
  return deleteIncludeActivities.value
    ? `This will permanently delete the tag "#${tag.name}" and remove all ${tag.count || 0} activities that use this tag.`
    : `This will remove the tag "#${tag.name}" from all ${tag.count || 0} activities, but keep the activities.`
})

const deleteConfirmDetails = computed(() => {
  const tag = tagToDelete.value
  if (!tag) return undefined
  
  return {
    title: `${tag.count || 0} activities affected`,
    message: deleteIncludeActivities.value
      ? 'All activities with this tag will be permanently deleted.'
      : 'Activities will remain but without this tag.'
  }
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


const editTag = (tag: TagData) => {
  tagToEdit.value = tag
  showEditDialog.value = true
  hideContextMenu()
}

const removeTagHandler = (tag: TagData, includeActivities: boolean) => {
  tagToDelete.value = tag
  deleteIncludeActivities.value = includeActivities
  showDeleteConfirm.value = true
  hideContextMenu()
}

// Handle tag rename completion
const handleTagRenamed = (oldName: string, newName: string) => {
  // Update local tag data
  const tagIndex = props.topTags.findIndex(t => t.name === oldName)
  if (tagIndex !== -1) {
    props.topTags[tagIndex].name = newName
  }
  
  // Update selected tags if the renamed tag was selected
  if (selectedTags.value.has(oldName)) {
    selectedTags.value.delete(oldName)
    selectedTags.value.add(newName)
    emit('selection-changed', new Set(selectedTags.value))
  }
  
  emit('tag-edit', { name: newName, totalTime: 0 })
}

// Handle confirmed tag deletion
const handleConfirmDelete = async () => {
  if (!tagToDelete.value || !confirmDialogRef.value) return
  
  const tag = tagToDelete.value
  const includeActivities = deleteIncludeActivities.value
  
  confirmDialogRef.value.setLoading(true)
  
  try {
    const result = await removeTag(tag.name, includeActivities)
    
    if (result.success) {
      // Remove from local tag list
      const tagIndex = props.topTags.findIndex(t => t.name === tag.name)
      if (tagIndex !== -1) {
        props.topTags.splice(tagIndex, 1)
      }
      
      // Remove from selected tags if selected
      if (selectedTags.value.has(tag.name)) {
        selectedTags.value.delete(tag.name)
        emit('selection-changed', new Set(selectedTags.value))
      }
      
      emit('tag-remove', tag, includeActivities)
      showDeleteConfirm.value = false
    } else {
      confirmDialogRef.value.setError(result.error || 'Failed to delete tag')
    }
  } catch (error: any) {
    confirmDialogRef.value.setError(error.message || 'Failed to delete tag')
  } finally {
    confirmDialogRef.value.setLoading(false)
  }
}

// Watch for external changes to selectedTags prop
watch(() => props.selectedTags, (newSelectedTags) => {
  selectedTags.value = new Set(newSelectedTags)
}, { deep: true })

</script>