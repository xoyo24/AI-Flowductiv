# Test Command

Generate tests following the three-layer testing strategy: Integration (primary), Component (user behavior), E2E (workflows).

## Testing Philosophy

**Test user behavior, not implementation details:**
- ✅ Test what users see and do, public interfaces, outcomes
- ❌ Test internal state, implementation details, framework internals

## Test Types

### **1. Integration Tests (Primary)**
**File**: `tests/integration/composables/[name].test.ts`
- API integration with `vi.fn()` mocks for `$fetch`
- Pure logic testing (utility functions)
- Vue reactivity state management
- Error handling and edge cases

### **2. Component Tests**  
**File**: `tests/integration/components/[name].test.ts`
- User interactions (`trigger('click')`, `setValue()`)
- Props and rendering behavior
- Keyboard shortcuts and accessibility
- Use `mountSuspended()` + `mockNuxtImport()`

### **3. E2E Tests**
**File**: `tests/e2e/[workflow].test.ts` 
- Complete user workflows with Playwright
- Real browser, API, and database
- Mobile responsiveness testing
- Critical path validation

## File Structure
```
tests/
├── integration/composables/  # Composable + unit logic  
├── integration/components/   # Component behavior
├── e2e/workflows/           # Complete user flows
└── helpers/                 # Test utilities, mocks
```

## Test Standards

### **Required Patterns**
- `data-testid` for reliable element selection
- `beforeEach()` for mock resets and cleanup  
- Meaningful assertions (no `expect(true).toBe(true)`)
- Async/await for user interactions and API calls

### **Performance Targets**
- Integration: <500ms per test
- Component: <100ms per test
- E2E: <5s per test
- Full suite: <30s total

### **Coverage Targets**
- Critical paths (timer, activities): 80%
- User interface: 70%
- API integration: 75%

### **Commands**
- `bun test` - Integration tests (fast feedback)
- `bun test:e2e` - End-to-end workflows
- `bun test --run` - All tests without watch mode