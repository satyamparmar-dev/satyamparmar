"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function HomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-8 z-50"
    >
      <Link
        href="/"
        className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg ring-1 ring-gray-200 hover:bg-white dark:bg-gray-800/90 dark:text-gray-100 dark:ring-gray-700"
        aria-label="Go to Home"
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </Link>
    </motion.div>
  );
}
