# Flowductiv - Development Workflow

> **Optimized for 30-60 minute daily coding sessions**

## 🎯 **Role Distribution Strategy**

### **Your Role (Human Developer):**
- **Project decisions** and feature prioritization
- **Code reviews** and architectural choices
- **User testing** and feedback collection
- **Environment setup** and tooling configuration
- **Complex debugging** and performance optimization

### **AI Role (Claude):**
- **Boilerplate code generation** and scaffolding
- **Component implementation** following patterns
- **Documentation writing** and maintenance
- **Test case creation** and implementation
- **Configuration file setup**

### **Collaborative Areas:**
- **Design discussions** for complex features
- **Code refactoring** and improvement suggestions
- **Problem-solving** when stuck on implementation
- **Best practice reviews** and pattern establishment

## 🤝 **Collaboration Principles**

### **Documentation Management**
- **SESSION_NOTES.md** is the **living document** - update during sessions for real progress
- **COLLABORATION_PLAN.md** for workflow patterns - stable reference
- **TodoWrite** for immediate session tracking - complement documentation
- **Always verify environment** before suggesting commands (check tools are installed)

### **Session Flow Best Practices**  
- **Start each session** by reviewing SESSION_NOTES.md current status
- **Update documentation proactively** during significant decisions, not just when asked
- **Include testing** alongside feature implementation, not as afterthought
- **Validate deployment readiness** regularly throughout development

### **Quality & Environment Standards**
- **Verify prerequisites** before task planning (Bun, npm, etc.)
- **Flag quality gaps** proactively (missing tests, environment issues)
- **Capture architectural decisions** with reasoning in SESSION_NOTES.md
- **Link decisions to future impact** for better context
- **Commit verified changes** after each working step/todo completion

## 📅 **Daily Session Optimization (30-60 minutes)**

### **Quick Start Ritual (5 minutes)**
```bash
# Daily session starter commands
bun dev                    # Start development server
code .                     # Open VS Code
git status                 # Check current state
npm run task:next          # Get next recommended task (if using TaskMaster)
```

### **Session Types by Available Time:**

#### **30-minute Session: "Quick Wins"**
- **Focus**: Single component or utility function
- **Pattern**: Review → Implement → Test → Commit
- **Typical tasks**: 
  - UI component creation
  - Utility function implementation
  - Configuration updates
  - Bug fixes

#### **45-minute Session: "Feature Blocks"**
- **Focus**: Complete feature implementation
- **Pattern**: Plan → Implement → Test → Review
- **Typical tasks**:
  - API endpoint creation
  - Composable development
  - Integration between components
  - Simple feature additions

#### **60-minute Session: "Deep Work"**
- **Focus**: Complex features or architecture
- **Pattern**: Design → Implement → Test → Document
- **Typical tasks**:
  - Core system implementation
  - Database schema changes
  - Complex component interactions
  - Performance optimizations

#### **Weekend Sessions (2+ hours): "Sprint Completion"**
- **Focus**: Complete phase milestones
- **Pattern**: Plan → Implement → Test → Deploy → Review
- **Typical tasks**:
  - Phase completion
  - End-to-end feature testing
  - User feedback integration
  - Major refactoring

## 📋 **Sprint Management Framework**

> **For current sprint goals and task breakdowns, see [SESSION_NOTES.md](./SESSION_NOTES.md)**

### **Sprint Planning Approach**
- **Sprint Duration**: 1 week (4-7 sessions)
- **Session Tracking**: Dynamic updates in SESSION_NOTES.md
- **Phase Transitions**: Documented in both files
- **Retrospectives**: Weekly reviews with action items

## 🔄 **Daily Workflow Patterns**

### **Standard Session Flow:**
```
1. Review (5 min) - Check previous session's work
2. Plan (5 min) - Choose specific task from backlog
3. Implement (20-45 min) - Code with AI assistance
4. Test (5-10 min) - Quick validation
5. Commit (5 min) - Save progress with clear message
```

### **AI Collaboration Commands:**
```bash
# Quick task breakdown
"Break down this feature into 30-minute tasks"

# Code generation
"Generate a Vue component for [specific functionality]"

# Code review
"Review this code for best practices and potential issues"

# Testing
"Create comprehensive tests for this component"

# Documentation
"Update documentation to reflect these changes"
```

## 📋 **Task Handoff Patterns**

### **Handoff Format:**
```markdown
## Task: [Feature Name]
**Status**: Ready for implementation
**Time Estimate**: 30/45/60 minutes
**Prerequisites**: [Any dependencies]
**Your Part**: [Specific human tasks]
**AI Part**: [Specific AI tasks]
**Success Criteria**: [How to verify completion]
**Next Steps**: [What happens after completion]
```

### **Example Handoff:**
```markdown
## Task: Timer Display Component
**Status**: Ready for implementation
**Time Estimate**: 30 minutes
**Prerequisites**: useTimer composable completed
**Your Part**: 
- Review component design and UX (10 min)
- Test timer display accuracy (5 min)
- Validate responsive behavior (5 min)
**AI Part**: 
- Generate TimerDisplay.vue component (15 min)
- Implement time formatting utilities (5 min)
- Add proper TypeScript types (5 min)
**Success Criteria**: 
- [ ] Timer displays correctly in HH:MM:SS format
- [ ] Updates every second when running
- [ ] Shows current activity name
- [ ] Responsive on mobile devices
**Next Steps**: Integrate with TimerControls component
```

## 🎯 **Weekly Sprint Planning**

### **Monday Planning (15 min):**
- Review previous week's progress in SESSION_NOTES.md
- Select this week's focus area
- Break down tasks by session length
- Identify any blockers or dependencies
- Update sprint goals and priorities

### **Friday Review (15 min):**
- Assess week's achievements against sprint goals
- Document any issues or learnings in SESSION_NOTES.md
- Plan weekend session (if available)
- Update sprint metrics and velocity

### **Sprint Metrics Tracking:**
- **Velocity**: Sessions completed vs planned
- **Quality**: Features working, tests passing
- **User Value**: Features that improve core workflow
- **Blockers**: Environment, dependencies, decisions needed

## 🚀 **Phase Transition Strategy**

### **Phase Completion Criteria:**
- All must-have features implemented
- Core workflows tested and validated
- Performance benchmarks met
- Documentation updated

### **Handoff Protocol:**
1. **User** validates all phase criteria in SESSION_NOTES.md
2. **AI** prepares next phase detailed tasks
3. **Together** review and adjust upcoming phase plan
4. **User** approves transition and scope
5. **AI** updates SESSION_NOTES.md with new sprint goals

## 🛠️ **Development Environment Optimization**

### **VS Code Extensions (AI will configure):**
- Vue Language Features (Volar)
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- Auto Rename Tag

### **Terminal Setup:**
```bash
# Daily development aliases (add to .bashrc/.zshrc)
alias fg-dev="cd ~/workspace/ai-focus-guard && bun dev"
alias fg-test="bun test"
alias fg-build="bun run build"
alias fg-lint="bun run lint"
```

### **Git Workflow:**
```bash
# Branch naming convention
feature/timer-implementation
bugfix/timer-persistence-issue
refactor/component-structure

# Commit message format
feat: add timer display component
fix: resolve timer persistence issue
refactor: improve component structure
test: add timer functionality tests
docs: update collaboration plan
```

This collaboration plan maximizes your limited time while ensuring consistent progress through clear role separation and optimized workflows!