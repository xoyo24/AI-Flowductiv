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

## 📁 **File Structure & Naming Conventions**

```
tests/
├── unit/                   # Fast, isolated logic tests
│   ├── services/          # Business logic testing
│   └── components/        # Component unit tests (pure logic only)
├── integration/            # Component + composable integration tests
│   ├── components/        # Component integration tests
│   └── composables/       # Composable integration tests (includes unit logic)
├── e2e/                   # End-to-end user workflows
│   └── workflows/         # Complete user flows
├── helpers/               # Test utilities and mocks
│   ├── apiMocks.ts       # Simple API mocking utilities
│   └── testDatabase.ts   # Test database setup
└── setup.ts              # Global test setup
```

**Simplified Structure Benefits:**
- **📁 Consolidated composable tests**: Both unit logic and integration in `tests/integration/composables/`
- **🎯 No redundant API tests**: Removed separate API tests, covered in composable integration tests
- **⚡ Faster execution**: Eliminated duplicate test coverage
- **🔧 Simpler mocking**: Direct `vi.fn()` approach instead of complex helpers

**Naming Convention**: `[module].test.ts` (folder indicates test type)
- `tests/integration/composables/useTimer.test.ts` - Integration + unit tests for useTimer composable
- `tests/integration/components/TimerSection.test.ts` - Integration test for TimerSection component
- `tests/e2e/timer-workflow.test.ts` - E2E test for timer workflow

**Benefits of Folder-Based Organization:**
- **🎯 Clear Intent** - Folder name indicates test type, no redundant suffixes
- **⚡ Fast Feedback** - Run `bun test:unit` for quick development cycles
- **🔧 Targeted Testing** - Run specific test types as needed
- **📁 Clean Names** - Simpler file names without type suffixes

## 🛠️ **Testing Standards & Patterns**

### **Component Testing Patterns**

```typescript
// Standard component test structure
describe('ComponentName', () => {
  describe('User Interactions', () => {
    it('should handle user action correctly', async () => {
      // Arrange: Set up component
      const wrapper = mount(Component, { props: { ... } })
      
      // Act: Simulate user action
      await wrapper.find('[data-testid="action-button"]').trigger('click')
      
      // Assert: Verify expected outcome
      expect(wrapper.emitted('action-performed')).toBeTruthy()
    })
  })
  
  describe('Props & Rendering', () => {
    it('should display correct content based on props', () => {
      const wrapper = mount(Component, {
        props: { title: 'Test Title' }
      })
      expect(wrapper.text()).toContain('Test Title')
    })
  })
})
```

### **Integration Testing Patterns**

#### **Simplified Mocking Approach**
```typescript
// Simple, direct mocking following Vue Test Utils best practices
import { vi } from 'vitest'

const mockFetch = vi.fn()
globalThis.$fetch = mockFetch

describe('useActivities Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })
  
  it('should save activity and update local state', async () => {
    // Simple mock setup
    mockFetch.mockResolvedValue({ 
      data: { id: 'test-1', title: 'Work', durationMs: 1800000 } 
    })
    
    const { saveActivity, activities } = useActivities()
    
    await saveActivity({ title: 'Work', durationMs: 1800000 })
    
    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/activities', {
      method: 'POST',
      body: expect.objectContaining({ title: 'Work' })
    })
    
    // Test real Vue reactivity
    expect(activities.value).toHaveLength(1)
    expect(activities.value[0].title).toBe('Work')
  })
})
```

#### **Consolidated Testing Approach**
```typescript
// Combine unit logic tests with integration tests in same file
describe('useActivities - Comprehensive Tests', () => {
  // Integration tests with API mocking
  describe('API Integration', () => {
    it('should handle API calls correctly', async () => {
      // Test with mocked API...
    })
  })
  
  // Pure logic tests (former unit tests)
  describe('Utility Functions', () => {
    it('should format duration correctly', () => {
      const { formatDuration } = useActivities()
      expect(formatDuration(90000)).toBe('1m 30s')
    })
  })
  
  // Reactive state logic tests
  describe('State Management', () => {
    it('should handle reactive state correctly', () => {
      // Test Vue reactivity without API calls...
    })
  })
})
```

#### **API Logic Tests**
```typescript
// Test API logic directly, no HTTP layer
import { createActivity } from '~/server/api/activities.post'

describe('Activities API Logic', () => {
  beforeEach(async () => {
    await setupTestDatabase()
  })
  
  it('should create activity in database', async () => {
    const result = await createActivity({
      title: 'Test Activity',
      durationMs: 1800000
    })
    
    expect(result.data.title).toBe('Test Activity')
    
    // Verify in test database
    const saved = await getActivityById(result.data.id)
    expect(saved.title).toBe('Test Activity')
  })
})
```

### **E2E Testing Patterns**

```typescript
// Standard E2E test structure
test.describe('Timer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  
  test('complete timer session', async ({ page }) => {
    // Start timer
    await page.fill('[data-testid="activity-input"]', 'Work task')
    await page.click('[data-testid="start-timer"]')
    
    // Verify timer is running
    await expect(page.locator('[data-testid="timer-status"]')).toContainText('Running')
    
    // Finish timer
    await page.click('[data-testid="finish-timer"]')
    
    // Verify activity is saved
    await expect(page.locator('[data-testid="activity-list"]')).toContainText('Work task')
  })
})
```

## 🚀 **Performance & Quality Standards**

### **Test Execution Performance**
- **Unit Tests**: < 10ms per test
- **Component Tests**: < 100ms per test
- **Integration Tests**: < 500ms per test
- **E2E Tests**: < 5s per test
- **Full Test Suite**: < 30s total

### **Test Quality Metrics**
- **Coverage Target**: 75% for critical paths
- **Test Reliability**: > 99% pass rate
- **Flaky Test Tolerance**: < 1%
- **Test Maintenance**: Update with feature changes

## 🔧 **Configuration & Setup**

### **Test Environment Variables**
```typescript
// tests/setup.ts
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.AI_PROVIDER = 'mock'
```

### **Simplified Mock Strategy**

**Integration Tests** (Primary approach - covers both unit and integration concerns):
- **External APIs**: Mock $fetch using simple `vi.fn()` approach
- **Browser APIs**: Use setup.ts global mocks (localStorage, etc.)
- **Internal Composables**: Use real composables (useTimer, useActivities, etc.)
- **Vue Reactivity**: Use real Vue reactivity system
- **Pure Functions**: Test directly without mocking

**Unit Tests** (Only for isolated services/utilities):
- **External Dependencies**: Mock everything external
- **Focus**: Pure business logic without Vue dependencies

**E2E Tests**: Real everything
- **APIs**: Real server with real endpoints
- **Database**: Real test database
- **Browser**: Real browser environment

**Key Simplification**: Consolidate most testing into integration tests that combine unit logic testing with API integration, reducing test file duplication and maintenance overhead.

### **Data Test IDs**
All interactive elements must include `data-testid` attributes:
```vue
<button data-testid="start-timer" @click="startTimer">
  Start Timer
</button>
```

## 📈 **Continuous Integration**

### **Pre-commit Hooks**
- Run linting (Biome)
- Run unit tests
- Check TypeScript compilation

### **CI/CD Pipeline**
1. **Lint Check**: `bun run lint` - Biome linting
2. **Unit Tests**: `bun test:unit` - Fast isolated logic tests
3. **Integration Tests**: `bun test:integration` - Component and API tests
4. **Build Check**: `bun run build` - Nuxt build verification
5. **E2E Tests**: `bun test:e2e` - Full workflow tests
6. **Coverage Report**: `bun test:coverage` - Generate and upload coverage

### **Available Test Commands**
- `bun test` - Run all Vitest tests (unit + integration, excludes E2E)
- `bun test:unit` - Run only unit tests (`tests/unit/`)
- `bun test:integration` - Run only integration tests (`tests/integration/`)
- `bun test:component` - Run only component integration tests
- `bun test:e2e` - Run E2E tests with Playwright
- `bun test:all` - Run complete test suite (unit + integration + e2e)

**Simplified Workflow**:
- **Development**: `bun test tests/integration/composables/` - Fast feedback for composable changes
- **CI/CD**: `bun test` → `bun test:e2e` - Complete validation pipeline

## 🐛 **Debugging & Troubleshooting**

### **Common Testing Issues**
- **Async/Await**: Always await user interactions and API calls
- **Vue Reactivity**: Use `nextTick()` when testing reactive updates
- **Timer Testing**: Use `vi.useFakeTimers()` for time-dependent tests
- **Component Cleanup**: Ensure proper component unmounting

### **Test Debugging Tools**
- **Vitest UI**: `bun test:ui` for interactive debugging
- **Playwright Inspector**: `npx playwright test --debug`
- **Vue DevTools**: Available in test environment

## 📚 **Resources & References**

- [Vue.js Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

**Remember**: Good tests are like good documentation - they explain what the application should do from a user's perspective, not how it works internally.