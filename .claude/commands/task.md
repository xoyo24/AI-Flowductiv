# Task Management

Simplified task management command for your development workflow. Four focused commands covering the complete development cycle.

## Usage

```bash
/task              # View current status (default)
/task work [focus] # Implementation + testing + git commits
/task done [what]  # Record completion + reflection
/task plan [idea]  # Add future work to backlog
```

---

## `/task` (default) - Current Status

**Purpose:** Show current TodoWrite items + SESSION_NOTES.md progress + immediate next actions

### What It Shows:
- **Active Session Tasks** (TodoWrite) - current in_progress items
- **Current Sprint Progress** (SESSION_NOTES.md) - Phase status & weekly priorities
- **This Week's Focus** - immediate actions ready to start
- **Blockers** - anything preventing progress
- **Recommended Next** - specific task with time estimate

### Output Format:
```markdown
## 📊 Current Task Status

### 🔄 Active Session (TodoWrite)
- [in_progress] [high] Mobile timer component implementation
- [pending] [medium] Haptic feedback integration

### 🎯 Current Phase: Phase 1B Mobile-First UX (Week 1)
**This Week's Priorities:**
- [ ] Priority 2: Mobile Timer Interface (Day 3-4) - Ready to start
- [ ] Priority 3: Responsive Foundation (Day 5) - Blocked on Priority 2

### 🚧 Blockers: None

### 💡 Recommended Next: Mobile Timer Interface (45 min)
Create TimerSectionMobile.vue with 44px touch targets + haptic feedback
```

---

## `/task work [focus]` - Implementation Cycle

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

## `/task done [what-completed]` - Record Completion + Reflection

**Purpose:** Update SESSION_NOTES.md with completed work + add reflection to SESSION_HISTORY.md

### What It Does:
1. **Mark Complete**: Update current priorities in SESSION_NOTES.md as completed
2. **Record Evidence**: Reference git commits, tests, and files created
3. **Capture Reflection**: Add learning insights to SESSION_HISTORY.md
4. **Update TodoWrite**: Mark relevant tasks as completed
5. **Plan Next**: Identify immediate next priority

### Reflection Process:
Prompts you to capture:
- **What was completed?** (specific deliverables)
- **What evidence exists?** (git commits, test files, components created)
- **What worked well?** (effective processes, good decisions)
- **What needs improvement?** (blockers encountered, better approaches)
- **Next time insights** (lessons for future similar work)

### Example Usage:
```bash
/task done mobile-timer    # After implementing TimerSectionMobile.vue
/task done api-security    # After completing rate limiting work
/task done testing-setup   # After adding comprehensive test coverage
```

### SESSION_HISTORY.md Entry Format:
```markdown
## [Task Name] ([Date], [Duration])
**Completed**: [Specific deliverables]
**Evidence**: commits [hash1, hash2] | [N] tests passing | files: [list]
**Worked Well**: [Process insights, effective decisions]
**Needs Improvement**: [Blockers, inefficiencies, better approaches]
**Next Time**: [Lessons for future similar work]
**Impact**: [How this advances current Phase goals]
```

### SESSION_NOTES.md Updates:
- Mark weekly priorities as completed with checkmarks
- Update current session summary with actual accomplishments
- Reference git commits and measurable evidence
- Identify next immediate priority based on dependencies

---

## `/task plan [feature-idea]` - Add Future Work

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
2. **`/task work [focus]`** → Implement code with TDD approach
3. **`/task done [what]`** → Record completion with reflection
4. **Repeat** until session/day complete

### Occasional Planning:
- **`/task plan [idea]`** → Capture future features as they come up

### Document Integration:
- **SESSION_NOTES.md**: Current sprint focus (updated by `/task done`)
- **SESSION_HISTORY.md**: Completed work with reflections (updated by `/task done`)
- **FEATURE_BACKLOG.md**: Future work ideas (updated by `/task plan`)
- **TodoWrite**: Current session tasks (managed automatically)

### Command Integration:
- **`/task work`** orchestrates `/implement` + `/test` + verification cycles
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