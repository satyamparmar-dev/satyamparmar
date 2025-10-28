'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getEstimatedReadTime } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  className?: string;
}

export default function BlogCard({ post, featured = false, className }: BlogCardProps) {
  const readTime = getEstimatedReadTime(post.content);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800',
        featured && 'lg:col-span-2',
        className
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured Image Placeholder */}
        <div className={cn(
          'h-48 bg-gradient-to-br from-primary-500 to-primary-600',
          featured && 'lg:h-64'
        )}>
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">
                {post.title.charAt(0)}
              </div>
              <div className="text-sm opacity-90">
                {post.tags[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className={cn(
            'mb-3 font-bold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400',
            featured ? 'text-2xl lg:text-3xl' : 'text-xl'
          )}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{readTime} min read</span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center space-x-1 text-primary-600 dark:text-primary-400"
            >
              <span>Read more</span>
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
