<template>
  <div class="relative" ref="menuRef">
    <!-- Menu Button -->
    <button 
      @click="toggleMenu"
      class="p-2 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ 'opacity-100': isOpen }"
      aria-label="Activity options"
      data-testid="activity-menu-button"
    >
      <svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
      </svg>
    </button>
    
    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen"
      class="absolute right-0 top-full mt-1 w-48 content-card py-2 shadow-lg border z-50"
      data-testid="activity-menu-dropdown"
    >
      <button
        @click="handleEdit"
        class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center space-x-2"
        data-testid="edit-activity"
      >
        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        <span>Edit Activity</span>
      </button>
      
      <div class="border-t border-border my-1"></div>
      
      <button
        @click="handleDelete"
        class="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive transition-colors flex items-center space-x-2"
        data-testid="delete-activity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        <span>Delete</span>
      </button>
    </div>
    
    <!-- Overlay to close menu when clicking outside -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: string
  title: string
  durationMs: number
  startTime: string
  endTime: string
  tags: string[]
}

interface Props {
  activity: Activity
}

interface Emits {
  (e: 'edit', activity: Activity): void
  (e: 'delete', activity: Activity): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement>()

const _toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const _handleEdit = () => {
  emit('edit', props.activity)
  closeMenu()
}

const _handleDelete = () => {
  emit('delete', props.activity)
  closeMenu()
}

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      closeMenu()
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>