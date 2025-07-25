# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Flowductiv** is a privacy-first, AI-enhanced productivity tool built with Nuxt 3. Focus: Manual time tracking enhanced by multi-modal AI insights.

**Current Phase**: Testing infrastructure setup and component integration

📚 **Detailed Documentation**: See `docs/` directory:
- `docs/PRD.md` - Product requirements and roadmap
- `docs/IMPLEMENTATION_PLAN.md` - Technical architecture and database schema  
- `docs/COLLABORATION_PLAN.md` - Development workflow and session management
- `docs/TESTING_STRATEGY.md` - Vue.js testing patterns and best practices
- `docs/SESSION_NOTES.md` - Current sprint status and progress

## Critical Commands & Environment

**Always use Bun** (3x faster than npm):
```bash
bun install          # Install dependencies
bun dev             # Start Nuxt 3 development server  
bun test            # Run Vitest test suite
bun run vitest run  # Run tests without watch mode
bun run lint        # Run Biome linting (10x faster than ESLint)
bun run build       # Production build

# Database (Drizzle ORM)
bun run db:generate # Generate migrations
bun run db:migrate  # Run migrations
bun run db:studio   # Open Drizzle Studio
```

**Tech Stack**: Nuxt 3 + TypeScript + shadcn-vue + Tailwind + Drizzle ORM + SQLite + Vitest + Bun + Biome

## Essential Development Rules

### **Testing Standards** 
- Follow Vue.js testing best practices in `docs/TESTING_STRATEGY.md`
- Test **user behavior**, not implementation details
- Use `data-testid` attributes for reliable element selection
- **Never skip tests** - ask for guidance when stuck
- Use `--run` flag with test commands for CI/automation
- **Never use `expect(true).toBe(true)`** in test cases
- Target 75% coverage for critical paths (timer, activities, API)

### **Code Quality**
- **Vue 3 Composition API** exclusively (no Options API)
- Use `<script setup>` syntax for all components
- Follow shadcn-vue component patterns
- Include proper TypeScript types
- **Commit verified changes** after each working step
- Verify environment (Bun installation) before suggesting commands

### **Workflow Pattern**
1. **Explore** - Read existing code and understand context
2. **Plan** - Break down tasks, identify dependencies  
3. **Code** - Implement following established patterns
4. **Test** - Verify functionality works as expected
5. **Commit** - Save working changes with clear messages

## Key Patterns & Examples

### **Vue 3 Composables (Replace Stores)**
```typescript
// ✅ Correct: Readonly state exposure
export const useTimer = () => {
  const isRunning = ref(false)
  const currentActivity = ref('')
  
  return {
    // Readonly state
    isRunning: readonly(isRunning),
    currentActivity: readonly(currentActivity),
    // Actions
    startTimer: () => { /* implementation */ },
    stopTimer: () => { /* implementation */ }
  }
}
```

### **Component Standards**
```vue
<template>
  <button 
    data-testid="start-timer" 
    @click="handleStart"
    class="px-4 py-2 bg-primary text-primary-foreground"
  >
    Start Timer
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'timer-started'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleStart = () => {
  // Implementation
  emit('timer-started')
}
</script>
```

### **API Design (Nuxt 3)**
```typescript
// server/api/activities.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = await db.insert(activities).values(body)
    return { data: result }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid activity data'
    })
  }
})
```

### **Testing Patterns (Nuxt 3)**
```typescript
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'

// Mock composables at top level
mockNuxtImport('useTimer', () => {
  return () => ({
    isRunning: ref(false),
    startTimer: vi.fn()
  })
})

describe('TimerSection Component', () => {
  it('should start timer when button clicked', async () => {
    const wrapper = await mountSuspended(TimerSection)
    await wrapper.find('[data-testid="start-timer"]').trigger('click')
    expect(wrapper.emitted('timer-started')).toBeTruthy()
  })
})
```

## Safety & Quality Standards

### **Security**
- **Defensive tasks only** - No malicious code creation
- Validate user inputs and sanitize outputs
- Never commit secrets or API keys
- Use environment variables for sensitive data

### **Performance Targets**
- **Development**: Dev start <2s, Hot reload <200ms, Tests <30s
- **Production**: Page load <1s, Timer ops <200ms, AI summaries <5s

### **Code Quality Gates**
- TypeScript compilation passes
- Biome linting passes  
- Tests pass (75% coverage minimum)
- No console.errors in production

## Custom Slash Commands

Create custom slash commands for frequent workflows:

### `/fix-test` - Fix Component Tests
```markdown
Fix failing component tests using:
- Vue Test Utils + Nuxt 3 patterns (`mountSuspended`, `mockNuxtImport`)
- Test user behavior, not implementation
- Use `data-testid` for element selection
- Follow patterns in `docs/TESTING_STRATEGY.md`
```

### `/component` - Generate Vue Component  
```markdown
Generate Vue 3 component following:
- `<script setup>` syntax
- shadcn-vue design patterns
- Proper TypeScript interfaces
- `data-testid` attributes for testing
- Tailwind CSS classes
```

### `/api-endpoint` - Create API Endpoint
```markdown
Create Nuxt 3 API endpoint with:
- Proper error handling (`createError`)
- Drizzle ORM for database operations
- TypeScript types
- Input validation
- RESTful conventions
```

### `/review-code` - Code Review
```markdown
Review code for:
- Vue 3 Composition API best practices
- TypeScript type safety
- Testing coverage gaps
- Performance considerations
- Security vulnerabilities
```

### `/update-docs` - Documentation Update
```markdown
Update `docs/SESSION_NOTES.md` with:
- Current task progress
- Completed features
- Next session priorities  
- Any blockers or decisions needed
- Testing status
```

## Quick Reference

### **File Structure**
```
├── components/         # Auto-imported Vue components
├── composables/       # Business logic (replaces Pinia stores)  
├── server/api/        # Nuxt 3 API endpoints
├── server/database/   # Drizzle schema and utilities
├── pages/             # File-based routing
├── types/             # TypeScript definitions
├── tests/             # Testing (unit, integration, e2e)
└── docs/              # Project documentation
```

### **Database Schema**
- **Activities**: id, title, durationMs, startTime, endTime, tags, priority, focusRating, energyLevel
- **AI Summaries**: id, date, content, provider, activitiesHash, tokensUsed, generatedAt

### **Key Dependencies**
- **UI**: shadcn-vue, Tailwind CSS, Lucide icons
- **Database**: Drizzle ORM, SQLite (dev) / Supabase (prod)
- **Testing**: Vitest, Vue Test Utils, Playwright, @nuxt/test-utils
- **AI**: Multi-provider router (Claude, GPT-4, Gemini, Ollama)

---

**Remember**: Always verify environment setup (Bun), follow established patterns, test thoroughly, and commit working changes incrementally.