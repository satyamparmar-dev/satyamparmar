/**
 * Phase 1 inventory: every blob from github.com/Satyverse-Satyam-Parmar/Java (main).
 * Each summaryLine is the first non-empty line from that file (see vendor-manifest.json excerpt).
 */

export type InventoryRow = {
  path: string;
  /** Same as the file basename in the repo. */
  topic: string;
  contentType: string;
  summaryLine: string;
};

function basename(p: string): string {
  const parts = p.split('/');
  return parts[parts.length - 1] ?? p;
}

const row = (path: string, contentType: string, summaryLine: string): InventoryRow => ({
  path,
  topic: basename(path),
  contentType,
  summaryLine,
});

/** Grouped inventory for the external Java repo (includes pom.xml for audit only). */
export const JAVA_GITHUB_PHASE1_INVENTORY: { group: string; files: InventoryRow[] }[] = [
  {
    group: 'Repository root — Markdown',
    files: [
      row('GETTING_STARTED.md', 'Markdown', '# Getting Started Guide'),
      row('README.md', 'Markdown', '# Java 8 to Latest: Comprehensive Learning & Interview Guide'),
      row('SUMMARY.md', 'Markdown', '# Java 8+ Learning Guide - Summary'),
      row('ARCHITECTURE_DIAGRAMS.md', 'Markdown', '# Architecture Diagrams - PlantUML'),
      row('INTERVIEW_QUESTIONS.md', 'Markdown', '# Java 8+ Interview Questions & Answers'),
      row('SCENARIO_BASED_QA_INDEX.md', 'Markdown', '# Scenario-Based Questions & Answers - Complete Index'),
      row('SCENARIO_BASED_QA_PART1.md', 'Markdown', '# Scenario-Based Questions & Answers - Part 1: Core Java & JVM'),
      row('SCENARIO_BASED_QA_PART2.md', 'Markdown', '# Scenario-Based Questions & Answers - Part 2: Spring Boot & Enterprise'),
      row('SCENARIO_BASED_QA_PART3.md', 'Markdown', '# Scenario-Based Questions & Answers - Part 3: Concurrency, Design Patterns & Production'),
      row('SENIOR_JAVA_INTERVIEW_INDEX.md', 'Markdown', '# Senior Java Developer Interview Questions - Complete Index'),
      row('SENIOR_JAVA_INTERVIEW_PART1.md', 'Markdown', '# Senior Java Developer Interview Questions - Part 1'),
      row('SENIOR_JAVA_INTERVIEW_PART2.md', 'Markdown', '# Senior Java Developer Interview Questions - Part 2'),
      row('SENIOR_JAVA_INTERVIEW_PART3.md', 'Markdown', '# Senior Java Developer Interview Questions - Part 3'),
    ],
  },
  {
    group: 'Repository root — XML',
    files: [row('pom.xml', 'XML', '<?xml version="1.0" encoding="UTF-8"?>')],
  },
  {
    group: 'src/main/java/com/example/enterprise',
    files: [
      row(
        'src/main/java/com/example/enterprise/OrderProcessingService.java',
        'Java',
        'package com.example.enterprise;'
      ),
    ],
  },
  {
    group: 'src/main/java/com/example/functional',
    files: [
      row(
        'src/main/java/com/example/functional/FunctionalInterfacesDemo.java',
        'Java',
        'package com.example.functional;'
      ),
    ],
  },
  {
    group: 'src/main/java/com/example/optional',
    files: [
      row('src/main/java/com/example/optional/OptionalExamples.java', 'Java', 'package com.example.optional;'),
    ],
  },
  {
    group: 'src/main/java/com/example/streams',
    files: [
      row('src/main/java/com/example/streams/AdvancedCollectors.java', 'Java', 'package com.example.streams;'),
      row('src/main/java/com/example/streams/StreamBasics.java', 'Java', 'package com.example.streams;'),
    ],
  },
];
