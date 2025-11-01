/**
 * Unit tests for BlogCard component (components/BlogCard.tsx)
 * 
 * Priority: P1 (High)
 * Coverage Target: ≥85%
 */

import { render, screen } from '@testing-library/react';
import BlogCard from '@/components/BlogCard';
import type { BlogPost } from '@/lib/blog-client';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  User: () => <div data-testid="user-icon">User</div>,
  ArrowRight: () => <div data-testid="arrow-icon">ArrowRight</div>,
}));

describe('BlogCard Component', () => {
  const mockPost: BlogPost = {
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    date: '2025-01-18',
    author: 'Satyam Parmar',
    tags: ['backend', 'nodejs'],
    excerpt: 'This is a test blog post excerpt.',
    content: '# Test Blog Post\n\nThis is the full content of the test blog post.',
  };

  it('should render blog post title', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('should render blog post excerpt', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('This is a test blog post excerpt.')).toBeInTheDocument();
  });

  it('should render author name', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Satyam Parmar')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(<BlogCard post={mockPost} />);
    // Date should be formatted (formatDate returns something like "January 18, 2025")
    expect(screen.getByText(/January|2025/)).toBeInTheDocument();
  });

  it('should render estimated read time', () => {
    render(<BlogCard post={mockPost} />);
    // Should show read time icon
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<BlogCard post={mockPost} />);
    // Tags can appear multiple times (in tag pills and category), so use getAllByText
    const backendTags = screen.getAllByText('backend');
    const nodejsTags = screen.getAllByText('nodejs');
    expect(backendTags.length).toBeGreaterThan(0);
    expect(nodejsTags.length).toBeGreaterThan(0);
  });

  it('should link to blog post page', () => {
    render(<BlogCard post={mockPost} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/test-blog-post');
  });

  it('should apply featured styling when featured=true', () => {
    const { container } = render(<BlogCard post={mockPost} featured={true} />);
    // Featured cards should have specific classes (check for lg:col-span-2 or similar)
    const article = container.querySelector('article');
    expect(article).toHaveClass('lg:col-span-2');
  });

  it('should handle missing data gracefully', () => {
    const incompletePost: Partial<BlogPost> = {
      title: 'Incomplete Post',
      slug: 'incomplete',
      date: '2025-01-18',
      author: 'Test Author',
      tags: [],
      excerpt: '',
      content: '',
    };

    render(<BlogCard post={incompletePost as BlogPost} />);
    expect(screen.getByText('Incomplete Post')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<BlogCard post={mockPost} className="custom-class" />);
    const article = container.querySelector('article');
    expect(article).toHaveClass('custom-class');
  });

  it('should render calendar icon', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('should render user icon', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('should render arrow icon', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });

  it('should handle empty tags array', () => {
    const postWithoutTags: BlogPost = {
      ...mockPost,
      tags: [],
    };

    render(<BlogCard post={postWithoutTags} />);
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('should handle long titles gracefully', () => {
    const postWithLongTitle: BlogPost = {
      ...mockPost,
      title: 'This is a very long blog post title that might need truncation or wrapping',
    };

    render(<BlogCard post={postWithLongTitle} />);
    expect(screen.getByText(postWithLongTitle.title)).toBeInTheDocument();
  });
});

