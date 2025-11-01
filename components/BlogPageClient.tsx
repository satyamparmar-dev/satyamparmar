'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, X, Tag, Calendar, User } from 'lucide-react';
import Layout from '@/components/Layout';
import BlogCard from '@/components/BlogCard';
import SearchBar from '@/components/SearchBar';
import type { BlogPost } from '@/lib/blog-client';

interface BlogPageClientProps {
  allPosts: BlogPost[];
  allTags: string[];
  categories: string[];
}

export default function BlogPageClient({ allPosts, allTags, categories }: BlogPageClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(allPosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(allPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle URL parameters
    const tag = searchParams.get('tag');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (tag) {
      setSelectedTag(tag);
      setPosts(allPosts.filter(post => post.tags.includes(tag)));
    } else if (category) {
      setSelectedCategory(category);
      setPosts(allPosts.filter(post => 
        post.tags.some(tag => 
          tag.toLowerCase().includes(category.toLowerCase())
        )
      ));
    } else if (search) {
      setSearchQuery(search);
      setPosts(allPosts);
    } else {
      setPosts(allPosts);
    }
  }, [searchParams, allPosts]);

  useEffect(() => {
    let filtered = [...posts];

    // Apply search filter (support multiple keywords)
    if (searchQuery) {
      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(keyword => keyword.length > 0);
      filtered = filtered.filter(post => {
        const searchText = `${post.title} ${post.excerpt} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
        return keywords.every(keyword => searchText.includes(keyword));
      });
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(post => 
        post.tags.some(tag => 
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        
        return postDate >= startDate && postDate <= endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedTag, selectedCategory, dateRange, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedTag(null);
    setSelectedCategory(null);
    
    // Filter posts based on search query
    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setPosts(filtered);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedCategory(null);
    setPosts(allPosts);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setSelectedCategory(null);
    setSearchQuery('');
    setPosts(allPosts.filter(post => post.tags.includes(tag)));
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedTag(null);
    setSearchQuery('');
    setPosts(allPosts.filter(post => 
      post.tags.some(tag => 
        tag.toLowerCase().includes(category.toLowerCase())
      )
    ));
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setDateRange({start: '', end: ''});
    setSortBy('date');
    setSortOrder('desc');
    setPosts(allPosts);
  };

  const hasActiveFilters = selectedTag || selectedCategory || searchQuery || dateRange.start || dateRange.end;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            Blog Articles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            Discover insights, tutorials, and best practices in backend engineering, 
            AI, and tech innovations.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="mt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </motion.button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active filters:
              </span>
              {selectedTag && (
                <span className="inline-flex items-center space-x-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  <Tag className="h-3 w-3" />
                  <span>{selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900 dark:text-green-300">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showFilters ? 1 : 0, 
              height: showFilters ? 'auto' : 0 
            }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Categories
                  </h3>
                  <div className="mt-3 space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Popular Tags
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allTags.slice(0, 12).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          selectedTag === tag
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range & Sorting */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Date Range & Sorting
                  </h3>
                  <div className="mt-3 space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="Start date"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="End date"
                        />
                      </div>
                    </div>

                    {/* Sorting */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort By
                      </label>
                      <div className="space-y-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'author')}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="date">Date</option>
                          <option value="title">Title</option>
                          <option value="author">Author</option>
                        </select>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Results Count */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 text-center"
          >
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No articles found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
