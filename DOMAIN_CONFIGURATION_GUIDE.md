# 🌐 Custom Domain Configuration Guide
## Setting up satyamparmar.blog for GitHub Pages

---

## 📋 Prerequisites

- ✅ Domain purchased at GoDaddy: `satyamparmar.blog`
- ✅ GitHub repository with GitHub Pages enabled
- ✅ Access to GoDaddy DNS settings
- ✅ Repository settings access on GitHub

---

## 🔧 Step 1: Update Code Configuration

### ✅ Already Updated Files:

1. **`next.config.js`** - Removed basePath for custom domain
2. **`app/sitemap.ts`** - Updated to use `satyamparmar.blog`
3. **`app/feed.xml/route.ts`** - Updated RSS feed URL
4. **`app/robots.txt/route.ts`** - Updated sitemap URL
5. **`app/layout.tsx`** - Updated OpenGraph URL

### Optional: Create Environment Variable

Create `.env.local` file (optional, for local testing):

```bash
NEXT_PUBLIC_BASE_URL=https://satyamparmar.blog
```

---

## 🌐 Step 2: Configure GoDaddy DNS

### Option A: Using A Records (Recommended for GitHub Pages)

1. **Log in to GoDaddy**
   - Go to [godaddy.com](https://www.godaddy.com)
   - Sign in to your account
   - Click on "My Products"

2. **Access DNS Management**
   - Find `satyamparmar.blog` in your domains list
   - Click on the domain
   - Click "DNS" or "Manage DNS"

3. **Add A Records**
   
   You need to add **4 A records** pointing to GitHub Pages IPs:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | @ | 185.199.108.153 | 600 |
   | A | @ | 185.199.109.153 | 600 |
   | A | @ | 185.199.110.153 | 600 |
   | A | @ | 185.199.111.153 | 600 |

   **How to add:**
   - Click "Add" or "+" button
   - Select "A" as Type
   - Name: `@` (or leave blank for root domain)
   - Value: `185.199.108.153` (add first IP)
   - TTL: `600` (or default)
   - Click "Save"
   - Repeat for all 4 IPs

4. **Remove Existing A Records** (if any)
   - Delete any old A records pointing to other IPs
   - Keep only the 4 GitHub Pages IPs above

5. **Add CNAME Record for www** (Optional but recommended)
   
   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | www | satyamparmar-dev.github.io | 600 |

   **How to add:**
   - Click "Add"
   - Type: `CNAME`
   - Name: `www`
   - Value: `satyamparmar-dev.github.io` (your GitHub username/repo)
   - TTL: `600`
   - Click "Save"

6. **Remove Old CNAME for @** (if exists)
   - If there's a CNAME record for `@` (root), delete it
   - Root domain cannot have CNAME if A records exist

### Option B: Using CNAME Only (Alternative)

If you prefer using only CNAME:

1. **Delete all A records** for `@`
2. **Add CNAME record:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | @ | satyamparmar-dev.github.io | 600 |

   ⚠️ **Note**: Some DNS providers don't support CNAME at root. If GoDaddy doesn't allow this, use Option A (A Records).

---

## 📝 Step 3: Configure GitHub Pages Custom Domain

1. **Go to GitHub Repository**
   - Navigate to: `https://github.com/satyamparmar-dev/your-repo-name`
   - Click on "Settings" tab

2. **Access Pages Settings**
   - Scroll down to "Pages" section (left sidebar)
   - Or go to: `https://github.com/satyamparmar-dev/your-repo-name/settings/pages`

3. **Add Custom Domain**
   - Under "Custom domain" section
   - Enter: `satyamparmar.blog`
   - Click "Save"

4. **Enable HTTPS (Important!)**
   - After domain is added, check "Enforce HTTPS"
   - GitHub will automatically provision SSL certificate (takes 5-10 minutes)

5. **Verify Domain**
   - GitHub may ask you to verify ownership
   - Follow the instructions if prompted

---

## 🔍 Step 4: Verify DNS Configuration

### Check DNS Propagation

After updating DNS, verify it's working:

1. **Use DNS Checker Tool**
   - Go to: https://dnschecker.org
   - Enter: `satyamparmar.blog`
   - Select: `A` record type
   - Click "Search"
   - Wait for results (should show GitHub IPs)

2. **Use Command Line** (if available)
   ```bash
   # Check A records
   nslookup satyamparmar.blog
   
   # Or use dig
   dig satyamparmar.blog A
   ```

3. **Expected Results**
   - Should show one of: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, or `185.199.111.153`

### DNS Propagation Time

- ⏱️ **Usually takes**: 5 minutes to 48 hours
- ⏱️ **Average**: 1-4 hours
- ✅ **Check periodically**: DNS may propagate to different regions at different times

---

## 🚀 Step 5: Build and Deploy

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Configure custom domain satyamparmar.blog"
   git push origin main
   ```

2. **Wait for GitHub Pages Build**
   - Go to "Actions" tab in GitHub
   - Wait for deployment to complete
   - Usually takes 1-2 minutes

3. **Test Your Domain**
   - After DNS propagates (1-4 hours)
   - Visit: `https://satyamparmar.blog`
   - Should see your website!

---

## 🔒 Step 6: Enable HTTPS (SSL Certificate)

1. **In GitHub Pages Settings**
   - Go to: Repository → Settings → Pages
   - Under "Custom domain"
   - Check ✅ "Enforce HTTPS"
   - GitHub automatically provides SSL certificate

2. **Wait for SSL Provisioning**
   - Usually takes 5-10 minutes
   - Check status in Pages settings
   - When ready, you'll see a green checkmark

3. **Test HTTPS**
   - Visit: `https://satyamparmar.blog`
   - Should see padlock icon in browser
   - No security warnings

---

## 📝 Step 7: Update Additional References (If Needed)

These files have already been updated, but verify:

- ✅ `next.config.js` - basePath removed
- ✅ `app/sitemap.ts` - Updated baseUrl
- ✅ `app/feed.xml/route.ts` - Updated baseUrl
- ✅ `app/robots.txt/route.ts` - Updated sitemap URL
- ✅ `app/layout.tsx` - Updated OpenGraph URL

---

## 🐛 Troubleshooting

### Domain Not Working?

1. **Check DNS Propagation**
   - Use https://dnschecker.org
   - Verify A records point to GitHub IPs
   - Wait 1-4 hours for full propagation

2. **Check GitHub Pages Settings**
   - Verify domain is added in GitHub
   - Check for any error messages
   - Ensure repository is set to GitHub Pages source

3. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache

4. **Check DNS Records**
   - Ensure no conflicting records
   - Remove old CNAME for `@` if using A records
   - Verify TTL settings

### HTTPS Not Working?

1. **Wait for SSL Provision**
   - GitHub needs 5-10 minutes to provision SSL
   - Check status in GitHub Pages settings

2. **Enable "Enforce HTTPS"**
   - Make sure checkbox is checked
   - Wait a few minutes and refresh

3. **Check Certificate**
   - Visit: `https://www.ssllabs.com/ssltest/analyze.html?d=satyamparmar.blog`
   - Should show valid certificate

### www Subdomain Not Working?

1. **Add CNAME Record**
   - In GoDaddy DNS: Add CNAME `www` → `satyamparmar-dev.github.io`

2. **Add www in GitHub**
   - In GitHub Pages settings
   - Add both: `satyamparmar.blog` and `www.satyamparmar.blog`
   - Or enable "Redirect www to apex" option

---

## 📋 GoDaddy DNS Configuration Checklist

- [ ] Logged into GoDaddy account
- [ ] Opened DNS Management for satyamparmar.blog
- [ ] Added A record: `@` → `185.199.108.153`
- [ ] Added A record: `@` → `185.199.109.153`
- [ ] Added A record: `@` → `185.199.110.153`
- [ ] Added A record: `@` → `185.199.111.153`
- [ ] Added CNAME: `www` → `satyamparmar-dev.github.io` (optional)
- [ ] Removed conflicting/old records
- [ ] Saved all changes
- [ ] Verified DNS with dnschecker.org (after 5-10 minutes)

---

## 📋 GitHub Configuration Checklist

- [ ] Repository is public (or has GitHub Pages enabled)
- [ ] GitHub Pages is enabled in Settings → Pages
- [ ] Source branch is set (usually `main` or `gh-pages`)
- [ ] Custom domain added: `satyamparmar.blog`
- [ ] "Enforce HTTPS" is checked
- [ ] Deployment completed successfully (check Actions tab)

---

## ✅ Verification Steps

After configuration, verify everything works:

1. **DNS Check**
   ```bash
   # Should return GitHub IPs
   nslookup satyamparmar.blog
   ```

2. **Website Access**
   - Visit: `https://satyamparmar.blog`
   - Should load your website
   - Check for HTTPS padlock

3. **Subdomain (if configured)**
   - Visit: `https://www.satyamparmar.blog`
   - Should redirect or load correctly

4. **Sitemap**
   - Visit: `https://satyamparmar.blog/sitemap.xml`
   - Should show all pages

5. **RSS Feed**
   - Visit: `https://satyamparmar.blog/feed.xml`
   - Should show RSS feed

---

## 🎯 Important Notes

1. **DNS Propagation**: Can take up to 48 hours (usually 1-4 hours)
2. **GitHub Pages**: Free SSL certificate is automatic
3. **Build Time**: GitHub Pages builds after each push to main branch
4. **Custom Domain**: Must be verified in GitHub before it works
5. **HTTPS**: Enable "Enforce HTTPS" for secure connection

---

## 📞 Need Help?

### Common Issues:

**Issue**: "Domain not resolving"
- **Solution**: Wait for DNS propagation (check with dnschecker.org)

**Issue**: "HTTPS not working"
- **Solution**: Enable "Enforce HTTPS" in GitHub Pages settings

**Issue**: "404 error on domain"
- **Solution**: Check GitHub Pages source branch is set correctly

**Issue**: "DNS still pointing to old IP"
- **Solution**: Clear DNS cache, wait for propagation

---

## 🎉 Success!

Once everything is configured:

✅ Domain: `https://satyamparmar.blog` should work
✅ HTTPS: Automatic SSL certificate
✅ www: `https://www.satyamparmar.blog` (if configured)
✅ All pages accessible on custom domain

**Your website is now live on your custom domain!** 🚀

---

## 📚 Additional Resources

- [GitHub Pages Custom Domain Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GoDaddy DNS Help](https://www.godaddy.com/help/manage-dns-zone-file-680)
- [DNS Checker](https://dnschecker.org)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Last Updated**: Configuration ready for satyamparmar.blog domain

