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
- **SESSION_NOTES.md** - living document for current sprint progress
- **COLLABORATION_PLAN.md** - stable workflow reference
- **`/task` command** - real-time session management and orchestration

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

## 📋 **Sprint Management Framework**

> **For current sprint goals and task breakdowns, see [SESSION_NOTES.md](./SESSION_NOTES.md)**

### **Sprint Planning Approach**
- **Sprint Duration**: 1 week (4-7 sessions)
- **Session Tracking**: Dynamic updates in SESSION_NOTES.md
- **Phase Transitions**: Documented in both files
- **Retrospectives**: Weekly reviews with action items

## 🔄 **Workflow Pattern**

### **Standard Session Flow:**
1. **Review** (5 min) - `/task status` for current state
2. **Plan** (5 min) - `/task create` or `/task optimize` priorities  
3. **Implement** (20-45 min) - Code with TDD cycles
4. **Test & Commit** (10 min) - Validate and save progress
5. **Update** (5 min) - `/task execute` to sync documentation

## 🎯 **Sprint Management**

### **Weekly Rhythm:**
- **Monday:** `/task analytics` review + `/task create` for week priorities
- **Daily:** `/task status` → implement → `/task execute` 
- **Friday:** `/task validate` week's work + plan next sprint

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
bun dev       # Start development server
bun test      # Run test suite  
bun run lint  # Code quality checks
git status    # Check current state
```

---

*This workflow maximizes productivity through clear role separation, optimized session patterns, and intelligent task management via the `/task` command system.*