<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left w-full"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <span class="text-xs font-medium text-primary">{{ userInitials }}</span>
      </div>
      <div v-if="!collapsed" class="flex-1 min-w-0">
        <div class="text-sm font-medium text-foreground truncate">{{ username }}</div>
      </div>
      <ChevronDown 
        v-if="!collapsed"
        :class="{
          'w-3 h-3 transition-transform duration-200 text-muted-foreground': true,
          'rotate-180': isOpen
        }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div 
      v-if="isOpen && !collapsed"
      class="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50"
    >
      <div class="p-1">
        <button
          @click="handleSettingsClick"
          class="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <Settings class="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button
          @click="handleHistoryClick"
          class="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <Clock class="w-4 h-4" />
          <span>Full History</span>
        </button>
        <div class="border-t border-border my-1"></div>
        <button
          @click="handleThemeToggle"
          class="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <Sun v-if="$colorMode.value === 'dark'" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
          <span>{{ $colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>
    </div>

    <!-- Click outside overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Clock, Moon, Settings, Sun } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Props {
  collapsed?: boolean
}

interface Emits {
  (e: 'navigate-to-settings'): void
  (e: 'navigate-to-history'): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<Emits>()

// Local state
const isOpen = ref(false)

// User data (hardcoded for now - could be from composable later)
const username = 'xoyo24'
const userInitials = computed(() => {
  return username.slice(0, 2).toUpperCase()
})

// Handlers
const handleSettingsClick = () => {
  isOpen.value = false
  emit('navigate-to-settings')
}

const handleHistoryClick = () => {
  isOpen.value = false
  emit('navigate-to-history')
}

const handleThemeToggle = () => {
  const { $colorMode } = useNuxtApp()
  $colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'
  isOpen.value = false
}
</script>