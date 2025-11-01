# Incremental Testing Plan

This document outlines a step-by-step plan to add tests incrementally without breaking existing functionality.

## 🎯 Goal

Add comprehensive test coverage to the Satyverse blog **one feature at a time**, ensuring existing functionality remains intact.

## 📋 Step-by-Step Plan

### Phase 1: Setup (Week 1)

**Goal:** Establish testing infrastructure

#### Step 1.1: Install Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

#### Step 1.2: Configure Jest
- ✅ Create `jest.config.js`
- ✅ Create `jest.setup.js`
- ✅ Add test scripts to `package.json`

#### Step 1.3: Verify Setup
```bash
npm test
```
Expected: Tests run (even if none exist yet)

#### Step 1.4: Create Test Structure
```bash
mkdir -p __tests__/lib __tests__/components __tests__/__mocks__
```

**Branch:** `feature/testing-setup`  
**PR:** "Add testing infrastructure"  
**Merge Criteria:** Setup verified, CI configured

---

### Phase 2: Utility Functions (Week 1-2)

**Goal:** Test all utility functions (`lib/utils.ts`)

#### Step 2.1: Test Critical Functions (P0)
Priority order:
1. `generateHeadingId()` - Used in TOC
2. `slugify()` - Used for URLs
3. `formatDate()` - Used in blog cards

```bash
# Create test file
touch __tests__/lib/utils.test.ts

# Run tests
npm test -- utils.test.ts
```

**Test Coverage Target:** ≥95%

#### Step 2.2: Test High Priority Functions (P1)
1. `truncateText()` - Used in excerpts
2. `getEstimatedReadTime()` - Used in blog cards
3. `formatDateShort()` - Used in listings

**Test Coverage Target:** ≥85%

#### Step 2.3: Test Medium Priority Functions (P2)
1. `cn()` - Used for styling
2. `generateMetadata()` - Used for SEO

**Test Coverage Target:** ≥70%

**Branch:** `feature/utils-tests`  
**PR:** "Add tests for utility functions"  
**Merge Criteria:** All tests pass, ≥80% coverage, existing functionality verified

---

### Phase 3: Premium System (Week 2)

**Goal:** Test premium content system (`lib/premium.ts`, `lib/encryption.ts`)

#### Step 3.1: Test Encryption Functions
```bash
touch __tests__/lib/encryption.test.ts
npm test -- encryption.test.ts
```

Functions to test:
1. `encrypt()`
2. `decrypt()`
3. `hashUserIdentifier()`

#### Step 3.2: Test Premium Functions
```bash
touch __tests__/lib/premium.test.ts
npm test -- premium.test.ts
```

Functions to test:
1. `isPremiumUser()`
2. `setPremiumUser()`
3. `clearPremiumUser()`
4. `canAccessContent()`

**Branch:** `feature/premium-tests`  
**PR:** "Add tests for premium system"  
**Merge Criteria:** All tests pass, ≥95% coverage, premium functionality verified

---

### Phase 4: Blog Data Management (Week 2-3)

**Goal:** Test blog data functions (`lib/blog-client.ts`)

#### Step 4.1: Test Core Functions
```bash
touch __tests__/lib/blog-client.test.ts
npm test -- blog-client.test.ts
```

Functions to test:
1. `getAllBlogPosts()`
2. `getBlogPostBySlug()`
3. `getBlogPostsByCategory()`
4. `getBlogPostsByTag()`
5. `searchBlogPosts()`

**Branch:** `feature/blog-client-tests`  
**PR:** "Add tests for blog data functions"  
**Merge Criteria:** All tests pass, ≥95% coverage, blog functionality verified

---

### Phase 5: UI Components (Week 3-4)

**Goal:** Test React components

#### Step 5.1: Test Critical Components (P0)
Priority:
1. `NewsletterSignup` - Newsletter subscription
2. `ContactForm` - Contact form submission

```bash
touch __tests__/components/NewsletterSignup.test.tsx
touch __tests__/components/ContactForm.test.tsx
npm test -- NewsletterSignup.test.tsx ContactForm.test.tsx
```

#### Step 5.2: Test High Priority Components (P1)
1. `BlogCard` - Blog post display
2. `BlogTOC` - Table of contents
3. `PremiumGate` - Premium access control

```bash
touch __tests__/components/BlogCard.test.tsx
touch __tests__/components/BlogTOC.test.tsx
touch __tests__/components/PremiumGate.test.tsx
```

#### Step 5.3: Test Medium Priority Components (P2)
1. `Pagination` - Pagination controls
2. `BlogSearch` - Search functionality
3. `SocialShare` - Social sharing

**Branch:** `feature/component-tests`  
**PR:** "Add tests for UI components"  
**Merge Criteria:** All tests pass, ≥85% coverage, UI functionality verified

---

### Phase 6: CI/CD Integration (Week 4)

**Goal:** Set up automated testing in CI/CD

#### Step 6.1: Configure GitHub Actions
```bash
# Create workflow file
touch .github/workflows/test.yml
```

**Workflow should:**
- Run tests on PRs
- Check coverage threshold
- Block merge if tests fail

#### Step 6.2: Configure Azure Pipelines (if used)
```bash
touch azure-pipelines.yml
```

#### Step 6.3: Test CI Pipeline
1. Create test PR
2. Verify tests run
3. Verify coverage check
4. Verify merge blocking

**Branch:** `feature/ci-testing`  
**PR:** "Add CI testing workflow"  
**Merge Criteria:** CI runs successfully, merge blocking works

---

### Phase 7: Documentation (Week 4)

**Goal:** Document testing practices

#### Step 7.1: Create Testing Guide
- ✅ `TESTING_GUIDE.md` - How to write and run tests
- ✅ `TEST_STRUCTURE.md` - Test structure and conventions
- ✅ `PR_CHECKLIST.md` - PR requirements

#### Step 7.2: Update README
Add testing section to README:

```markdown
## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for more details.
```

**Branch:** `feature/testing-docs`  
**PR:** "Add testing documentation"  
**Merge Criteria:** Documentation reviewed and approved

---

## 🔄 Incremental Approach

### For Each Phase:

1. **Create feature branch**
   ```bash
   git checkout -b feature/[feature-name]-tests
   ```

2. **Write tests**
   - Start with highest priority features
   - Write tests before/alongside code changes
   - Ensure tests are deterministic

3. **Run tests locally**
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Verify existing functionality**
   ```bash
   npm run dev
   # Manually test affected features
   ```

5. **Create PR**
   - Include test files
   - Include coverage report
   - Document any changes

6. **Get review**
   - Code review
   - Test review
   - Coverage check

7. **Merge**
   - All tests pass
   - Coverage threshold met
   - Existing functionality verified

### Merging Strategy

**Small PRs:** Merge tests for one feature at a time

**Benefits:**
- Easier review
- Faster feedback
- Less risk
- Gradual improvement

### Commands for Each Phase

```bash
# 1. Checkout main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/[feature-name]-tests

# 3. Write tests
# Edit __tests__/...

# 4. Run tests
npm test

# 5. Check coverage
npm run test:coverage

# 6. Commit
git add __tests__/
git commit -m "Add tests for [feature-name]"

# 7. Push
git push origin feature/[feature-name]-tests

# 8. Create PR
# Follow PR_CHECKLIST.md
```

---

## ✅ Verification Checklist

Before merging each phase:

- [ ] All new tests pass
- [ ] All existing tests pass
- [ ] Coverage threshold met
- [ ] No flaky tests
- [ ] Existing functionality verified manually
- [ ] Code reviewed
- [ ] Tests reviewed
- [ ] Documentation updated (if needed)

---

## 🚨 Rollback Plan

If tests break existing functionality:

1. **Identify issue** - Which test is failing?
2. **Check branch** - Is issue in new code or existing?
3. **Fix immediately** - Update test or fix code
4. **Re-run tests** - Verify fix works
5. **Update PR** - Push fix

If issue persists:
- Revert PR
- Investigate issue
- Fix in separate PR
- Re-attempt original PR

---

## 📊 Progress Tracking

Track progress in `TEST_MAPPING.md`:

- Mark completed tests with ✅
- Update coverage percentages
- Note any blockers
- Document decisions

---

## 🎯 Success Criteria

Phase is complete when:

1. ✅ All tests for phase pass
2. ✅ Coverage threshold met
3. ✅ CI/CD configured and working
4. ✅ Documentation complete
5. ✅ No regressions in existing functionality
6. ✅ Code reviewed and approved

---

**Questions?** Check `TESTING_GUIDE.md` or ask in PR comments.

