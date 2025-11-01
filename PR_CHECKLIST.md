# Pull Request Checklist

This checklist must be completed before a PR can be merged into `main`/`master`.

## 🔍 Pre-Submission Checklist

### Code Quality
- [ ] Code follows project style guidelines
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] All TypeScript/ESLint errors resolved
- [ ] Code is formatted (Prettier or project formatter)

### Testing
- [ ] **All existing tests pass** (`npm test`)
- [ ] **New tests added for new features** (at least 80% coverage for new code)
- [ ] **Existing tests updated if functionality changed**
- [ ] **No flaky tests introduced**
- [ ] Tests run locally without errors
- [ ] Test names are descriptive and follow naming convention
- [ ] Mocks are used for external dependencies

### Documentation
- [ ] README updated if needed
- [ ] Code comments added for complex logic
- [ ] API documentation updated (if applicable)
- [ ] Changelog updated (if applicable)

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] No breaking changes (or documented if intentional)

## 🧪 CI/CD Requirements

All of the following must pass in CI before merging:

- [ ] **Type checking passes** (`npm run typecheck`)
- [ ] **Linting passes** (`npm run lint`)
- [ ] **All unit tests pass** (`npm run test:ci`)
- [ ] **Code coverage meets threshold** (≥80% overall, ≥95% for P0 features)
- [ ] **No new flaky tests**
- [ ] **Build succeeds** (`npm run build`)

## 📋 Reviewer Checklist

Reviewers should verify:

- [ ] Code follows architectural patterns
- [ ] Performance implications considered
- [ ] Security implications considered
- [ ] Accessibility requirements met (if applicable)
- [ ] Backward compatibility maintained (if applicable)
- [ ] Tests are meaningful and not just coverage for coverage's sake
- [ ] Test assertions are clear and verify correct behavior

## 🚫 Blocking Issues

The following will **block merging**:

- ❌ Any failing tests
- ❌ Code coverage below threshold
- ❌ TypeScript errors
- ❌ ESLint errors
- ❌ Build failures
- ❌ Flaky tests
- ❌ Breaking changes without migration guide

## ✅ Merge Approval

Once all checkboxes are checked and CI passes:

1. **Get approval from at least one reviewer**
2. **Ensure all CI checks are green**
3. **Merge using "Squash and merge" or "Rebase and merge"**
4. **Delete feature branch after merge**

## 📝 Post-Merge

After merging:

- [ ] Verify deployment succeeded (if automated)
- [ ] Monitor error logs for new issues
- [ ] Update related tickets/issues

---

**Note:** If you have questions about any item, ask in the PR comments before marking as complete.

