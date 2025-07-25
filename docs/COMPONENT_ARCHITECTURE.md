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

## **Refactoring Example: History & Settings**

### **❌ Before (Anti-pattern)**
```
pages/
  history.vue     # 168 lines, duplicated mobile/desktop layouts
  settings.vue    # 140 lines, duplicated mobile/desktop layouts
  index.vue       # No navigation to history/settings on desktop
```

**Problems:**
- Separate routes with no desktop navigation
- Duplicate layout code (mobile header + desktop header)
- Complex conditional classes repeated 3x per filter button
- No component reusability

### **✅ After (Best Practice)**
```
pages/
  history.vue     # 45 lines, clean page wrapper
  settings.vue    # 35 lines, clean page wrapper
  index.vue       # Added desktop navigation sidebar

components/
  HistoryContent.vue       # Pure content logic
  SettingsContent.vue      # Pure content logic
  UI/
    PageHeader.vue         # Reusable header component
    FilterTabs.vue         # Reusable filter buttons
    SettingsSection.vue    # Consistent settings layout
    SettingsToggle.vue     # Reusable toggle component
    SettingsButton.vue     # Reusable button component
```

**Benefits:**
- ✅ **70% less code** (pages reduced from 308 to 80 lines)
- ✅ **Reusable components** for future features
- ✅ **Desktop navigation** added to main dashboard
- ✅ **Simplified class logic** extracted to utilities
- ✅ **Easier testing** (components can be unit tested)

---

## **Component Composition Patterns**

### **1. Content + Presentation Separation**
```vue
<!-- ❌ Bad: Mixed concerns -->
<template>
  <div class="complex-layout">
    <header>...</header>
    <main>
      <!-- Complex filter logic inline -->
      <button :class="complexCondition" @click="filterLogic">All</button>
      <button :class="complexCondition" @click="filterLogic">Today</button>
      <!-- Business logic mixed with presentation -->
      <ActivityList :filter="activeFilter" />
    </main>
  </div>
</template>

<!-- ✅ Good: Separated concerns -->
<template>
  <div class="min-h-screen bg-background">
    <PageHeader title="History" :show-back-button="true" />
    <HistoryContent :is-mobile="isMobile" />
  </div>
</template>
```

### **2. Prop-Driven Flexibility**
```vue
<!-- ✅ Flexible component design -->
<FilterTabs 
  v-model="activeFilter"
  :filters="filterOptions"
  :size="isMobile ? 'sm' : 'md'"
/>

<!-- ✅ Configurable header -->
<PageHeader 
  title="Settings"
  :show-back-button="isMobile"
  :show-brand="!isMobile"
>
  <template #actions>
    <NuxtLink to="/">← Back</NuxtLink>
  </template>
</PageHeader>
```

### **3. Compound Components**
```vue
<!-- ✅ Composable settings sections -->
<SettingsSection title="AI Provider Settings">
  <AISettingsDropdown />
</SettingsSection>

<SettingsSection title="Preferences">
  <SettingsToggle label="Haptic Feedback" v-model="hapticEnabled" />
  <SettingsToggle label="Auto-save" v-model="autosaveEnabled" />
</SettingsSection>
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
test('FilterTabs emits correct value on click', async () => {
  const wrapper = mount(FilterTabs, {
    props: { modelValue: 'all', filters: mockFilters }
  })
  await wrapper.find('[data-testid="filter-today"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')).toEqual([['today']])
})
```

---

## **Performance Benefits**

### **Bundle Size Reduction**
- **Before**: 3 large page components = ~800 lines total
- **After**: 3 small pages + 6 reusable components = ~400 lines total
- **Savings**: 50% code reduction + better tree-shaking

### **Reusability**
- `FilterTabs` can be used in future analytics pages
- `PageHeader` standardizes all page headers
- `SettingsSection` creates consistent settings UX

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