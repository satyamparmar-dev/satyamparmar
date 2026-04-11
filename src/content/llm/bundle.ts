import concepts from './concepts.md?raw';
import ragPrompting from './rag-prompting.md?raw';
import interviewAngle from './interview-angle.md?raw';
import plainLanguageScript from './plain-language-script.md?raw';

export type LlmTabSection = { id: string; label: string; markdown: string };

export function buildLlmTabSections(): LlmTabSection[] {
  return [
    { id: 'concepts', label: 'Core concepts', markdown: concepts },
    { id: 'rag', label: 'RAG & prompting', markdown: ragPrompting },
    { id: 'interview', label: 'Interview angles', markdown: interviewAngle },
  ];
}

export const llmOverviewFullMarkdown = [
  concepts.trim(),
  ragPrompting.trim(),
  interviewAngle.trim(),
  plainLanguageScript.trim(),
].join('\n\n---\n\n');
