'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search,
  Code,
  Brain,
  Rocket,
  Building,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Code },
  { name: 'Blog', href: '/blog', icon: Brain },
  { name: 'Premium', href: '/premium', icon: Star },
  { name: 'About', href: '/about', icon: Building },
  { name: 'Contact', href: '/contact', icon: Rocket },
  { name: 'Setup', href: '/setup', icon: Code },
];

const categories = [
  { name: 'Backend Engineering', href: '/category/backend-engineering', color: 'bg-blue-500' },
  { name: 'AI & ML', href: '/category/ai', color: 'bg-purple-500' },
  { name: 'DSA & Algo', href: '/category/dsa-algo', color: 'bg-indigo-500' },
  { name: 'Startup World', href: '/category/startup-world', color: 'bg-green-500' },
  { name: 'Tech Innovations', href: '/category/tech-innovations', color: 'bg-orange-500' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm md:bg-transparent md:dark:bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-10 relative" aria-label="Satyverse home">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            >
              <img 
                src="/satyverse-logo.svg" 
                alt="Satyverse logo" 
                className="h-8 w-8"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">S</div>';
                  }
                }}
              />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              Satyverse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (item.name === 'Blog') {
                return (
                  <div key={item.name} className="relative group">
                    <button className={cn(
                      'flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    )}>
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link
                          href="/blog"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          All Articles
                        </Link>
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center space-x-2 rounded-lg px-3 py-2 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {isDark ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* Mobile Categories */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <h3 className="px-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Categories
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <div className={`h-2 w-2 rounded-full ${category.color}`} />
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
