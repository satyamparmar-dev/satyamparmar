import { Suspense } from 'react';
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