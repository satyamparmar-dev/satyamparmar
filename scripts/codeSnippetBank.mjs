import { SNIPPETS_PART1 } from './codeSnippetBank.part1.mjs';
import { SNIPPETS_6_45 } from './codeSnippetBank.part1b.mjs';
import { SNIPPETS_46_90 } from './codeSnippetBank.part2.mjs';

/** Merged bank: day 1–90 → { basic, intermediate, advanced } */
export const SNIPPETS = {
  ...SNIPPETS_PART1,
  ...SNIPPETS_6_45,
  ...SNIPPETS_46_90,
};
