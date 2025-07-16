<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Global app configuration
useHead({
  title: 'Flowductiv',
  meta: [
    { name: 'description', content: 'Privacy-first, AI-enhanced productivity tool' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Enable dark mode support
const colorMode = useColorMode({
  preference: 'system',
  fallback: 'light'
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>