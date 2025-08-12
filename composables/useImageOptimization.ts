import { nextTick, onMounted, readonly, ref } from 'vue'

export const useImageOptimization = () => {
  // Create optimized image loading with lazy loading and proper sizing
  const createOptimizedImage = (src: string, alt: string, options: {
    lazy?: boolean
    width?: number
    height?: number
    quality?: number
  } = {}) => {
    const {
      lazy = true,
      width,
      height,
      quality = 80
    } = options

    // For now, return standard img attributes
    // In production, this could integrate with image optimization services
    const imgProps = {
      src,
      alt,
      loading: lazy ? 'lazy' as const : 'eager' as const,
      decoding: 'async' as const,
      style: {
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` })
      }
    }

    return imgProps
  }

  // Preload critical images
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  // Lazy load images with intersection observer
  const lazyLoadImages = () => {
    if (typeof window === 'undefined') return

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })

    return imageObserver
  }

  return {
    createOptimizedImage,
    preloadImage,
    lazyLoadImages
  }
}

// WebP support detection
export const useWebPSupport = () => {
  const webpSupported = ref(false)

  const checkWebPSupport = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  onMounted(async () => {
    webpSupported.value = await checkWebPSupport()
  })

  return { webpSupported: readonly(webpSupported) }
}

// Image format optimization
export const useImageFormat = () => {
  const getOptimalFormat = (originalFormat: string, webpSupported: boolean): string => {
    if (webpSupported && originalFormat !== 'svg') {
      return 'webp'
    }
    return originalFormat
  }

  const getOptimalSrc = (baseSrc: string, webpSupported: boolean): string => {
    if (webpSupported && !baseSrc.endsWith('.svg')) {
      // Replace extension with .webp
      return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
    return baseSrc
  }

  return {
    getOptimalFormat,
    getOptimalSrc
  }
}