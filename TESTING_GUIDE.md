# Testing Guide

This guide explains how to write, run, and debug tests for the Satyverse blog.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Writing Tests](#writing-tests)
3. [Running Tests](#running-tests)
4. [Debugging Failed Tests](#debugging-failed-tests)
5. [Test Structure](#test-structure)
6. [Best Practices](#best-practices)
7. [Interpreting CI Results](#interpreting-ci-results)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn installed

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests to verify setup:**
   ```bash
   npm test
   ```

## ✍️ Writing Tests

### Test File Location

Tests should be placed in `__tests__/` directory, mirroring the source structure:

```
src/
  lib/
    utils.ts
__tests__/
  lib/
    utils.test.ts
```

### Test Structure

```typescript
/**
 * Unit tests for [Component/Function Name]
 * 
 * Priority: P0/P1/P2/P3
 * Coverage Target: ≥XX%
 */

import { functionToTest } from '@/lib/utils';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Testing Utility Functions

```typescript
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format ISO date correctly', () => {
    const date = '2025-01-18';
    const result = formatDate(date);
    expect(result).toMatch(/January.*18.*2025/);
  });

  it('should handle invalid dates', () => {
    const result = formatDate('invalid');
    expect(typeof result).toBe('string');
  });
});
```

## 🏃 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- utils.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="formatDate"
```

### Run Tests in CI Mode

```bash
npm run test:ci
```

## 🐛 Debugging Failed Tests

### 1. Read the Error Message

Start with the error message. It usually tells you:
- What was expected
- What was actually received
- The file and line number where it failed

### 2. Run Tests Locally

```bash
npm test -- --verbose
```

This shows more detailed output about what's happening.

### 3. Use Debugger

Add `debugger` statement in your test:

```typescript
it('should do something', () => {
  const input = 'test';
  debugger; // Execution will pause here
  const result = functionToTest(input);
  expect(result).toBe('expected');
});
```

Then run:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand [test-file]
```

### 4. Check Test Isolation

Make sure tests don't depend on each other. Each test should:
- Set up its own data
- Clean up after itself
- Not rely on global state

### 5. Check Mocks

Verify mocks are set up correctly:

```typescript
// Before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 6. Common Issues

**Issue: "Cannot find module"**
- Check import paths
- Verify file exists
- Check `jest.config.js` module paths

**Issue: "localStorage is not defined"**
- Use jsdom test environment
- Mock localStorage in `jest.setup.js`

**Issue: "window is not defined"**
- Mock browser APIs
- Use `jest.setup.js` for global mocks

**Issue: Flaky tests**
- Check for race conditions
- Use `waitFor` for async operations
- Ensure proper cleanup

## 📁 Test Structure

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: `describe('Feature Name', ...)`
- Test cases: `it('should do something specific', ...)`

### File Organization

```
__tests__/
  __mocks__/          # Manual mocks
    next/
      navigation.ts
  components/          # Component tests
    BlogCard.test.tsx
  lib/                # Utility function tests
    utils.test.ts
    premium.test.ts
```

## ✅ Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
it('should call formatDate function', () => {
  const spy = jest.spyOn(utils, 'formatDate');
  render(<Component />);
  expect(spy).toHaveBeenCalled();
});
```

✅ **Good:**
```typescript
it('should display formatted date', () => {
  render(<Component date="2025-01-18" />);
  expect(screen.getByText(/January.*18.*2025/)).toBeInTheDocument();
});
```

### 2. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('works', () => { ... });
```

✅ **Good:**
```typescript
it('should format ISO date string to readable format', () => { ... });
```

### 3. Test Edge Cases

```typescript
it('should handle empty strings', () => {
  expect(formatDate('')).toBe('');
});

it('should handle invalid dates', () => {
  expect(formatDate('invalid')).toBeTruthy();
});
```

### 4. Keep Tests Small and Focused

Each test should verify one thing:

```typescript
it('should format date correctly', () => { ... });
it('should handle invalid input', () => { ... });
it('should handle edge cases', () => { ... });
```

### 5. Use Mocks for External Dependencies

```typescript
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));
```

### 6. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

## 📊 Interpreting CI Results

### GitHub Actions

1. **Go to your PR** → Check the "Checks" tab
2. **View test results:**
   - ✅ Green checkmark = Tests passed
   - ❌ Red X = Tests failed

3. **Click on "Details"** to see:
   - Which tests failed
   - Coverage reports
   - Error messages

### Coverage Reports

Coverage is shown in the PR comment:
- **Lines**: Code coverage percentage
- **Statements**: Statement coverage
- **Functions**: Function coverage
- **Branches**: Branch coverage

**Threshold:** ≥80% overall, ≥95% for P0 features

### Failed Tests

If tests fail in CI:

1. **Click "Details"** to see error logs
2. **Run tests locally** to reproduce:
   ```bash
   npm run test:ci
   ```
3. **Fix the issue** and push again
4. **Wait for CI** to re-run

### Coverage Below Threshold

If coverage is below threshold:

1. **Check coverage report:**
   ```bash
   npm run test:coverage
   ```
2. **Open `coverage/lcov-report/index.html`** in browser
3. **Find uncovered code** and add tests
4. **Push changes** and re-run CI

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests in CI mode |
| `npm test -- [file]` | Run specific test file |
| `npm test -- --testNamePattern="pattern"` | Run tests matching pattern |

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Need Help?** Ask in PR comments or open an issue.

