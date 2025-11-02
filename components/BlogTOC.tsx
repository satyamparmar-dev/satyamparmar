'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, ChevronDown, ChevronRight } from 'lucide-react';
import { generateHeadingId } from '@/lib/utils';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCSection {
  mainItem: TOCItem;
  subsections: TOCItem[];
}

interface BlogTOCProps {
  content: string;
  className?: string;
}

export default function BlogTOC({ content, className }: BlogTOCProps) {
  const [tocSections, setTocSections] = useState<TOCSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract headings from markdown content (H2-H6, skip H1 as it's usually the title)
    // Supports headings with optional trailing spaces and special characters
    const headingRegex = /^(#{2,6})\s+(.+?)(?:\s*#+\s*)?$/gm;
    const items: TOCItem[] = [];
    let match;
    const idCounts: Record<string, number> = {}; // Track duplicate IDs

    // Reset regex lastIndex to avoid issues with multiple calls
    headingRegex.lastIndex = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // Number of # symbols
      const title = match[2].trim();
      
      // Skip empty titles
      if (!title) continue;
      
      // Generate consistent ID using utility function
      const baseId = generateHeadingId(title);
      
      // Make ID unique if duplicate exists
      if (idCounts[baseId]) {
        idCounts[baseId]++;
        const id = `${baseId}-${idCounts[baseId]}`;
        items.push({ id, title, level });
      } else {
        idCounts[baseId] = 1;
        items.push({ id: baseId, title, level });
      }
    }

    // Group items into sections (H2 = main section, H3+ = subsections)
    const sections: TOCSection[] = [];
    let currentSection: TOCSection | null = null;

    for (const item of items) {
      if (item.level === 2) {
        // Start a new main section
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          mainItem: item,
          subsections: [],
        };
      } else if (currentSection && item.level > 2) {
        // Add to current section's subsections
        currentSection.subsections.push(item);
      } else if (!currentSection && item.level > 2) {
        // If we encounter a subsection before any main section, create a dummy section
        currentSection = {
          mainItem: item, // Treat it as main item
          subsections: [],
        };
      }
    }

    // Push the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    setTocSections(sections);
  }, [content]);

  // Ensure all headings in the DOM have the correct IDs
  useEffect(() => {
    if (tocSections.length === 0) return;

    const ensureHeadingIds = () => {
      const allItems: TOCItem[] = [];
      tocSections.forEach((section) => {
        allItems.push(section.mainItem);
        allItems.push(...section.subsections);
      });

      allItems.forEach((item) => {
        // First, try to find by ID
        let element = document.getElementById(item.id);
        
        if (!element && typeof window !== 'undefined') {
          // If not found by ID, find by text content and assign ID
          const headings = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6')) as HTMLElement[];
          const heading = headings.find((h) => {
            const headingText = h.textContent?.trim() || '';
            return generateHeadingId(headingText) === item.id || 
                   headingText.toLowerCase() === item.title.toLowerCase();
          });
          
          if (heading) {
            heading.id = item.id;
            element = heading as HTMLElement;
          }
        }
      });
    };

    // Run immediately
    ensureHeadingIds();

    // Set up observer to handle dynamically rendered content
    const observer = new MutationObserver(ensureHeadingIds);

    // Observe the article content area specifically
    const articleContent = document.querySelector('article, .prose, [class*="prose"]');
    const observeTarget = articleContent || document.body;

    observer.observe(observeTarget, {
      childList: true,
      subtree: true,
    });

    // Also check after a short delay to catch ReactMarkdown rendering
    const timeoutId = setTimeout(ensureHeadingIds, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [tocSections]);

  useEffect(() => {
    if (tocSections.length === 0) return;

    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      // Collect all items (main + subsections)
      const allItems: TOCItem[] = [];
      tocSections.forEach((section) => {
        allItems.push(section.mainItem);
        allItems.push(...section.subsections);
      });

      const headings = allItems
        .map((item) => {
          const element = document.getElementById(item.id);
          return element 
            ? { id: item.id, element, offsetTop: element.offsetTop } 
            : null;
        })
        .filter((item): item is { id: string; element: HTMLElement; offsetTop: number } => item !== null);

      if (headings.length === 0) return;

      const scrollPosition = window.scrollY + 120; // Offset for sticky header

      // Find the heading that's currently in view or the last one we've scrolled past
      let activeHeadingId = headings[0].id;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (scrollPosition >= headings[i].offsetTop - 50) {
          activeHeadingId = headings[i].id;
          break;
        }
      }

      setActiveId(activeHeadingId);

      // Auto-expand section if a subsection is active
      const activeItem = allItems.find((item) => item.id === activeHeadingId);
      if (activeItem && activeItem.level > 2) {
        // Find the parent section
        const parentSection = tocSections.find((section) =>
          section.subsections.some((sub) => sub.id === activeItem.id)
        );
        if (parentSection) {
          setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.add(parentSection.mainItem.id);
            return newSet;
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocSections]);

  const handleClick = (id: string, e?: React.MouseEvent) => {
    // Prevent event if clicking on chevron icon
    if (e?.target && (e.target as HTMLElement).closest('.chevron-button')) {
      return;
    }

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

  const toggleSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (tocSections.length === 0) {
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
        <ul className="space-y-1">
          {tocSections.map((section) => {
            const isExpanded = expandedSections.has(section.mainItem.id);
            const hasSubsections = section.subsections.length > 0;
            const isMainActive = activeId === section.mainItem.id;

            return (
              <li key={section.mainItem.id} className="space-y-0.5">
                {/* Main Section */}
                <div
                  className={`
                    group flex items-center gap-2 rounded px-3 py-2 transition-colors
                    ${isMainActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-l-2 border-primary-600 dark:border-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                    ${hasSubsections ? 'cursor-pointer' : ''}
                  `}
                  onClick={(e) => handleClick(section.mainItem.id, e)}
                >
                  {/* Chevron Icon */}
                  {hasSubsections && (
                    <button
                      onClick={(e) => toggleSection(section.mainItem.id, e)}
                      className="chevron-button flex-shrink-0 rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                  {!hasSubsections && <span className="w-5" />}
                  
                  {/* Main Section Title */}
                  <span className={`
                    flex-1 text-sm font-medium
                    ${isMainActive
                      ? 'text-primary-700 dark:text-primary-400'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}>
                    {section.mainItem.title}
                  </span>
                </div>

                {/* Subsections */}
                {hasSubsections && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-7 space-y-0.5"
                      >
                        {section.subsections.map((subsection) => {
                          const isSubActive = activeId === subsection.id;
                          const indentLevel = subsection.level - 3; // H3 = 0, H4 = 1, etc.
                          const indentClass = indentLevel === 0 ? 'ml-0' : 
                                             indentLevel === 1 ? 'ml-4' : 
                                             indentLevel === 2 ? 'ml-8' : 'ml-12';

                          return (
                            <li
                              key={subsection.id}
                              className={`
                                cursor-pointer rounded px-3 py-1.5 transition-colors text-sm
                                ${indentClass}
                                ${isSubActive
                                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-l-2 border-primary-600 dark:border-primary-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }
                              `}
                              onClick={() => handleClick(subsection.id)}
                            >
                              {subsection.title}
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
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

