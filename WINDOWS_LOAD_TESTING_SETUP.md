# Load Testing Setup for Windows

## 🚨 PowerShell Execution Policy Issue

If you get an error like:
```
artillery : File cannot be loaded because running scripts is disabled
```

This is a **Windows PowerShell security policy**. Here are your options:

---

## ✅ Solution 1: Use npx (Recommended - No Admin Required)

**No execution policy change needed!** Just use `npx` to run Artillery:

```cmd
npx --yes artillery run loadtest-artillery.yml
```

Or use the batch file:
```cmd
run-loadtest.bat
```

This doesn't require changing PowerShell settings and works immediately.

---

## ✅ Solution 2: Change PowerShell Execution Policy (If You Have Admin Rights)

### Option A: Temporary Change (Current Session Only)

Open PowerShell **as Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Then run:
```cmd
artillery run loadtest-artillery.yml
```

### Option B: Permanent Change (For Current User)

Open PowerShell **as Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Note**: This requires administrator privileges.

---

## ✅ Solution 3: Use Command Prompt Instead of PowerShell

Instead of PowerShell, use **Command Prompt (cmd.exe)**:

1. Open **Command Prompt** (not PowerShell)
2. Navigate to your project directory:
   ```cmd
   cd D:\workspace\backend-engineering
   ```
3. Run:
   ```cmd
   npx --yes artillery run loadtest-artillery.yml
   ```

Command Prompt doesn't have the execution policy restriction.

---

## 🎯 Quick Start (Recommended for Windows)

### Step 1: Use the Batch File

Simply double-click or run:
```cmd
run-loadtest.bat
```

This uses `npx` which bypasses the execution policy issue.

### Step 2: Edit the Config File

Edit `loadtest-artillery.yml`:
- Change `target` URL to your website
- Adjust `arrivalRate` for number of users
- Modify `duration` for test length

### Step 3: Run the Test

```cmd
run-loadtest.bat
```

---

## 📊 Running Tests

### Basic Test (Quick)

```cmd
npx --yes artillery run loadtest-artillery.yml
```

### Save Results to File

```cmd
npx --yes artillery run loadtest-artillery.yml --output results.json
```

### Generate HTML Report

```cmd
npx --yes artillery report results.json
```

This creates an HTML report you can open in your browser.

---

## 🔧 Alternative: Install Artillery Locally (No Global Install)

If you prefer to avoid the global install:

1. **Install locally in project:**
   ```cmd
   npm install --save-dev artillery
   ```

2. **Run via npm script** (add to `package.json`):
   ```json
   "scripts": {
     "loadtest": "artillery run loadtest-artillery.yml"
   }
   ```

3. **Run:**
   ```cmd
   npm run loadtest
   ```

---

## 📝 Example Commands

### Test with Custom Duration

```cmd
REM Edit loadtest-artillery.yml first, then:
npx --yes artillery run loadtest-artillery.yml
```

### Test Specific Phase

```cmd
npx --yes artillery run loadtest-artillery.yml --only-phase "Warm up"
```

### Save and View Report

```cmd
REM Run test and save results
npx --yes artillery run loadtest-artillery.yml --output results.json

REM Generate HTML report
npx --yes artillery report results.json

REM Open results.html in browser
```

---

## 🛠️ Troubleshooting

### "artillery not found"
- **Fix**: Use `npx --yes artillery` instead of just `artillery`

### "Cannot be loaded" (Execution Policy)
- **Fix**: Use `npx` or change execution policy (see Solution 2)

### "Scripts disabled"
- **Fix**: Use `run-loadtest.bat` which uses `npx`

### Slow First Run
- **Normal**: First time `npx` downloads Artillery (one-time)

---

## 💡 Tips for Windows Users

1. **Use Command Prompt**: Avoids PowerShell execution policy issues
2. **Use npx**: No need to change execution policy
3. **Use Batch Files**: `.bat` files work without policy restrictions
4. **Local Install**: Install Artillery as dev dependency if preferred

---

## 📚 Next Steps

1. ✅ Run `run-loadtest.bat` to test your website
2. ✅ Edit `loadtest-artillery.yml` to customize tests
3. ✅ Save results with `--output results.json`
4. ✅ View HTML report with `artillery report results.json`

---

**Quick Start**: Just run `run-loadtest.bat` and you're done! 🚀

