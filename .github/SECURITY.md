# Security Policy

## 🛡️ Supported Versions

Since this is an experimental project in active development, we focus security efforts on the latest version.

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | ✅ |
| Older versions | ❌ |

## 🚨 Reporting a Vulnerability

We take security seriously, even for experimental projects.

### For Security Issues:
**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead:
1. **Email**: Send details to [your-email@example.com] 
2. **Subject**: "Flowductiv Security Issue"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### Response Timeline:
- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week  
- **Fix**: Depends on severity (critical issues prioritized)

### For General Security Questions:
- Open a regular GitHub issue with the "security" label
- Use GitHub Discussions for broader security topics

## 🔒 Security Considerations

### Current Security Measures:
- **Local-first approach**: Data stored locally by default
- **No tracking**: Privacy-focused design
- **Input validation**: API endpoints validate input
- **TypeScript**: Type safety reduces certain vulnerability classes

### Known Limitations:
- **Development focus**: Security hardening ongoing
- **Local database**: SQLite file accessible to user
- **No encryption**: Local data not encrypted (planned for Phase 1B)

### Best Practices for Users:
- Keep your system and browser updated
- Don't share your local database file
- Be cautious with browser extensions that access all sites

## 🔄 Security Updates

Security fixes will be:
- Released as soon as possible
- Documented in release notes
- Communicated through GitHub releases

---

**Remember**: This is experimental software. Use appropriate caution in production environments.