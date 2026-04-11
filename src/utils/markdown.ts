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
import python from 'highlight.js/lib/languages/python';

// Register languages
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
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

export type ParseMarkdownOptions = {
  /** Framed code blocks, spacing, and scan-friendly emphasis for interview answers */
  interview?: boolean;
};

/** Wrap each &lt;pre&gt; block so CSS can add a label and border (interview / scenario layouts). */
function wrapPreInCodeFrame(html: string): string {
  return html.replace(/<pre(\s[^>]*)?>[\s\S]*?<\/pre>/gi, '<div class="md-code-frame">$&</div>');
}

/** True if this line is empty or a Java/JS line comment (leading //). */
function isSlashSlashCommentLine(line: string): boolean {
  return line.trim().length === 0 || /^\s*\/\//.test(line);
}

/** Index after the longest run of blank + // lines starting at `start`. */
function endOfSlashSlashRun(lines: string[], start: number): number {
  let i = start;
  while (i < lines.length && isSlashSlashCommentLine(lines[i])) {
    i++;
  }
  return i;
}

/**
 * Day JSON often stores pseudo-Java as // comment lines without markdown fences.
 * Splitting only on `\n\n` misses runs that use single newlines between // lines.
 * Scan line-by-line: maximal runs where every non-empty line starts with // become ```java blocks.
 */
function processUnfencedSegmentForInterview(segment: string): string {
  if (!segment.trim()) return segment;
  const lines = segment.split(/\r?\n/);
  const chunks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const j = endOfSlashSlashRun(lines, i);
    const runLines = lines.slice(i, j);
    const nonEmpty = runLines.filter((l) => l.trim().length > 0);
    if (nonEmpty.length > 0 && nonEmpty.every((l) => /^\s*\/\//.test(l))) {
      chunks.push('```java\n' + runLines.join('\n').trimEnd() + '\n```');
      i = j;
      continue;
    }
    if (j > i) {
      i = j;
      continue;
    }
    const proseStart = i;
    i++;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') {
        i++;
        break;
      }
      if (/^\s*\/\//.test(line)) break;
      i++;
    }
    const prose = lines.slice(proseStart, i).join('\n');
    if (prose.length > 0) chunks.push(prose);
  }
  return chunks.join('\n\n');
}

function promotePseudoJavaCommentBlocksToFences(content: string): string {
  const parts = content.split(/(```[\w-]*\r?\n[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith('```')) return part;
      return processUnfencedSegmentForInterview(part);
    })
    .join('');
}

// ─── Parse Markdown → HTML ───────────────────────────────────
export const parseMarkdown = (content: string, options?: ParseMarkdownOptions): string => {
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
    const mdSource = options?.interview ? promotePseudoJavaCommentBlocksToFences(content) : content;
    const raw = marked.parse(mdSource) as string;
    if (!raw || !raw.trim()) {
      return `<p>${escapeHtml(content).replace(/\n/g, '<br/>')}</p>`;
    }
    let sanitized = DOMPurify.sanitize(raw, {
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
    if (options?.interview) {
      sanitized = wrapPreInCodeFrame(sanitized);
    }
    return sanitized;
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
