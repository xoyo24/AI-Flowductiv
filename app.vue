<template>
  <div id="app" class="bg-gray-50 min-h-screen">
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

// Force light mode for Flomo-inspired design consistency
const colorMode = useColorMode({
  preference: 'light',
  fallback: 'light',
})

// Ensure components respect light mode
useHead({
  htmlAttrs: {
    'data-theme': 'light',
    class: 'light'
  }
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Force light mode theme variables for Flomo-inspired design */
:root {
  --color-background: 249 250 251; /* gray-50 */
  --color-foreground: 17 24 39; /* gray-900 */
  --color-card: 255 255 255; /* white */
  --color-card-foreground: 17 24 39; /* gray-900 */
  --color-popover: 255 255 255; /* white */
  --color-popover-foreground: 17 24 39; /* gray-900 */
  --color-primary: 59 130 246; /* blue-500 */
  --color-primary-foreground: 255 255 255; /* white */
  --color-secondary: 243 244 246; /* gray-100 */
  --color-secondary-foreground: 17 24 39; /* gray-900 */
  --color-muted: 243 244 246; /* gray-100 */
  --color-muted-foreground: 107 114 128; /* gray-500 */
  --color-accent: 243 244 246; /* gray-100 */
  --color-accent-foreground: 17 24 39; /* gray-900 */
  --color-destructive: 239 68 68; /* red-500 */
  --color-destructive-foreground: 255 255 255; /* white */
  --color-border: 229 231 235; /* gray-200 */
  --color-input: 229 231 235; /* gray-200 */
  --color-ring: 59 130 246; /* blue-500 */
}

/* Force these variables even in dark mode */
html.dark {
  --color-background: 249 250 251; /* gray-50 */
  --color-foreground: 17 24 39; /* gray-900 */
  --color-card: 255 255 255; /* white */
  --color-card-foreground: 17 24 39; /* gray-900 */
  --color-popover: 255 255 255; /* white */
  --color-popover-foreground: 17 24 39; /* gray-900 */
  --color-primary: 59 130 246; /* blue-500 */
  --color-primary-foreground: 255 255 255; /* white */
  --color-secondary: 243 244 246; /* gray-100 */
  --color-secondary-foreground: 17 24 39; /* gray-900 */
  --color-muted: 243 244 246; /* gray-100 */
  --color-muted-foreground: 107 114 128; /* gray-500 */
  --color-accent: 243 244 246; /* gray-100 */
  --color-accent-foreground: 17 24 39; /* gray-900 */
  --color-destructive: 239 68 68; /* red-500 */
  --color-destructive-foreground: 255 255 255; /* white */
  --color-border: 229 231 235; /* gray-200 */
  --color-input: 229 231 235; /* gray-200 */
  --color-ring: 59 130 246; /* blue-500 */
}
</style>