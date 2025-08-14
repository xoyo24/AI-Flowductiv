<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Flowductiv
        </h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Personal productivity workspace
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="password" class="sr-only">
            Access Code
          </label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="relative block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Enter access code"
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center rounded-lg bg-primary py-2 px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Verifying...</span>
            <span v-else>Access Workspace</span>
          </button>
        </div>

        <div v-if="error" class="text-sm text-destructive text-center">
          {{ error }}
        </div>
      </form>

      <div class="text-xs text-muted-foreground text-center">
        This is a private workspace. Access is restricted to authorized users only.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple password protection for personal use
const password = ref('')
const loading = ref(false)
const error = ref('')

// Set page meta
definePageMeta({
  layout: false,
})

// Simple password check (you can customize this)
const ACCESS_CODE = 'flowductiv2024' // Change this to your preferred password

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  // Simulate network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500))

  if (password.value === ACCESS_CODE) {
    // Store auth state
    sessionStorage.setItem('flowductiv-auth', 'authenticated')
    
    // Redirect to home
    await navigateTo('/')
  } else {
    error.value = 'Invalid access code'
    password.value = ''
  }

  loading.value = false
}

// Clear any existing error when user types
watch(password, () => {
  if (error.value) {
    error.value = ''
  }
})
</script>