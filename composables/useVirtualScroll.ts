import { computed, nextTick, onMounted, onUnmounted, reactive, readonly, ref, watch, type Ref } from 'vue'

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number // Extra items to render for smoother scrolling
}

export const useVirtualScroll = <T>(
  items: Ref<T[]>,
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options
  
  // Reactive state
  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()
  
  // Computed values
  const visibleItemCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = computed(() => items.value.length * itemHeight)
  
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / itemHeight)
    return Math.max(0, index - overscan)
  })
  
  const endIndex = computed(() => {
    const index = Math.min(
      items.value.length - 1,
      startIndex.value + visibleItemCount + overscan * 2
    )
    return index
  })
  
  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
      item,
      index: startIndex.value + index,
      offsetY: (startIndex.value + index) * itemHeight
    }))
  })
  
  const offsetY = computed(() => startIndex.value * itemHeight)
  
  // Scroll handler
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }
  
  // Scroll to specific item
  const scrollToItem = (index: number) => {
    if (containerRef.value) {
      const targetScrollTop = index * itemHeight
      containerRef.value.scrollTop = targetScrollTop
    }
  }
  
  // Scroll to top
  const scrollToTop = () => scrollToItem(0)
  
  // Setup and cleanup
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })
  
  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })
  
  return {
    // Refs
    containerRef,
    
    // Computed data
    visibleItems: readonly(visibleItems),
    totalHeight: readonly(totalHeight),
    offsetY: readonly(offsetY),
    
    // Methods
    scrollToItem,
    scrollToTop,
    
    // State
    scrollTop: readonly(scrollTop),
    startIndex: readonly(startIndex),
    endIndex: readonly(endIndex)
  }
}

// Optimized list rendering composable
export const useOptimizedList = <T>(
  items: Ref<T[]>,
  options: {
    itemHeight?: number
    maxVisibleItems?: number
    enableVirtualScroll?: boolean
  } = {}
) => {
  const {
    itemHeight = 60,
    maxVisibleItems = 50,
    enableVirtualScroll = true
  } = options
  
  const shouldUseVirtualScroll = computed(() => 
    enableVirtualScroll && items.value.length > maxVisibleItems
  )
  
  const optimizedItems = computed(() => {
    if (!shouldUseVirtualScroll.value) {
      return items.value.map((item, index) => ({ item, index, offsetY: 0 }))
    }
    
    // If we're using virtual scrolling, this will be overridden
    return items.value.slice(0, maxVisibleItems).map((item, index) => ({
      item,
      index,
      offsetY: index * itemHeight
    }))
  })
  
  return {
    shouldUseVirtualScroll: readonly(shouldUseVirtualScroll),
    optimizedItems: readonly(optimizedItems),
    itemHeight
  }
}

// Performance-focused list item component helper
export const useListItemOptimization = () => {
  // Debounced update to prevent excessive re-renders
  const debounceUpdate = (fn: Function, delay = 16) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }
  
  // Memoization for expensive computations
  const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map()
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  }
  
  return {
    debounceUpdate,
    memoize
  }
}