# Contributing to Procxy

Thank you for your interest in contributing to Procxy! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows a code of conduct that all contributors are expected to adhere to. Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- pnpm 8+ (install via `npm install -g pnpm`)
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/procxy.git
cd procxy
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/procxy.git
```

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run tests to verify setup:

```bash
pnpm test
```

3. Build the project:

```bash
pnpm build
```

### Development Workflow

```bash
# Run tests in watch mode
pnpm test --watch

# Type check without building
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# Run all checks before committing
pnpm type-check && pnpm lint && pnpm test
```

## Project Structure

```
procxy/
├── src/
│   ├── index.ts              # Main entry point, public API
│   ├── parent/
│   │   ├── procxy.ts         # Parent-side proxy implementation
│   │   └── ipc-client.ts     # IPC client for parent process
│   ├── child/
│   │   └── agent.ts          # Child process agent
│   ├── shared/
│   │   ├── protocol.ts       # IPC protocol definitions
│   │   ├── serialization.ts  # JSON serialization utilities
│   │   ├── errors.ts         # Error classes
│   │   └── module-resolver.ts # Module resolution logic
│   └── types/
│       ├── procxy.ts         # Procxy<T> mapped type
│       └── options.ts        # Configuration types
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test fixtures
├── specs/
│   └── 001-procxy-core-library/
│       ├── spec.md           # Technical specification
│       ├── plan.md           # Implementation plan
│       └── tasks.md          # Task breakdown
└── examples/                 # Usage examples

```

### Key Files

- **src/index.ts** - Main entry point, exports public API
- **src/parent/procxy.ts** - Core proxy implementation
- **src/child/agent.ts** - Child process agent that receives IPC messages
- **src/shared/protocol.ts** - IPC message protocol definitions
- **src/types/procxy.ts** - Mapped type that transforms class types

## Coding Standards

This project follows strict coding standards. Please review [AGENTS.md](./AGENTS.md) for comprehensive guidelines.

### Key Principles

1. **TypeScript First** - Use explicit types, avoid `any`
2. **Naming Conventions**:
   - `camelCase` for variables and functions
   - `PascalCase` for classes, types, interfaces, and file names
   - `kebab-case` for non-module scripts
3. **Modern JavaScript** - Use ES2022+ features (async/await, optional chaining, nullish coalescing)
4. **Error Handling** - Always handle errors explicitly with try/catch
5. **Documentation** - Add JSDoc comments to all public APIs

### Style Guide

```typescript
// ✅ Good
class Calculator {
  /**
   * Adds two numbers together.
   *
   * @param a - First number
   * @param b - Second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }
}

// ❌ Bad - missing types, no JSDoc
class Calculator {
  add(a, b) {
    return a + b;
  }
}
```

### Code Formatting

We use **oxfmt** for formatting. Run `pnpm format` before committing.

Configuration: See `.oxfmt.json` or `package.json` config.

### Linting

We use **oxlint** for linting. Run `pnpm lint` to check for issues.

## Testing

All code changes must include tests.

### Test Structure

- **Unit tests** (`tests/unit/`): Test individual functions/classes in isolation
- **Integration tests** (`tests/integration/`): Test complete workflows end-to-end

### Writing Tests

Use **Vitest** for all tests:

```typescript
import { describe, it, expect } from 'vitest';
import { procxy } from '../src/index';

describe('Calculator', () => {
  it('should add two numbers', async () => {
    await using calc = await procxy(Calculator, './tests/fixtures/calculator.js');
    const result = await calc.add(2, 3);
    expect(result).toBe(5);
  });
});
```

### Test Requirements

- All new features must have tests
- Bug fixes must include regression tests
- Aim for >90% code coverage
- Tests must pass before PR is merged

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test tests/unit/parent-proxy.test.ts

# Run tests with coverage
pnpm test:coverage

# View coverage report
open coverage/index.html
```

## Submitting Changes

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no functionality change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes

**Examples:**

```bash
feat(proxy): add support for optional parameters
fix(ipc): handle child process crash gracefully
docs(readme): update installation instructions
test(integration): add EventEmitter forwarding tests
```

### Pull Request Process

1. **Create a branch**:

```bash
git checkout -b feat/your-feature-name
```

2. **Make your changes**:
   - Write code following coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Run quality checks**:

```bash
pnpm type-check
pnpm lint
pnpm format
pnpm test
```

4. **Commit your changes**:

```bash
git add .
git commit -m "feat(scope): description"
```

5. **Push to your fork**:

```bash
git push origin feat/your-feature-name
```

6. **Open a Pull Request**:
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Link related issues

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Include tests and documentation
- Ensure all CI checks pass
- Respond to review feedback promptly
- Squash commits before merging (if requested)

## Release Process

Releases are managed by maintainers using semantic versioning:

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Version Bumping

We use [Changesets](https://github.com/changesets/changesets) for version management:

1. Run `pnpm changeset` after making changes
2. Select the version bump type (major/minor/patch)
3. Write a description of the changes
4. Commit the changeset file

Maintainers will release when ready.

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/ORIGINAL_OWNER/procxy/discussions)
- **Bug Reports**: Open an [Issue](https://github.com/ORIGINAL_OWNER/procxy/issues)
- **Feature Requests**: Open an [Issue](https://github.com/ORIGINAL_OWNER/procxy/issues) with the `enhancement` label

## License

By contributing to Procxy, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Procxy! 🚀
