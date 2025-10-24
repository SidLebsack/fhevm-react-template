# Contributing to FHEVM Universal SDK

Thank you for your interest in contributing to the FHEVM Universal SDK! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful** - Treat everyone with respect
- **Be collaborative** - Work together constructively
- **Be professional** - Focus on what is best for the project
- **Be inclusive** - Welcome diverse perspectives

---

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git
- Basic knowledge of TypeScript, React, and Ethereum

### Find an Issue

1. Check the [Issues](https://github.com/SidLebsack/fhevm-react-template/issues) page
2. Look for issues tagged with `good first issue` or `help wanted`
3. Comment on the issue to let others know you're working on it

### Ask Questions

- Open a [GitHub Discussion](https://github.com/SidLebsack/fhevm-react-template/discussions) for questions
- Join the [Zama Discord](https://discord.com/invite/zama) for community support

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/fhevm-react-template
cd fhevm-react-template
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Build the SDK
cd packages/fhevm-sdk
npm run build
cd ../..
```

### 3. Set Up Environment

```bash
# Copy environment files
cp examples/nextjs-fitness-tracker/.env.example examples/nextjs-fitness-tracker/.env
cp examples/privacy-fitness-tracker/.env.example examples/privacy-fitness-tracker/.env

# Edit .env files with your configuration
```

### 4. Run Examples

```bash
# Run Next.js example
npm run dev:nextjs

# Or run contract example
cd examples/privacy-fitness-tracker
npm run compile
npm run deploy:local
```

---

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-vue-support` - New features
- `fix/encryption-error` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/client-init` - Code refactoring
- `test/add-decryption-tests` - Test additions

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat(sdk): add batch decryption support
fix(hooks): resolve useEncrypt loading state issue
docs(api): update encryption function documentation
test(core): add unit tests for client initialization
refactor(react): simplify provider context
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `style` - Code style/formatting

---

## Coding Standards

### TypeScript

**Follow these conventions:**

```typescript
// ✅ Good - Descriptive names, proper types
async function encryptUserData(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  if (!client.isInitialized) {
    throw new Error('Client not initialized');
  }

  return await encryptInput(client, value, options);
}

// ❌ Bad - Poor names, missing types
async function enc(c, v, o) {
  return await encryptInput(c, v, o);
}
```

**Type Safety:**
- Use strict TypeScript configuration
- Avoid `any` types when possible
- Define interfaces for all public APIs
- Export all types that users need

**Naming Conventions:**
- `camelCase` for functions and variables
- `PascalCase` for types and interfaces
- `UPPER_SNAKE_CASE` for constants
- Prefix private functions with `_`

### React

**Hooks:**
```tsx
// ✅ Good - Clear, typed hook
function useEncrypt(): {
  encrypt: (value: number) => Promise<EncryptedValue | null>;
  isEncrypting: boolean;
  error: Error | null;
} {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Implementation...

  return { encrypt, isEncrypting, error };
}
```

**Components:**
```tsx
// ✅ Good - Typed props, clear structure
interface WorkoutFormProps {
  onSubmit: (data: WorkoutData) => Promise<void>;
  isLoading?: boolean;
}

export function WorkoutForm({ onSubmit, isLoading = false }: WorkoutFormProps) {
  // Implementation...
}
```

### Code Style

**Use ESLint and Prettier:**
```bash
# Lint code
npm run lint

# Format code
npm run format
```

**Comments:**
```typescript
// ✅ Good - Explains "why", not "what"
// Retry encryption on network failure to handle temporary issues
await retry(() => encryptInput(client, value), 3, 1000);

// ❌ Bad - States the obvious
// Call retry function
await retry(() => encryptInput(client, value), 3, 1000);
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# SDK tests only
npm run test:sdk

# Contract tests
npm run test:contracts

# Watch mode
npm run test:watch
```

### Writing Tests

**Unit Tests:**
```typescript
import { createFhevmClient } from '@fhevm/sdk';

describe('createFhevmClient', () => {
  it('should initialize client with valid config', async () => {
    const client = await createFhevmClient({
      provider: mockProvider,
      network: 'sepolia',
      contractAddress: '0x...'
    });

    expect(client.isInitialized).toBe(true);
  });

  it('should throw error with invalid network', async () => {
    await expect(
      createFhevmClient({
        provider: mockProvider,
        network: 'invalid' as any,
        contractAddress: '0x...'
      })
    ).rejects.toThrow('Unsupported network');
  });
});
```

**Integration Tests:**
```typescript
describe('Encryption workflow', () => {
  it('should encrypt and decrypt value end-to-end', async () => {
    const value = 42;

    // Encrypt
    const encrypted = await encryptInput(client, value);
    expect(encrypted.data).toBeDefined();

    // Decrypt
    const result = await userDecrypt(client, encrypted.data, contractAddress);
    expect(result.value).toBe(value);
  });
});
```

**Test Coverage:**
- Aim for >80% code coverage
- Test all edge cases
- Test error conditions
- Test async operations

---

## Pull Request Process

### 1. Create Pull Request

1. Push your changes to your fork
2. Go to the original repository
3. Click "New Pull Request"
4. Select your branch
5. Fill in the PR template

### 2. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 3. Review Process

- Maintainers will review your PR
- Address any feedback
- Keep PR focused on single issue/feature
- Be responsive to comments

### 4. Merge Criteria

PR must meet these criteria:
- ✅ All tests passing
- ✅ Code review approved
- ✅ No merge conflicts
- ✅ Documentation updated
- ✅ Follows coding standards

---

## Documentation

### Code Documentation

**JSDoc Comments:**
```typescript
/**
 * Encrypts a value using FHEVM encryption
 *
 * @param client - Initialized FHEVM client
 * @param value - Value to encrypt (0-255 for euint8)
 * @param options - Optional encryption options
 * @returns Promise resolving to encrypted value with metadata
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(client, 42);
 * console.log(encrypted.data); // "0x..."
 * ```
 */
export async function encryptInput(
  client: FhevmClient,
  value: number,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  // Implementation...
}
```

### README Updates

When adding features:
1. Update relevant README files
2. Add code examples
3. Update API documentation
4. Add to CHANGELOG.md

### Example Updates

When adding examples:
1. Include complete working code
2. Add comments explaining key concepts
3. Provide setup instructions
4. Test example works

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - Questions, ideas, general discussion
- **Zama Discord** - Real-time chat, community support

### Getting Help

**Before asking:**
1. Check existing issues/discussions
2. Review documentation
3. Search Discord history

**When asking:**
1. Provide clear description
2. Include code examples
3. Share error messages
4. Describe what you've tried

### Helping Others

- Answer questions in issues/discussions
- Review pull requests
- Improve documentation
- Share your experiences

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

- Open a [GitHub Discussion](https://github.com/SidLebsack/fhevm-react-template/discussions)
- Ask in [Zama Discord](https://discord.com/invite/zama)
- Email: [Contact maintainers]

---

Thank you for contributing to the FHEVM Universal SDK! 🎉
