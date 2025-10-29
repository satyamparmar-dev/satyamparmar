'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Star, X } from 'lucide-react';
import { isPremiumUser, canAccessContent } from '@/lib/premium';
import AuthModal from './AuthModal';

interface PremiumGateProps {
  children: React.ReactNode;
  category: 'premium' | 'vip';
  contentTitle: string;
  fallback?: React.ReactNode;
}

export default function PremiumGate({ 
  children, 
  category, 
  contentTitle, 
  fallback 
}: PremiumGateProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authorization on mount
    const checkAuth = async () => {
      setIsLoading(true);
      
      if (typeof window !== 'undefined') {
        // Get user identifier from localStorage or prompt
        const userEmail = localStorage.getItem('user_email');
        
        if (userEmail && canAccessContent(category, userEmail)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [category]);

  const handleAuth = (email: string) => {
    // In a real app, this would verify with your premium user database
    // For now, we'll use a simple check against a hardcoded list
    const premiumEmails = [
      'premium@example.com',
      'vip@example.com',
      'admin@example.com'
    ];
    
    const isPremium = premiumEmails.includes(email.toLowerCase());
    
    if (isPremium) {
      localStorage.setItem('user_email', email);
      setIsAuthorized(true);
      setShowAuthModal(false);
    } else {
      alert('This email is not in our premium user list. Please contact support.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Blurred content preview */}
        <div className="filter blur-sm pointer-events-none select-none">
          {fallback || children}
        </div>
        
        {/* Premium gate overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                {category === 'vip' ? (
                  <Crown className="h-8 w-8 text-white" />
                ) : (
                  <Star className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {category === 'vip' ? 'VIP Content' : 'Premium Content'}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {category === 'vip' 
                  ? 'This is exclusive VIP content. Upgrade to VIP to access this premium article.'
                  : 'This is premium content. Subscribe to access this exclusive article.'
                }
              </p>
              
              {/* Content title */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Article:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{contentTitle}</p>
              </div>
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                >
                  {category === 'vip' ? 'Verify VIP Access' : 'Verify Premium Access'}
                </motion.button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onAuth={handleAuth}
            category={category}
          />
        )}
      </AnimatePresence>
    </>
  );
}
