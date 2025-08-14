// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-23',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    // '@nuxtjs/supabase', // Disabled for Phase 0 - local SQLite only
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    // 'nuxt-security', // Temporarily disabled due to configuration issues
    ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module'] : []),
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false, // Disable for faster dev startup
  },

  runtimeConfig: {
    // Private keys (only available on server-side) - for Phase 1A
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,

    // Public keys (exposed to client-side)
    public: {
      // Supabase disabled for Phase 0 - using local SQLite only
      // supabaseUrl: process.env.SUPABASE_URL,
      // supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },

  // supabase: {/
  //   redirectOptions: {
  //     login: '/auth/login',
  //     callback: '/auth/callback',
  //     exclude: ['/']
  //   }
  // },

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    manifest: {
      name: 'Flowductiv',
      short_name: 'Flowductiv',
      description: 'AI-enhanced productivity tracking',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },

  experimental: {
    typedPages: true,
  },

  // Performance optimizations
  vite: {
    build: {
      rollupOptions: {
        // Enable tree shaking
        treeshake: true,
        output: {
          manualChunks: {
            // Separate Chart.js into its own chunk
            'chart': ['chart.js', 'vue-chartjs'],
            // Separate large icon library  
            'icons': ['lucide-vue-next'],
            // AI providers in separate chunk
            'ai-providers': ['@ai-sdk/anthropic', '@ai-sdk/openai', '@ai-sdk/google'],
            // Vue ecosystem
            'vue-vendor': ['vue', '@vue/runtime-core', '@vue/runtime-dom']
          }
        }
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
      exclude: ['chart.js', 'vue-chartjs'] // Lazy load these heavy deps
    }
  },


  // Nitro configuration for clean development
  nitro: {
    experimental: {
      wasm: false,
    },
    preset: process.env.NITRO_PRESET || (process.env.NODE_ENV === 'production' ? 'vercel' : 'node-server'),
  },
})
