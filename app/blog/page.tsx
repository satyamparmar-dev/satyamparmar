import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllBlogPosts, getAllTags, getCategories } from '@/lib/blog-client';
import PaginatedBlogList from '@/components/PaginatedBlogList';

export default function BlogPage() {
  // Use only actual blog posts (no generated content)
  const allPosts = getAllBlogPosts();
  const allTags = getAllTags();
  const categories = getCategories();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Blog</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Technical Blog
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore {allPosts.length.toLocaleString()}+ articles on backend engineering, 
                AI, DevOps, and cutting-edge technology.
              </p>
            </div>
          </div>
        </div>

        {/* Paginated Blog List */}
        <PaginatedBlogList 
          posts={allPosts} 
          postsPerPage={12}
          showSearch={true}
          showFilters={true}
        />
      </div>
    </Suspense>
  );
}