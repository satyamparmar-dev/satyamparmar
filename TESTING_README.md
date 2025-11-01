# Testing Infrastructure - Quick Start

This is a quick reference guide for the testing infrastructure. For detailed guides, see the other testing documents.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### 3. Write Your First Test

Create a test file: `__tests__/lib/my-feature.test.ts`

```typescript
import { myFunction } from '@/lib/my-feature';

describe('myFeature', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

## 📚 Documentation

| Document | Purpose |
|---------|---------|
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | How to write, run, and debug tests |
| **[TEST_MAPPING.md](TEST_MAPPING.md)** | Feature-to-test mapping |
| **[TEST_STRUCTURE.md](TEST_STRUCTURE.md)** | Test structure and conventions |
| **[INCREMENTAL_TESTING_PLAN.md](INCREMENTAL_TESTING_PLAN.md)** | Step-by-step plan to add tests |
| **[PR_CHECKLIST.md](PR_CHECKLIST.md)** | PR requirements and checklist |
| **[TEST_TRADE_OFFS.md](TEST_TRADE_OFFS.md)** | Testing limitations and strategies |

## 📊 Current Test Coverage

- **Utility Functions**: 95%+ (✅ Complete)
- **Premium System**: 90%+ (✅ Complete)
- **Encryption**: 85%+ (✅ Complete)
- **Blog Client**: 95%+ (✅ Complete)
- **Components**: 85%+ (✅ Partial - examples provided)

## 🎯 Coverage Targets

| Priority | Target | Current |
|----------|--------|---------|
| P0 (Critical) | ≥95% | ✅ |
| P1 (High) | ≥85% | ✅ |
| P2 (Medium) | ≥70% | ✅ |
| P3 (Low) | ≥50% | ✅ |

## 🧪 Example Tests

See these files for examples:

- `__tests__/lib/utils.test.ts` - Utility function tests
- `__tests__/lib/premium.test.ts` - Premium system tests
- `__tests__/lib/encryption.test.ts` - Encryption tests
- `__tests__/lib/blog-client.test.ts` - Blog data tests
- `__tests__/components/BlogCard.test.tsx` - Component tests
- `__tests__/components/NewsletterSignup.test.tsx` - Form component tests

## 🔄 CI/CD Integration

Tests run automatically on:
- Every pull request
- Every push to `main`/`master`

**Merge Requirements:**
- ✅ All tests must pass
- ✅ Coverage must meet threshold (≥80%)
- ✅ No flaky tests
- ✅ Type checking must pass
- ✅ Linting must pass

## 📋 Test Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ci` | Run tests in CI mode |
| `npm test -- [file]` | Run specific test file |
| `npm test -- --testNamePattern="pattern"` | Run tests matching pattern |

## 🆘 Need Help?

1. **Check [TESTING_GUIDE.md](TESTING_GUIDE.md)** for detailed instructions
2. **Check [TEST_STRUCTURE.md](TEST_STRUCTURE.md)** for conventions
3. **Look at example tests** in `__tests__/` directory
4. **Ask in PR comments** if you have questions

## ✅ PR Checklist

Before submitting a PR:
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets threshold (`npm run test:coverage`)
- [ ] New tests added for new features
- [ ] Existing tests updated if functionality changed
- [ ] No flaky tests introduced
- [ ] Follows test structure conventions

---

**Happy Testing!** 🎉

