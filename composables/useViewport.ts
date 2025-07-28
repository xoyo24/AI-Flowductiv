import { computed, onMounted, onUnmounted, ref } from 'vue'

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

  // Touch device detection
  const isTouchDevice = computed(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Smartphone detection (always mobile regardless of orientation)
  const isSmartphone = computed(() => {
    return screenWidth.value <= 480 || (screenWidth.value <= 896 && screenHeight.value <= 500)
  })

  // Mobile layout logic: smartphones always + tablets in portrait
  const isMobile = computed(() => {
    // Always mobile for smartphones
    if (isSmartphone.value) return true

    // Tablets in portrait mode
    if (screenWidth.value >= 481 && screenHeight.value > screenWidth.value) return true

    return false
  })

  // Desktop layout logic: tablets in landscape + desktop screens
  const isDesktop = computed(() => !isMobile.value)

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
    isDesktop: readonly(isDesktop),
  }
}
