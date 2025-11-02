import { ReactNode } from 'react';
import AdminNav from '@/components/AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}
