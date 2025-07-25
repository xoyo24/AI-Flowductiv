# Flowductiv - Technical Implementation Plan

> **Modern architecture foundation and technical design decisions**

## 🏗️ **Modern Architecture Foundation**

### **Technology Stack Evolution**
```
Previous → Modern Improvement
Vue 3 + Vuetify → Nuxt 3 + shadcn-vue + Tailwind
IndexedDB → Supabase + Local SQLite (Drizzle ORM)
npm + ESLint → Bun + Biome (10x faster)
Vitest → Vitest + Playwright (E2E)
Single AI → Multi-modal AI Router
Pinia → Nuxt State + Composables
```

### **Development Environment Architecture**
```mermaid
graph TB
    subgraph "Local Development"
        Bun[Bun Runtime] --> Nuxt[Nuxt 3 Dev Server]
        Nuxt --> SQLite[Local SQLite]
        Nuxt --> Composables[Vue Composables]
        Nuxt --> UI[shadcn-vue Components]
    end
    
    subgraph "Cloud Services"
        Supabase[Supabase Backend] --> DB[(PostgreSQL)]
        Supabase --> Auth[Authentication]
        Supabase --> Storage[File Storage]
        Supabase --> Edge[Edge Functions]
    end
    
    subgraph "AI Layer"
        AIRouter[AI Router] --> Claude[Claude 3.5]
        AIRouter --> GPT[GPT-4 Turbo]  
        AIRouter --> Ollama[Local Ollama]
        AIRouter --> Gemini[Gemini Pro]
    end
    
    Nuxt --> Supabase
    Composables --> AIRouter
    
    style Nuxt fill:#00dc82
    style Supabase fill:#3ecf8e
    style AIRouter fill:#ff6b6b
```

## 📋 **Phase Technical Milestones**

### **✅ Phase 0: Foundation (Complete)**
**Technical Deliverables:**
- Nuxt 3 + TypeScript + Bun development environment
- Drizzle ORM with SQLite for rapid prototyping
- shadcn-vue component library integration
- Basic timer functionality with Vue 3 Composition API
- Test infrastructure (Vitest + happy-dom)

### **✅ Phase 1A: Core MVP (Complete)**
**Technical Deliverables:**
- Smart input parsing with centralized service architecture
- Multi-provider AI router with fallback mechanisms
- Real-time auto-complete with debounced API calls
- Test-driven development with comprehensive coverage
- API security foundation with server-side key management

**Key Architectural Decisions:**
- **Composables over Stores**: Vue 3 Composition API replaces Pinia
- **TDD Methodology**: Red→Green→Refactor→Commit cycles throughout
- **API Security**: Server-side only key management, zero client exposure
- **Provider Architecture**: Extensible AI router ready for additional providers

### **✅ Phase 1B: Mobile-First UX (COMPLETED)**
**Technical Achievements:**
- **Responsive Architecture**: Desktop/mobile component switching with SSR compatibility
- **Touch Optimization**: 44px touch targets, iOS safe areas, haptic feedback
- **Component Architecture**: 70% code reduction through reusable UI patterns
- **Simple Navigation**: Standard mobile patterns replacing complex gesture system

**Delivered Technical Components:**
- `useViewport()` - Device detection and orientation handling
- `TimerSectionMobile.vue` - Touch-optimized mobile interface
- Reusable UI components (FilterTabs, PageHeader, Settings primitives)
- Production-ready mobile experience with integrated desktop navigation

### **🎯 Phase 1C: Analytics Dashboard (Current)**
**Technical Focus:** GitHub/Flomo-inspired productivity analytics with visual patterns
**Key Components:** 
- **ProductivityHeatmap.vue** - 365-day activity visualization with click-to-drill-down
- **AnalyticsDashboard.vue** - Integrated dashboard replacing separate pages
- **GoalsInsights.vue** - Visual progress tracking with streak counters and AI insights
- **Mobile AnalyticsPanel.vue** - Slide-out analytics panel for mobile users

**Technical Challenges:**
- Daily activity aggregation and productivity scoring algorithms
- Performant rendering of 365-day heatmap grids
- Interactive day detail modals with activity breakdowns
- Mobile-optimized analytics panel with touch interactions

**Database Requirements:**
- Daily aggregation queries for activity patterns
- Goal tracking schema for progress measurement
- Pattern analysis for AI insights generation

### **🔄 Phase 2: Advanced Analytics & Habits**
**Technical Focus:** Advanced pattern analysis and habit tracking systems  
**Key Components:** Calendar integration, habit tracking algorithms, advanced AI insights

### **🤖 Phase 3: AI Intelligence & Automation**
**Technical Focus:** Predictive analytics and automated productivity coaching
**Key Components:** Pattern recognition ML, recommendation engines, automated categorization

---

## 🚀 **Deployment Strategy**

### **Development → Production Pipeline**

#### **Local Development (Current)**
```bash
bun dev                    # Local development server
Local SQLite              # Development database
```

#### **Production Deployment**
```bash
Vercel                    # Hosting platform (excellent Bun support)
Supabase                  # Production database (PostgreSQL)
Bun                       # Package manager (faster builds on Vercel)
```

### **Database Migration Strategy**
```typescript
// Environment-based database selection
// server/database/index.ts
export const getDatabase = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Supabase PostgreSQL
    return drizzle(postgres(process.env.DATABASE_URL!))
  } else {
    // Development: Local SQLite
    return drizzle(new Database('local.db'))
  }
}
```

**Migration Phases:**
1. **Phase 0-1A**: SQLite for MVP development speed
2. **Phase 1B**: Add Supabase configuration alongside SQLite
3. **Phase 1C**: Switch production to Supabase, keep SQLite for dev
4. **Phase 2+**: Optional dev environment consistency

**Deployment Commands:**
```bash
# Vercel deployment (auto-detects Bun)
vercel --prod

# Database migration to Supabase
bun run db:migrate:prod
```

**Strategic Benefits:**
- ✅ **Zero downtime** migration path
- ✅ **Bun optimization** on Vercel (faster builds)
- ✅ **Cost-effective** development (free SQLite)
- ✅ **Scalable** production (Supabase)
- ✅ **Industry standard** stack for portfolio

---

## 🧪 **Testing & Quality Strategy**

### **Testing Architecture**
- **Integration Tests**: Primary approach combining unit + API testing
- **Component Tests**: User behavior focus with Vue Test Utils + Nuxt 3
- **E2E Tests**: Complete workflows for critical paths (Playwright)

### **Performance Benchmarks**
- **Page Load**: <1 second initial load
- **Timer Operations**: <200ms response time
- **AI Summary**: <5 seconds generation
- **Test Suite**: <30 seconds total execution

### **Quality Standards**
- **Coverage**: 75% for critical paths (timer, activities, AI)
- **TypeScript**: Strict compilation with proper interfaces
- **Accessibility**: ARIA attributes and keyboard navigation
- **Security**: Input validation and parameterized queries

---

## 🔧 **Key Technical Patterns**

### **Vue 3 Composition API Pattern**
```typescript
// ✅ Readonly state exposure pattern
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

### **API Security Implementation**

#### **Security Headers Middleware**
```typescript
// server/middleware/security.ts - Custom implementation
export default defineEventHandler(async (event) => {
  // Essential security headers
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-XSS-Protection', '1; mode=block')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // API-specific CORS and cache control
  if (event.node.req.url?.startsWith('/api/')) {
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  }
})
```

**Security Architecture Decision**:
- **Current**: Custom middleware (Phase 1B) - reliable, essential headers
- **Rationale**: nuxt-security module caused server crashes during setup
- **Coverage**: Core attack vectors (XSS, clickjacking, MIME sniffing)
- **Production**: Consider nuxt-security for Phase 1C+ with minimal config
- **Real Protection**: Application-level rate limiting via focus time gates

#### **Application-Level Rate Limiting**
```typescript
// server/utils/focusTimeCalculator.ts
export async function calculateNewFocusTime(userId: string | null, currentActivities: any[]) {
  const MIN_FOCUS_TIME_MS = 60 * 60 * 1000 // 1 hour
  const MIN_ACTIVITY_COUNT = 3 // Minimum activities
  
  // Calculate focus time since last AI summary
  const totalNewFocusTime = /* calculation logic */
  return {
    canRequestSummary: totalNewFocusTime >= MIN_FOCUS_TIME_MS && activityCount >= MIN_ACTIVITY_COUNT,
    progressPercent: Math.round((totalNewFocusTime / MIN_FOCUS_TIME_MS) * 100),
    timeToNextSummary: formatDuration(remainingTime)
  }
}
```

#### **API Endpoint Security Pattern**
```typescript
// server/api/ai/daily-summary.post.ts
export default defineEventHandler(async (event) => {
  // Input validation
  const body = await readBody(event)
  if (!body.activities?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Activities required' })
  }

  // Application-level rate limiting
  const focusAnalysis = await calculateNewFocusTime(null, body.activities)
  if (!focusAnalysis.canRequestSummary) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Track more focus time to unlock AI summary',
      data: { progress: focusAnalysis.progressPercent, timeRemaining: focusAnalysis.timeToNextSummary }
    })
  }

  // Protected API key access
  const config = useRuntimeConfig()
  const aiResponse = await aiRouter.generate(prompt, { apiKey: config.anthropicApiKey })
})
```

### **Mobile-First Component Pattern**
```vue
<template>
  <component 
    :is="isMobile ? 'TimerSectionMobile' : 'TimerSection'"
    v-bind="$attrs"
    @timer-started="handleTimerStart"
  />
</template>

<script setup lang="ts">
const { isMobile } = useViewport()
</script>
```

---

## 📁 **File Structure**
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

**Architecture Status**: Mobile-first UX complete (Phase 1B), enterprise security established, ready for analytics dashboard implementation (Phase 1C) with scalable component architecture and unified user experience.