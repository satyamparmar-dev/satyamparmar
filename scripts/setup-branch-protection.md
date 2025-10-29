# Branch Protection Setup Guide

This guide will help you set up branch protection rules to prevent direct commits to the main branch and require Pull Request approval.

## 🔒 GitHub Branch Protection Rules

### Step 1: Access Repository Settings
1. Go to your GitHub repository: `https://github.com/satyamparmar-dev/satyamparmar`
2. Click on **"Settings"** tab
3. Click on **"Branches"** in the left sidebar

### Step 2: Add Branch Protection Rule
1. Click **"Add rule"** button
2. In **"Branch name pattern"**, enter: `main`
3. Configure the following settings:

#### ✅ Required Settings:
- [x] **Require a pull request before merging**
  - [x] **Require approvals** (set to 1)
  - [x] **Dismiss stale PR approvals when new commits are pushed**
  - [x] **Require review from code owners** (if you have CODEOWNERS file)

- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**
  - [x] Select these status checks:
    - `check-pr-requirements`
    - `validate-pr`
    - `build`

- [x] **Require conversation resolution before merging**

- [x] **Restrict pushes that create files that are larger than 100 MB**

- [x] **Do not allow bypassing the above settings**

#### ⚠️ Important Settings:
- [x] **Include administrators** (applies rules to admins too)
- [x] **Allow force pushes** (unchecked)
- [x] **Allow deletions** (unchecked)

### Step 3: Save the Rule
1. Click **"Create"** button
2. Confirm the rule is active

## 🚀 How to Use After Setup

### For New Features:
```bash
# 1. Create a new branch
git checkout -b feature/your-feature-name

# 2. Make your changes
git add .
git commit -m "feat: Add your feature"

# 3. Push the branch
git push origin feature/your-feature-name

# 4. Create Pull Request on GitHub
# 5. Request review from team members
# 6. Get approval and merge through GitHub interface
```

### For Bug Fixes:
```bash
# 1. Create a new branch
git checkout -b fix/describe-the-fix

# 2. Make your changes
git add .
git commit -m "fix: Describe the fix"

# 3. Push the branch
git push origin fix/describe-the-fix

# 4. Create Pull Request on GitHub
# 5. Get approval and merge
```

## 🔍 What Happens When You Try Direct Commits

If someone tries to commit directly to main:

1. **GitHub will block the push** with an error message
2. **The workflow will fail** and show detailed instructions
3. **The commit will be rejected** until they use a PR

## 📋 Benefits

- ✅ **Code Quality**: All changes are reviewed
- ✅ **Security**: Prevents accidental commits
- ✅ **Collaboration**: Team members must approve changes
- ✅ **History**: Clean commit history with proper PR descriptions
- ✅ **CI/CD**: All changes must pass tests before merging

## 🛠️ Troubleshooting

### If You Need Emergency Access:
1. Temporarily disable branch protection in Settings
2. Make your emergency fix
3. Re-enable branch protection
4. Create a PR to document the emergency change

### If Workflow Fails:
1. Check the Actions tab for error details
2. Fix the issues in your branch
3. Push again to trigger re-run
4. The PR will automatically update

## 📞 Support

If you need help setting up branch protection or have questions about the workflow, please:
1. Check the GitHub documentation
2. Review the workflow logs in Actions tab
3. Contact the repository administrators
