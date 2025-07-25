<template>
  <button 
    @click="$emit('click')"
    :class="buttonClass"
    v-bind="$attrs"
  >
    <div class="text-sm font-medium" :class="titleClass">{{ title }}</div>
    <div v-if="description" class="text-xs text-muted-foreground mt-1">{{ description }}</div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

defineEmits<Emits>()

const buttonClass = computed(() => 
  `w-full text-left px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors ${
    props.variant === 'destructive' ? 'text-destructive' : ''
  }`
)

const titleClass = computed(() => 
  props.variant === 'destructive' ? 'text-destructive' : ''
)
</script>