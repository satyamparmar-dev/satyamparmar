# Testing Trade-offs and Risk Areas

This document identifies areas that cannot be fully unit tested and provides strategies for safe testing.

## 🎯 Testing Strategy Overview

### Unit Tests (Can Fully Test)
- ✅ Pure utility functions
- ✅ Component rendering
- ✅ Business logic
- ✅ Data transformations
- ✅ Validation functions

### Integration Tests (Partial Coverage)
- ⚠️ External API calls (mocked in unit tests)
- ⚠️ Database operations (if added)
- ⚠️ File system operations
- ⚠️ Network requests

### E2E Tests (Limited Coverage)
- 🔴 Full user workflows
- 🔴 Cross-browser compatibility
- 🔴 Performance testing

## 🚫 Areas That Cannot Be Fully Unit Tested

### 1. External Services (Email, Analytics)

**Services:**
- EmailJS (Newsletter)
- Formspree (Contact Form)
- Google Forms (Newsletter)
- Google Analytics 4

**Why Can't Fully Test:**
- Requires external API calls
- Requires authentication
- Requires network connectivity
- May incur costs in testing

**Strategy: Mocking**

```typescript
// Mock EmailJS
jest.mock('@/lib/newsletter', () => ({
  submitNewsletterEmail: jest.fn().mockResolvedValue({
    ok: true,
    message: 'Success',
  }),
}));

// Mock Google Analytics
jest.mock('@/lib/analytics', () => ({
  trackNewsletterSignup: jest.fn(),
}));
```

**Testing Approach:**
1. ✅ Unit tests: Mock all external calls
2. ⚠️ Contract tests: Verify API responses match expected format
3. 🔴 Integration tests: Test with real services (optional, in staging)

**Coverage:** ≥90% with mocks

---

### 2. Browser APIs (localStorage, Cookies)

**Why Can't Fully Test:**
- Browser-specific behavior
- Security restrictions
- Storage limits
- SSR vs Client-side differences

**Strategy: Mocking**

```typescript
// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test with mocked storage
it('should store data in localStorage', () => {
  setPremiumUser(mockUser);
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
    'premium_user',
    expect.any(String)
  );
});
```

**Testing Approach:**
1. ✅ Unit tests: Mock browser APIs
2. ⚠️ Integration tests: Test in real browser (optional)

**Coverage:** ≥95% with mocks

---

### 3. Next.js Server Components

**Why Can't Fully Test:**
- Run on server, not in Jest
- Require Next.js runtime
- Static generation happens at build time

**Strategy: Component Extraction**

```typescript
// Extract logic to testable functions
export function getBlogPostData(slug: string) {
  // Testable logic
}

// Test the function, not the server component
it('should get blog post by slug', () => {
  const post = getBlogPostData('test-slug');
  expect(post).toBeDefined();
});
```

**Testing Approach:**
1. ✅ Unit tests: Test extracted logic
2. ✅ Component tests: Test client components
3. ⚠️ Static generation: Test at build time

**Coverage:** ≥85% with extraction

---

### 4. Static Site Generation (SSG)

**Why Can't Fully Test:**
- Happens at build time
- Requires Next.js build process
- Depends on file system structure

**Strategy: Build-time Verification**

```bash
# Test build succeeds
npm run build

# Verify static files generated
ls -la out/
```

**Testing Approach:**
1. ✅ Build verification: Test build succeeds
2. ✅ File verification: Check generated files
3. ⚠️ Content verification: Check generated content

**Coverage:** ≥80% with build tests

---

### 5. SEO and Metadata

**Why Can't Fully Test:**
- Generated at build time
- Requires HTML parsing
- Depends on Next.js metadata API

**Strategy: Function Testing**

```typescript
// Test metadata generation function
it('should generate correct metadata', () => {
  const metadata = generateMetadata('Title', 'Description', ['tag1']);
  expect(metadata.title).toBe('Title | Backend Engineering Blog');
});
```

**Testing Approach:**
1. ✅ Unit tests: Test metadata generation
2. ⚠️ Integration tests: Verify in generated HTML (optional)

**Coverage:** ≥85% with function tests

---

### 6. Dark Mode / Theme System

**Why Can't Fully Test:**
- Depends on CSS
- Depends on localStorage
- Depends on browser media queries

**Strategy: State Testing**

```typescript
// Test theme state management
it('should toggle dark mode', () => {
  const { result } = renderHook(() => useTheme());
  act(() => {
    result.current.toggle();
  });
  expect(result.current.isDark).toBe(true);
});
```

**Testing Approach:**
1. ✅ Unit tests: Test state logic
2. ⚠️ Visual tests: Manual verification (optional)

**Coverage:** ≥80% with state tests

---

## 🔒 Risk Mitigation Strategies

### Strategy 1: Mocking External Dependencies

**When to Use:**
- External API calls
- Browser APIs
- Third-party services

**Benefits:**
- Fast tests
- No external dependencies
- Deterministic results

**Limitations:**
- Doesn't test actual integration
- May miss API changes

**Example:**
```typescript
jest.mock('@/lib/newsletter', () => ({
  submitNewsletterEmail: jest.fn(),
}));
```

---

### Strategy 2: Contract Testing

**When to Use:**
- External APIs with contracts
- Service integrations

**Benefits:**
- Validates API compatibility
- Catches breaking changes

**Limitations:**
- Requires API access
- May need separate test environment

**Example:**
```typescript
it('should match newsletter API contract', async () => {
  const response = await submitNewsletterEmail('test@example.com');
  expect(response).toHaveProperty('ok');
  expect(response).toHaveProperty('message');
});
```

---

### Strategy 3: Integration Test Stage

**When to Use:**
- Critical user flows
- Payment processing
- Authentication flows

**Benefits:**
- Tests real integrations
- Catches integration issues

**Limitations:**
- Slower than unit tests
- Requires test environment
- May have flakiness

**Example:**
```typescript
// In separate integration test suite
describe('Newsletter Integration', () => {
  it('should submit to Google Forms', async () => {
    // Test with real Google Forms (in staging)
  });
});
```

---

### Strategy 4: Manual Testing Checklist

**When to Use:**
- Visual testing
- Cross-browser testing
- Performance testing

**Benefits:**
- Catches visual issues
- Tests real user experience

**Limitations:**
- Time-consuming
- Not automated
- Subjective

**Example:**
```
Manual Testing Checklist:
- [ ] Newsletter form works in Chrome
- [ ] Newsletter form works in Firefox
- [ ] Dark mode toggles correctly
- [ ] Mobile layout looks good
```

---

## 📊 Coverage by Testing Strategy

| Feature | Unit Tests | Integration Tests | Manual Tests | Total Coverage |
|---------|-----------|-------------------|--------------|----------------|
| Utility Functions | ✅ 95% | N/A | N/A | **95%** |
| Components | ✅ 85% | ⚠️ 10% | 🔴 5% | **90%** |
| Premium System | ✅ 90% | ⚠️ 5% | 🔴 5% | **90%** |
| Newsletter | ✅ 85% | ⚠️ 10% | 🔴 5% | **85%** |
| External APIs | ✅ 70% | ⚠️ 15% | 🔴 15% | **80%** |
| Static Generation | ✅ 80% | ⚠️ 10% | 🔴 10% | **80%** |

---

## ⚠️ Known Limitations

### 1. Email Services

**Limitation:** Can't test actual email delivery

**Mitigation:**
- Mock email submission
- Test email format/validation
- Manual testing in staging

**Risk Level:** 🟡 Medium (free tier, no critical path)

---

### 2. Analytics

**Limitation:** Can't test actual GA4 tracking

**Mitigation:**
- Mock `gtag` function
- Verify event calls
- Manual verification in GA4 dashboard

**Risk Level:** 🟢 Low (not critical for functionality)

---

### 3. Premium System (Client-Side)

**Limitation:** Client-side security can be bypassed

**Mitigation:**
- Test logic thoroughly
- Document as non-production-grade
- Consider server-side migration

**Risk Level:** 🟠 Medium (not for production security)

---

### 4. Static Export

**Limitation:** Can't fully test GitHub Pages deployment

**Mitigation:**
- Test build process
- Verify generated files
- Manual testing after deployment

**Risk Level:** 🟡 Medium (catches build issues)

---

## ✅ Safe Testing Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good: Test behavior
it('should format date correctly', () => {
  expect(formatDate('2025-01-18')).toMatch(/January.*18.*2025/);
});

// ❌ Bad: Test implementation
it('should call toLocaleDateString', () => {
  const spy = jest.spyOn(Date.prototype, 'toLocaleDateString');
  formatDate('2025-01-18');
  expect(spy).toHaveBeenCalled();
});
```

### 2. Use Mocks for External Dependencies

```typescript
// Always mock external services
jest.mock('@/lib/newsletter');
jest.mock('@/lib/analytics');
```

### 3. Test Edge Cases

```typescript
// Test empty input
it('should handle empty strings', () => {
  expect(formatDate('')).toBeTruthy();
});

// Test invalid input
it('should handle invalid dates', () => {
  expect(formatDate('invalid')).toBeTruthy();
});
```

### 4. Keep Tests Deterministic

```typescript
// ✅ Good: Fixed test data
const date = '2025-01-18';

// ❌ Bad: Random data
const date = new Date().toISOString();
```

---

## 📝 Summary

**Can Fully Test:**
- ✅ Utility functions (95%+)
- ✅ Component rendering (85%+)
- ✅ Business logic (90%+)
- ✅ Data transformations (95%+)

**Partially Testable (with mocks):**
- ⚠️ External APIs (80%+ with mocks)
- ⚠️ Browser APIs (90%+ with mocks)
- ⚠️ Static generation (80%+ with build tests)

**Requires Manual Testing:**
- 🔴 Visual design
- 🔴 Cross-browser compatibility
- 🔴 Performance
- 🔴 User experience

**Overall Coverage Target:** ≥80% with unit tests + mocks

---

**Questions?** See `TESTING_GUIDE.md` or ask in PR comments.

