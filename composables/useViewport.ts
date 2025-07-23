import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useViewport = () => {
  // Default to desktop during SSR, will update on client
  const screenWidth = ref(1024)
  const screenHeight = ref(768)

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
    }
  }

  // Mobile breakpoint (matches Tailwind's default)
  const isMobile = computed(() => screenWidth.value < 768)
  
  // Touch device detection
  const isTouchDevice = computed(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Tablet detection
  const isTablet = computed(() => {
    return screenWidth.value >= 768 && screenWidth.value < 1024
  })

  // Desktop detection
  const isDesktop = computed(() => screenWidth.value >= 1024)

  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return {
    screenWidth: readonly(screenWidth),
    screenHeight: readonly(screenHeight),
    isMobile: readonly(isMobile),
    isTouchDevice: readonly(isTouchDevice),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop)
  }
}