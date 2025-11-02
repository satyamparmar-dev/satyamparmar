# Usage Examples - Content Protection

## 📝 How to Use Content Protection

### Example 1: Protect Blog Post Component

```tsx
// app/blog/[slug]/page.tsx
import ProtectedContent from '@/components/ProtectedContent';
import { getBlogPost } from '@/lib/blog-client';

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  return (
    <article className="blog-post">
      <h1>{post.title}</h1>
      
      {/* Wrap content in ProtectedContent */}
      <ProtectedContent 
        watermarkText="Your Site Name"
        enableWatermark={true}
      >
        <div 
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </ProtectedContent>
    </article>
  );
}
```

### Example 2: Protect Specific Sections Only

```tsx
import ProtectedContent from '@/components/ProtectedContent';

export default function ArticlePage() {
  return (
    <div>
      {/* Free section - no protection */}
      <section>
        <h2>Introduction (Free)</h2>
        <p>This section is free to read and copy.</p>
      </section>

      {/* Premium section - protected */}
      <ProtectedContent watermarkText="Premium Content">
        <section>
          <h2>Premium Content</h2>
          <p>This section is protected and cannot be copied.</p>
        </section>
      </ProtectedContent>
    </div>
  );
}
```

### Example 3: Custom Protection Configuration

```tsx
import { ContentProtection } from '@/lib/content-protection';
import { useEffect } from 'react';

export default function CustomProtectedContent() {
  useEffect(() => {
    // Custom protection settings
    const protection = new ContentProtection({
      disableTextSelection: true,
      disableRightClick: true,
      disableKeyboardShortcuts: true,
      disablePrint: true,
      disableClipboard: true,
      enableWatermark: true,
      watermarkText: 'Copyright 2025 - Your Site',
      enableDevToolsDetection: true,
    });

    protection.init();

    return () => {
      protection.destroy();
    };
  }, []);

  return (
    <div className="protected-content">
      {/* Your content here */}
    </div>
  );
}
```

---

## 🔧 Backend Usage Examples

### Example 1: Express.js with Rate Limiting

```javascript
// server.js (Node.js/Express)
const express = require('express');
const rateLimit = require('express-rate-limit');
const { botDetectionMiddleware, securityHeadersMiddleware } = require('./lib/anti-scraping');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use('/blog', limiter);
app.use('/blog', botDetectionMiddleware);
app.use('/blog', securityHeadersMiddleware);

app.get('/blog/:slug', (req, res) => {
  // Your blog post handler
  res.render('blog-post', { post });
});

app.listen(3000);
```

### Example 2: Next.js API Route Protection

```typescript
// app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { detectBot, createFingerprint } from '@/lib/anti-scraping';

export async function GET(request: NextRequest) {
  // Bot detection
  if (detectBot(request)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Create fingerprint for logging
  const fingerprint = createFingerprint(request);
  
  // Your blog post logic
  const post = await getBlogPost();
  
  return NextResponse.json(post);
}
```

---

## 📊 Monitoring Examples

### Example 1: View Security Logs

```typescript
// app/admin/security-logs/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SecurityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/security/log')
      .then(res => res.json())
      .then(data => setLogs(data.logs));
  }, []);

  return (
    <div>
      <h1>Security Logs</h1>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event</th>
            <th>IP</th>
            <th>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.timestamp}</td>
              <td>{log.event}</td>
              <td>{log.ip}</td>
              <td>{log.userAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ⚙️ Configuration Examples

### Example 1: Adjust Rate Limits

```typescript
// middleware.ts
const RATE_LIMIT_MAX = 50; // Lower = stricter
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
```

### Example 2: Custom Bot Detection

```typescript
// lib/anti-scraping.ts
export function detectBot(req: Request): boolean {
  const userAgent = req.headers['user-agent'] || '';
  
  // Add custom bot patterns
  const customBotPatterns = [
    /your-custom-bot/i,
    /specific-scraper/i,
  ];
  
  // ... existing code
}
```

### Example 3: Disable Protection for Development

```typescript
// lib/content-protection.ts
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
  protection.init();
}
```

---

## 🧪 Testing Examples

### Example 1: Test Bot Detection

```bash
# Should be blocked
curl -A "Python-requests/2.28.0" https://your-site.com/blog/post

# Should work
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://your-site.com/blog/post
```

### Example 2: Test Rate Limiting

```bash
# Make 101 requests rapidly
for i in {1..101}; do
  curl https://your-site.com/blog/post
done
```

### Example 3: Test Security Headers

```bash
curl -I https://your-site.com/blog/post | grep -i "x-robots-tag"
```

---

## 📝 Quick Start Checklist

1. ✅ Copy `ProtectedContent` component to your project
2. ✅ Wrap blog content with `<ProtectedContent>`
3. ✅ Add middleware for bot detection
4. ✅ Configure `robots.txt`
5. ✅ Test all protection features
6. ✅ Monitor security logs

---

**Ready to use!** 🚀

