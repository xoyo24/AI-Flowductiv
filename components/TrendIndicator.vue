<template>
  <div class="flex items-center space-x-1">
    <component 
      :is="trendIcon" 
      :class="{
        'w-3 h-3': true,
        'text-green-500': isPositive,
        'text-red-500': isNegative,
        'text-muted-foreground': isNeutral
      }" 
    />
    <span 
      :class="{
        'text-green-500': isPositive,
        'text-red-500': isNegative,
        'text-muted-foreground': isNeutral
      }"
    >
      {{ formattedChange }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Minus, TrendingDown, TrendingUp } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  current: number
  previous: number
  format?: 'number' | 'percentage' | 'duration' | 'decimal'
  showSign?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number',
  showSign: true,
})

const { formatDuration } = useActivities()

// Calculate change
const change = computed(() => props.current - props.previous)
const percentChange = computed(() => {
  if (props.previous === 0) return props.current > 0 ? 100 : 0
  return ((props.current - props.previous) / props.previous) * 100
})

// Determine trend direction
const isPositive = computed(() => change.value > 0)
const isNegative = computed(() => change.value < 0)
const isNeutral = computed(() => change.value === 0)

// Select appropriate icon
const trendIcon = computed(() => {
  if (isPositive.value) return TrendingUp
  if (isNegative.value) return TrendingDown
  return Minus
})

// Format the change value
const formattedChange = computed(() => {
  const abs = Math.abs(change.value)
  const sign = props.showSign && !isNeutral.value ? (isPositive.value ? '+' : '-') : ''

  switch (props.format) {
    case 'duration':
      return `${sign}${formatDuration(abs)}`
    case 'percentage':
      return `${sign}${Math.abs(percentChange.value).toFixed(1)}%`
    case 'decimal':
      return `${sign}${abs.toFixed(1)}`
    case 'number':
    default:
      return `${sign}${abs}`
  }
})
</script>