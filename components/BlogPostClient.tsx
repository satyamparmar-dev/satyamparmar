'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Bookmark, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import Layout from '@/components/Layout';
import ProtectedContent from '@/components/ProtectedContent';
import { getEstimatedReadTime, formatDate, generateHeadingId } from '@/lib/utils';
import type { BlogPost } from '@/lib/blog-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlogTOC from '@/components/BlogTOC';
import SocialShare from '@/components/SocialShare';

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const readTime = getEstimatedReadTime(post.content);
  // Use a fresh map per render to avoid StrictMode double-render mismatches between server/client
  const headingCounts = useMemo<Record<string, number>>(() => ({}), [post.content]);

  return (
    <Layout>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 sm:mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href="/blog"
              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate">{post.title}</span>
          </nav>
        </motion.div>

        {/* Main Content Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12">
          {/* Main Article Content */}
          <article className="w-full lg:w-2/3 lg:max-w-4xl">

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          {/* Tags */}
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-100 px-2 py-1 text-xs sm:text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl xl:text-5xl">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Social Share */}
          <div className="mt-4 sm:mt-6">
            <SocialShare
              url={`/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
            />
          </div>
        </motion.header>

        {/* Article Content - Protected */}
        <ProtectedContent watermarkText="Satyverse - Protected Content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none dark:prose-invert protected-content"
          >
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children, ...props }: any) => {
                const baseId = generateHeadingId(children);
                if (headingCounts[baseId]) {
                  headingCounts[baseId]++;
                  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
                  return (
                    <h2 id={uniqueId} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 scroll-mt-20" {...props}>
                      {children}
                    </h2>
                  );
                } else {
                  headingCounts[baseId] = 1;
                  return (
                    <h2 id={baseId} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 scroll-mt-20" {...props}>
                      {children}
                    </h2>
                  );
                }
              },
              h3: ({ children, ...props }: any) => {
                const baseId = generateHeadingId(children);
                if (headingCounts[baseId]) {
                  headingCounts[baseId]++;
                  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
                  return (
                    <h3 id={uniqueId} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6 scroll-mt-20" {...props}>
                      {children}
                    </h3>
                  );
                } else {
                  headingCounts[baseId] = 1;
                  return (
                    <h3 id={baseId} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6 scroll-mt-20" {...props}>
                      {children}
                    </h3>
                  );
                }
              },
              h4: ({ children, ...props }: any) => {
                const baseId = generateHeadingId(children);
                if (headingCounts[baseId]) {
                  headingCounts[baseId]++;
                  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
                  return (
                    <h4 id={uniqueId} className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h4>
                  );
                } else {
                  headingCounts[baseId] = 1;
                  return (
                    <h4 id={baseId} className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h4>
                  );
                }
              },
              h5: ({ children, ...props }: any) => {
                const baseId = generateHeadingId(children);
                if (headingCounts[baseId]) {
                  headingCounts[baseId]++;
                  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
                  return (
                    <h5 id={uniqueId} className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h5>
                  );
                } else {
                  headingCounts[baseId] = 1;
                  return (
                    <h5 id={baseId} className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h5>
                  );
                }
              },
              h6: ({ children, ...props }: any) => {
                const baseId = generateHeadingId(children);
                if (headingCounts[baseId]) {
                  headingCounts[baseId]++;
                  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
                  return (
                    <h6 id={uniqueId} className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h6>
                  );
                } else {
                  headingCounts[baseId] = 1;
                  return (
                    <h6 id={baseId} className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-4 scroll-mt-20" {...props}>
                      {children}
                    </h6>
                  );
                }
              },
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return !isInline && match ? (
                  <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {children}
                </h1>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 dark:text-gray-300">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic">
                  {children}
                </em>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {children}
                </td>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
          </motion.div>
        </ProtectedContent>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 sm:mt-16 border-t border-gray-200 pt-8 sm:pt-12 dark:border-gray-700"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  {relatedPosts.map((relatedPost) => (
                    <motion.article
                      key={relatedPost.slug}
                      whileHover={{ y: -4 }}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Link href={`/blog/${relatedPost.slug}`} className="block">
                        <div className="h-40 sm:h-48 bg-gradient-to-br from-primary-500 to-primary-600">
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-2xl sm:text-3xl font-bold mb-2">
                                {relatedPost.title.charAt(0)}
                              </div>
                              <div className="text-xs sm:text-sm opacity-90">
                                {relatedPost.tags[0]}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="mb-2 sm:mb-3 flex flex-wrap gap-2">
                            {relatedPost.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                            {relatedPost.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            )}
          </article>

          {/* Sidebar with Table of Contents */}
          <aside className="hidden lg:block lg:w-1/3 xl:w-1/4">
            <div className="sticky top-24">
              <BlogTOC content={post.content} />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
