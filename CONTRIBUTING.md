# Contributing to n8n Email Broadcasting Module

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-repo/n8n-email-broadcasting-module.git
cd n8n-email-broadcasting-module
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run tests:
```bash
npm test
```

## Code Style

- Follow TypeScript best practices
- Use ESLint for code linting: `npm run lint`
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## Testing

- Write unit tests for all new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage (>80%)

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Update documentation if needed
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## Commit Message Format

Use conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
style: Format code
chore: Update dependencies
```

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## Questions?

Open an issue or reach out to the maintainers.
