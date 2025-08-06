<template>
  <div id="app" class="bg-background min-h-screen">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Global app configuration
useHead({
  title: 'Flowductiv',
  meta: [
    { name: 'description', content: 'Privacy-first, AI-enhanced productivity tool' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

// Initialize color mode - let the module handle HTML class updates
const _colorMode = useColorMode({
  preference: 'dark',
  fallback: 'dark',
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>