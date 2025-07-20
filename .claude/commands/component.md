# Generate Vue Component

Generate a Vue 3 component following Flowductiv patterns and best practices.

## Requirements

1. **Use `<script setup>` syntax**:
   ```vue
   <script setup lang="ts">
   interface Props {
     // Define props with TypeScript
   }
   
   interface Emits {
     (e: 'event-name', payload: Type): void
   }
   
   const props = defineProps<Props>()
   const emit = defineEmits<Emits>()
   </script>
   ```

2. **Follow shadcn-vue design patterns**:
   - Use existing UI components from `components/ui/`
   - Follow Tailwind CSS utility classes
   - Use consistent spacing and color schemes
   - Include proper hover/focus states

3. **Include data-testid attributes**:
   ```vue
   <button data-testid="action-button" @click="handleAction">
     Action
   </button>
   ```

4. **Use composables for business logic**:
   - Import and use existing composables (`useTimer`, `useActivities`, etc.)
   - Follow readonly state exposure pattern
   - Handle loading/error states appropriately

5. **Component structure**:
   ```vue
   <template>
     <!-- Semantic HTML with proper accessibility -->
   </template>
   
   <script setup lang="ts">
   // Imports
   // Props/Emits interfaces
   // Composables
   // Computed properties
   // Methods
   </script>
   
   <style scoped>
   /* Only if needed for component-specific styles */
   </style>
   ```

6. **Accessibility considerations**:
   - Use semantic HTML elements
   - Include ARIA attributes where needed
   - Ensure keyboard navigation support
   - Provide proper labels and descriptions

7. **TypeScript best practices**:
   - Define all interfaces explicitly
   - Use proper type annotations
   - Avoid `any` types
   - Export types if they're used elsewhere

8. **Reference existing components** for patterns:
   - `components/Timer/TimerSection.vue`
   - `components/Activity/ActivityList.vue`
   - `components/DailySummary.vue`