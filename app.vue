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

// Force dark mode for Flomo-inspired design consistency
const colorMode = useColorMode({
  preference: 'dark',
  fallback: 'dark',
})

// Ensure components respect dark mode
useHead({
  htmlAttrs: {
    'data-theme': 'dark',
    class: 'dark'
  }
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Flomo-inspired dark theme with gray cards on near-black background */
:root,
html.dark,
html.light {
  --color-background: 10 10 10; /* near-black #0a0a0a */
  --color-foreground: 229 231 235; /* light gray text */
  --color-card: 26 26 26; /* dark gray cards #1a1a1a */
  --color-card-foreground: 229 231 235; /* light gray text on cards */
  --color-popover: 26 26 26; /* dark gray */
  --color-popover-foreground: 229 231 235; /* light gray text */
  --color-primary: 59 130 246; /* blue-500 for accents */
  --color-primary-foreground: 255 255 255; /* white */
  --color-secondary: 38 38 38; /* slightly lighter gray #262626 */
  --color-secondary-foreground: 163 163 163; /* medium gray text */
  --color-muted: 38 38 38; /* medium gray */
  --color-muted-foreground: 115 115 115; /* muted gray text #737373 */
  --color-accent: 38 38 38; /* medium gray */
  --color-accent-foreground: 229 231 235; /* light gray text */
  --color-destructive: 239 68 68; /* red-500 */
  --color-destructive-foreground: 255 255 255; /* white */
  --color-border: 38 38 38; /* dark gray borders #262626 */
  --color-input: 38 38 38; /* dark gray input background */
  --color-ring: 59 130 246; /* blue-500 for focus rings */
}

/* Force all elements to use the dark theme colors */
body, 
.bg-background { 
  background-color: rgb(10 10 10) !important; 
}

.bg-card { 
  background-color: rgb(26 26 26) !important; 
}

.text-foreground { 
  color: rgb(229 231 235) !important; 
}

.text-muted-foreground { 
  color: rgb(115 115 115) !important; 
}

.border-border { 
  border-color: rgb(38 38 38) !important; 
}
</style>