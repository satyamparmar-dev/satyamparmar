"use client";

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllBlogPosts } from '@/lib/blog-client';
import { motion } from 'framer-motion';

interface BlogPostDraft {
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function isValidISODate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateDraft(d: BlogPostDraft): string[] {
  const errors: string[] = [];
  if (!d.title || d.title.length < 4) errors.push('Title is required (min 4 chars).');
  if (!d.slug || d.slug.length < 3) errors.push('Slug is required (min 3 chars).');
  if (!isValidISODate(d.date)) errors.push('Date must be YYYY-MM-DD.');
  if (!d.author) errors.push('Author is required.');
  if (!d.excerpt || d.excerpt.length < 20) errors.push('Excerpt is required (min 20 chars).');
  if (!d.content || d.content.length < 60) errors.push('Content is required (min ~60 chars).');
  if (d.tags.length === 0) errors.push('At least one tag is required.');
  return errors;
}

function toJsonFileString(d: BlogPostDraft): string {
  // Safe JSON with escaped newlines and quotes via JSON.stringify
  const obj = {
    title: d.title,
    slug: d.slug,
    date: d.date,
    author: d.author,
    tags: d.tags,
    excerpt: d.excerpt,
    content: d.content,
  };
  return JSON.stringify(obj);
}

export default function BlogEditor() {
  const existingPosts = useMemo(() => getAllBlogPosts(), []);
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const [draft, setDraft] = useState<BlogPostDraft>({
    title: '',
    slug: '',
    date: new Date().toISOString().slice(0, 10),
    author: 'Satyverse Team',
    tags: [],
    excerpt: '',
    content: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [jsonPreview, setJsonPreview] = useState<string>('');
  const [folder, setFolder] = useState<'blogs' | 'backend-engineering' | 'ai' | 'startup-world' | 'tech-innovations'>('blogs');

  useEffect(() => {
    // Keep slug synced with title unless user manually edited slug
    setDraft((prev) => ({
      ...prev,
      slug: prev.slug && prev.slug !== slugify(prev.title) ? prev.slug : slugify(prev.title),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title]);

  useEffect(() => {
    setErrors(validateDraft(draft));
    setJsonPreview(toJsonFileString(draft));
  }, [draft]);

  const loadExisting = (slug: string) => {
    setSelectedSlug(slug);
    if (!slug) return;
    const existing = existingPosts.find((p) => p.slug === slug);
    if (!existing) return;
    setDraft({
      title: existing.title,
      slug: existing.slug,
      date: existing.date,
      author: existing.author,
      tags: existing.tags,
      excerpt: existing.excerpt,
      content: existing.content,
    });
  };

  const handleDownload = () => {
    const e = validateDraft(draft);
    if (e.length > 0) {
      alert('Please fix validation errors before downloading.');
      return;
    }
    const blob = new Blob([toJsonFileString(draft)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.slug}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(toJsonFileString(draft));
    alert('JSON copied to clipboard. Place it under data/' + folder + `/${draft.slug}.json`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Blog Editor (Satyverse)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
                placeholder="auto-generated-from-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date (YYYY-MM-DD)</label>
              <input
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
              <input
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
              <input
                value={draft.tags.join(', ')}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
                placeholder="backend, performance, security"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder</label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
              >
                <option value="blogs">data/blogs</option>
                <option value="backend-engineering">data/backend-engineering</option>
                <option value="ai">data/ai</option>
                <option value="startup-world">data/startup-world</option>
                <option value="tech-innovations">data/tech-innovations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
            <textarea
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (Markdown)</label>
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={16}
              className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600"
              placeholder="# Title\n\nWrite your content here..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              Copy JSON
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Download JSON
            </button>

            <select
              value={selectedSlug}
              onChange={(e) => loadExisting(e.target.value)}
              className="ml-auto rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600"
            >
              <option value="">Load existing post…</option>
              {existingPosts.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <strong>Validation Errors:</strong>
              <ul className="list-disc ml-5 mt-1">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON Preview</label>
            <pre className="mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">{jsonPreview}</pre>
            <p className="mt-2 text-xs text-gray-500">Destination: <code>data/{folder}/{draft.slug || 'your-slug'}.json</code></p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold mb-3">Live Preview</h2>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-1">{draft.title || 'Post Title'}</h3>
              <p className="text-xs text-gray-500 mb-3">{draft.date} • {draft.author}</p>
              <div className="mb-3">
                {draft.tags.map((t) => (
                  <span key={t} className="mr-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{t}</span>
                ))}
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm dark:prose-invert max-w-none">
                {draft.content || '_Content preview will appear here…_'}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">Note: This is a static editor. Use the Download/Copy JSON and add the file under the correct <code>data/</code> folder, then commit via PR. On GitHub Pages, server-side writes are not supported.</p>
    </div>
  );
}
