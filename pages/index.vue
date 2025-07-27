<template>
  <!-- Unified Layout for All Devices -->
  <ClientOnly>
    <template #default>
      <UnifiedDashboard />
    </template>
    
    <template #fallback>
      <!-- SSR-Safe Loading State -->
      <div class="min-h-screen bg-background">
        <div class="flex items-center justify-center min-h-screen">
          <div class="animate-pulse space-y-4 w-full max-w-md px-4">
            <!-- Loading skeleton -->
            <div class="h-4 bg-muted rounded w-3/4"></div>
            <div class="h-12 bg-muted rounded"></div>
            <div class="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Dashboard - Flowductiv',
  meta: [{ name: 'description', content: 'Track your productivity with AI-enhanced insights' }],
})
</script>