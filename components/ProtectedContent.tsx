'use client';

/**
 * ProtectedContent Component
 * 
 * Wraps blog content with protection features
 * - Disables text selection
 * - Blocks right-click
 * - Prevents keyboard shortcuts
 * - Adds watermark overlay
 * 
 * 100% Free - No dependencies
 */

import { useEffect, useRef } from 'react';
import { ContentProtection } from '@/lib/content-protection';

interface ProtectedContentProps {
  children: React.ReactNode;
  className?: string;
  enableWatermark?: boolean;
  watermarkText?: string;
}

export default function ProtectedContent({
  children,
  className = '',
  enableWatermark = true,
  watermarkText,
}: ProtectedContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize content protection immediately
    const protection = new ContentProtection({
      disableTextSelection: true,
      disableRightClick: true,
      disableKeyboardShortcuts: true,
      disablePrint: true,
      disableClipboard: true,
      enableWatermark: enableWatermark,
      watermarkText: watermarkText || 'Protected Content',
      enableDevToolsDetection: true,
    });

    // Initialize protection
    protection.init();

    // Add protected-content class to wrapper and all children
    if (contentRef.current) {
      contentRef.current.classList.add('protected-content');
      // Also add class to all nested elements
      const allElements = contentRef.current.querySelectorAll('*');
      allElements.forEach((el) => {
        (el as HTMLElement).classList.add('protected-content');
      });
    }

    // Also add global protection class to body when component mounts
    document.body.classList.add('content-protection-active');

    // Cleanup on unmount
    return () => {
      protection.destroy();
      document.body.classList.remove('content-protection-active');
    };
  }, [enableWatermark, watermarkText]);

  return (
    <div ref={contentRef} className={`protected-content-wrapper ${className}`}>
      {children}
    </div>
  );
}

