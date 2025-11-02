'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Code, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  ArrowUp,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { submitNewsletterEmail, type NewsletterMode, GOOGLE_FORMS_ACTION_URL, GOOGLE_FORMS_EMAIL_ENTRY } from '@/lib/newsletter';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  categories: [
    { name: 'Backend', href: '/blog?category=backend' },
    { name: 'AI', href: '/blog?category=ai' },
    { name: 'Startup', href: '/blog?category=startup' },
    { name: 'Architecture', href: '/blog?category=architecture' },
    { name: 'DevOps', href: '/blog?category=devops' },
    { name: 'Cloud Native', href: '/blog?category=cloud-native' },
  ],
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:contact@example.com',
      icon: Mail,
    },
  ],
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function Footer() {
  const [footerEmail, setFooterEmail] = useState('');
  const [footerMsg, setFooterMsg] = useState('');
  const [mode, setMode] = useState<NewsletterMode>('auto');

  const googleConfigured = Boolean(GOOGLE_FORMS_ACTION_URL && GOOGLE_FORMS_EMAIL_ENTRY);

  const handleFooterSubscribe = async () => {
    if (!footerEmail) return;
    if (mode === 'google' && !googleConfigured) {
      setFooterMsg('Google Forms is not configured. Choose Auto or Email App, or configure Google Forms in lib/newsletter.ts.');
      return;
    }
    const res = await submitNewsletterEmail(footerEmail, mode);
    setFooterMsg(res.message);
    if (res.ok) setFooterEmail('');
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Code className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Satyverse
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400"
            >
              A modern technical blog focused on backend engineering, AI, tech innovations, 
              and the startup world. Built for developers, by developers.
            </motion.p>
            
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex space-x-4"
            >
              {navigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-1">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Navigation
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 space-y-2"
            >
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-1">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Categories
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 space-y-2"
            >
              {navigation.categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Stay Updated
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400"
            >
              Get the latest articles on backend engineering, AI, and tech innovations 
              delivered to your inbox.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                  <input
                    type="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-l-lg border-0 bg-white/95 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-0 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFooterSubscribe}
                    className="rounded-r-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Subscribe
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Method:</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as NewsletterMode)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="auto">Auto (Google Forms if set, else Email)</option>
                    <option value="google">Google Forms (no login, free)</option>
                    <option value="mailto">Email App (mailto)</option>
                  </select>
                </div>
                {footerMsg && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{footerMsg}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700"
        >
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© 2025 Satyverse. Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for developers.</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 rounded-full bg-primary-600 p-3 text-white shadow-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}
