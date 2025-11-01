# Developer Onboarding - Testing

**One-page guide** for new developers on how to write, run, fix tests, interpret CI results, and debug failed tests.

---

## 📝 Writing Tests

### Quick Start

```typescript
// __tests__/lib/my-feature.test.ts
import { myFunction } from '@/lib/my-feature';

describe('myFeature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Naming Convention
- File: `feature-name.test.ts` or `ComponentName.test.tsx`
- Test: `it('should [expected behavior]', ...)`

### Where to Put Tests
- Components: `__tests__/components/ComponentName.test.tsx`
- Utilities: `__tests__/lib/utility-name.test.ts`

---

## 🏃 Running Tests

### Local Development

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific file
npm test -- utils.test.ts
```

### CI Mode

```bash
# Run tests in CI mode (non-interactive)
npm run test:ci
```

---

## 🐛 Fixing Tests

### Step 1: Read the Error

Error messages show:
- Expected value
- Actual value
- File and line number

### Step 2: Run Locally

```bash
npm test -- --verbose [test-file]
```

### Step 3: Common Fixes

**Issue: "Cannot find module"**
- Check import path
- Verify file exists
- Check `jest.config.js` paths

**Issue: "localStorage is not defined"**
- Already mocked in `jest.setup.js`
- If still fails, check test isolation

**Issue: Flaky test**
- Check for race conditions
- Use `waitFor` for async
- Ensure cleanup in `afterEach`

### Step 4: Verify Fix

```bash
npm test
npm run test:coverage
```

---

## 📊 Interpreting CI Results

### GitHub Actions

1. **Open your PR** → Click "Checks" tab
2. **View test status:**
   - ✅ Green = Passed
   - ❌ Red = Failed

3. **Click "Details"** to see:
   - Failed tests
   - Coverage report
   - Error logs

### Coverage Report

Look for PR comment:
- **Lines**: Overall coverage %
- **Threshold**: Must be ≥80%
- **If below**: Add more tests

### Failed Tests

If tests fail:
1. Click "Details" → See error logs
2. Run locally: `npm run test:ci`
3. Fix the issue
4. Push changes
5. CI re-runs automatically

### Merge Requirements

✅ **All of these must pass:**
- All tests pass
- Coverage ≥80%
- Type checking passes
- Linting passes
- Build succeeds

❌ **If any fail:** PR cannot be merged

---

## 🔍 Debugging Failed Tests

### Method 1: Run Locally

```bash
# Reproduce CI failure locally
npm run test:ci

# Or with more details
npm test -- --verbose
```

### Method 2: Use Debugger

Add `debugger` in test:

```typescript
it('should do something', () => {
  const input = 'test';
  debugger; // Execution pauses here
  const result = myFunction(input);
  expect(result).toBe('expected');
});
```

Run with debugger:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand [test-file]
```

### Method 3: Check Test Isolation

Ensure tests:
- Don't depend on each other
- Clean up after themselves
- Use fresh data for each test

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Watch mode | `npm run test:watch` |
| Coverage | `npm run test:coverage` |
| CI mode | `npm run test:ci` |
| Run file | `npm test -- [file]` |

---

## 📚 More Help

- **Detailed guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Test structure**: [TEST_STRUCTURE.md](TEST_STRUCTURE.md)
- **Examples**: Check `__tests__/` directory

---

**Welcome!** 🎉 If you need help, ask in PR comments.

