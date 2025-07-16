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

## 🏗️ **Phase 0 - Collaboration Breakdown**

### **Week 1: Foundation Setup**

#### **Session 1 (Weekend 2hrs): Environment Setup**
**👤 Your Tasks (60 min):**
- [ ] Clone and initialize project repository
- [ ] Install Bun and verify development environment
- [ ] Configure VS Code with recommended extensions
- [ ] Set up project structure and initial commit

**🤖 AI Tasks (60 min):**
- [ ] Generate all configuration files (nuxt.config.ts, package.json, etc.)
- [ ] Create base component scaffolding
- [ ] Set up TypeScript configuration
- [ ] Generate initial project documentation

**🤝 Collaboration Points:**
- Review generated configurations together
- Verify environment setup is working
- Decide on any custom tooling preferences

#### **Session 2 (30 min): Database Schema**
**👤 Your Tasks (15 min):**
- [ ] Review database schema design
- [ ] Test local database setup
- [ ] Verify migration system works

**🤖 AI Tasks (15 min):**
- [ ] Generate Drizzle schema files
- [ ] Create database utility functions
- [ ] Set up migration scripts

#### **Session 3 (45 min): Core Timer Logic**
**👤 Your Tasks (20 min):**
- [ ] Review timer composable logic
- [ ] Test timer accuracy and edge cases
- [ ] Validate localStorage persistence

**🤖 AI Tasks (25 min):**
- [ ] Implement useTimer composable
- [ ] Create timer utility functions
- [ ] Add comprehensive timer tests

#### **Session 4 (30 min): Timer UI Components**
**👤 Your Tasks (10 min):**
- [ ] Review component design and UX
- [ ] Test responsive behavior
- [ ] Validate accessibility features

**🤖 AI Tasks (20 min):**
- [ ] Generate TimerDisplay component
- [ ] Create TimerControls component
- [ ] Implement proper styling and interactions

### **Week 2: Activity Management**

#### **Session 5 (45 min): Activity Storage System**
**👤 Your Tasks (20 min):**
- [ ] Review API endpoint design
- [ ] Test database operations
- [ ] Validate error handling

**🤖 AI Tasks (25 min):**
- [ ] Create useActivities composable
- [ ] Generate API endpoints
- [ ] Implement CRUD operations

#### **Session 6 (30 min): Activity UI Components**
**👤 Your Tasks (10 min):**
- [ ] Review activity list design
- [ ] Test user interactions
- [ ] Validate data display

**🤖 AI Tasks (20 min):**
- [ ] Create ActivityList component
- [ ] Generate ActivityItem component
- [ ] Implement editing functionality

#### **Session 7 (Weekend 1hr): Integration & Testing**
**👤 Your Tasks (30 min):**
- [ ] End-to-end workflow testing
- [ ] User experience validation
- [ ] Performance verification

**🤖 AI Tasks (30 min):**
- [ ] Create integration tests
- [ ] Generate comprehensive test suite
- [ ] Set up CI/CD pipeline basics

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
- Review previous week's progress
- Select this week's focus area
- Break down tasks by session length
- Identify any blockers or dependencies

### **Friday Review (15 min):**
- Assess week's achievements
- Document any issues or learnings
- Plan weekend session (if available)
- Update project documentation

### **Sprint Metrics:**
- **Velocity**: Tasks completed per week
- **Quality**: Tests passing, no regressions
- **User Value**: Features that improve core workflow
- **Technical Debt**: Refactoring and optimization tasks

## 🚀 **Phase Transition Strategy**

### **Phase 0 → Phase 1A Criteria:**
- [ ] Timer works reliably for 2+ hour sessions
- [ ] Activities save and load correctly
- [ ] Basic UI is responsive and accessible
- [ ] 10+ beta users validate core workflow
- [ ] Performance meets benchmarks (<1s load time)

### **Handoff Protocol:**
1. **User** validates all phase criteria
2. **AI** prepares next phase detailed tasks
3. **Together** review and adjust Phase 1A plan
4. **User** approves transition and scope
5. **AI** generates first Phase 1A tasks

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