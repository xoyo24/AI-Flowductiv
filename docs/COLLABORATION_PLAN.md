# Flowductiv - Development Workflow

> **Optimized for 30-60 minute daily coding sessions**

## 🎯 **Role Distribution**

### **Human Developer:**
- Project decisions and feature prioritization
- Code reviews and architectural choices
- User testing and feedback collection
- Environment setup and tooling configuration

### **AI Assistant (Claude):**
- Code generation following established patterns
- Component implementation with comprehensive testing
- Documentation updates and maintenance
- Task breakdown and workflow orchestration

## 🤝 **Core Principles**

### **Documentation Strategy**
- **SESSION_NOTES.md** - single source of current truth with detailed current work
- **FEATURE_BACKLOG.md** - future phases only (Phase 2+)
- **docs/history/session-YYYY-MM-DD-[topic].md** - individual session logs with implementation details
- **COLLABORATION_PLAN.md** - stable workflow reference

### **Quality Standards**
- Verify environment setup before task planning
- Include testing with every feature implementation
- Commit working changes after each completed task
- Flag quality gaps proactively (missing tests, environment issues)

## 📅 **Daily Session Optimization (30-60 minutes)**

### **Quick Start Ritual (5 minutes)**
```bash
# Daily session starter commands
bun dev                    # Start development server
code .                     # Open VS Code
git status                 # Check current state
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

## 📋 **Session Management Framework**

> **For current focus status, see [SESSION_NOTES.md](./SESSION_NOTES.md)**  
> **For detailed feature planning, see [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md)**  
> **For development history, see [docs/history/](./history/) folder**

### **Session-Based Approach**
- **Session Duration**: 30-60 minutes (daily focused work)
- **Current Work**: SESSION_NOTES.md (detailed current work, single source of truth)
- **Future Planning**: FEATURE_BACKLOG.md (Phase 2+ future ideas)
- **Session Archive**: docs/history/session-YYYY-MM-DD-[topic].md (completed work details)
- **Phase Transitions**: Documented in session history files  
- **Retrospectives**: As needed, captured in dedicated session history files

## 🔄 **Workflow Pattern**

### **Standard Session Flow:**
1. **Review** (5 min) - Check current state and priorities
2. **Plan** (5 min) - Identify session objectives and scope
3. **Implement** (20-45 min) - Code with TDD cycles  
4. **Test & Commit** (10 min) - Validate and save progress
5. **Update** (5 min) - Record completion and plan next

## 🎯 **Session Management**

### **Daily Rhythm:**
- **Start Session:** Check current focus + priorities (`/task`)
- **Work Session:** Implement + test (`/task:work [focus]`)
- **End Session:** Record progress + plan next (`/task:done [what]`)

### **Phase Transitions:**
- All must-have features implemented and tested
- Core workflows validated with real usage
- Documentation and deployment ready
- User approval on phase completion criteria

## 🛠️ **Environment Setup**

### **Essential Tools:**

- **Bun** - Primary package manager and runtime (3x faster than npm)
- **VS Code** - IDE with Vue, TypeScript, and Tailwind extensions
- **Git** - Version control with conventional commit messages

### **Daily Commands:**

```bash
bun dev                      # Start development server
bun run test:unit:run        # Fast unit tests (91 tests, ~2s)
bun run test:composables:run # Composable tests (45 tests) 
bun run test:services:run    # Service tests (31 tests)
bun run lint                 # Code quality checks
git status                   # Check current state
```

## 🔄 **User Feedback & Validation**

### **Session-Based Validation**
- **Daily**: Session-focused implementation with immediate user feedback
- **Weekly**: User testing with 5-10 beta users for feature validation
- **As-needed**: Retrospectives when significant features complete
- **Phase-based**: Data analysis and next phase planning

### **User Feedback Integration**
- **Continuous**: In-app feedback widget for feature requests
- **Weekly**: Video calls with 2-3 power users
- **Monthly**: Broader survey to all active users
- **Quarterly**: Comprehensive user journey analysis

---

*This workflow maximizes productivity through clear role separation, optimized session patterns, and intelligent task management via the `/task` command system.*