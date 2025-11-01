# CI Workflow Management Guide

This document explains how to enable and disable the Test Suite workflow for deployments and commits to the main branch.

## Current Status

**Test Suite Workflow: DISABLED** 🚫

The test suite is currently disabled to allow:
- Deployment to GitHub Pages without waiting for tests
- Commits to main branch without test blocking
- Faster development cycles

## How to Disable the Test Suite

The test suite can be disabled in two ways:

### Method 1: Comment Out Triggers (Recommended)

Edit `.github/workflows/test.yml` and comment out the `on:` section:

```yaml
# DISABLED: Test suite is currently disabled
# on:
#   pull_request:
#     branches: [main, master]
#   push:
#     branches: [main, master]

# Add manual trigger only
on:
  workflow_dispatch:  # Allows manual trigger from GitHub Actions UI
```

### Method 2: Add Condition to Skip Job

Add an `if: false` condition to the test job:

```yaml
jobs:
  test:
    name: Run Tests
    if: false  # Change to 'true' or remove this line to enable
    runs-on: ubuntu-latest
    # ... rest of the job
```

## How to Enable the Test Suite

To re-enable the test suite, follow these steps:

### Step 1: Edit the Workflow File

Open `.github/workflows/test.yml` in your editor.

### Step 2: Uncomment the Triggers

Replace the disabled configuration with the active triggers:

```yaml
name: Test Suite

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master, feature/ci-workflow]
    paths-ignore:
      - '**.md'
      - '.gitignore'
      - 'LICENSE'
```

### Step 3: Remove or Update the Condition

Remove the `if: false` condition from the test job:

```yaml
jobs:
  test:
    name: Run Tests
    # Remove 'if: false' line or change to 'if: true'
    runs-on: ubuntu-latest
    # ... rest of the job
```

### Step 4: Commit and Push

```bash
git add .github/workflows/test.yml
git commit -m "chore: enable test suite workflow"
git push origin main
```

## Manual Trigger

Even when disabled, you can manually trigger the test suite from the GitHub Actions UI:

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Select **Test Suite** from the workflow list
4. Click **Run workflow** button
5. Select the branch and click **Run workflow**

## When to Enable/Disable

### Disable the Test Suite When:
- ✅ You need to deploy quickly to production
- ✅ Tests are temporarily broken and blocking deployment
- ✅ You're doing major refactoring
- ✅ You need to merge hotfixes quickly
- ✅ CI/CD pipeline is under maintenance

### Enable the Test Suite When:
- ✅ You want to ensure code quality before merging
- ✅ You're working on a stable codebase
- ✅ You want PR comments with test results
- ✅ You want to enforce merge requirements
- ✅ You want coverage reports

## Workflow Details

### What the Test Suite Does

When enabled, the Test Suite workflow:

1. **Runs on**:
   - Pull requests to `main` or `master` branches
   - Pushes to `main`, `master`, or `feature/ci-workflow` branches
   - Manual trigger (workflow_dispatch)

2. **Executes**:
   - Installs dependencies (`npm ci`)
   - Type checking (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Tests with coverage (`npm run test:ci`)
   - Coverage threshold check (≥80%)

3. **Provides**:
   - Test results as PR comments
   - Coverage reports to Codecov
   - Merge blocking if tests fail

### Current Configuration

- **Node.js Versions**: 18.x, 20.x (matrix strategy)
- **Coverage Threshold**: 80%
- **Runs on**: Ubuntu Latest
- **Status**: ⚠️ **DISABLED**

## Troubleshooting

### Tests Fail After Re-enabling

If tests fail after re-enabling:

1. Check local test results: `npm test`
2. Verify `package-lock.json` is up to date: `npm ci`
3. Check GitHub Actions logs for specific errors
4. Ensure all dependencies are properly installed

### Workflow Not Running

If the workflow isn't running after enabling:

1. Verify the `on:` triggers are uncommented
2. Check that `if: false` is removed or changed to `true`
3. Ensure you're pushing to the correct branch
4. Check repository settings → Actions → Allow workflows

### Deployment Blocked by Tests

If deployment is blocked:

1. **Temporary**: Disable the workflow using Method 1 or 2
2. **Permanent**: Update deployment workflow to not depend on test workflow
3. **Fix**: Ensure all tests pass before deployment

## Related Files

- `.github/workflows/test.yml` - Test Suite workflow configuration
- `.github/workflows/deploy.yml` - Deployment workflow
- `package.json` - Test scripts configuration
- `jest.config.js` - Jest test configuration

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Conditional Execution](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)

---

**Last Updated**: 2025-11-01  
**Status**: Test Suite DISABLED ⚠️

