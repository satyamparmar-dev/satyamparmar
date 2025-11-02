# 🔧 GoDaddy DNS Configuration - Step by Step
## For satyamparmar.blog → GitHub Pages

---

## ⚠️ Current Issues to Fix

Based on your DNS records, you need to make these changes:

1. ❌ **Delete** the "Parked" A record (conflicts with GitHub Pages)
2. 🔄 **Update** www CNAME to point to GitHub Pages URL

---

## 📝 Step-by-Step Instructions

### Step 1: Delete the "Parked" A Record

1. In GoDaddy DNS page, find the A record with:
   - **Type**: `A`
   - **Name**: `@`
   - **Data**: `Parked`

2. Click the **"Delete"** button (or trash icon) next to that record

3. Confirm deletion

**Why?** The "Parked" record tells GoDaddy to show a parking page instead of your website.

---

### Step 2: Update www CNAME Record

1. Find the CNAME record with:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Data**: `satyamparmar.blog.`

2. Click **"Edit"** (pencil icon)

3. Change the **Data/Value** field:
   - **Current**: `satyamparmar.blog.`
   - **New**: `satyamparmar-dev.github.io`
   - ⚠️ **Important**: Replace `satyamparmar-dev` with your actual GitHub username if different!

4. Click **"Save"**

**Result**: www.satyamparmar.blog will work correctly

---

### Step 3: Verify All Records

After changes, your DNS should look like this:

✅ **A Records** (4 records):
- `@` → `185.199.108.153` ✅ (Keep)
- `@` → `185.199.109.153` ✅ (Keep)
- `@` → `185.199.110.153` ✅ (Keep)
- `@` → `185.199.111.153` ✅ (Keep)

❌ **Delete**:
- `@` → `Parked` ❌ (DELETE THIS)

✅ **CNAME Records**:
- `www` → `satyamparmar-dev.github.io` ✅ (UPDATE THIS - change from `satyamparmar.blog.`)

✅ **System Records** (DO NOT DELETE):
- `ns07.domaincontrol.com` (Nameserver - Keep)
- `ns08.domaincontrol.com` (Nameserver - Keep)
- `_domainconnect` → `_domainconnect.gd.domaincontrol.com.` (Keep)
- SOA record (Keep)

---

## 🎯 Quick Action Checklist

- [ ] Delete the A record with "Parked" value
- [ ] Edit www CNAME: Change from `satyamparmar.blog.` to `satyamparmar-dev.github.io`
- [ ] Keep all 4 GitHub Pages A records (185.199.108.153, etc.)
- [ ] Keep all system records (NS, SOA, _domainconnect)
- [ ] Save changes
- [ ] Wait 5-10 minutes for DNS to update

---

## ✅ Expected Final DNS Configuration

| Type | Name | Data/Value | TTL | Action |
|------|------|------------|-----|--------|
| A | @ | 185.199.108.153 | 600 | ✅ Keep |
| A | @ | 185.199.109.153 | 600 | ✅ Keep |
| A | @ | 185.199.110.153 | 600 | ✅ Keep |
| A | @ | 185.199.111.153 | 600 | ✅ Keep |
| CNAME | www | satyamparmar-dev.github.io | 600 | 🔄 Update |
| NS | @ | ns07.domaincontrol.com | 1 Hour | ✅ Keep |
| NS | @ | ns08.domaincontrol.com | 1 Hour | ✅ Keep |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com. | 1 Hour | ✅ Keep |
| SOA | @ | (System record) | 1 Hour | ✅ Keep |

---

## 🔍 How to Make Changes in GoDaddy

### To Delete the "Parked" Record:

1. Find the record in the list
2. Click the **"Delete"** button (trash icon) on the right
3. Confirm deletion

### To Edit the www CNAME:

1. Find the `www` CNAME record
2. Click **"Edit"** (pencil icon)
3. Change the **Data** field from `satyamparmar.blog.` to `satyamparmar-dev.github.io`
4. Click **"Save"**

---

## ⏱️ After Making Changes

1. **Wait 5-10 minutes** for DNS to update
2. **Verify with DNS Checker**:
   - Go to: https://dnschecker.org
   - Enter: `satyamparmar.blog`
   - Type: `A`
   - Should show: `185.199.108.153` (or other GitHub IPs)
   - Should NOT show: "Parked" or other IPs

3. **Test Website**:
   - Visit: `https://satyamparmar.blog`
   - Should load your GitHub Pages site

---

## 📋 GitHub Pages Setup (After DNS is Fixed)

1. Go to your GitHub repository
2. **Settings** → **Pages**
3. Under **"Custom domain"**, enter: `satyamparmar.blog`
4. Click **"Save"**
5. Check ✅ **"Enforce HTTPS"**
6. Wait 5-10 minutes for SSL certificate

---

## 🐛 Troubleshooting

### Still seeing GoDaddy parking page?

- ✅ Make sure "Parked" A record is deleted
- ✅ Wait 10-15 minutes for DNS changes
- ✅ Clear browser cache
- ✅ Try incognito/private mode

### www subdomain not working?

- ✅ Verify www CNAME points to: `satyamparmar-dev.github.io`
- ✅ Make sure there's no trailing dot in CNAME value
- ✅ Wait for DNS propagation (10-15 minutes)

### Domain not pointing to GitHub?

- ✅ Verify all 4 A records are present
- ✅ Check DNS propagation with dnschecker.org
- ✅ Ensure GitHub Pages custom domain is configured

---

## ✅ Final Checklist

- [ ] Deleted "Parked" A record
- [ ] Updated www CNAME to GitHub Pages URL
- [ ] Verified 4 GitHub A records are present
- [ ] Saved all DNS changes in GoDaddy
- [ ] Added custom domain in GitHub Pages settings
- [ ] Enabled HTTPS in GitHub Pages
- [ ] Waited 10-15 minutes for DNS propagation
- [ ] Tested: `https://satyamparmar.blog` works
- [ ] Tested: `https://www.satyamparmar.blog` works

---

**Once these changes are made, your domain will be properly configured!** 🎉

