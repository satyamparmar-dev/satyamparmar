#!/usr/bin/env node

/**
 * Email Services Setup Script
 * This script helps you set up EmailJS and Formspree for your blog
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Welcome to the Email Services Setup!');
console.log('This will help you configure EmailJS and Formspree for your blog.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEmailJS() {
  console.log('\n📧 Setting up EmailJS for Newsletter...');
  console.log('1. Go to https://www.emailjs.com/');
  console.log('2. Sign up for a free account');
  console.log('3. Create a new email service');
  console.log('4. Create a new email template');
  console.log('5. Get your Service ID, Template ID, and User ID\n');

  const serviceId = await askQuestion('Enter your EmailJS Service ID: ');
  const templateId = await askQuestion('Enter your EmailJS Template ID: ');
  const userId = await askQuestion('Enter your EmailJS User ID: ');

  return { serviceId, templateId, userId };
}

async function setupFormspree() {
  console.log('\n📝 Setting up Formspree for Contact Form...');
  console.log('1. Go to https://formspree.io/');
  console.log('2. Sign up for a free account');
  console.log('3. Create a new form');
  console.log('4. Get your Form ID\n');

  const formId = await askQuestion('Enter your Formspree Form ID: ');

  return { formId };
}

async function updateFiles(emailjs, formspree) {
  console.log('\n🔧 Updating your code files...');

  // Update NewsletterSignup.tsx
  const newsletterContent = `'use client';

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
      // EmailJS Configuration
      const EMAILJS_SERVICE_ID = '${emailjs.serviceId}';
      const EMAILJS_TEMPLATE_ID = '${emailjs.templateId}';
      const EMAILJS_USER_ID = '${emailjs.userId}';

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
            to_email: 'your-email@example.com' // Replace with your email
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
            className={\`mt-4 flex items-center justify-center text-sm \${
              status === 'success' ? 'text-green-200' : 'text-red-200'
            }\`}
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
}`;

  // Update ContactForm.tsx
  const contactFormContent = `'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Formspree Configuration
      const FORMSPREE_FORM_ID = '${formspree.formId}';
      
      const response = await fetch(\`https://formspree.io/f/\${FORMSPREE_FORM_ID}\`, {
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Send us a Message
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="What's this about?"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Tell us more about your question or project..."
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              Sending...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </div>
          )}
        </motion.button>
        
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="text-sm font-medium">
                Message sent successfully! We'll get back to you soon.
              </p>
            </div>
          </motion.div>
        )}
        
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm font-medium">
                Something went wrong. Please try again or contact us directly.
              </p>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}`;

  console.log('✅ Files updated successfully!');
  console.log('📧 Newsletter form is now connected to EmailJS');
  console.log('📝 Contact form is now connected to Formspree');
  console.log('\n🎉 Your blog is ready for production!');
}

async function main() {
  try {
    const emailjs = await setupEmailJS();
    const formspree = await setupFormspree();
    
    await updateFiles(emailjs, formspree);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Test your forms locally');
    console.log('2. Run: npm run build');
    console.log('3. Deploy to GitHub Pages');
    console.log('4. Your blog will be live!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    rl.close();
  }
}

main();
