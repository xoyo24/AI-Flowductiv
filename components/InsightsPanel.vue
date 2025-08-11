<template>
  <div>
    <!-- Analytics Dialog -->
    <AnalyticsDialog 
      :is-open="showAnalyticsDialog" 
      @close="closeAnalyticsDialog"
      @open-settings="$emit('open-settings')"
      @view-ai-history="$emit('view-ai-history')"
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

interface Emits {
  (e: 'open-settings'): void
  (e: 'view-ai-history'): void
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  mobileMode: false,
})

const emit = defineEmits<Emits>()

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