# Code Review

Review code for Vue 3 best practices, TypeScript safety, testing coverage, and potential issues.

## Review Checklist

### **Vue 3 Best Practices**
- [ ] Uses `<script setup>` syntax instead of Options API
- [ ] Follows Composition API patterns correctly
- [ ] Proper use of `ref()`, `reactive()`, `computed()`, `watch()`
- [ ] State is exposed as readonly where appropriate
- [ ] Props and emits are properly typed with TypeScript interfaces
- [ ] Composables are used for business logic instead of inline code
- [ ] Components are focused and have single responsibility

### **TypeScript Type Safety**
- [ ] All functions have proper return type annotations
- [ ] Props and emits interfaces are well-defined
- [ ] No use of `any` types (except where absolutely necessary)
- [ ] Proper use of generic types
- [ ] Import/export types correctly
- [ ] Database operations use proper Drizzle types
- [ ] API responses have consistent type structure

### **Component Quality**
- [ ] Semantic HTML structure
- [ ] Proper accessibility attributes (ARIA, labels)
- [ ] `data-testid` attributes for interactive elements
- [ ] Consistent styling with shadcn-vue + Tailwind patterns
- [ ] Error states and loading states handled
- [ ] Proper event handling and emission

### **Testing Coverage**
- [ ] Component tests exist and cover user interactions
- [ ] Tests use `mountSuspended()` for Nuxt components
- [ ] Proper mocking of composables with `mockNuxtImport()`
- [ ] Tests focus on user behavior, not implementation
- [ ] Edge cases and error states are tested
- [ ] No meaningless assertions like `expect(true).toBe(true)`

### **Performance Considerations**
- [ ] Unnecessary re-renders avoided
- [ ] Computed properties used for derived state
- [ ] Watch effects are properly cleaned up
- [ ] Large lists use proper pagination or virtualization
- [ ] Images have appropriate loading strategies
- [ ] API calls are debounced where appropriate

### **Security & Best Practices**
- [ ] User inputs are validated and sanitized
- [ ] No secrets or API keys in client-side code
- [ ] Proper error handling without exposing sensitive information
- [ ] Database queries use parameterized queries (Drizzle ORM)
- [ ] Authentication/authorization checks where needed

### **Code Organization**
- [ ] File structure follows Nuxt 3 conventions
- [ ] Consistent naming conventions
- [ ] Appropriate separation of concerns
- [ ] Reusable code extracted into composables or utilities
- [ ] Comments explain "why" not "what"
- [ ] Import statements are organized and clean

### **API Design (if applicable)**
- [ ] RESTful conventions followed
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] Input validation with clear error messages
- [ ] Proper error handling with `createError()`

## Review Process

1. **Read the code** thoroughly to understand its purpose
2. **Check against patterns** in existing codebase
3. **Identify issues** based on the checklist above
4. **Suggest improvements** with specific examples
5. **Highlight positive aspects** that follow best practices
6. **Provide actionable feedback** with clear next steps

## Common Issues to Watch For

- Using Options API instead of Composition API
- Missing TypeScript types or using `any`
- Testing implementation details instead of user behavior
- Missing accessibility attributes
- Inconsistent error handling
- Performance anti-patterns (unnecessary reactivity)
- Security vulnerabilities (unvalidated inputs)
- Code duplication that could be extracted to composables