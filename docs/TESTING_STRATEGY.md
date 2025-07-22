# Flowductiv Testing Strategy

> **Vue.js best practices for comprehensive testing coverage**

## 🎯 **Testing Philosophy**

Following Vue.js official testing guidelines, our testing strategy focuses on:
- **Test user behavior, not implementation details**
- **Test public interfaces, not internal state**
- **Write tests that resemble how users interact with the application**
- **Maintain fast, reliable test execution**

## 📋 **Three-Layer Testing Architecture**

### **1. Unit Testing (Vitest)**
**Purpose**: Test isolated logic and utilities
**Tools**: Vitest
**Target**: Business logic, utilities, pure functions

```typescript
// ✅ Good: Test behavior
it('should format time correctly for user display', () => {
  expect(formatTime(90000)).toBe('01:30')
})

// ❌ Bad: Test implementation
it('should call Math.floor internally', () => {
  const spy = vi.spyOn(Math, 'floor')
  formatTime(90000)
  expect(spy).toHaveBeenCalled()
})
```

### **2. Component Testing (Vitest + Vue Test Utils)**
**Purpose**: Test component behavior and user interactions
**Tools**: Vitest + Vue Test Utils + jsdom
**Target**: Component rendering, user events, props/emits

```typescript
// ✅ Good: Test user interaction
it('should start timer when user clicks start button', async () => {
  const wrapper = mount(TimerSection)
  await wrapper.find('[data-testid="start-button"]').trigger('click')
  expect(wrapper.emitted('timer-started')).toBeTruthy()
})

// ❌ Bad: Test internal state
it('should set isRunning to true', () => {
  const wrapper = mount(TimerSection)
  wrapper.vm.isRunning = true
  expect(wrapper.vm.isRunning).toBe(true)
})
```

### **3. E2E Testing (Playwright)**
**Purpose**: Test complete user workflows
**Tools**: Playwright
**Target**: Multi-page flows, real browser interactions

```typescript
// ✅ Good: Test complete workflow
test('user can track time for an activity', async ({ page }) => {
  await page.fill('[data-testid="activity-input"]', 'Work on project #urgent')
  await page.click('[data-testid="start-timer"]')
  await page.waitForTimeout(1000)
  await page.click('[data-testid="finish-timer"]')
  await expect(page.locator('[data-testid="activity-list"]')).toContainText('Work on project')
})
```

## 🏗️ **Test Categories & Coverage Targets**

### **Critical Path Testing (80% Coverage)**
- Timer operations (start/pause/resume/finish)
- Activity CRUD operations
- Auto-complete suggestions system
- Data persistence and retrieval

### **User Interface Testing (70% Coverage)**
- Component rendering and interactions
- Form validation and error states
- Keyboard navigation and accessibility
- Mobile responsiveness

### **Integration Testing (60% Coverage)**
- API endpoint functionality
- Database operations
- AI integration flows
- Error handling and edge cases

## 📁 **Co-located Test Structure & Naming Conventions**

```
server/
├── api/
│   └── ai/
│       ├── daily-summary.post.ts
│       └── daily-summary.test.ts         # API integration tests
├── utils/
│   ├── focusTimeUtils.ts
│   ├── focusTimeUtils.test.ts           # Pure utility unit tests
│   ├── focusTimeCalculator.ts  
│   └── focusTimeCalculator.test.ts      # Database integration tests

composables/
├── useTimer.ts
├── useTimer.test.ts                     # Unit tests
├── useActivities.ts
└── useActivities.test.ts                # Unit tests

services/
├── ai/
│   ├── aiRouter.ts
│   ├── aiRouter.test.ts                 # Unit tests
│   ├── prompts.ts
│   └── prompts.test.ts                  # Unit tests
├── inputParser.ts
└── inputParser.test.ts                  # Unit tests

components/
├── ActivityList.vue
├── ActivityList.test.ts                 # Component integration tests
├── DailySummary.vue
└── DailySummary.test.ts                 # Component integration tests

tests/ (cross-cutting concerns only)
├── e2e/                                 # End-to-end workflows
├── helpers/                             # Test utilities and mocks
└── setup.ts                             # Global test setup
```

**Co-location Benefits:**
- **📁 Tests next to implementation** - Easy to find and maintain tests
- **🎯 Clear separation** - Server vs client test concerns naturally separated  
- **⚡ Focused development** - Test specific modules in isolation
- **🔧 Logical organization** - Tests follow the same structure as source code
- **📦 Module cohesion** - Tests and implementation evolve together

**Naming Convention**: `[module].test.ts` (co-located with source)
- `composables/useTimer.test.ts` - Unit tests for useTimer composable
- `server/api/ai/daily-summary.test.ts` - Integration test for API endpoint
- `services/ai/aiRouter.test.ts` - Unit test for aiRouter service

## 🛠️ **Testing Standards**

### **Required Patterns**
- **User Behavior Focus**: Test what users see and do, not implementation
- **Reliable Selection**: Use `data-testid` attributes for element targeting
- **Meaningful Assertions**: No `expect(true).toBe(true)` - test actual behavior
- **Proper Cleanup**: `beforeEach()` for mock resets and component cleanup

### **Three-Layer Implementation**
1. **Integration Tests**: Primary approach combining unit logic + API integration
2. **Component Tests**: User interactions with `mountSuspended()` + `mockNuxtImport()`  
3. **E2E Tests**: Complete workflows with Playwright for critical paths

## 🚀 **Performance & Quality Standards**

### **Test Execution Performance**
- **Unit Tests**: < 10ms per test
- **Component Tests**: < 100ms per test
- **Integration Tests**: < 500ms per test
- **E2E Tests**: < 5s per test
- **Full Test Suite**: < 30s total

### **Test Quality Metrics**
- **Coverage Target**: 75% for critical paths (timer, activities, API)
- **Test Reliability**: > 99% pass rate
- **Flaky Test Tolerance**: < 1%
- **Test Maintenance**: Update with feature changes

### **Critical Testing Constraints**
- **Never use `expect(true).toBe(true)`** or similar meaningless assertions
- **Never skip tests** - ask for guidance when stuck on implementation
- **Always commit verified changes** - tests must pass before commits
- **Use `--run` flag** with test commands for CI/automation (prevents watch mode)

## 🔧 **Configuration**

### **Mock Strategy**
- **Integration Tests**: Mock $fetch with `vi.fn()`, use real Vue composables
- **Component Tests**: `mockNuxtImport()` for composables, `mountSuspended()` for components
- **E2E Tests**: Real APIs, database, and browser environment

### **Test Commands**
- `bun run test:unit:run` - All unit tests (91 tests, ~2s)
- `bun run test:composables:run` - Composable tests only (45 tests)
- `bun run test:services:run` - Service tests only (31 tests)
- `bun run test:server:run` - Server utility tests only (15 tests)
- `bun run test:integration:run` - Integration tests (API + components)
- `bun run test:e2e` - End-to-end workflows
- `bun run test:all` - All tests (unit + integration)

### **CI/CD Pipeline**
1. `bun run lint` - Biome linting
2. `bun run test:unit:run` - Unit tests (fast feedback)
3. `bun run test:integration:run` - Integration tests (when fixed)
4. `bun run build` - TypeScript compilation

## 🚧 **Known Issues & Future Improvements**

### **Integration Test Environment Issues**
Current integration tests are experiencing technical issues that need dedicated setup time:

**Component Integration Tests:**
- **Issue**: `Cannot find package '#imports'` - Nuxt auto-imports compatibility
- **Cause**: @nuxt/test-utils runtime environment setup 
- **Impact**: Component + composable integration tests failing
- **Workaround**: Unit tests cover composable logic, E2E covers UI workflows

**Server Integration Tests:**
- **Issue**: `better-sqlite3 ABI version mismatch` - Node.js/Bun compatibility
- **Cause**: Native module compiled for different Node.js version
- **Impact**: Database integration tests failing
- **Workaround**: Unit tests with mocked dependencies work correctly

**API Integration Tests:**
- **Issue**: `The service was stopped: write EPIPE` - ESBuild service crashes
- **Cause**: Vite/ESBuild process management in test environment
- **Impact**: Full API endpoint testing limited

### **Future Integration Test Improvements**
1. **Database Setup**: Configure proper test database with migrations
2. **Environment Config**: Fix Nuxt test environment for component integration
3. **Native Dependencies**: Resolve better-sqlite3 ABI compatibility 
4. **CI Pipeline**: Enable integration tests in automated testing

### **Future Unit Test Additions**
1. **AI Provider Classes**: Add comprehensive unit tests for:
   - `services/ai/providers/claude.ts` - API interaction patterns, error handling
   - `services/ai/providers/openai.ts` - Response formatting, health checks
2. **Complex Composables**: Full testing for `useAISettings` when mock environment supports:
   - useLocalStorage integration, dynamic imports, Vue lifecycle hooks

**Current Status**: Unit tests (90 passing) + E2E tests provide solid coverage for Phase 1B.

---

**Remember**: Good tests are like good documentation - they explain what the application should do from a user's perspective, not how it works internally.