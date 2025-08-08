<template>
  <div>
    <!-- Analytics Dialog -->
    <AnalyticsDialog 
      :is-open="showAnalyticsDialog" 
      @close="closeAnalyticsDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AnalyticsDialog from './AnalyticsDialog.vue'

interface Props {
  compact?: boolean
  mobileMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  mobileMode: false,
})

// UI State
const showAnalyticsDialog = ref(false)

// Dialog management
const openAnalyticsDialog = () => {
  showAnalyticsDialog.value = true
}

const closeAnalyticsDialog = () => {
  showAnalyticsDialog.value = false
}

// Expose methods for parent components
defineExpose({
  openAnalyticsDialog
})
</script>