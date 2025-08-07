# Task Management

Simplified task management command for your development workflow. Four focused commands covering the complete development cycle.

## Usage

```bash
/task              # View current status (default)
/task:work [focus] # Implementation + testing + git commits
/task:done [what]  # Record completion + reflection
/task:plan [idea]  # Add future work to backlog
```

---

## `/task` (default) - Current Status

**Purpose:** Show current TodoWrite items + SESSION_NOTES.md detailed current work + immediate next actions

### What It Shows:
- **Active Session Tasks** (TodoWrite) - current in_progress items
- **Current Focus Progress** (SESSION_NOTES.md) - Phase status & immediate priorities
- **Today's Focus** - immediate actions ready to start
- **Blockers** - anything preventing progress
- **Recommended Next** - specific task with time estimate

### Output Format:
```markdown
## 📊 Current Task Status

### 🔄 Active Session (TodoWrite)
- [in_progress] [high] Mobile timer component implementation
- [pending] [medium] Haptic feedback integration

### 🎯 Current Focus: Analytics & Insights Enhancement
**Today's Priorities:**
- [ ] Productivity Heatmap Implementation - Ready to start
- [ ] Goal Setting & Progress Tracking - Next after heatmap

### 🚧 Blockers: None

### 💡 Recommended Next: Productivity Heatmap Implementation (90 min)
Create GitHub-style 365-day activity heatmap with click-to-filter
```

---

## `/task:work [focus]` - Implementation Cycle

**Purpose:** Pure code implementation with testing and verification - no documentation updates

### What It Does:
- **Implementation**: Use `/implement` command following established patterns
- **Testing**: Use `/test` command for comprehensive coverage
- **Verification**: Validate code works with automated checks
- **Git Commits**: Create commits with working, tested code

### TDD Workflow (Recommended):
1. **Red Phase** (10-15 min): Create failing tests first
2. **Green Phase** (15-25 min): Implement code to make tests pass
3. **Refactor Phase** (10-15 min): Optimize and clean up
4. **Verify Phase** (5 min): Run all checks and manual testing
5. **Commit Phase** (5 min): Git commit with evidence

### Focus Areas:
```bash
/task work mobile-timer     # Component implementation
/task work api-security     # API endpoint work
/task work composable       # Composable/service work  
/task work integration      # Cross-component work
```

### Verification Checklist:
- **Code Quality**: `bun run lint` passes
- **Type Safety**: `bun run build` compiles successfully
- **Test Coverage**: `bun test --run` all tests pass
- **Manual Testing**: Feature works in `bun dev`
- **Git Evidence**: Meaningful commit with file changes

### Integration Patterns:
- Follow Vue 3 + TypeScript + shadcn-vue patterns from IMPLEMENTATION_PLAN.md
- Use testing best practices from TESTING_STRATEGY.md
- Create `data-testid` attributes for reliable component testing
- Ensure 44px minimum touch targets for mobile components

---

## `/task:done [what-completed]` - Record Completion + Reflection

**Purpose:** Update SESSION_NOTES.md with completed work + create individual session log in `docs/history/`

### What It Does:
1. **Remove Completed Work**: Remove completed tasks/details from SESSION_NOTES.md to keep it focused on current work
2. **Create Individual Session Log**: Add detailed session file to `docs/history/session-YYYY-MM-DD-[topic].md` with implementation details
   1. If log already exist for the same day, appending to existing log instead of creating new one.
3. **Update TodoWrite**: Mark relevant tasks as completed
4. **Plan Next**: Identify immediate next priority

### Individual Session Log Content (Focused):
- **Session Objectives** - What was planned for this specific session
- **Technical Implementation** - Key files/components modified with implementation details
- **Issues Resolved** - What problems were fixed and how
- **User Experience Impact** - How this improves the user experience
- **Quality Assurance** - Test coverage, build status, verification results
- **Key Learnings** - Technical insights, patterns discovered, AI collaboration notes

### Example Usage:
```bash
/task:done mobile-timer    # After implementing TimerSectionMobile.vue
/task:done tag-bugs        # After fixing user-reported tag issues
/task:done testing-setup   # After adding comprehensive test coverage
```

### Individual Session File Template:
```markdown
# Session: [Topic]
**Date**: [Date]  
**Duration**: [Duration]  
**Focus**: [Session main objective]

## 🎯 **Session Objectives**
[What was planned for this specific session]

## ✅ **Completed Tasks**
[Detailed breakdown of what was implemented]
Example:
- 🐛 **Issues Fixed**
[Problems resolved and solution approaches]
- 🎨 **User Experience Improvements**
[How this enhances the user experience]

## 🔧 **Technical Implementation Details**
[Key files modified, patterns used, architecture decisions]

## 🧪 **Quality Assurance**
[Test coverage, verification steps, build status]

## 📝 **Key Learnings**
[Technical insights, AI collaboration notes, future considerations]
```

### SESSION_NOTES.md Updates:
- **Remove completed work** from current priorities (don't just mark as complete)
- Add brief one-line summary to "Completed This Sprint" section
- Keep SESSION_NOTES.md focused only on current/next work
- All implementation details go to individual session history files

---

## `/task:plan [feature-idea]` - Add Future Work

**Purpose:** Add new features, improvements, or ideas to FEATURE_BACKLOG.md for future phases

### What It Does:
- **Capture Ideas**: Record feature concepts while they're fresh
- **Estimate Complexity**: Break down into rough implementation phases
- **Identify Dependencies**: Note what must be completed first
- **Set Priority Context**: Align with overall product roadmap
- **Technical Notes**: Capture initial implementation thoughts

### Example Usage:
```bash
/task plan offline-mode        # Add offline functionality to backlog
/task plan team-collaboration  # Add multi-user features
/task plan advanced-analytics  # Add detailed insights dashboard
/task plan voice-input         # Add speech-to-text for activity entry
```

### FEATURE_BACKLOG.md Entry Format:
```markdown
## [Feature Name] - [Complexity: Small/Medium/Large]

**Phase Suggestion**: [1D/1E/2A/etc.] - [reasoning]
**User Need**: [What problem this solves]
**Core Functionality**: 
- [Key feature 1]
- [Key feature 2] 
- [Key feature 3]

**Technical Approach**:
- [Implementation strategy]
- [Key components needed]
- [Integration points]

**Dependencies**: 
- [What needs to exist first]
- [Potential blockers]

**Success Metrics**:
- [How to measure success]
- [User adoption indicators]

**Rough Estimate**: [X weeks, Y components, Z new concepts]
```

### Integration with Current Work:
- Ideas captured don't interrupt current Phase focus
- Detailed planning happens when idea becomes current priority
- Cross-references with IMPLEMENTATION_PLAN.md when ready to implement
- Links back to actual user needs and product goals from PRD.md

---

## Complete Development Workflow

### Daily Development Cycle:
1. **`/task`** → See current status and next priorities
2. **`/task:work [focus]`** → Implement code with TDD approach
3. **`/task:done [what]`** → Record completion with reflection
4. **Repeat** until session/day complete

### Occasional Planning:
- **`/task:plan [idea]`** → Capture future features as they come up

### Document Integration:
- **SESSION_NOTES.md**: Single source of current truth with detailed current work (updated by `/task done` - removes completed)
- **docs/history/session-YYYY-MM-DD-[topic].md**: Individual session logs (focused, detailed, created by `/task done`)
- **IMPLEMENTATION_PLAN.md**: High-level technical architecture only (stable reference)
- **FEATURE_BACKLOG.md**: Future phases only (Phase 2+, updated by `/task plan`)
- **TodoWrite**: Current session tasks (managed automatically)

### Command Integration:
- **`/task:work`** orchestrates `/implement` + `/test` + verification cycles
- **`/implement`** follows IMPLEMENTATION_PLAN.md patterns (Vue 3 + TypeScript + shadcn-vue)
- **`/test`** follows TESTING_STRATEGY.md best practices (user behavior focus)
- **Quality gates**: `bun run lint`, `bun test --run`, `bun run build` must pass

### Session Time Alignment:
- **30-min**: Single component or utility with tests
- **45-min**: Complete feature with TDD cycle
- **60-min**: Complex integration with comprehensive testing
- All commands recommend appropriate scope based on available time

### Evidence-Based Progress:
- Every completion tracked with git commits + test evidence + working features
- Reflections capture what works and what needs improvement
- Sprint progress reflects actual deliverable functionality
- Future planning informed by historical velocity and insights