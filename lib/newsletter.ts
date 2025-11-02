export type NewsletterResult = { ok: boolean; message: string };
export type NewsletterMode = 'auto' | 'google' | 'mailto';

// Configure one of the modes below. Both are free.
// 1) Google Forms (recommended): Create a Google Form with one short-answer field (email),
//    then set GOOGLE_FORMS_ACTION_URL to the form "formResponse" action URL and
//    GOOGLE_FORMS_EMAIL_ENTRY to the input name like "entry.123456789".
// 2) Mailto fallback: Opens the user's email client to send you an email.

export const GOOGLE_FORMS_ACTION_URL = '';
export const GOOGLE_FORMS_EMAIL_ENTRY = '';
export const NEWSLETTER_RECEIVE_EMAIL = 'contact@example.com';

function googleConfigured(): boolean {
  return Boolean(GOOGLE_FORMS_ACTION_URL && GOOGLE_FORMS_EMAIL_ENTRY);
}

function doMailto(email: string): NewsletterResult {
  if (typeof window !== 'undefined') {
    const subject = encodeURIComponent('Satyverse Newsletter Subscription');
    const body = encodeURIComponent(`Please subscribe this email: ${email}`);
    window.location.href = `mailto:${NEWSLETTER_RECEIVE_EMAIL}?subject=${subject}&body=${body}`;
    return { ok: true, message: 'Opening your email app to complete subscription.' };
  }
  return { ok: false, message: 'Unable to open email app.' };
}

export async function submitNewsletterEmail(email: string, mode: NewsletterMode = 'auto'): Promise<NewsletterResult> {
  const wantGoogle = mode === 'google' || (mode === 'auto' && googleConfigured());

  // If explicitly set to Google but not configured, fall back to mailto with a helpful message
  if (mode === 'google' && !googleConfigured()) {
    const res = doMailto(email);
    return res.ok
      ? { ok: true, message: 'Google Forms not configured. Using Email app instead.' }
      : { ok: false, message: 'Google Forms not configured and email app could not be opened.' };
  }

  // Google Forms path
  if (typeof window !== 'undefined' && wantGoogle && googleConfigured()) {
    try {
      const form = new FormData();
      form.append(GOOGLE_FORMS_EMAIL_ENTRY, email);
      await fetch(GOOGLE_FORMS_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: form,
      });
      // no-cors => opaque; assume success
      return { ok: true, message: 'Thanks! You are subscribed via Google Forms.' };
    } catch (e) {
      // If Google submission fails, fall back to mailto in auto or google mode
      const res = doMailto(email);
      return res.ok
        ? { ok: true, message: 'Could not reach Google Forms. Using Email app instead.' }
        : { ok: false, message: 'Unable to submit via Google Forms or email app.' };
    }
  }

  // Mailto path (auto or explicit)
  if (mode === 'mailto' || mode === 'auto') {
    return doMailto(email);
  }

  return { ok: false, message: 'Unable to submit newsletter request.' };
}
