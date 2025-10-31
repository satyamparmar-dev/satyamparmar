'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { List, X } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface BlogTOCProps {
  content: string;
  className?: string;
}

export default function BlogTOC({ content, className }: BlogTOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // Number of # symbols
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      items.push({ id, title, level });
    }

    setTocItems(items);
  }, [content]);

  // Update TOC when headings are rendered in DOM
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new MutationObserver(() => {
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (!element && typeof window !== 'undefined') {
          // Find heading by text content if ID not found
          const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
          const heading = headings.find(
            (h) => h.textContent?.trim().toLowerCase() === item.title.toLowerCase()
          );
          if (heading && !heading.id) {
            heading.id = item.id;
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const headings = tocItems.map((item) => {
        const element = document.getElementById(item.id);
        return { id: item.id, element, offsetTop: element?.offsetTop || 0 };
      });

      const scrollPosition = window.scrollY + 100; // Offset for header

      for (let i = headings.length - 1; i >= 0; i--) {
        if (scrollPosition >= headings[i].offsetTop) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for sticky header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
      setIsOpen(false); // Close mobile menu after click
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  // TOC content component (reused for both mobile and desktop)
  const TOCContent = () => (
    <>
      {/* Title */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 lg:mb-6">
        Table of Contents
      </h3>

      {/* TOC Items */}
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
        <ul className="space-y-1.5">
          {tocItems.map((item) => (
            <li
              key={item.id}
              className={`
                cursor-pointer rounded px-3 py-2 text-sm transition-colors
                ${item.level === 2 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}
                ${item.level === 3 ? 'ml-4 text-sm' : ''}
                ${item.level === 4 ? 'ml-8 text-xs' : ''}
                ${activeId === item.id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-l-2 border-primary-600 dark:border-primary-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => handleClick(item.id)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-white shadow-lg transition-all hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 lg:hidden"
        aria-label="Toggle table of contents"
      >
        <List className="h-5 w-5" />
        <span className="font-medium">Contents</span>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile TOC (Fixed Position) */}
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-8 z-50 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:hidden"
        >
          {/* Close Button */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Close table of contents"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <TOCContent />
        </motion.nav>
      )}

      {/* Desktop TOC (Sidebar) */}
      <nav className={`hidden lg:block ${className || ''}`}>
        <TOCContent />
      </nav>
    </>
  );
}

