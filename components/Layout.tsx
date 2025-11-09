'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import HomeButton from './HomeButton';
import Analytics from './Analytics';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Analytics />
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <HomeButton />
    </div>
  );
}
