# Contributing to Neumes Secrétaire

Thank you for your interest in contributing to Neumes Secrétaire! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/neumes-secretaire.git`
3. Install dependencies: `npm run install:all`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Code Style

### TypeScript
- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use CSS modules or separate CSS files

### Backend
- Follow RESTful API conventions
- Add error handling for all endpoints
- Validate input data
- Use middleware for cross-cutting concerns

## Testing

- Write tests for new features
- Ensure existing tests pass before submitting PR
- Test manually on multiple browsers

## Submitting Changes

1. Commit your changes with clear, descriptive messages
2. Push to your fork
3. Create a Pull Request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to any related issues

## Security

- Never commit API keys or secrets
- Report security vulnerabilities privately
- Follow secure coding practices

## Questions?

Open an issue for questions or discussions about contributions.
