'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';

export default function EmailServiceSetup() {
  const [activeTab, setActiveTab] = useState<'emailjs' | 'formspree'>('emailjs');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const emailjsSteps = [
    {
      step: 1,
      title: "Sign up for EmailJS",
      description: "Go to EmailJS.com and create a free account",
      action: "Visit EmailJS",
      url: "https://www.emailjs.com/",
      code: null
    },
    {
      step: 2,
      title: "Create Email Service",
      description: "Add your email provider (Gmail, Outlook, etc.)",
      action: "Create Service",
      url: null,
      code: null
    },
    {
      step: 3,
      title: "Create Email Template",
      description: "Use this template for newsletter subscriptions",
      action: "Copy Template",
      url: null,
      code: `Subject: New Newsletter Subscription

Hello,

A new person subscribed to your newsletter:

Email: {{email}}

Best regards,
Your Blog`
    },
    {
      step: 4,
      title: "Get Your IDs",
      description: "Copy these IDs and update the code",
      action: "Copy IDs",
      url: null,
      code: `// Replace these in components/NewsletterSignup.tsx
const EMAILJS_SERVICE_ID = 'service_abc123'; // Your service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789'; // Your template ID  
const EMAILJS_USER_ID = 'user_abc123def456'; // Your user ID`
    }
  ];

  const formspreeSteps = [
    {
      step: 1,
      title: "Sign up for Formspree",
      description: "Go to Formspree.io and create a free account",
      action: "Visit Formspree",
      url: "https://formspree.io/",
      code: null
    },
    {
      step: 2,
      title: "Create New Form",
      description: "Create a new form and get your form ID",
      action: "Create Form",
      url: null,
      code: null
    },
    {
      step: 3,
      title: "Configure Form Settings",
      description: "Set up your form settings and email notifications",
      action: "Configure",
      url: null,
      code: null
    },
    {
      step: 4,
      title: "Update Code",
      description: "Replace the form ID in your contact form",
      action: "Copy Code",
      url: null,
      code: `// Replace this in components/ContactForm.tsx
const FORMSPREE_FORM_ID = 'xpzgkqwe'; // Your form ID`
    }
  ];

  const currentSteps = activeTab === 'emailjs' ? emailjsSteps : formspreeSteps;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Email Services Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Follow these steps to enable newsletter and contact form functionality
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('emailjs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'emailjs'
              ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          📧 Newsletter (EmailJS)
        </button>
        <button
          onClick={() => setActiveTab('formspree')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'formspree'
              ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          📝 Contact Form (Formspree)
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {currentSteps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {step.step}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {step.description}
                </p>
                
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {step.action}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                )}

                {step.code && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Code to copy:
                      </span>
                      <button
                        onClick={() => copyToClipboard(step.code!, `step-${step.step}`)}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {copied === `step-${step.step}` ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6"
      >
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              🎉 You're Almost Done!
            </h3>
            <p className="text-green-700 dark:text-green-300 mt-1">
              Once you complete these steps, your newsletter and contact form will be fully functional!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
