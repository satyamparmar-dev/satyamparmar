// Google Analytics 4 integration for static sites
// This is a lightweight, privacy-focused implementation

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track newsletter signups
export const trackNewsletterSignup = (email: string) => {
  event({
    action: 'newsletter_signup',
    category: 'engagement',
    label: 'newsletter',
  });
};

// Track contact form submissions
export const trackContactForm = () => {
  event({
    action: 'contact_form_submit',
    category: 'engagement',
    label: 'contact',
  });
};

// Track blog post views
export const trackBlogPostView = (postTitle: string) => {
  event({
    action: 'blog_post_view',
    category: 'content',
    label: postTitle,
  });
};

// Track search queries
export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
