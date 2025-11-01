# Test Structure and Conventions

This document outlines the test structure, naming conventions, and guidelines for test data management.

## 📁 Directory Structure

```
__tests__/
├── __mocks__/              # Manual mocks for external dependencies
│   ├── next/
│   │   └── navigation.ts
│   ├── framer-motion.ts
│   └── lucide-react.ts
├── components/             # Component tests
│   ├── BlogCard.test.tsx
│   ├── NewsletterSignup.test.tsx
│   └── ContactForm.test.tsx
├── lib/                    # Utility function tests
│   ├── utils.test.ts
│   ├── premium.test.ts
│   ├── encryption.test.ts
│   └── blog-client.test.ts
└── integration/            # Integration tests (if any)
    └── api.test.ts
```

## 📝 Naming Conventions

### Test Files

- **Unit tests**: `*.test.ts` or `*.test.tsx`
- **Integration tests**: `*.integration.test.ts`
- **E2E tests**: `*.e2e.test.ts`
- **Snapshot tests**: `*.snapshot.test.tsx`

**Examples:**
- `utils.test.ts` - Unit tests for utils.ts
- `BlogCard.test.tsx` - Component tests
- `api.integration.test.ts` - Integration tests

### Test Suites

```typescript
describe('Feature Name', () => {
  // Tests for this feature
});
```

### Test Cases

```typescript
it('should do something specific', () => {
  // Test implementation
});

// Or with async:
it('should handle async operation', async () => {
  // Async test
});
```

**Naming Pattern:**
- `should [expected behavior]`
- `should [action] when [condition]`
- `should handle [edge case]`

**Examples:**
- `should format date correctly`
- `should validate email format`
- `should handle empty strings gracefully`
- `should render blog post title`

## 🧪 Test Data Management

### Test Fixtures

Create reusable test data in separate files:

```typescript
// __tests__/fixtures/blog-posts.ts
export const mockBlogPost: BlogPost = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  date: '2025-01-18',
  author: 'Satyam Parmar',
  tags: ['backend', 'nodejs'],
  excerpt: 'This is a test excerpt.',
  content: '# Test Content\n\nThis is test content.',
};
```

### Test Doubles

Use mocks, stubs, and spies for external dependencies:

```typescript
// Mock external service
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

### Mock Files

Place manual mocks in `__tests__/__mocks__/`:

```typescript
// __tests__/__mocks__/next/navigation.ts
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
}));
```

## 🎯 Test Organization

### Arrange-Act-Assert (AAA) Pattern

```typescript
it('should format date correctly', () => {
  // Arrange
  const date = '2025-01-18';
  
  // Act
  const result = formatDate(date);
  
  // Assert
  expect(result).toMatch(/January.*18.*2025/);
});
```

### Test Hooks

```typescript
describe('Feature', () => {
  // Runs once before all tests
  beforeAll(() => {
    // Setup
  });

  // Runs before each test
  beforeEach(() => {
    // Setup
    jest.clearAllMocks();
  });

  // Runs after each test
  afterEach(() => {
    // Cleanup
    localStorage.clear();
  });

  // Runs once after all tests
  afterAll(() => {
    // Teardown
  });
});
```

## 📋 Test Structure Template

```typescript
/**
 * Unit tests for [Component/Function Name] (path/to/file.ts)
 * 
 * Priority: P0/P1/P2/P3
 * Coverage Target: ≥XX%
 */

import { functionToTest } from '@/lib/utils';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = functionToTest('');
      expect(result).toBe('');
    });

    it('should handle invalid input', () => {
      const result = functionToTest(null);
      expect(typeof result).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Mock error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = functionToTest('invalid');
      expect(result).toBeTruthy();
      
      console.error.mockRestore();
    });
  });
});
```

## 🔧 Coverage Tools

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

### Coverage Reports

Generate coverage report:

```bash
npm run test:coverage
```

View HTML report:

```bash
open coverage/lcov-report/index.html
```

## 🛠️ Test Utilities

### Custom Matchers

Create custom Jest matchers if needed:

```typescript
// __tests__/setup/jest-matchers.ts
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});
```

### Test Helpers

Create reusable test helpers:

```typescript
// __tests__/helpers/test-utils.ts
export function createMockBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post',
    date: '2025-01-18',
    author: 'Satyam Parmar',
    tags: [],
    excerpt: '',
    content: '',
    ...overrides,
  };
}
```

## 📊 Test Coverage Guidelines

### Minimum Coverage

- **Overall**: ≥80%
- **P0 (Critical)**: ≥95%
- **P1 (High)**: ≥85%
- **P2 (Medium)**: ≥70%
- **P3 (Low)**: ≥50%

### What to Test

✅ **DO Test:**
- Core business logic
- Utility functions
- Component rendering
- User interactions
- Error handling
- Edge cases

❌ **DON'T Test:**
- Third-party library internals
- Framework code
- Implementation details (only behavior)

## 🔍 Flaky Test Detection

### Common Causes

1. **Timing issues**: Use `waitFor` for async operations
2. **Shared state**: Ensure tests are isolated
3. **Race conditions**: Use proper async/await
4. **Random data**: Use fixed test data

### Prevention

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

## 📚 Best Practices Summary

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Follow AAA pattern (Arrange-Act-Assert)**
4. **Keep tests small and focused**
5. **Use mocks for external dependencies**
6. **Clean up after tests**
7. **Test edge cases**
8. **Maintain test coverage thresholds**
9. **Avoid flaky tests**
10. **Document complex test logic**

## 🎓 Examples

See existing tests for examples:

- `__tests__/lib/utils.test.ts` - Utility function tests
- `__tests__/lib/premium.test.ts` - Premium system tests
- `__tests__/components/BlogCard.test.tsx` - Component tests
- `__tests__/components/NewsletterSignup.test.tsx` - Form component tests

---

**Questions?** Check `TESTING_GUIDE.md` or ask in PR comments.

