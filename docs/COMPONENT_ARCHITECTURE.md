# Component Architecture & Best Practices

## **Pages vs Components Decision Tree**

### **Use Pages When:**
- ✅ **Unique URL/Route needed** (SEO, bookmarking, direct links)
- ✅ **Different page metadata** (title, description, social cards)
- ✅ **Distinct user workflows** (login flow vs dashboard vs checkout)
- ✅ **Legal requirements** (privacy policy, terms of service)

### **Use Components When:**
- ✅ **Reusable UI patterns** (modals, forms, cards)
- ✅ **Shared across desktop/mobile** (settings panel, filters)
- ✅ **Part of larger page layout** (sidebar content, tabs)
- ✅ **Business logic separation** (data fetching, state management)

---

## **Current Architecture: Integrated Dashboard**

### **Single Page Application (Phase 1C)**
```
pages/
  index.vue       # Single unified dashboard

components/
  TimerSection.vue        # Timer + activity input
  TimerSectionMobile.vue  # Mobile-optimized timer
  ActivityList.vue        # Recent activities display
  DailySummary.vue        # Today's metrics
  QuickStats.vue          # Key statistics
  AISettingsDropdown.vue  # Settings integration
```

**Current Benefits:**
- ✅ **Unified experience** - No separate pages, all features integrated
- ✅ **Mobile-first responsive** - Optimal UX on all devices
- ✅ **Component reusability** - Clean separation of concerns
- ✅ **Phase 1C ready** - Architecture supports analytics dashboard

---

## **Component Composition Patterns**

### **1. Mobile-First Responsive Design**
```vue
<!-- ✅ Current: Responsive dashboard -->
<template>
  <ClientOnly>
    <!-- Mobile Layout -->
    <div v-if="isMobile" class="min-h-screen bg-background">
      <TimerSectionMobile />
    </div>
    
    <!-- Desktop Layout -->
    <div v-else class="min-h-screen bg-background">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <TimerSection />
          <ActivityList />
        </div>
        <div class="space-y-6">
          <DailySummary />
          <QuickStats />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
```

### **2. Composable Integration**
```vue
<!-- ✅ Business logic in composables -->
<script setup>
const { isMobile } = useViewport()
const { activities } = useActivities()
const { isRunning, currentActivity } = useTimer()
</script>

<!-- ✅ Settings integration -->
<template>
  <div class="space-y-6">
    <AISettingsDropdown />
    <!-- Future: Analytics dashboard components -->
  </div>
</template>
```

---

## **Class Simplification Patterns**

### **❌ Before: Complex Conditional Classes**
```vue
<button 
  :class="[
    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
    activeFilter === 'all' 
      ? 'bg-primary text-primary-foreground' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
  ]"
>
```

### **✅ After: Computed Class Logic**
```vue
<script setup>
const getButtonClass = (value: string) => {
  const baseClass = 'font-medium rounded-md transition-colors'
  const sizeClass = props.size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  const activeClass = props.modelValue === value
    ? 'bg-primary text-primary-foreground'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
  
  return `${baseClass} ${sizeClass} ${activeClass}`
}
</script>

<template>
  <button :class="getButtonClass(filter.value)">
</template>
```

---

## **Testing Strategy**

### **Pages (Integration Tests)**
```typescript
// Test full page workflows
test('history page shows correct filter options', async () => {
  const wrapper = await mountSuspended(HistoryPage)
  expect(wrapper.find('[data-testid="filter-all"]')).toBeTruthy()
})
```

### **Components (Unit Tests)**
```typescript
// Test isolated component behavior
test('TimerSection starts timer correctly', async () => {
  const wrapper = await mountSuspended(TimerSection)
  await wrapper.find('[data-testid="start-timer"]').trigger('click')
  expect(wrapper.emitted('timer-started')).toBeTruthy()
})
```

---

## **Performance Benefits**

### **Architecture Simplification**
- **Phase 1B**: Removed redundant pages, unified dashboard experience
- **Current**: Single page with responsive components
- **Phase 1C Ready**: Architecture supports analytics dashboard integration

### **Component Reusability**
- `TimerSection` optimized for both mobile and desktop
- `ActivityList` reusable across different views
- `AISettingsDropdown` integrates seamlessly into dashboard

### **Maintainability**
- Single source of truth for filter logic
- Consistent styling across all filter instances
- Easier to update button styles globally

---

## **Implementation Checklist**

### **When Creating New Pages:**
- [ ] Does this need a unique URL? → Use page
- [ ] Can this be a modal/sidebar instead? → Use component
- [ ] Will desktop & mobile share logic? → Extract to component
- [ ] Does it have complex repeated UI? → Extract sub-components

### **When Refactoring Existing Code:**
- [ ] Look for duplicate layout patterns
- [ ] Extract complex conditional classes to computed functions
- [ ] Identify reusable UI patterns (buttons, forms, headers)
- [ ] Separate business logic from presentation logic
- [ ] Add proper TypeScript interfaces for props

This architecture ensures scalable, maintainable, and performant Vue.js applications.