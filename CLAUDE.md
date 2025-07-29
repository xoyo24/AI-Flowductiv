# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Flowductiv** is a privacy-first, AI-enhanced productivity tool built with Nuxt 3. Focus: Manual time tracking enhanced by multi-modal AI insights.

**Current Phase**: Phase 1B Mobile-First UX + Security implementation

📚 **Documentation Structure**: Optimized 3-file system:
- `docs/SESSION_NOTES.md` - Current sprint focus (Phase 1B status & immediate actions)
- `docs/FEATURE_BACKLOG.md` - Detailed planning (Phase 1C+ features & task breakdowns)
- `docs/SESSION_HISTORY.md` - Development archive (completed sessions & key decisions)

📋 **Additional References**:
- `docs/PRD.md` - Product requirements and roadmap
- `docs/IMPLEMENTATION_PLAN.md` - Technical architecture and database schema  
- `docs/COLLABORATION_PLAN.md` - Development workflow and session management
- `docs/TESTING_STRATEGY.md` - Vue.js testing patterns and best practices
- `docs/DESIGN_SYSTEM.html` - 🎨 **Visual Design System**: Flomo-inspired patterns, components, and styling guidelines

## Critical Commands & Environment

**Always use Bun** (3x faster than npm):
```bash
bun install          # Install dependencies
bun dev             # Start Nuxt 3 development server  
bun run lint        # Run Biome linting (10x faster than ESLint)
bun run build       # Production build

# Testing (Co-located structure)
bun run test:unit:run        # All unit tests (91 tests, ~2s)
bun run test:composables:run # Composable tests only (45 tests)
bun run test:services:run    # Service tests only (31 tests) 
bun run test:server:run      # Server utility tests only (15 tests)
bun run test:integration:run # Integration tests (API + components)
bun run test:e2e            # End-to-end browser tests
bun run test:all            # All tests (unit + integration)

# Database (Drizzle ORM)
bun run db:generate # Generate migrations
bun run db:migrate  # Run migrations
bun run db:studio   # Open Drizzle Studio
```

**Tech Stack**: Nuxt 3 + TypeScript + shadcn-vue + Tailwind + Drizzle ORM + SQLite + Vitest + Bun + Biome

## Essential Development Rules

### **Testing Standards** 
- **Co-located Structure**: Tests live next to their implementations
- Follow Vue.js testing best practices in `docs/TESTING_STRATEGY.md`
- Test **user behavior**, not implementation details
- Use `data-testid` attributes for reliable element selection
- **Never skip tests** - ask for guidance when stuck
- Use `:run` suffix commands for CI/automation (no watch mode)
- **Never use `expect(true).toBe(true)`** in test cases
- Target 75% coverage for critical paths (timer, activities, API)

**Test Locations:**
- `composables/*.test.ts` - Unit tests for composables (45 tests)
- `services/**/*.test.ts` - Unit tests for services (31 tests)
- `server/utils/*.test.ts` - Unit tests for server utilities (15 tests)
- `server/api/**/*.test.ts` - Integration tests for API endpoints
- `components/*.test.ts` - Integration tests for Vue components
- `tests/e2e/` - End-to-end browser workflows

### **Code Quality**
- **Vue 3 Composition API** exclusively (no Options API)
- Use `<script setup>` syntax for all components
- Follow shadcn-vue component patterns
- **Apply Design System**: Reference `docs/DESIGN_SYSTEM.html` for Flomo-inspired patterns, colors, spacing, and components
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

Available slash commands defined in `.claude/commands/`:

### `/test` - Generate Tests
```markdown
Generate tests following co-located structure and Vue.js best practices from `docs/TESTING_STRATEGY.md`.

**Core Principles:**
- Test user behavior, not implementation details
- Use `data-testid` for reliable element selection
- `mountSuspended()` + `mockNuxtImport()` for Nuxt 3 components

**Co-located Structure:**
- Unit Tests: Next to source (e.g., `composables/useTimer.test.ts`)
- Component Tests: Next to components (e.g., `components/TimerSection.test.ts`)
- E2E Tests: Centralized in `tests/e2e/`

**Commands:**
- `bun run test:unit:run` (91 tests, ~2s)
- `bun run test:composables:run` (45 tests)
- `bun run test:services:run` (31 tests)
```

### `/implement` - Generate Code
```markdown
Generate code following established project patterns for Vue 3 components, Nuxt 3 APIs, composables, and services.

**Core Patterns:**
- Vue 3: `<script setup>` with TypeScript, `data-testid` attributes, shadcn-vue + Tailwind
- Nuxt 3 API: Zod validation, `defineEventHandler`, Drizzle ORM, `createError`
- Composables: Readonly state exposure, async actions, Vue 3 reactivity
- Services: Static methods, input validation, TypeScript types

**Integration:**
- Use existing Drizzle schema, integrate with `useAuth`, follow shadcn-vue patterns
```

### `/task` - Simplified Task Management
```markdown
Four focused commands covering complete development workflow:

- `/task` - Current TodoWrite + SESSION_NOTES.md status + next priorities
- `/task work [focus]` - Implementation + testing + git commits (TDD cycles)
- `/task done [what]` - Record completion + reflection in SESSION_HISTORY.md
- `/task plan [idea]` - Add future features to FEATURE_BACKLOG.md

**Daily Workflow:**
Status Check (`/task`) → Implementation (`/task work`) → Record + Reflect (`/task done`)
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