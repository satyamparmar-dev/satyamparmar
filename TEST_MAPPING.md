# Feature-to-Unit Test Mapping

## Overview
This document maps every feature in the Satyverse blog to its corresponding unit tests. Tests are prioritized by business criticality and risk level.

**Priority Levels:**
- 🔴 **P0 (Critical)**: Business-critical features, authentication, data integrity
- 🟠 **P1 (High)**: Core functionality, user-facing features
- 🟡 **P2 (Medium)**: Nice-to-have features, UI enhancements
- 🟢 **P3 (Low)**: Cosmetic improvements, optimizations

---

## 1. Utility Functions (`lib/utils.ts`)

### Feature: `cn()` - Class Name Merging
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should merge Tailwind classes correctly
- ✅ Should handle conditional classes
- ✅ Should handle undefined/null inputs
- ✅ Should merge conflicting classes (e.g., `p-4 p-2` → `p-2`)

### Feature: `formatDate()` - Date Formatting
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should format ISO date string to readable format
- ✅ Should handle invalid dates gracefully
- ✅ Should format dates in correct locale
- ✅ Should handle edge cases (leap years, month boundaries)

### Feature: `slugify()` - URL Slug Generation
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should convert text to lowercase
- ✅ Should remove special characters
- ✅ Should replace spaces with hyphens
- ✅ Should trim leading/trailing hyphens
- ✅ Should handle empty strings
- ✅ Should handle unicode characters
- ✅ Should handle multiple consecutive spaces/dashes

### Feature: `truncateText()` - Text Truncation
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should truncate text longer than maxLength
- ✅ Should not truncate text shorter than maxLength
- ✅ Should preserve word boundaries
- ✅ Should handle empty strings
- ✅ Should handle very long words (longer than maxLength)

### Feature: `getEstimatedReadTime()` - Read Time Calculation
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should calculate read time based on word count
- ✅ Should round up to nearest minute
- ✅ Should handle empty content
- ✅ Should handle content with only whitespace
- ✅ Should use correct words per minute (200)

### Feature: `generateHeadingId()` - Heading ID Generation
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should convert text to lowercase
- ✅ Should remove special characters
- ✅ Should replace spaces with hyphens
- ✅ Should handle React node input
- ✅ Should handle array input
- ✅ Should generate consistent IDs
- ✅ Should trim leading/trailing hyphens

---

## 2. Blog Data Management (`lib/blog-client.ts`)

### Feature: `getAllBlogPosts()` - Get All Posts
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should return all blog posts
- ✅ Should return posts in correct format
- ✅ Should exclude todo folder posts
- ✅ Should handle missing data gracefully

### Feature: `getBlogPostBySlug()` - Get Post by Slug
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should return post with matching slug
- ✅ Should return null for non-existent slug
- ✅ Should be case-insensitive
- ✅ Should handle special characters in slug

### Feature: `getBlogPostsByCategory()` - Filter by Category
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should return posts for specific category
- ✅ Should return empty array for non-existent category
- ✅ Should handle case-insensitive category matching
- ✅ Should return correct number of posts

### Feature: `getBlogPostsByTag()` - Filter by Tag
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should return posts with matching tag
- ✅ Should handle multiple tags
- ✅ Should be case-insensitive
- ✅ Should return empty array if no matches

### Feature: `searchBlogPosts()` - Search Functionality
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should search in title
- ✅ Should search in content
- ✅ Should search in excerpt
- ✅ Should search in tags
- ✅ Should be case-insensitive
- ✅ Should handle multi-word queries
- ✅ Should handle special characters
- ✅ Should return empty array if no matches
- ✅ Should handle empty search query

---

## 3. Premium Content System (`lib/premium.ts`)

### Feature: `isPremiumUser()` - Premium Verification
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should return true for valid premium user
- ✅ Should return false for non-premium user
- ✅ Should return false when localStorage is empty
- ✅ Should return false for inactive premium user
- ✅ Should handle invalid localStorage data
- ✅ Should return false on server-side (SSR)

### Feature: `setPremiumUser()` - Set Premium Session
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should store user data in localStorage
- ✅ Should set cookie with correct expiration
- ✅ Should hash email identifier
- ✅ Should handle missing user data
- ✅ Should handle localStorage errors

### Feature: `clearPremiumUser()` - Clear Premium Session
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should remove premium data from localStorage
- ✅ Should clear premium cookie
- ✅ Should handle missing localStorage gracefully

### Feature: `canAccessContent()` - Content Access Control
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should allow premium user to access premium content
- ✅ Should allow VIP user to access premium content
- ✅ Should allow VIP user to access VIP content
- ✅ Should deny premium user access to VIP content
- ✅ Should deny access for expired subscriptions
- ✅ Should deny access for inactive users
- ✅ Should deny access when no user is logged in

---

## 4. Encryption Utilities (`lib/encryption.ts`)

### Feature: `encrypt()` - Text Encryption
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should encrypt text correctly
- ✅ Should return Base64 encoded string
- ✅ Should handle empty strings
- ✅ Should handle special characters
- ✅ Should handle encryption errors gracefully

### Feature: `decrypt()` - Text Decryption
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should decrypt encrypted text correctly
- ✅ Should reverse encryption
- ✅ Should handle invalid encrypted strings
- ✅ Should handle decryption errors gracefully
- ✅ Should handle empty strings

### Feature: `hashUserIdentifier()` - User ID Hashing
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should generate consistent hash for same input
- ✅ Should generate different hashes for different inputs
- ✅ Should handle empty strings
- ✅ Should handle special characters
- ✅ Should return alphanumeric string

---

## 5. Analytics (`lib/analytics.ts`)

### Feature: Analytics Tracking Functions
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should track page views
- ✅ Should track newsletter signups
- ✅ Should track contact form submissions
- ✅ Should handle missing GA4 configuration
- ✅ Should not track in development mode (if configured)

---

## 6. Newsletter (`lib/newsletter.ts`)

### Feature: `submitNewsletterEmail()` - Newsletter Submission
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should submit email via Google Forms (if configured)
- ✅ Should submit email via EmailJS (if configured)
- ✅ Should fall back to email app
- ✅ Should validate email format
- ✅ Should handle submission errors
- ✅ Should return success status on success
- ✅ Should return error message on failure
- ✅ Should handle network errors

---

## 7. UI Components

### Component: `BlogCard` (`components/BlogCard.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render blog post title
- ✅ Should render blog post excerpt
- ✅ Should render author name
- ✅ Should render formatted date
- ✅ Should render estimated read time
- ✅ Should render tags
- ✅ Should link to blog post page
- ✅ Should apply featured styling when featured=true
- ✅ Should handle missing data gracefully
- ✅ Should handle dark mode
- ✅ Should animate on hover

### Component: `BlogTOC` (`components/BlogTOC.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should extract headings from markdown content
- ✅ Should generate correct heading IDs
- ✅ Should highlight active heading on scroll
- ✅ Should navigate to headings on click
- ✅ Should handle empty content
- ✅ Should handle missing headings
- ✅ Should update on content change
- ✅ Should handle mobile toggle
- ✅ Should show/hide on mobile

### Component: `NewsletterSignup` (`components/NewsletterSignup.tsx`)
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should render email input
- ✅ Should render submit button
- ✅ Should validate email format
- ✅ Should show error for invalid email
- ✅ Should show loading state during submission
- ✅ Should show success message on success
- ✅ Should show error message on failure
- ✅ Should clear form on success
- ✅ Should call submitNewsletterEmail with correct parameters
- ✅ Should track analytics on success
- ✅ Should handle network errors

### Component: `ContactForm` (`components/ContactForm.tsx`)
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should render all form fields
- ✅ Should validate required fields
- ✅ Should validate email format
- ✅ Should show validation errors
- ✅ Should disable submit during submission
- ✅ Should show success message on success
- ✅ Should show error message on failure
- ✅ Should clear form on success
- ✅ Should track analytics on submission
- ✅ Should handle Formspree submission
- ✅ Should handle network errors

### Component: `BlogSearch` (`components/BlogSearch.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render search input
- ✅ Should filter posts as user types
- ✅ Should search in title, content, excerpt, tags
- ✅ Should be case-insensitive
- ✅ Should show no results message when no matches
- ✅ Should highlight search terms
- ✅ Should clear search
- ✅ Should handle special characters

### Component: `Pagination` (`components/Pagination.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render page numbers correctly
- ✅ Should highlight current page
- ✅ Should disable previous on first page
- ✅ Should disable next on last page
- ✅ Should navigate to correct page on click
- ✅ Should handle page boundary cases
- ✅ Should handle large page counts

### Component: `PremiumGate` (`components/PremiumGate.tsx`)
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should show premium content for premium users
- ✅ Should show upgrade message for non-premium users
- ✅ Should verify user subscription type
- ✅ Should check subscription expiration
- ✅ Should handle missing user data
- ✅ Should redirect to login/premium page

### Component: `SocialShare` (`components/SocialShare.tsx`)
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should render share buttons for all platforms
- ✅ Should generate correct share URLs
- ✅ Should handle URL encoding
- ✅ Should include title and description in share URL

---

## 8. Page Components (Next.js App Router)

### Page: Home (`app/page.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render hero section
- ✅ Should render featured blog posts
- ✅ Should render recent blog posts
- ✅ Should render newsletter signup
- ✅ Should render categories section

### Page: Blog List (`app/blog/page.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render all blog posts
- ✅ Should implement pagination
- ✅ Should handle empty blog list
- ✅ Should render search functionality

### Page: Blog Post (`app/blog/[slug]/page.tsx`)
**Priority:** 🔴 P0  
**Tests:**
- ✅ Should render blog post content
- ✅ Should render blog post metadata
- ✅ Should render table of contents
- ✅ Should render social share buttons
- ✅ Should render 404 for non-existent post
- ✅ Should handle markdown rendering
- ✅ Should render code blocks with syntax highlighting

### Page: Category (`app/category/[category]/page.tsx`)
**Priority:** 🟠 P1  
**Tests:**
- ✅ Should render posts for specific category
- ✅ Should render 404 for non-existent category
- ✅ Should handle empty category
- ✅ Should implement pagination

---

## 9. API Routes (Next.js)

### Route: RSS Feed (`app/feed.xml/route.ts`)
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should generate valid RSS XML
- ✅ Should include all blog posts
- ✅ Should include correct metadata
- ✅ Should set correct content type header

### Route: Sitemap (`app/sitemap.ts`)
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should generate valid sitemap XML
- ✅ Should include all pages
- ✅ Should include correct URLs
- ✅ Should include last modified dates

### Route: Robots.txt (`app/robots.txt/route.ts`)
**Priority:** 🟡 P2  
**Tests:**
- ✅ Should generate valid robots.txt
- ✅ Should include sitemap URL
- ✅ Should allow/disallow correct paths

---

## 10. Integration Points (Cannot be Fully Unit Tested)

### Email Services (EmailJS, Formspree, Google Forms)
**Priority:** 🟠 P1  
**Strategy:** Mock external API calls in unit tests, use contract tests for integration

**Tests:**
- ✅ Should mock EmailJS submission
- ✅ Should mock Formspree submission
- ✅ Should mock Google Forms submission
- ✅ Should handle API errors
- ✅ Should validate API responses

### Google Analytics 4
**Priority:** 🟡 P2  
**Strategy:** Mock `gtag` function, use integration tests for actual tracking

**Tests:**
- ✅ Should mock GA4 tracking calls
- ✅ Should verify correct event names
- ✅ Should verify correct parameters
- ✅ Should not call GA4 in test environment

### localStorage & Cookies (Premium System)
**Priority:** 🔴 P0  
**Strategy:** Mock browser APIs using jsdom or manual mocks

**Tests:**
- ✅ Should mock localStorage operations
- ✅ Should mock cookie operations
- ✅ Should handle missing localStorage
- ✅ Should handle localStorage errors

---

## Test Coverage Targets

- **Overall Coverage:** ≥ 80%
- **Critical Features (P0):** ≥ 95%
- **High Priority (P1):** ≥ 85%
- **Medium Priority (P2):** ≥ 70%
- **Low Priority (P3):** ≥ 50%

---

## Notes

1. **Server-Side Rendering (SSR)**: Tests should mock `window` and browser APIs for server-side functions
2. **Framer Motion**: Mock animations to avoid test flakiness
3. **Next.js Routing**: Use `next-router-mock` or similar for routing tests
4. **Static Generation**: Test data fetching and page generation separately
5. **Dark Mode**: Test both light and dark mode rendering where applicable

