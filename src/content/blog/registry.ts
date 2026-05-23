/**
 * Uncategorized topics & short articles (markdown under this folder).
 *
 * To add a post:
 * 1. Create `your-slug.md` in `src/content/blog/`.
 * 2. Import it with `?raw` below.
 * 3. Append to BLOG_POSTS and blogMarkdownBySlug with the same slug.
 */
import intellijShortcuts from './intellij-shortcuts.md?raw';
import gitCommandsJavaDevs from './git-commands-java-devs.md?raw';
import javaStreamsCheatsheet from './java-streams-cheatsheet.md?raw';
import mavenGradleCommands from './maven-gradle-commands.md?raw';
import jvmFlagsTuning from './jvm-flags-tuning.md?raw';
import springBootAnnotations from './spring-boot-annotations.md?raw';
import httpStatusCodesRest from './http-status-codes-rest.md?raw';
import sqlJoinsWindowFunctions from './sql-joins-window-functions.md?raw';
import linuxTerminalJavaDevs from './linux-terminal-java-devs.md?raw';

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** Shown in the hero chip, e.g. "Productivity" */
  tag?: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'intellij-shortcuts',
    title: 'IntelliJ IDEA shortcuts every developer should know',
    description:
      'Navigation, editing, refactoring, run/debug, and VCS — bindings that save time for Java and JVM developers.',
    tag: 'Productivity',
  },
  {
    slug: 'git-commands-java-devs',
    title: 'Git commands every Java developer uses daily',
    description:
      'Stash, cherry-pick, bisect, rebase, reflog — the commands that save you when something goes wrong, with real Java project examples.',
    tag: 'Git',
  },
  {
    slug: 'java-streams-cheatsheet',
    title: 'Java Stream API cheat sheet',
    description:
      'Every Stream method with a one-liner example — filter, map, flatMap, collect, groupingBy, partitioningBy, reduce, and Optional.',
    tag: 'Java',
  },
  {
    slug: 'maven-gradle-commands',
    title: 'Maven & Gradle commands every Java dev needs',
    description:
      'Build lifecycle, dependency tree, skip tests, force refresh, profiles, multi-module builds — the commands you Google every time until you do not.',
    tag: 'Build Tools',
  },
  {
    slug: 'jvm-flags-tuning',
    title: 'JVM flags & tuning reference',
    description:
      'Heap size, GC selection, GC logging, thread dumps, heap dumps, container-aware flags — what each flag does and when to set it.',
    tag: 'JVM',
  },
  {
    slug: 'spring-boot-annotations',
    title: 'Spring Boot annotations cheat sheet',
    description:
      '@Component, @Service, @Transactional, @Scheduled, @Async, @ConfigurationProperties, @ConditionalOn* — what each does and when to use it.',
    tag: 'Spring Boot',
  },
  {
    slug: 'http-status-codes-rest',
    title: 'HTTP status codes reference for REST API design',
    description:
      'Which 2xx/3xx/4xx/5xx to return and when — the decisions that come up in every API design discussion, with Java examples and common mistakes.',
    tag: 'REST API',
  },
  {
    slug: 'sql-joins-window-functions',
    title: 'SQL joins & window functions visual guide',
    description:
      'INNER, LEFT, RIGHT, FULL, CROSS joins with diagrams — plus ROW_NUMBER, RANK, LAG, LEAD, SUM OVER with real examples.',
    tag: 'SQL',
  },
  {
    slug: 'linux-terminal-java-devs',
    title: 'Linux & terminal commands for Java backend developers',
    description:
      'grep, awk, tail -f, curl, netstat, lsof, jstack — the commands you need when SSH\'d into a production server with nothing but a terminal.',
    tag: 'Linux',
  },
];

export const blogMarkdownBySlug: Record<string, string> = {
  'intellij-shortcuts': intellijShortcuts,
  'git-commands-java-devs': gitCommandsJavaDevs,
  'java-streams-cheatsheet': javaStreamsCheatsheet,
  'maven-gradle-commands': mavenGradleCommands,
  'jvm-flags-tuning': jvmFlagsTuning,
  'spring-boot-annotations': springBootAnnotations,
  'http-status-codes-rest': httpStatusCodesRest,
  'sql-joins-window-functions': sqlJoinsWindowFunctions,
  'linux-terminal-java-devs': linuxTerminalJavaDevs,
};

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogMarkdown(slug: string): string | undefined {
  return blogMarkdownBySlug[slug];
}
