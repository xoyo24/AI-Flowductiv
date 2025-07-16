// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/supabase', // Disabled for Phase 0 - local SQLite only
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false // Disable for faster dev startup
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
    }
  },

  // supabase: {
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
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
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
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },

  experimental: {
    typedPages: true
  },

  // Nitro configuration for clean development
  nitro: {
    experimental: {
      wasm: false
    }
  }
})