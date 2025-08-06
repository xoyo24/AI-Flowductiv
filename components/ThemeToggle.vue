<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    data-testid="theme-toggle"
  >
    <Sun v-if="isDark" class="w-5 h-5" />
    <Moon v-else class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode({
  preference: 'dark',
  fallback: 'dark',
})

const _isDark = computed(() => colorMode.value === 'dark')

const _toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>