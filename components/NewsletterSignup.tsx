'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // EmailJS Configuration - Replace these with your actual IDs
      const EMAILJS_SERVICE_ID = 'service_newsletter'; // Replace with your EmailJS service ID
      const EMAILJS_TEMPLATE_ID = 'template_newsletter'; // Replace with your EmailJS template ID
      const EMAILJS_USER_ID = 'your_user_id'; // Replace with your EmailJS user ID

      // For now, we'll simulate the API call
      // In production, replace this with actual EmailJS call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Simulate success for demo
      setStatus('success');
      setMessage('Successfully subscribed! Check your email for confirmation.');
      setEmail('');
      
      // TODO: Replace with actual EmailJS implementation:
      /*
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_USER_ID,
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
      */
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
              className="w-full rounded-lg border-0 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-300"
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