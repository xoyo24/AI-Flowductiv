# Fix Component Tests

Fix failing component tests using Vue Test Utils + Nuxt 3 patterns.

## Requirements

1. **Use proper Nuxt 3 testing patterns**:
   - `mountSuspended()` instead of `mount()` for Nuxt components
   - `mockNuxtImport()` at top level to mock auto-imported composables
   - Test environment with `@nuxt/test-utils/runtime`

2. **Test user behavior, not implementation**:
   - Test what users see and interact with
   - Use `data-testid` attributes for reliable element selection
   - Verify emitted events and rendered content
   - Test all component states (loading, error, success, empty)

3. **Follow established mocking patterns**:
   ```typescript
   // Mock at top level, outside describe blocks
   let mockActivities = ref([])
   let mockLoading = ref(false)
   
   mockNuxtImport('useActivities', () => {
     return () => ({
       activities: mockActivities,
       loading: mockLoading,
       // ... other properties
     })
   })
   
   // Reset in beforeEach
   beforeEach(() => {
     mockActivities.value = []
     mockLoading.value = false
   })
   ```

4. **Test categories to cover**:
   - User interactions (clicks, form inputs)
   - Component rendering with different props
   - Error states and edge cases
   - Accessibility attributes (ARIA, semantic structure)
   - Emitted events

5. **Never use `expect(true).toBe(true)` or similar meaningless assertions**

6. **Reference patterns** from existing working tests:
   - `tests/integration/components/ActivityList.test.ts`
   - `tests/integration/components/DailySummary.test.ts`
   - `tests/integration/components/SuggestionDropdown.test.ts`

7. **Run tests with**: `bun run vitest run [test-file]` to verify fixes