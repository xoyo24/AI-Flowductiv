# 🚀 Flowductiv

> **Privacy-first, AI-enhanced productivity tool built with modern web technologies**

Flowductiv is a fresh implementation focusing on manual time tracking enhanced by multi-modal AI insights, built with Nuxt 3 and optimized for 30-60 minute development sessions.

## ✨ Key Features

- **Manual Time Tracking**: Start/stop/pause timer with smart activity input
- **AI-Enhanced Insights**: Multi-provider AI analysis (Claude, GPT-4, Gemini, Ollama)
- **Privacy-First**: Local SQLite with optional encrypted cloud sync
- **Smart Input**: Natural language parsing with tags (#work) and priorities (!1-3)
- **PWA Ready**: Install on mobile devices, offline functionality
- **Modern Stack**: Nuxt 3 + Bun + Drizzle ORM + shadcn-vue

## 🏗️ Tech Stack

**Frontend**: Nuxt 3 + TypeScript + shadcn-vue + Tailwind CSS  
**Database**: Drizzle ORM + SQLite (local) / Supabase (cloud)  
**AI**: Multi-provider router supporting Claude, GPT-4, Gemini, Ollama  
**Testing**: Vitest + Playwright  
**Tooling**: Bun (3x faster) + Biome (10x faster linting)  

## 🎯 Current Status

**Phase 0**: Proof of Concept (2 weeks)
- Goal: Validate core timer with 10-20 beta users
- Focus: 30-60min daily sessions, weekend sprints

## 📚 Documentation

- [`docs/ENHANCED_PRD.md`](./docs/ENHANCED_PRD.md) - Product requirements and roadmap
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) - Technical architecture details
- [`docs/COLLABORATION_PLAN.md`](./docs/COLLABORATION_PLAN.md) - Development workflow
- [`CLAUDE.md`](./CLAUDE.md) - AI coding assistant instructions

## 🚀 Quick Start

```bash
# Install dependencies (3x faster than npm)
bun install

# Start development server
bun dev

# Run tests
bun test

# Lint code (10x faster than ESLint)
bun run lint

# Database operations
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

## 💡 Development Philosophy

- **Modern Best Practices**: Fresh implementation with latest tools
- **Optimized Collaboration**: AI-assisted development with clear role separation
- **Privacy-Focused**: Local-first with optional cloud features
- **Performance-First**: <1s page loads, <200ms timer operations

## 🤝 Contributing

This project uses an optimized collaboration workflow between human developers and AI assistants. See [`docs/COLLABORATION_PLAN.md`](./docs/COLLABORATION_PLAN.md) for detailed development patterns.

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to boost your productivity?** This modern implementation focuses on what matters most: helping you understand and optimize how you spend your time through intelligent AI insights.