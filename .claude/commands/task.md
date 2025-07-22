# Task Management

Unified task management command for your development workflow. Use with options: `create`, `execute`, `status`, `analytics`, `optimize`, `validate`.

## Usage

```bash
/task create    # Create new project-level task hierarchy
/task execute   # Execute task with intelligent orchestration  
/task status    # View task status across sessions
/task analytics # Task performance and analytics dashboard
/task optimize  # Optimize task execution strategies
/task validate  # Validate task completion with evidence
```

---

## `/task create` - Create Task Hierarchy

**Purpose:** Break down complex Phase tasks into session-sized chunks (30/45/60 min)

### What It Does:
- Analyze current Phase tasks from SESSION_NOTES.md (current sprint focus)
- Reference detailed planning from FEATURE_BACKLOG.md for future phases
- Split complex tasks using TDD Red→Green→Refactor cycles
- Create TodoWrite items aligned with session types (30/45/60 min)
- Update SESSION_NOTES.md immediate priorities

### Session-Based Breakdown:
- **30-min:** Single component fixes, utility functions, configurations
- **45-min:** Feature implementation with TDD, API endpoints, integrations  
- **60-min:** Complex architecture, multi-component work, major refactoring

### Output Format:
```markdown
## 📋 New Task Hierarchy Created

### Immediate Next Session (30 min)
- [high] [Task name] - [Specific deliverable with tests]

### This Week Sessions  
- [medium] [Task name] (45 min) - [TDD cycle with integration]
- [medium] [Task name] (30 min) - [Component work]

### Dependencies Identified
- [Dependency] → blocks [Task name]
- [Technical decision] → needs human input
```

---

## `/task execute` - Execute with Orchestration

**Purpose:** Intelligent task execution covering implementation and testing with verification

### What It Does:
- **Implementation Phase**: Use `/implement` command for code generation
- **Testing Phase**: Use `/test` command for comprehensive test coverage  
- **Verification Phase**: Validate both implementation and tests are working
- **Documentation Phase**: Update TodoWrite and SESSION_NOTES.md with verified progress

### TDD Execution Workflow:
1. **Red Phase** (10-15 min): `/test` to create failing tests first
2. **Green Phase** (15-25 min): `/implement` to make tests pass
3. **Refactor Phase** (10-15 min): Optimize and clean up code
4. **Verify Phase** (5 min): Run tests, check git status, validate functionality
5. **Update Phase** (5 min): Mark progress and plan next task

### Implementation Integration:
```
/task execute → 
  ├── /implement [component|api|service|composable]
  │   └── Following IMPLEMENTATION_PLAN.md patterns
  ├── /test [integration|component|e2e]
  │   └── Following TESTING_STRATEGY.md patterns
  └── Verification & Documentation Update
```

### Verification Evidence Required:
- **Code Evidence**: Git commits with working implementation
- **Test Evidence**: All tests passing (`bun test --run`)
- **Integration Evidence**: Features working in development environment
- **Quality Evidence**: Linting and TypeScript compilation passing

### Safety Checks:
- Never mark tasks completed without: working code + passing tests + git commit + manual verification
- Verify actual functionality matches requirements from IMPLEMENTATION_PLAN.md
- Ensure tests follow user behavior patterns from TESTING_STRATEGY.md
- Flag any gaps between implementation and test coverage

---

## `/task status` - Cross-Session Status View

**Purpose:** Combined TodoWrite + Sprint progress + session context

### What It Shows:
1. **Active Session Tasks** (TodoWrite) - current in_progress items
2. **Current Sprint Progress** (SESSION_NOTES.md) - Phase 1B status & priorities
3. **Recent Completions** - what was accomplished in last session
4. **Next Immediate Actions** - this week's priorities from SESSION_NOTES.md
5. **Future Planning Reference** - link to FEATURE_BACKLOG.md for upcoming phases
6. **Historical Context** - reference to SESSION_HISTORY.md for decisions

### Output Format:
```markdown
## 📊 Task Status Overview

### 🔄 Current Session (TodoWrite)
- [in_progress] [high] [Current task]
- [pending] [medium] [Next 2-3 tasks]

### 🎯 Current Phase Progress: [Phase status from SESSION_NOTES.md]
**Recently Completed:**
- ✅ [Feature] - TDD implementation + integration
- ✅ [Component] - tests passing, committed

**This Week's Priorities:**
- [ ] [Task] (Day 1-2) - Ready to start  
- [ ] [Task] (Day 3-4) - Needs dependency

### 🚧 Blockers: [None/List specific blockers]

### 📚 References:
- **Current Sprint**: SESSION_NOTES.md  
- **Future Planning**: FEATURE_BACKLOG.md
- **Decisions History**: SESSION_HISTORY.md

### 💡 Recommended Next: [Specific task with time estimate]
```

---

## `/task analytics` - Performance Dashboard

**Purpose:** Track task completion patterns and velocity insights

### Analytics Provided:
1. **Velocity Tracking** - Actual vs estimated time per task type
2. **Success Patterns** - Which session types work best for different tasks  
3. **Completion Quality** - Tasks completed vs those requiring rework
4. **Sprint Progress** - Weekly completion rates and momentum
5. **Bottleneck Analysis** - Common blockers and resolution patterns

### Metrics Tracked:
- Session effectiveness by time slot (30/45/60 min)
- TDD cycle completion rates
- Testing coverage correlation with rework
- Time from task creation to completion
- Blocker resolution patterns

---

## `/task optimize` - Execution Strategy Optimization  

**Purpose:** Reorder priorities and improve task execution approach

### Optimization Areas:
1. **Priority Reordering** - Based on dependencies and available time
2. **Session Matching** - Align task complexity with available session time
3. **Dependency Resolution** - Identify and sequence dependency chains
4. **Energy Management** - Match task complexity to current capacity
5. **Momentum Preservation** - Maintain sprint progress and flow

### Optimization Triggers:
- New blockers resolved
- Available session time changes
- Critical path shifts
- Sprint goals adjustment
- Velocity patterns change

---

## `/task validate` - Completion Evidence + Code Review

**Purpose:** Verify task completion with implementation evidence, testing coverage, and code quality review

### Validation Process:
1. **Evidence Check** - Working code + passing tests + git commits
2. **Code Review** - Quality, patterns, and best practices  
3. **Integration Test** - Manual functionality verification
4. **Refactoring Suggestions** - Identify improvement opportunities

### Automated Validation:
```bash
bun run lint        # Code quality (Biome)
bun test --run      # All test suites  
bun run build       # TypeScript compilation
```

### Code Review Checklist:
- **Vue 3**: `<script setup>`, Composition API, readonly state exposure
- **TypeScript**: Proper interfaces, no `any` types, return annotations
- **Testing**: User behavior focus, `data-testid` attributes, meaningful assertions
- **Accessibility**: ARIA attributes, keyboard navigation support
- **Performance**: Computed properties, proper cleanup, debounced APIs
- **Security**: Input validation, no exposed secrets, parameterized queries

### Refactoring Opportunities:
- Extract reusable logic into composables
- Consolidate duplicate code patterns
- Optimize component rendering performance  
- Improve error handling consistency
- Enhance TypeScript type safety
- Strengthen test coverage for edge cases

### Quality Gates:
- All tests passing with >75% coverage on critical paths
- Linting passes with zero warnings  
- TypeScript compilation successful
- Manual feature verification in `bun dev`
- No regressions in existing functionality

---

## Integration with Your Workflow

### Unified Development Commands:
- **`/task execute`** → Orchestrates `/implement` + `/test` + verification
- **`/implement`** → Code generation following IMPLEMENTATION_PLAN.md patterns
- **`/test`** → Comprehensive testing following TESTING_STRATEGY.md patterns  
- **`/task validate`** → Evidence-based completion verification

### TDD Cycle Integration:
1. **`/task create`** → Plan Red→Green→Refactor→Commit cycles
2. **`/task execute`** → Red Phase (`/test`) → Green Phase (`/implement`) → Refactor → Verify
3. **`/task validate`** → Ensure each cycle delivers working, tested functionality

### Session Type Alignment:
- **30-min sessions**: Single component or utility with tests
- **45-min sessions**: Complete feature with TDD cycle  
- **60-min sessions**: Complex integration with comprehensive testing
- All commands respect available time and recommend appropriate scope

### Documentation Synchronization:
- TodoWrite progress synced with SESSION_NOTES.md (current sprint focus)
- Completed features archived to SESSION_HISTORY.md  
- Future planning maintained in FEATURE_BACKLOG.md
- Implementation evidence verified before marking complete
- Sprint progress reflects actual working features with test coverage

### Quality Standards Integration:
- **Implementation**: Vue 3 + TypeScript + shadcn-vue patterns from IMPLEMENTATION_PLAN.md
- **Testing**: User behavior focus + integration tests from TESTING_STRATEGY.md  
- **Verification**: Code + tests + git commits + manual functionality check
- **Documentation**: Real progress tracking based on working features