<template>
  <div class="space-y-6" :class="containerClass">
    <!-- AI Settings -->
    <SettingsSection title="AI Provider Settings">
      <AISettingsDropdown />
    </SettingsSection>

    <!-- Mobile-specific preferences -->
    <SettingsSection v-if="showMobilePreferences" title="Preferences">
      <div class="space-y-3">
        <SettingsToggle
          label="Haptic Feedback"
          :modelValue="hapticEnabled"
          @update:modelValue="hapticEnabled = $event"
          data-testid="haptic-toggle"
        />
        <SettingsToggle
          label="Auto-save Activities"
          :modelValue="autosaveEnabled"
          @update:modelValue="autosaveEnabled = $event"
          data-testid="autosave-toggle"
        />
      </div>
    </SettingsSection>

    <!-- Data Management -->
    <SettingsSection title="Data">
      <div class="space-y-3">
        <SettingsButton
          title="Export Data"
          description="Download your activity history"
          @click="exportData"
          data-testid="export-data"
        />
        <SettingsButton
          title="Clear All Data"
          description="Permanently delete all activities"
          variant="destructive"
          @click="clearData"
          data-testid="clear-data"
        />
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showMobilePreferences?: boolean
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showMobilePreferences: false,
  containerClass: ''
})

// Local state for preferences
const hapticEnabled = ref(true)
const autosaveEnabled = ref(true)

// Actions
const exportData = () => {
  // TODO: Implement data export
  console.log('Exporting data...')
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    // TODO: Implement data clearing
    console.log('Clearing data...')
  }
}
</script>