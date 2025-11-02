# Load Testing Configuration Files

This directory contains configuration files for manually testing your website with multiple concurrent users.

## 📁 Files Included

### 1. **k6 Configuration** (`loadtest-k6.js`)
- **Tool**: k6 (JavaScript-based)
- **Best for**: Modern, powerful testing with detailed metrics
- **Installation**: Download from https://k6.io/docs/getting-started/installation/
- **Usage**: `k6 run loadtest-k6.js`

### 2. **Artillery.io Configuration** (`loadtest-artillery.yml`)
- **Tool**: Artillery.io (YAML-based)
- **Best for**: Simple, easy-to-read tests
- **Installation**: `npm install -g artillery`
- **Usage**: `artillery run loadtest-artillery.yml`

### 3. **Apache Bench Scripts**
- **Scripts**: `loadtest-ab.sh` (Linux/Mac) and `loadtest-ab.bat` (Windows)
- **Tool**: Apache Bench (built-in on many systems)
- **Best for**: Quick, simple tests
- **Usage**: Run the script directly

### 4. **Artillery Processor** (`loadtest-processor.js`)
- **Purpose**: Helper functions for Artillery tests
- **Required**: Only if using dynamic URLs in Artillery config

## 🚀 Quick Start

### Option 1: k6 (Recommended)

1. **Install k6:**
   ```bash
   # Windows (with Chocolatey)
   choco install k6
   
   # macOS (with Homebrew)
   brew install k6
   
   # Linux
   # See: https://k6.io/docs/getting-started/installation/
   ```

2. **Edit `loadtest-k6.js`:**
   - Change `BASE_URL` to your website URL
   - Update `blogSlugs` array with your actual blog post slugs

3. **Run test:**
   ```bash
   k6 run loadtest-k6.js
   ```

4. **View results:**
   - Results print to console
   - Look for metrics like: response time, error rate, requests/sec

### Option 2: Artillery.io (Easiest)

1. **Install Artillery:**
   ```bash
   npm install -g artillery
   ```

2. **Edit `loadtest-artillery.yml`:**
   - Change `target` to your website URL
   - Adjust `phases` (duration, arrivalRate)

3. **Run test:**
   ```bash
   artillery run loadtest-artillery.yml
   ```

4. **Save and view report:**
   ```bash
   # Save results to JSON
   artillery run loadtest-artillery.yml --output results.json
   
   # Generate HTML report
   artillery report results.json
   ```

### Option 3: Apache Bench (Simplest)

**Windows:**
```cmd
loadtest-ab.bat
```

**Linux/Mac:**
```bash
chmod +x loadtest-ab.sh
./loadtest-ab.sh
```

## 📊 Understanding Results

### Key Metrics:

1. **Response Time:**
   - **Mean**: Average response time
   - **Median**: 50% of requests faster than this
   - **95th percentile**: 95% of requests faster than this
   - **99th percentile**: 99% of requests faster than this

2. **Throughput:**
   - **Requests/second**: How many requests handled per second
   - **Bytes/second**: Data transfer rate

3. **Errors:**
   - **Status codes**: 200 (OK), 4xx (client errors), 5xx (server errors)
   - **Timeouts**: Requests that took too long
   - **Connection errors**: Failed connections

### Good vs Bad Results:

✅ **Good:**
- Mean response time < 500ms
- 95th percentile < 2000ms
- Error rate < 0.1%
- All status codes are 200

❌ **Bad:**
- Mean response time > 2000ms
- 95th percentile > 5000ms
- Error rate > 1%
- Many 5xx errors

## 🎯 Customization Guide

### Change Test Duration

**k6:**
```javascript
stages: [
  { duration: '60s', target: 50 },  // Test for 60 seconds
]
```

**Artillery:**
```yaml
phases:
  - duration: 60  # 60 seconds
    arrivalRate: 50
```

### Change Concurrent Users

**k6:**
```javascript
stages: [
  { duration: '1m', target: 100 },  // 100 concurrent users
]
```

**Artillery:**
```yaml
phases:
  - duration: 120
    arrivalRate: 100  # 100 new users per second
```

### Test Different URLs

Edit the URL arrays in the config files:
- Add/remove blog slugs
- Add/remove categories
- Add new endpoints

## 📈 Test Scenarios

### Scenario 1: Light Load Test
- **Users**: 10-20 concurrent
- **Duration**: 1-2 minutes
- **Goal**: Verify basic functionality

### Scenario 2: Normal Load Test
- **Users**: 50-100 concurrent
- **Duration**: 5 minutes
- **Goal**: Test under normal conditions

### Scenario 3: Stress Test
- **Users**: 200-500 concurrent
- **Duration**: 10 minutes
- **Goal**: Find breaking point

### Scenario 4: Spike Test
- **Users**: 10 → 500 → 10
- **Duration**: Short spike (30 seconds)
- **Goal**: Test sudden traffic increase

## 🛠️ Troubleshooting

### "Command not found" (k6/Artillery)
- **Fix**: Install the tool first
- k6: Download from k6.io
- Artillery: `npm install -g artillery`

### "Too many connection errors"
- **Fix**: Reduce concurrent users
- Try starting with fewer users (10-20)

### "All requests timing out"
- **Fix**: Check your website URL
- Verify the site is accessible
- Check server capacity

### "Mixed success/error results"
- **Fix**: Check website logs
- May be rate limiting or server issues
- Reduce load and test again

## 📚 Additional Resources

- **k6 Documentation**: https://k6.io/docs/
- **Artillery Documentation**: https://www.artillery.io/docs
- **Apache Bench Guide**: https://httpd.apache.org/docs/2.4/programs/ab.html
- **Load Testing Best Practices**: See `LOAD_TESTING_GUIDE.md`

## 💡 Tips

1. **Start Small**: Begin with low user counts and gradually increase
2. **Test Realistic Scenarios**: Simulate actual user behavior
3. **Save Results**: Keep test results for comparison
4. **Test Regularly**: Run tests after major changes
5. **Monitor Server**: Watch CPU/memory during tests (if you have access)
6. **Use Production URL**: Test actual deployed site when possible

---

**Need Help?** Check `LOAD_TESTING_GUIDE.md` for detailed explanations.

