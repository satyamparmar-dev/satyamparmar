'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: Search functionality will be handled by the parent component
// This component only handles UI interactions
import type { BlogPost } from '@/lib/blog';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  className?: string;
}

interface SearchResult extends BlogPost {
  type: 'post' | 'tag';
}

export default function SearchBar({ onSearch, onClear, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = searchBlogPosts(searchQuery);
    const tagResults = getAllTags()
      .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(tag => ({ ...tag, type: 'tag' } as any));

    setResults([...searchResults.map(post => ({ ...post, type: 'post' as const })), ...tagResults]);
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'post') {
      onSearch(result.title);
      addToRecentSearches(result.title);
    } else {
      onSearch(result);
      addToRecentSearches(result);
    }
    setIsOpen(false);
    setQuery('');
  };

  const addToRecentSearches = (searchTerm: string) => {
    const newSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search articles, tags, or topics..."
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || recentSearches.length > 0) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            {results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto py-2">
                {results.slice(0, 8).map((result, index) => (
                  <motion.button
                    key={`${result.type}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {result.type === 'post' ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {result.title}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {result.excerpt}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {result}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            Tag
                          </p>
                        </div>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(search)}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {search}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
