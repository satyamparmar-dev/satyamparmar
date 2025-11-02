'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { trackNewsletterSignup } from '@/lib/analytics';
import { submitNewsletterEmail, type NewsletterMode, GOOGLE_FORMS_ACTION_URL, GOOGLE_FORMS_EMAIL_ENTRY } from '@/lib/newsletter';

const REPO_ISSUE_SUBSCRIBE_URL = 'https://github.com/satyamparmar-dev/satyamparmar/issues/new?template=subscribe.yml&labels=subscribe';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<NewsletterMode>('auto');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const googleConfigured = Boolean(GOOGLE_FORMS_ACTION_URL && GOOGLE_FORMS_EMAIL_ENTRY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'google' && !googleConfigured) {
      setStatus('error');
      setMessage('Google Forms is not configured. Choose "Auto" or "Email App" or configure Google Forms in lib/newsletter.ts.');
      return;
    }

    setStatus('loading');

    try {
      const result = await submitNewsletterEmail(email, mode);
      if (result.ok) {
        setStatus('success');
        setMessage(result.message || 'Successfully subscribed!');
        trackNewsletterSignup(email);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">
        Stay Updated
      </h2>
      <p className="text-primary-100 mb-6">
        Get the latest articles on backend engineering, AI, and tech innovations delivered to your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-transparent bg-white/95 text-gray-900 placeholder-gray-500 focus:border-primary-300 focus:ring-2 focus:ring-primary-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-lg bg-primary-800 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Subscribing...
              </div>
            ) : (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </div>
            )}
          </motion.button>
        </div>

        <div className="mt-3 flex flex-col items-center justify-center gap-2 text-xs text-primary-100">
          <div className="flex items-center gap-2">
            <span>Method:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as NewsletterMode)}
              className="rounded-md bg-white/20 px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/40 dark:bg-gray-900/30"
            >
              <option value="auto">Auto (Google Forms if set, else Email)</option>
              <option value="google">Google Forms (no login, free)</option>
              <option value="mailto">Email App (mailto)</option>
            </select>
          </div>
          <a
            href={REPO_ISSUE_SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary-200 hover:text-white"
          >
            Or subscribe via GitHub (opens issue)
          </a>
        </div>
        
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-center justify-center text-sm ${
              status === 'success' ? 'text-green-200' : 'text-red-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message}
          </motion.div>
        )}
      </form>
    </div>
  );
}