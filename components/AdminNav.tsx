'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Users, FileEdit, Home, ChevronRight, LogOut } from 'lucide-react';
import { logoutAdmin, isAdminAuthenticated } from '@/lib/admin-auth';
import { useState, useEffect } from 'react';

const adminLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Premium Users', href: '/admin/premium-users', icon: Users },
  { name: 'Blog Editor', href: '/admin/blog-editor', icon: FileEdit }
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, [pathname]);

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
    // Redirect to home or refresh if on admin page
    if (pathname?.startsWith('/admin')) {
      router.push('/');
    } else {
      router.refresh();
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              );
            })}
            
            {authenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
