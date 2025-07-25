<template>
  <header class="border-b border-border bg-card" :class="headerClass">
    <div class="flex items-center justify-between" :class="contentClass">
      <h1 class="font-semibold text-foreground" :class="titleClass">{{ title }}</h1>
      
      <!-- Back button for mobile -->
      <button 
        v-if="showBackButton"
        @click="navigateBack"
        class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        :data-testid="backButtonTestId"
      >
        <X class="w-5 h-5" />
      </button>
      
      <!-- Custom actions slot -->
      <div v-else-if="$slots.actions">
        <slot name="actions" />
      </div>
      
      <!-- Desktop brand -->
      <div v-else-if="showBrand" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-primary-foreground font-bold text-sm">F</span>
        </div>
        <span class="text-xl font-semibold text-foreground">{{ title }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  title: string
  showBackButton?: boolean
  showBrand?: boolean
  backButtonTestId?: string
  headerClass?: string
  contentClass?: string
  titleClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
  showBrand: false,
  backButtonTestId: 'back-button',
  headerClass: 'px-4 py-3',
  contentClass: '',
  titleClass: 'text-lg'
})

const navigateBack = () => {
  navigateTo('/')
}
</script>