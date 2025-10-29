'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Tag, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Pagination from './Pagination';
import BlogSearch from './BlogSearch';
import { formatDate, truncateText } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
  category?: string;
  readTime?: number;
  views?: number;
  isPremium?: boolean;
  isVIP?: boolean;
}

interface PaginatedBlogListProps {
  posts: BlogPost[];
  postsPerPage?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function PaginatedBlogList({ 
  posts, 
  postsPerPage = 12,
  showSearch = true,
  showFilters = true
}: PaginatedBlogListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    tags: [] as string[],
    dateRange: { start: '', end: '' },
    author: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(post => 
        post.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(post => 
        filters.tags.some(tag => post.tags.includes(tag))
      );
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(post => 
        post.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(post => 
        new Date(post.date) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(post => 
        new Date(post.date) <= new Date(filters.dateRange.end)
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchQuery, filters, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate loading delay for large datasets
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSort = (sort: string) => {
    setSortBy(sort);
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Backend Engineering': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AI & Machine Learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'DevOps & Infrastructure': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Database & Performance': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Security': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Architecture': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Startup & Business': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Tech Innovations': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      {showSearch && (
        <BlogSearch
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          totalResults={filteredPosts.length}
          isLoading={isLoading}
        />
      )}

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length.toLocaleString()} articles
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {currentPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="p-6">
                {/* Category and Premium Badges */}
                <div className="flex items-center justify-between mb-4">
                  {post.category && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  )}
                  <div className="flex space-x-2">
                    {post.isVIP && (
                      <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        VIP
                      </span>
                    )}
                    {post.isPremium && !post.isVIP && (
                      <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {truncateText(post.excerpt, 120)}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime || 5} min read
                    </div>
                  </div>
                  {post.views && (
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.date)}
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxVisiblePages={7}
        />
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                category: '',
                tags: [],
                dateRange: { start: '', end: '' },
                author: ''
              });
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
