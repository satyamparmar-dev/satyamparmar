'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import Layout from '@/components/Layout';
import ContactForm from '@/components/ContactForm';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Get in touch via email',
    value: 'contact@backendengineering.com',
    href: 'mailto:contact@backendengineering.com'
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Call us directly',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567'
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Visit our office',
    value: 'San Francisco, CA',
    href: '#'
  }
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: Github,
    color: 'hover:bg-gray-900 hover:text-white'
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
    color: 'hover:bg-blue-500 hover:text-white'
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
    color: 'hover:bg-blue-700 hover:text-white'
  }
];

export default function ContactPageClient() {

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            Have a question about backend engineering? Want to collaborate? 
            We&apos;d love to hear from you.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Contact Information
            </h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {info.description}
                      </p>
                      <p className="text-primary-600 dark:text-primary-400 font-medium">
                        {info.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors dark:bg-gray-700 dark:text-gray-400 ${link.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ContactForm />
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How often do you publish new articles?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We publish new articles weekly, covering the latest trends in backend engineering, 
                AI integration, and tech innovations.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I contribute to the blog?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! We welcome contributions from experienced developers. 
                Contact us with your article ideas and we&apos;ll discuss collaboration opportunities.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer consulting services?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we provide consulting services for backend architecture, 
                performance optimization, and AI integration projects.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How can I stay updated with new content?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Subscribe to our newsletter or follow us on social media to get notified 
                about new articles and updates.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
