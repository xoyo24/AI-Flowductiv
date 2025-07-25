<template>
  <div class="flex space-x-1" :class="containerClass">
    <button 
      v-for="filter in filters"
      :key="filter.value"
      :class="getButtonClass(filter.value)"
      @click="$emit('update:modelValue', filter.value)"
      :data-testid="`filter-${filter.value}`"
    >
      {{ filter.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Filter {
  value: string
  label: string
}

interface Props {
  modelValue: string
  filters: Filter[]
  size?: 'sm' | 'md'
  containerClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  containerClass: ''
})

defineEmits<Emits>()

const getButtonClass = (value: string) => {
  const baseClass = 'font-medium rounded-md transition-colors'
  const sizeClass = props.size === 'sm' 
    ? 'px-3 py-1.5 text-xs' 
    : 'px-4 py-2 text-sm'
  
  const activeClass = props.modelValue === value
    ? 'bg-primary text-primary-foreground'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
  
  return `${baseClass} ${sizeClass} ${activeClass}`
}
</script>