import { Metadata } from 'next';
import { getFeaturedBlogPosts, getCategories } from '@/lib/blog-server';
import HomePageClient from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Home',
  description: 'A modern technical blog focused on backend engineering, AI, tech innovations, and the startup world. Discover the latest insights, tutorials, and best practices.',
};

export default function HomePage() {
  const featuredPosts = getFeaturedBlogPosts();
  const categories = getCategories();

  return <HomePageClient featuredPosts={featuredPosts} categories={categories} />;
}