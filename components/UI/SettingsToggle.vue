<template>
  <div class="flex items-center justify-between py-2">
    <span class="text-sm text-foreground">{{ label }}</span>
    <button 
      @click="toggle"
      :class="toggleClass"
      v-bind="$attrs"
    >
      <div :class="indicatorClass"></div>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}

const toggleClass = computed(() => 
  `w-12 h-6 rounded-full relative transition-colors ${
    props.modelValue ? 'bg-primary' : 'bg-muted'
  }`
)

const indicatorClass = computed(() => 
  `w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
    props.modelValue ? 'right-0.5' : 'left-0.5'
  }`
)
</script>