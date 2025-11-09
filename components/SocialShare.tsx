'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SocialShare({
  url,
  title,
  description,
  className,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  // Ensure deterministic SSR: compute client values after mount
  const [fullUrl, setFullUrl] = useState<string>(url);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);
  const shareText = description || title;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(shareText);

  useEffect(() => {
    // Safe client-only computations
    try {
      setFullUrl(`${window.location.origin}${url}`);
      setCanNativeShare(!!navigator.share);
    } catch {
      // no-op for SSR
    }
  }, [url]);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    trackShare(platform);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
        trackShare('native');
      } catch (err) {
        // User cancelled or error occurred
        console.error('Share failed:', err);
      }
    }
  };

  const trackShare = (platform: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url,
      });
    }
  };

  const shareButtons = [
    {
      id: 'native',
      label: 'Share',
      icon: Share2,
      onClick: handleNativeShare,
      className: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
      show: canNativeShare,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      onClick: () => handleShare('twitter'),
      className: 'bg-blue-400 hover:bg-blue-500 text-white',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      onClick: () => handleShare('linkedin'),
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      onClick: () => handleShare('facebook'),
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
      className: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
    },
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {shareButtons.map((button) => (
          <motion.button
            key={button.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={button.onClick}
            className={`
              flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
              ${button.className}
            `}
            aria-label={`Share on ${button.label}`}
            style={button.show === false ? { display: 'none' } : undefined}
            aria-hidden={button.show === false}
            disabled={button.show === false}
          >
            <button.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{button.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

