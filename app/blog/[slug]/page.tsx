import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-client';
import { generateBlogPosts } from '@/lib/blog-generator';
import BlogPostClient from '@/components/BlogPostClient';
import type { BlogPost } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  // For static export, we need to generate all possible blog post slugs
  // This includes both static blog posts and generated ones
  const staticPosts = getAllBlogPosts();
  const generatedPosts = generateBlogPosts(100); // Generate 100 posts for static export
  
  const allSlugs = [
    ...staticPosts.map(post => ({ slug: post.slug })),
    ...generatedPosts.map(post => ({ slug: post.slug }))
  ];
  
  return allSlugs;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllBlogPosts()
    .filter(p => p.slug !== post.slug)
    .filter(p => p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}