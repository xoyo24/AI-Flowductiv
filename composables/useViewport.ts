import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useViewport = () => {
  const screenWidth = ref(0)
  const screenHeight = ref(0)

  const updateDimensions = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  // Mobile breakpoint (matches Tailwind's default)
  const isMobile = computed(() => screenWidth.value < 768)
  
  // Touch device detection
  const isTouchDevice = computed(() => {
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