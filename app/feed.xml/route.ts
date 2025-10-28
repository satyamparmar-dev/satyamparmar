import { getAllBlogPosts } from '@/lib/blog-server';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllBlogPosts();
  const baseUrl = 'https://satyamparmar-dev.github.io/satyamparmar';

  const rssItems = posts
    .map((post) => {
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.excerpt}]]></description>
          <link>${baseUrl}/blog/${post.slug}</link>
          <guid>${baseUrl}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <author>${post.author}</author>
          <category>${post.tags.join(', ')}</category>
        </item>
      `;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Backend Engineering Blog</title>
        <description>A modern technical blog focused on backend engineering, AI, tech innovations, and the startup world.</description>
        <link>${baseUrl}</link>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
        ${rssItems}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
