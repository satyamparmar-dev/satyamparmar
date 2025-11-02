# Load Testing Guide - How Configuration Files Work

## 📚 Overview

Configuration files for load testing are **simple text files** that describe:
- **Which URLs/pages to test**
- **How many users to simulate**
- **How fast to send requests**
- **What to measure/validate**

You edit these files, then run a command to execute the test.

---

## 🔄 How It Works (Step-by-Step)

### Step 1: Choose a Tool
You select a load testing tool (k6, Artillery, etc.)

### Step 2: Create/Edit Config File
You create a configuration file that describes your test:
```yaml
# Example: test.yml
target: https://your-site.com
phases:
  - duration: 60
    arrivalRate: 10  # 10 users per second
```

### Step 3: Run the Test
You run a simple command:
```bash
artillery run test.yml
```

### Step 4: View Results
The tool prints results showing:
- Response times
- Error rates
- Requests per second
- Success/failure rates

---

## 🛠️ Tools Using Configuration Files

### 1. **k6** (JavaScript Config)
- **Config File**: `.js` file
- **Command**: `k6 run loadtest.js`
- **Pros**: Powerful, modern, good performance
- **Cons**: Need to install Node.js/k6

### 2. **Artillery.io** (YAML Config)
- **Config File**: `.yml` file
- **Command**: `artillery run test.yml`
- **Pros**: Very simple YAML syntax, easy to read
- **Cons**: Node.js based

### 3. **Apache Bench (ab)** (Command-Line)
- **Config**: Command-line arguments
- **Command**: `ab -n 1000 -c 100 https://site.com/`
- **Pros**: Built-in on many systems, very simple
- **Cons**: Basic functionality, single URL only

### 4. **Locust** (Python Config)
- **Config File**: `.py` file (Python code)
- **Command**: `locust -f loadtest.py`
- **Pros**: Very flexible, web UI
- **Cons**: Need Python

---

## 📝 Configuration File Structure

### Example: Artillery.io (YAML)
```yaml
config:
  target: 'https://your-site.com'
  phases:
    - duration: 60      # Test for 60 seconds
      arrivalRate: 10   # 10 new users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50   # Ramp up to 50 users/second
      name: "Ramp up load"
    - duration: 180
      arrivalRate: 50   # Stay at 50 users/second
      name: "Sustained load"

scenarios:
  - name: "Browse homepage"
    flow:
      - get:
          url: "/"
          expect:
            - statusCode: 200
            - contentType: html
  
  - name: "View blog post"
    flow:
      - get:
          url: "/blog"
      - get:
          url: "/blog/{{ $randomString() }}"
```

**What this means:**
- `target`: Your website URL
- `phases`: Different load stages (warm up, ramp up, sustained)
- `arrivalRate`: New users per second
- `scenarios`: What each virtual user does
- `expect`: Validation rules (must get 200 status, HTML content)

---

## 🚀 Workflow Example

### Scenario: Test your blog with 100 concurrent users

**1. Create config file** (`loadtest.yml`):
```yaml
config:
  target: 'https://satyamparmar-dev.github.io/satyamparmar'
  phases:
    - duration: 60
      arrivalRate: 10   # Start with 10 users/sec
    - duration: 120
      arrivalRate: 50   # Increase to 50 users/sec
```

**2. Install tool** (one-time):
```bash
npm install -g artillery
```

**3. Run test:**
```bash
artillery run loadtest.yml
```

**4. Results appear:**
```
Phase 1: 60 seconds @ 10 users/sec
- Requests: 600
- Mean response time: 245ms
- 95th percentile: 450ms
- Errors: 0%

Phase 2: 120 seconds @ 50 users/sec
- Requests: 6000
- Mean response time: 320ms
- 95th percentile: 680ms
- Errors: 0.1%
```

---

## 📊 What You Can Test

### 1. **Homepage** (`/`)
- Most visited page
- Tests basic performance

### 2. **Blog Listing** (`/blog`)
- List all posts
- Test pagination if applicable

### 3. **Individual Blog Posts** (`/blog/[slug]`)
- Specific post pages
- Test dynamic routing

### 4. **Category Pages** (`/category/[category]`)
- Filtered content
- Test category filtering

### 5. **Contact/About Pages**
- Static content
- Test all major pages

### 6. **API Endpoints** (if any)
- Newsletter subscription
- Form submissions
- Any backend APIs

---

## 🎯 Configuration Options

### Load Patterns

**Ramp-up (Gradual Increase):**
```yaml
phases:
  - duration: 60
    arrivalRate: 5    # Start slow
  - duration: 120
    arrivalRate: 25   # Increase
  - duration: 180
    arrivalRate: 50   # Peak load
```

**Sustained Load (Constant):**
```yaml
phases:
  - duration: 300    # 5 minutes
    arrivalRate: 100  # Constant 100 users/sec
```

**Spike Test (Sudden Increase):**
```yaml
phases:
  - duration: 30
    arrivalRate: 10   # Normal
  - duration: 10
    arrivalRate: 500 # Spike!
  - duration: 60
    arrivalRate: 10   # Back to normal
```

### Validation Rules

**Check Response Time:**
```yaml
expect:
  - responseTime: 500  # Must respond in < 500ms
```

**Check Status Code:**
```yaml
expect:
  - statusCode: 200    # Must be 200 OK
```

**Check Content:**
```yaml
expect:
  - contentType: html  # Must be HTML
  - hasProperty: title # Must have title tag
```

---

## 🔧 Manual Execution Steps

### Using Artillery.io

1. **Install:**
   ```bash
   npm install -g artillery
   ```

2. **Edit config file** (`loadtest.yml`):
   - Change `target` to your URL
   - Adjust `arrivalRate` for users
   - Add/modify scenarios

3. **Run:**
   ```bash
   artillery run loadtest.yml
   ```

4. **Save results:**
   ```bash
   artillery run loadtest.yml --output report.json
   artillery report report.json  # View HTML report
   ```

### Using k6

1. **Install:**
   - Download from https://k6.io/docs/getting-started/installation/
   - Or: `choco install k6` (Windows)

2. **Edit config file** (`loadtest.js`):
   - Change URLs
   - Adjust virtual users
   - Modify test scenarios

3. **Run:**
   ```bash
   k6 run loadtest.js
   ```

4. **View results:**
   - Results print to console
   - Can export to JSON/CSV

---

## 📈 Interpreting Results

### Key Metrics:

**Response Time:**
- **Mean**: Average response time
- **Median**: 50% of requests faster than this
- **95th percentile**: 95% of requests faster than this
- **99th percentile**: 99% of requests faster than this

**Throughput:**
- **Requests/sec**: How many requests handled
- **Bytes/sec**: Data transfer rate

**Errors:**
- **Status codes**: 4xx (client errors), 5xx (server errors)
- **Timeout errors**: Requests that took too long
- **Connection errors**: Failed connections

### Good vs Bad Results:

✅ **Good:**
- Mean response time < 500ms
- 95th percentile < 1000ms
- Error rate < 0.1%
- All status codes are 200

❌ **Bad:**
- Mean response time > 2000ms
- 95th percentile > 5000ms
- Error rate > 1%
- Many 5xx errors

---

## 🎓 Example Test Scenarios

### Scenario 1: Light Load Test
- **Users**: 10 concurrent
- **Duration**: 2 minutes
- **Goal**: Verify basic functionality

### Scenario 2: Normal Load Test
- **Users**: 50 concurrent
- **Duration**: 5 minutes
- **Goal**: Test under normal conditions

### Scenario 3: Stress Test
- **Users**: 200 concurrent
- **Duration**: 10 minutes
- **Goal**: Find breaking point

### Scenario 4: Spike Test
- **Users**: 10 → 500 → 10
- **Duration**: Short spike period
- **Goal**: Test sudden traffic increase

---

## 💡 Best Practices

1. **Start Small**: Begin with low user counts
2. **Gradual Increase**: Don't jump from 10 to 1000 users
3. **Test Real Scenarios**: Simulate actual user behavior
4. **Monitor Resources**: Watch server CPU/memory
5. **Save Results**: Keep test results for comparison
6. **Test Regularly**: Run tests after major changes
7. **Use Production URL**: Test actual deployed site when possible

---

## 🆘 Troubleshooting

### "Too many connection errors"
- **Cause**: Too many concurrent users
- **Fix**: Reduce `arrivalRate`

### "All requests timing out"
- **Cause**: Server overwhelmed or network issues
- **Fix**: Check server, reduce load

### "Mixed success/error results"
- **Cause**: Rate limiting or intermittent issues
- **Fix**: Check server logs, adjust test pattern

---

## 📚 Next Steps

1. Choose your preferred tool (k6 or Artillery recommended)
2. Review the configuration files created in this project
3. Edit the URLs and user counts
4. Run your first test
5. Analyze results
6. Adjust and re-test

