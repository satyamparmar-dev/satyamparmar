import { Suspense } from 'react';
import { getAllBlogPosts, getAllTags, getCategories } from '@/lib/blog-server';
import BlogPageClient from '@/components/BlogPageClient';

export default function BlogPage() {
  const allPosts = getAllBlogPosts();
  const allTags = getAllTags();
  const categories = getCategories();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPageClient allPosts={allPosts} allTags={allTags} categories={categories} />
    </Suspense>
  );
}