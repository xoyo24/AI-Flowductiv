# Flowductiv - Feature Backlog & Implementation Planning

> **Detailed planning for Phase 1C and beyond - organized by implementation priority**

## 🎯 **Phase 1C: Productivity Analytics Dashboard (2 weeks)**

**Goal**: GitHub/Flomo-inspired visual analytics replacing basic activity lists

### **📊 Epic 1C.1: Productivity Heatmap Implementation (Week 1)**

#### **Task 1C.1.1: Core Heatmap Component (90 min)**
- **Data Aggregation** (30 min): Daily activity aggregation queries
  - Total time tracked per day
  - Activity count and focus rating averages
  - Productivity score calculation algorithm
- **Grid Rendering** (45 min): 365-day heatmap visualization
  - Color intensity based on productivity metrics
  - Responsive sizing for desktop/mobile
  - Hover tooltips with daily summaries
- **Integration** (15 min): Connect with existing activity data

#### **Task 1C.1.2: Interactive Day Details (60 min)**
- **Click Handlers** (20 min): Day selection and modal triggers
- **Detail Modal** (30 min): Comprehensive day breakdown
  - Activities list with time allocation
  - Focus ratings and energy levels
  - AI insights for that specific day
- **Navigation** (10 min): Previous/next day navigation within modal

#### **Task 1C.1.3: Heatmap Performance Optimization (45 min)**
- **Virtual Rendering** for large datasets (365+ days)
- **Lazy Loading** for historical data beyond current year
- **Caching Strategy** for aggregated daily stats
- **Mobile Touch Optimization** for day selection

### **🎨 Epic 1C.2: Integrated Dashboard Layout (Week 1)**

#### **Task 1C.2.1: Desktop Layout Restructuring (60 min)**
- **Grid Restructure** (30 min): Heatmap (left 2 cols) + Timer/Activities (right 1 col)
  - Remove sidebar navigation links to separate pages
  - Integrate heatmap as primary visual element
  - Position timer and recent activities as main content
- **Component Integration** (30 min): 
  - Replace ActivityList integration in pages/index.vue
  - Remove QuickStats/DailySummary from sidebar
  - Create unified analytics section

#### **Task 1C.2.2: Remove Redundant Pages (30 min)**
- **Delete Separate Pages**: Remove pages/history.vue and pages/settings.vue
- **Update Navigation**: Remove NuxtLink references to separate routes
- **Consolidate Settings**: Move AI settings to unified settings modal/panel
- **Update Tests**: Remove page-specific tests, update integration tests

### **⭐ Epic 1C.3: Goal Setting & Progress Tracking (Week 2)**

#### **Task 1C.3.1: Visual Goal System (75 min)**
- **Goal Definition Interface** (30 min): Daily/weekly/monthly targets
  - Time-based goals ("Track 6+ hours daily")
  - Activity-based goals ("Complete 5+ deep work sessions")
  - Streak-based goals ("Maintain 21-day tracking streak")
- **Progress Visualization** (30 min): 
  - Progress bars overlaying heatmap
  - Achievement badges and streak counters
  - Goal completion celebrations
- **AI Goal Suggestions** (15 min): Smart recommendations based on patterns

#### **Task 1C.3.2: Insights & Pattern Analysis (45 min)**
- **Pattern Recognition** (25 min): Identify productive periods and correlations
- **AI Insights Generation** (20 min): "Your peak focus time is 9-11 AM" style insights
- **Recommendation Engine**: Actionable suggestions for improvement

### **📊 Epic 1C.4: Mobile Analytics Panel (Week 2)**

#### **Task 1C.4.1: Slide-out Analytics Panel (90 min)**
- **Panel Component** (45 min): Flomo-inspired slide-out design
  - Condensed heatmap view for mobile
  - Touch-optimized day selection
  - Swipe gestures for navigation
- **Mobile Integration** (30 min): 
  - Trigger from hamburger menu in TimerSectionMobile
  - Maintain timer context when panel is open
  - Smooth slide animations
- **Touch Optimization** (15 min): 44px touch targets, haptic feedback

#### **Task 1C.4.2: Mobile Analytics Content (60 min)**
- **Condensed Insights** (30 min): Key stats and goals progress
- **Tag Filtering** (20 min): Quick filter chips for activity types
- **Quick Actions** (10 min): Jump to specific date ranges

### **🎨 Epic 1C.5: Visual Polish & Performance (Week 2)**

#### **Task 1C.5.1: Color System & Visual Hierarchy (45 min)**
- **Productivity Color Scale** (20 min): Define color intensity for heatmap
  - Light gray: No activity
  - Light green: Minimal activity (1-2 hours)
  - Medium green: Good activity (3-5 hours)  
  - Dark green: High productivity (6+ hours)
- **Visual Consistency** (15 min): Ensure color language across components
- **Accessibility** (10 min): Color-blind friendly palette, proper contrast

#### **Task 1C.5.2: Performance Optimization (30 min)**
- **Component Lazy Loading** for analytics components
- **Data Pagination** for large activity datasets
- **Bundle Size Optimization** through tree-shaking
- **Animation Performance** for smooth interactions

#### **Task 1C.5.3: Analytics Export (30 min)**
- **CSV Export** for heatmap data and analytics
- **Image Export** for sharing productivity visualizations
- **Date Range Selection** for targeted exports

---

## 🎨 **Phase 1C.6: Sidebar Filter Reorganization (Week 2)**

**Goal**: Transform sidebar from action-focused to filter-focused hub, moving all Advanced Filters from main content area to sidebar for cleaner UX

### **Task 1C.6.1: Sidebar Architecture Redesign (90 min)**

#### **Problem Analysis**
- Current AdvancedFilterPanel takes up too much space in main content area
- Main area should focus on timer, input, activities (high-frequency actions)
- Filter controls are medium-frequency and belong in sidebar
- Current sidebar has mixed analytics + navigation, needs logical grouping

#### **Solution: Two-Section Sidebar**
**Insight Area (Analytics - View Only)**
1. **Heatmap** - ProductivityOverview (existing, keep)
2. **Patterns** - PatternInsights (existing, keep) 
3. **AI Insights** - DailySummary (existing, keep)

**Filter Area (Interactive Controls)**
4. **Favorites** - Saved filter combinations (move from AdvancedFilterPanel)
5. **Priority** - 1-5 rating buttons (move from AdvancedFilterPanel)
6. **Focus** - 1-5 rating buttons (move from AdvancedFilterPanel)
7. **Duration** - Slider-style range picker (new component, replaces duration buttons)
8. **Tags** - TagFilters (existing, keep)

#### **Implementation Tasks (90 min)**

**Task 1C.6.1.1: Enhance AnalyticsSidebar.vue (45 min)**
- Add new "Filter Area" section after existing analytics content
- Move Priority/Focus controls from AdvancedFilterPanel with same functionality
- Integrate Saved Combinations (Favorites) section with proper positioning
- Add proper spacing, collapsible sections, and visual separation between areas
- Ensure all existing event handlers continue working

**Task 1C.6.1.2: Create DurationSlider Component (30 min)**
- Replace current duration buttons with clean range slider component
- Dual-handle slider for min/max range selection
- Show current values in readable format (e.g., "15min - 2h")
- Allow custom input via text fields when clicked
- Follow design system patterns from docs/DESIGN_SYSTEM.html
- Integrate with existing useAdvancedFilters composable

**Task 1C.6.1.3: Update UnifiedDashboard.vue (15 min)**
- Remove `<AdvancedFilterPanel />` from main content area (line 172)
- Clean up unused imports and event handlers related to AdvancedFilterPanel
- Ensure FilterBar continues working for active filter chips display
- Test that all filter events properly flow through sidebar components

#### **Saved Filter Placement Strategy**
**Location**: Top of Filter Area section in sidebar (after analytics, before individual filters)
**Rationale**: 
- Favorites represent saved combinations of other filters → logical to be first in filter section
- Users can quickly apply saved combinations, then adjust individual filters below
- Visual hierarchy: saved (convenient) → individual controls (precise)

**Design Pattern**:
```vue
<!-- AnalyticsSidebar.vue structure -->
<div class="sidebar-content">
  <!-- INSIGHT AREA -->
  <ProductivityOverview />
  <PatternInsights />
  <DailySummary />
  
  <!-- FILTER AREA -->
  <div class="filter-section">
    <!-- Favorites (Saved Combinations) -->
    <SavedFilterCombinations />
    
    <!-- Individual Filter Controls -->
    <PriorityFilter />
    <FocusFilter />
    <DurationSlider />
    <TagFilters />
  </div>
</div>
```

### **Task 1C.6.2: Mobile Filter Experience (45 min)**
- Ensure new filter layout works well in mobile menu overlay
- Test collapsible sections work properly on mobile
- Verify touch targets meet 44px minimum
- Ensure saved filters are easily accessible on mobile

### **Task 1C.6.3: Filter State Persistence (30 min)**
- Ensure all moved filter components maintain their state
- Test that filter combinations save/load correctly
- Verify FilterBar shows correct active filter chips
- Test filter clear functionality works across all components

### **Expected Benefits**
- **Cleaner main area**: Focus on timer, input, activities (high-frequency actions)
- **Logical grouping**: All filters consolidated in one place with clear hierarchy
- **Better mobile UX**: Sidebar organization scales better to mobile overlay
- **More content space**: Activities list gets more vertical space
- **Improved workflow**: Insights → Favorites → Individual filters → Activities

### **Technical Validation**
- All existing filter composables continue working unchanged
- Event handling properly forwards between sidebar and dashboard components
- Filter persistence and URL state management maintained
- Test coverage updated for new component locations
- No breaking changes to existing filter functionality

---

## 🔧 **Technical Infrastructure Improvements**

### **Technical Debt & Code Quality**

#### **DEBT.1 Build System Cleanup (30 min)**
- **Problem**: Multiple duplicate import warnings during development
- **Solution**: Complete cleanup of re-exported utilities from focusTimeCalculator.ts
- **Files to Fix**: Remaining import references across test files and utilities
- **Benefits**: Clean development experience, faster builds, clearer dependencies

#### **DEBT.2 Type Safety Improvements (45 min)**
- **Problem**: TypeScript `any` types in DailySummary and other components
- **Solution**: Create proper interfaces for rate limit data, error states, API responses
- **Implementation**: Define `RateLimitData`, `ApiErrorState`, `SummaryResponse` interfaces
- **Benefits**: Better IDE support, catch bugs at compile time, improved maintainability

#### **DEBT.3 Error Boundary Implementation (30 min)**
- **Problem**: No global error handling for component failures
- **Solution**: Add Vue error boundaries for mobile components and AI features
- **Implementation**: `<ErrorBoundary>` wrapper with fallback UI for TimerSectionMobile
- **Benefits**: Graceful degradation, better user experience, easier debugging

### **UI/UX Simplification & Performance**

#### **UX.1 DailySummary Simplification (30 min)**
- **Problem**: Current rate limit UX is complex (3 conditional states, 100+ template lines)
- **Solution**: Single summary display + small progress badge for rate limits
- **Backend Refactor**: Return 200 with `{ data: previousSummary, fromCache: true, progress: {...} }`
- **Frontend Simplification**: One template + computed progress indicator
- **Benefits**: Cleaner architecture, easier maintenance, better performance

#### **UX.2 Rate Limit Architecture Improvement (45 min)**  
- **Current**: 429 errors thrown to frontend for focus time gates
- **Better**: Reserve 429 for actual API abuse/spam protection
- **Implementation**: Always return previous summary with metadata flags
- **API Response**: `{ summary, isNew: false, reason: "Focus time requirement", nextUnlock: "15 min" }`
- **User Experience**: Smoother, no error states for normal usage patterns

### **Mobile UX Enhancement Epic**

#### **MOBILE.1 Motivational Input Prompts (30 min)**
- **Problem**: Plain activity input with no guidance or inspiration
- **Solution**: Dynamic, encouraging prompts with smart examples
- **Implementation**: 
  - Rotating placeholder text: "What are you focusing on? Try: 'Team standup #work' or 'Deep work session !2'"
  - Context-aware suggestions based on time of day: "Morning planning #strategy" vs "Afternoon coding #development"
  - Success stories: "Users who track #learning activities report 40% better retention"
- **Benefits**: Higher engagement, better data quality, improved onboarding

#### **MOBILE.2 Real-time Tag & Priority Feedback (45 min)**
- **Problem**: No visual indication when users type tags (#work) or priorities (!2)
- **Solution**: Live parsing with immediate visual feedback
- **Implementation**:
  - Animated chips appear as user types: `#work` → blue chip, `!2` → orange priority badge
  - Color-coded feedback: valid tags green, new tags yellow, priorities with urgency colors
  - Micro-animations on successful parsing: gentle bounce, color transition
  - Preview of parsed activity below input: "Team meeting" + blue #work chip + orange !2 badge
- **Benefits**: Clear user feedback, reduced input errors, more engaging interaction

#### **MOBILE.3 Modern Chat/Search Experience (60 min)**
- **Problem**: Traditional form input feels outdated on mobile
- **Solution**: Conversational, search-like interface inspired by modern chat apps
- **Implementation**:
  - Chat bubble design with message-like activity entries
  - Search-style input with instant suggestions dropdown
  - Voice input button for speech-to-text activity entry
  - Quick action buttons: "Meeting #work", "Focus time !3", "Break #personal"
  - Swipe gestures on activity bubbles for edit/delete actions
- **Benefits**: Modern mobile UX, reduced typing friction, higher user engagement

#### **MOBILE.4 Smart Contextual Suggestions (45 min)**
- **Problem**: Users struggle with activity naming and categorization
- **Solution**: AI-powered contextual suggestions based on time, history, and patterns
- **Implementation**:
  - Time-based suggestions: "Morning standup #work" at 9 AM, "Lunch break #personal" at 12 PM
  - History-based predictions: User often does "Code review" → suggest when similar timeframe
  - Pattern recognition: Detect recurring activities and suggest templates
  - Smart tag completion: Typing "meet" suggests "#meeting #work" based on user history
  - Integration with existing useAutoComplete but enhanced with ML patterns
- **Benefits**: Faster activity entry, better data consistency, personalized experience

### **AI Infrastructure Enhancements**

#### **AI.1 Provider Configuration Management (30 min)**
- **Environment-Based Selection** (dev vs prod providers)
- **API Key Management** with validation
- **Provider Health Dashboard** for monitoring

#### **AI.2 Performance & Caching (45 min)**
- **Response Caching** for repeated AI requests
- **Request Debouncing** for real-time features
- **Background Sync** for offline capability

#### **AI.3 Analytics & Monitoring (30 min)**
- **Usage Analytics** for AI token consumption
- **Performance Metrics** for response times
- **Error Tracking** for provider failures

### **Testing & Quality Infrastructure**

#### **TEST.1 E2E Test Coverage (45 min)**
- **Complete User Workflows** with Playwright
- **Cross-Browser Testing** setup
- **Mobile Device Testing** scenarios

#### **TEST.2 Performance Testing (30 min)**
- **Load Testing** for activity management
- **AI Response Time** benchmarking
- **Memory Usage** optimization

---

## 📅 **Phase 2: Habit Loop (4 weeks)**

### **Epic 2.1: Post-Session Quality Ratings**
- **Focus Rating Modal**: After timer completion, show quick 1-5 star rating modal for focus quality
- **Activity Edit Interface**: Allow editing priority, focus rating, and tags after activity creation
- **Batch Rating Mode**: Daily review mode to rate multiple activities at once
- **Rating Analytics**: Correlation analysis between ratings and productivity patterns
- **Contextual Prompts**: Smart rating prompts based on activity type and duration

### **Epic 2.2: Habit Tracking Foundation**
- Daily/weekly habit definition and tracking
- Streak visualization and motivation
- Goal setting and progress measurement

### **Epic 2.3: Calendar Integration**
- Automatic calendar import and meeting tracking
- Meeting effectiveness rating and analysis
- Focus time block identification and protection

---

## 📅 **Phase 3: AI Intelligence (6 weeks)**

### **Epic 3.1: Pattern Analysis**
- Weekly/monthly productivity pattern identification
- Habit-performance correlation discovery
- Optimal time/environment recommendations

### **Epic 3.2: Auto-Categorization & Smart Suggestions**
- Automatic activity categorization using AI
- Smart activity suggestions based on context
- Recurring activity detection and automation

### **Epic 3.3: Personalized Recommendations**
- Actionable productivity advice based on data
- Goal achievement pathway recommendations
- Work-life balance optimization suggestions

---

## 🔄 **Implementation Timeline Summary**

### **Phase 1B Remaining (1 week):**
- **Week 2**: 🚨 Urgent fixes (hydration mismatch, mobile testing) + Gesture system
- **Week 3**: Swipeable components + Performance optimization

### **Phase 1C (2 weeks):**
- **Week 1**: Productivity heatmap implementation + Integrated dashboard layout
- **Week 2**: Goal setting system + Mobile analytics panel + Visual polish

### **Phase 2 (4 weeks):**
- Advanced rating system and habit tracking
- Calendar integration and meeting analysis
- Goal setting and streak motivation

### **Phase 3 (6 weeks):**
- AI-powered pattern analysis
- Auto-categorization and smart suggestions
- Personalized recommendations engine

**Success Metrics:**
- Phase 1C: 70% interact with heatmap, 80% click day details, 60% set goals, 90% mobile analytics usage
- Phase 2: 70% track 3+ habits, 80% provide session ratings, 60% calendar integration
- Phase 3: 70% receive meaningful AI insights, 40% act on recommendations, 85% auto-categorization accuracy

---

*This backlog maintains all planned features while supporting the mobile-first Phase 1B implementation. Features are organized by priority and implementation complexity.*