<template>
  <div class="text-center space-y-3">
    <div 
      class="text-6xl timer-display font-bold text-foreground tracking-tight"
      data-testid="timer-display"
      aria-live="polite"
    >
      {{ formattedTime }}
    </div>
    
    <!-- Timer Status Indicator -->
    <div class="flex items-center justify-center space-x-2">
      <div 
        :class="{
          'w-2 h-2 rounded-full': true,
          'bg-green-500 animate-pulse': isRunning,
          'bg-yellow-500': isPaused,
          'bg-gray-400': !isRunning && !isPaused
        }"
        data-testid="timer-status"
      />
      <span class="text-xs text-muted-foreground">
        {{ timerStatus }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  formattedTime: string
  isRunning: boolean
  isPaused: boolean
}

const props = defineProps<Props>()

// Computed values
const timerStatus = computed(() => {
  if (props.isRunning) return 'Running'
  if (props.isPaused) return 'Paused'
  return 'Stopped'
})
</script>