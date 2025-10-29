'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Lock, Calendar, User, Tag } from 'lucide-react';
import { PremiumContent as PremiumContentType, canAccessContent } from '@/lib/premium';
import PremiumGate from './PremiumGate';

interface PremiumContentProps {
  content: PremiumContentType;
  showPreview?: boolean;
}

export default function PremiumContent({ content, showPreview = true }: PremiumContentProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (typeof window !== 'undefined') {
        const userEmail = localStorage.getItem('user_email');
        const hasAccess = canAccessContent(content.category, userEmail || undefined);
        setIsAuthorized(hasAccess);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [content.category]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = () => {
    return content.category === 'vip' ? Crown : Star;
  };

  const getCategoryColor = () => {
    return content.category === 'vip' 
      ? 'from-purple-500 to-pink-500' 
      : 'from-yellow-400 to-orange-500';
  };

  const getCategoryText = () => {
    return content.category === 'vip' ? 'VIP' : 'Premium';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const contentBody = (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${getCategoryColor()}`}>
            {(() => {
              const Icon = getCategoryIcon();
              return <Icon className="h-4 w-4 text-white" />;
            })()}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getCategoryColor()} text-white`}>
            {getCategoryText()} Content
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {content.title}
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {content.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{content.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(content.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4" />
            <span>{content.tags.join(', ')}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br />') }} />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${getCategoryColor()}`}>
              {(() => {
                const Icon = getCategoryIcon();
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thank you for being a {getCategoryText().toLowerCase()} subscriber!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your support helps us create more exclusive content.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );

  if (isAuthorized) {
    return contentBody;
  }

  if (showPreview) {
    return (
      <PremiumGate
        category={content.category}
        contentTitle={content.title}
        fallback={contentBody}
      >
        {contentBody}
      </PremiumGate>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${getCategoryColor()} mb-4`}>
          {(() => {
            const Icon = getCategoryIcon();
            return <Icon className="h-8 w-8 text-white" />;
          })()}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {getCategoryText()} Content
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This content requires {getCategoryText().toLowerCase()} access.
        </p>
        <button
          onClick={() => window.location.href = '/premium'}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
        >
          Get {getCategoryText()} Access
        </button>
      </div>
    </div>
  );
}
