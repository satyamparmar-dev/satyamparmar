import { getAllBlogPosts, getAllTags, getCategories } from '@/lib/blog-server';
import BlogPageClient from '@/components/BlogPageClient';

export default function BlogPage() {
  const allPosts = getAllBlogPosts();
  const allTags = getAllTags();
  const categories = getCategories();

  return <BlogPageClient allPosts={allPosts} allTags={allTags} categories={categories} />;
}