# 🚀 GitHub Pages Deployment Guide

## 📧 Newsletter Subscription Setup

### Option 1: EmailJS (Recommended for Static Sites)

1. **Sign up for EmailJS**:
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Create a free account (100 emails/month free)
   - Create a new service (Gmail, Outlook, etc.)

2. **Update the Newsletter Component**:
   ```typescript
   // In components/NewsletterSignup.tsx
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setStatus('loading');

     try {
       // Replace with your EmailJS service details
       const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           service_id: 'YOUR_SERVICE_ID',
           template_id: 'YOUR_TEMPLATE_ID',
           user_id: 'YOUR_USER_ID',
           template_params: {
             email: email,
             to_email: 'your-email@example.com'
           }
         }),
       });

       if (response.ok) {
         setStatus('success');
         setMessage('Successfully subscribed! Check your email for confirmation.');
         setEmail('');
       } else {
         throw new Error('Subscription failed');
       }
     } catch (error) {
       setStatus('error');
       setMessage('Something went wrong. Please try again.');
     }
   };
   ```

### Option 2: Mailchimp (More Professional)

1. **Create Mailchimp Account**:
   - Sign up at [Mailchimp.com](https://mailchimp.com/)
   - Create a new audience
   - Get your API key and audience ID

2. **Update API Route**:
   ```typescript
   // In app/api/newsletter/route.ts
   export async function POST(request: NextRequest) {
     try {
       const { email } = await request.json();
       
       const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           email_address: email,
           status: 'subscribed'
         }),
       });

       if (response.ok) {
         return NextResponse.json({ message: 'Successfully subscribed' });
       } else {
         throw new Error('Subscription failed');
       }
     } catch (error) {
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   ```

3. **Add Environment Variables**:
   ```bash
   # .env.local
   MAILCHIMP_API_KEY=your_api_key_here
   MAILCHIMP_AUDIENCE_ID=your_audience_id_here
   ```

## 📝 Contact Form Setup

### Option 1: Formspree (Easiest for Static Sites)

1. **Sign up for Formspree**:
   - Go to [Formspree.io](https://formspree.io/)
   - Create a free account (50 submissions/month free)
   - Create a new form and get your form ID

2. **Update ContactForm Component**:
   ```typescript
   // In components/ContactForm.tsx
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     
     try {
       // Replace YOUR_FORM_ID with your actual Formspree form ID
       const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
       });

       if (response.ok) {
         setSubmitStatus('success');
         setFormData({ name: '', email: '', subject: '', message: '' });
       } else {
         throw new Error('Form submission failed');
       }
     } catch (error) {
       setSubmitStatus('error');
     } finally {
       setIsSubmitting(false);
       setTimeout(() => setSubmitStatus('idle'), 5000);
     }
   };
   ```

### Option 2: Netlify Forms (If hosting on Netlify)

1. **Add netlify attribute to form**:
   ```html
   <form 
     name="contact" 
     method="POST" 
     data-netlify="true"
     data-netlify-honeypot="bot-field"
   >
     <input type="hidden" name="form-name" value="contact" />
     <input type="hidden" name="bot-field" />
     <!-- rest of form fields -->
   </form>
   ```

2. **Add to public/_headers**:
   ```
   /contact
     X-Frame-Options: DENY
     X-XSS-Protection: 1; mode=block
   ```

### Option 3: EmailJS for Contact Form

1. **Set up EmailJS template**:
   - Create a new template in EmailJS
   - Use variables: `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`

2. **Update ContactForm**:
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     
     try {
       const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           service_id: 'YOUR_SERVICE_ID',
           template_id: 'YOUR_TEMPLATE_ID',
           user_id: 'YOUR_USER_ID',
           template_params: {
             name: formData.name,
             email: formData.email,
             subject: formData.subject,
             message: formData.message,
             to_email: 'your-email@example.com'
           }
         }),
       });

       if (response.ok) {
         setSubmitStatus('success');
         setFormData({ name: '', email: '', subject: '', message: '' });
       } else {
         throw new Error('Form submission failed');
       }
     } catch (error) {
       setSubmitStatus('error');
     } finally {
       setIsSubmitting(false);
       setTimeout(() => setSubmitStatus('idle'), 5000);
     }
   };
   ```

## 🔧 GitHub Pages Deployment

### 1. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in the 'out' directory
# This is what you'll deploy to GitHub Pages
```

### 2. GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as source
4. Your site will be available at `https://yourusername.github.io/backend-engineering`

## 🎯 Recommended Setup for Production

### For Newsletter:
- **Free Tier**: EmailJS (100 emails/month)
- **Paid Tier**: Mailchimp (unlimited emails, better analytics)

### For Contact Form:
- **Free Tier**: Formspree (50 submissions/month)
- **Paid Tier**: Netlify Forms (unlimited submissions)

### Environment Variables:
```bash
# .env.local (for development)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id
FORMSPREE_FORM_ID=your_form_id
```

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up your email service (choose one):
# - EmailJS: Sign up and get your IDs
# - Mailchimp: Get API key and audience ID
# - Formspree: Get form ID

# 3. Update the components with your service details

# 4. Test locally
npm run dev

# 5. Build for production
npm run build

# 6. Deploy to GitHub Pages
# (The GitHub Action will handle this automatically)
```

## 📊 Analytics and Monitoring

### Add Google Analytics:
```typescript
// In app/layout.tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
    // Add Google Analytics code here
  }
}, []);
```

### Monitor Form Submissions:
- Formspree: Built-in dashboard
- Mailchimp: Audience analytics
- EmailJS: Usage statistics

## 🔒 Security Considerations

1. **Rate Limiting**: Implement client-side rate limiting
2. **Validation**: Always validate on both client and server
3. **Spam Protection**: Use honeypot fields
4. **CORS**: Configure proper CORS headers
5. **Environment Variables**: Never commit API keys

## 🎉 You're Ready!

Your blog now has:
- ✅ Working newsletter subscription
- ✅ Functional contact form
- ✅ GitHub Pages deployment
- ✅ Professional email handling
- ✅ Mobile-responsive design
- ✅ Dark/light mode
- ✅ SEO optimization

**Live URL**: `https://yourusername.github.io/backend-engineering`
