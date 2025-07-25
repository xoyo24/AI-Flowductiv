<template>
  <div class="space-y-4">
    <!-- Filter Tabs -->
    <div class="sticky top-0 bg-background" :class="filterContainerClass">
      <FilterTabs 
        v-model="activeFilter"
        :filters="filterOptions"
        :size="isMobile ? 'sm' : 'md'"
      />
    </div>

    <!-- Activity List -->
    <div :class="contentClass">
      <ActivityList :filter="activeFilter" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isMobile?: boolean
  filterContainerClass?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false,
  filterContainerClass: 'border-b border-border px-4 py-3',
  contentClass: 'p-4'
})

const activeFilter = ref('all')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' }
]
</script>