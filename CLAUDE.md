# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flowductiv** is a privacy-first, AI-enhanced productivity tool built with modern web technologies. Fresh implementation using Nuxt 3, focusing on manual time tracking enhanced by multi-modal AI insights.

📚 **Full Documentation**: See `docs/` for detailed specifications
- `docs/ENHANCED_PRD.md` - Product requirements and roadmap
- `docs/IMPLEMENTATION_PLAN.md` - Technical architecture details  
- `docs/COLLABORATION_PLAN.md` - Development workflow and collaboration
- `docs/SESSION_NOTES.md` - Current sprint goals and session tracking

## Essential Commands

### Core Development
- `bun install` - Install dependencies (3x faster than npm)
- `bun dev` - Start Nuxt 3 development server
- `bun test` - Run Vitest testing suite
- `bun run lint` - Run Biome linting (10x faster than ESLint)
- `bun run build` - Production build

### Database Management
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## Tech Stack (Quick Reference)

**Frontend**: Nuxt 3 + TypeScript + shadcn-vue + Tailwind  
**Database**: Drizzle ORM + SQLite/Supabase  
**AI**: Multi-provider router (Claude, GPT-4, Gemini, Ollama)  
**Testing**: Vitest + Playwright  
**Tooling**: Bun + Biome  

*See `docs/IMPLEMENTATION_PLAN.md` for complete architecture details*

## Key Development Patterns

### Vue 3 Composables (Replace Stores)
```typescript
// ✅ Good: Readonly state exposure
export const useTimer = () => {
  const isRunning = ref(false)
  return {
    isRunning: readonly(isRunning),
    startTimer: () => { /* implementation */ }
  }
}
```

### Component Standards
- Use `<script setup>` syntax
- Follow shadcn-vue patterns
- Include proper TypeScript types
- Add `data-testid` for E2E testing

### API Design (Nuxt 3)
- Use `server/api/` routes
- Implement `createError()` for error handling
- Use Drizzle ORM for type-safe operations

### AI Integration
- Check cache before API calls
- Use provider selection based on task requirements
- Implement graceful fallbacks
- Track token usage and costs

## Database Schema (Quick Reference)

**Activities Table**: id, title, description, durationMs, startTime, endTime, tags, priority, focusRating, energyLevel, userId  
**AI Summaries Table**: id, date, content, provider, activitiesHash, tokensUsed, generatedAt  

*See `docs/IMPLEMENTATION_PLAN.md` for complete schema definitions*

## Current Phase Status

### Phase 0: Proof of Concept (2 weeks)
**Goal**: Validate core timer with 10-20 beta users  
**Sessions**: 30-60min daily, weekend sprints  

**Week 1**: Environment + Timer + Database  
**Week 2**: Activities + Testing + PWA  

*See `docs/COLLABORATION_PLAN.md` for detailed workflow*

## File Structure (Modern Nuxt 3)
```
├── components/          # Vue components (auto-imports)
├── composables/        # Business logic (replaces stores)
├── server/api/         # API endpoints
├── server/database/    # Schema and utilities
├── pages/              # File-based routing
├── types/              # TypeScript definitions
└── docs/               # Project documentation
```

## Collaboration Workflow

### Human Tasks: 
Project decisions, code reviews, user testing, debugging

### AI Tasks: 
Code generation, documentation, tests, configuration

### Session Types:
- **30min**: Quick wins (single component)
- **45min**: Feature blocks (complete feature + tests)  
- **60min**: Deep work (complex features)
- **Weekend**: Sprint completion

*See `docs/COLLABORATION_PLAN.md` for detailed handoff patterns*

## Performance Standards

**Development**: Dev start <2s, Hot reload <200ms, Tests <30s  
**Production**: Page load <1s, Timer ops <200ms, AI summaries <5s  

## Privacy & Security

**Local-first**: Primary SQLite storage  
**AI Privacy Levels**: Local-only → Encrypted cloud → Full cloud  
**No tracking** without explicit consent  

## Important Notes

- Use **Bun** for all package management (verify installation first)
- Follow **Vue 3 Composition API** exclusively  
- **Biome** for linting (configured for speed)
- **Type-safe** database operations with Drizzle
- **30-60 minute** optimized development sessions
- **Dynamic documentation** - SESSION_NOTES.md reflects real progress

*For collaboration principles and session flow best practices, see `docs/COLLABORATION_PLAN.md`*

Remember: This is a fresh implementation focusing on modern best practices and optimized collaboration workflows with living documentation.