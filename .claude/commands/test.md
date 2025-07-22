# Test Command

Generate tests following co-located structure and Vue.js best practices from `docs/TESTING_STRATEGY.md`.

## Testing Philosophy
**Test user behavior, not implementation details:**
- ✅ Test what users see and do, public interfaces, outcomes
- ❌ Test internal state, implementation details, framework internals

## Co-located Test Structure
- **Unit Tests**: Next to source (e.g., `composables/useTimer.test.ts`)
- **Component Tests**: Next to components (e.g., `components/TimerSection.test.ts`)  
- **E2E Tests**: Centralized in `tests/e2e/`

## Required Patterns
- `data-testid` for reliable element selection
- `mountSuspended()` + `mockNuxtImport()` for Nuxt 3 components
- Meaningful assertions (no `expect(true).toBe(true)`)
- Test user interactions and outcomes

## Commands
- `bun run test:unit:run` - All unit tests (91 tests, ~2s)
- `bun run test:composables:run` - Composable tests (45 tests)
- `bun run test:services:run` - Service tests (31 tests)
- `bun run test:e2e` - End-to-end workflows