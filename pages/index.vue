<template>
  <!-- Responsive Layout with Hydration-Safe Detection -->
  <ClientOnly>
    <template #default>
      <!-- Mobile Layout -->
      <div v-if="isMobile" class="min-h-screen bg-background">
        <TimerSectionMobile />
      </div>

      <!-- Desktop Layout -->
      <div v-else class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <h1 class="text-xl font-semibold text-foreground">Flowductiv</h1>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-muted-foreground">Phase 1B - Mobile</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Timer Section -->
        <div class="lg:col-span-2">
          <TimerSection />
          <div class="mt-6">
            <ActivityList />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <DailySummary />
          <QuickStats />
        </div>
      </div>
    </main>
      </div>
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
// Responsive detection
const { isMobile } = useViewport()

// Page metadata
useHead({
  title: 'Dashboard - Flowductiv',
  meta: [{ name: 'description', content: 'Track your productivity with AI-enhanced insights' }],
})
</script>