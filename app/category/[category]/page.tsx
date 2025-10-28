import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPostsByCategory, getAllCategories } from '@/lib/blog-server';
import BlogPageClient from '@/components/BlogPageClient';
import type { BlogPost } from '@/lib/blog';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const posts = getBlogPostsByCategory(category);
  
  if (posts.length === 0) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryTitle = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${categoryTitle} Articles`,
    description: `Explore ${categoryTitle} articles covering the latest insights, tutorials, and best practices.`,
    keywords: categoryTitle.toLowerCase(),
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const posts = getBlogPostsByCategory(category);
  
  if (posts.length === 0) {
    notFound();
  }

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));
  const categories = getAllCategories();

  return <BlogPageClient allPosts={posts} allTags={allTags} categories={categories} />;
}
