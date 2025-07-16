# Contributing to Flowductiv

Thanks for your interest in contributing to Flowductiv! This is an experimental productivity app built with modern web technologies, and we welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Bun (recommended) or npm
- Git

### Development Setup
1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/AI-Flowductiv.git
   cd AI-Flowductiv
   ```

2. **Install dependencies**
   ```bash
   bun install  # or npm install
   ```

3. **Start development server**
   ```bash
   bun dev  # or npm run dev
   ```

4. **Visit** `http://localhost:3000`

## 🤝 How to Contribute

### Types of Contributions Welcome
- 🐛 **Bug fixes** - Help us improve stability
- ✨ **New features** - Enhance productivity workflows  
- 🎨 **UI improvements** - Better user experience
- 📚 **Documentation** - Help others understand the project
- 🧪 **Tests** - Increase reliability
- 🔧 **Performance** - Make it faster and more efficient

### Development Process
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Use TypeScript for type safety
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🛠️ Technical Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, avoid `any` types
- **Vue 3**: Use Composition API with `<script setup>`
- **Tailwind**: Use existing design system classes
- **Components**: Follow shadcn-vue patterns

### Testing
- Run existing tests: `bun test`
- Add tests for new features
- Test manually in development mode

### Database Changes
- Use Drizzle ORM for database operations
- Generate migrations: `npx drizzle-kit generate:sqlite`
- Run migrations: `npx tsx server/database/migrate.ts`

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows existing style and conventions
- [ ] All tests pass (`bun test`)
- [ ] No TypeScript errors (`bun run lint`)
- [ ] Changes work in development mode
- [ ] Documentation updated if needed

### PR Description Template
```markdown
## What this changes
Brief description of your changes

## Why
Explain the motivation for this change

## Testing
How did you test this?

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🐛 Reporting Issues

Use our issue templates:
- **Bug Report**: For problems with existing functionality
- **Feature Request**: For new feature suggestions  
- **Question**: For usage or contribution questions

## 📞 Getting Help

- **GitHub Issues**: For bugs, features, and questions
- **GitHub Discussions**: For broader conversations
- **README**: Check project documentation first

## 🎯 Project Goals

This is an **experimental project** focused on:
- Modern web technologies (Nuxt 3, TypeScript, etc.)
- AI-enhanced productivity insights
- Local-first approach with optional cloud sync
- Clean, maintainable code for learning

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding!** 🚀 Thanks for helping make Flowductiv better for everyone.