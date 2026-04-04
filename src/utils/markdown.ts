import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import plaintext from 'highlight.js/lib/languages/plaintext';

// Register languages
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext);

// ─── Configure Marked ────────────────────────────────────────
marked.setOptions({
  gfm: true,
  breaks: false,
});

// Custom renderer
const renderer = new marked.Renderer();

renderer.code = (code: string, infostring?: string, escaped?: boolean) => {
  const lang = infostring && hljs.getLanguage(infostring) ? infostring : 'plaintext';
  const source = escaped ? code : code;
  const highlighted = hljs.highlight(source, { language: lang }).value;
  return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
};

renderer.codespan = (text: string) => {
  return `<code class="inline-code">${text}</code>`;
};

renderer.heading = (text: string, level: number, raw: string) => {
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${level} id="${id}">${text}</h${level}>`;
};

marked.use({ renderer });

// ─── Parse Markdown → HTML ───────────────────────────────────
export const parseMarkdown = (content: string): string => {
  if (!content || !content.trim()) {
    return '<p>No content available.</p>';
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  try {
    const raw = marked.parse(content) as string;
    if (!raw || !raw.trim()) {
      return `<p>${escapeHtml(content).replace(/\n/g, '<br/>')}</p>`;
    }
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
        'a',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel'],
      FORCE_BODY: true,
    });
  } catch {
    return `<p>${escapeHtml(content).replace(/\n/g, '<br/>')}</p>`;
  }
};

// ─── Highlight Code Block ────────────────────────────────────
export const highlightCode = (code: string, language = 'java'): string => {
  try {
    const lang = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
};

// ─── Strip Markdown ───────────────────────────────────────────
export const stripMarkdown = (content: string): string => {
  return content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/>\s/g, '')
    .replace(/---/g, '')
    .trim();
};
