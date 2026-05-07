import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Avatar,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoadmapData {
  id: string;
  company: string;
  role: string;
  division: string;
  experience: string;
  color: string;
  accentColor: string;
  jdSummary: string;
  skillTaxonomy: {
    mustKnow: Array<{ skill: string; why: string }>;
    shouldKnow: Array<{ skill: string; why: string }>;
    goodToHave: Array<{ skill: string; why: string }>;
  };
  phases: Phase[];
  systemDesign: SystemDesignProblem[];
  interviewQA: TopicQA[];
  behavioral: BehavioralQuestion[];
  codeChallenges: CodeChallenge[];
  plan306090: Plan306090;
  cheatSheets: CheatSheets;
}

interface Phase {
  week: number;
  title: string;
  goal: string;
  topics: string[];
  theory: string;
  practicalExercise: string;
  codeSnippet: { title: string; language: string; code: string };
  systemDesignMiniChallenge: string;
  commonMistakes: string[];
}

interface SystemDesignProblem {
  title: string;
  clarifyingQuestions: string[];
  architecture: string[];
  keyDecisions: Array<{ decision: string; tradeoff: string }>;
  bottlenecks: string[];
  financialConsiderations: string[];
}

interface TopicQA {
  topic: string;
  questions: Array<{
    q: string;
    type: string;
    answer: string;
    followUpQ: string;
    followUpAnswer: string;
  }>;
}

interface BehavioralQuestion {
  question: string;
  evaluating: string;
  starAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface CodeChallenge {
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  solution: string;
  complexity: string;
  followUps: string[];
}

interface Plan306090 {
  days30: { title: string; goals: string[]; deliverable: string; antipattern: string };
  days60: { title: string; goals: string[]; deliverable: string; antipattern: string };
  days90: { title: string; goals: string[]; deliverable: string; antipattern: string };
}

interface CheatSheets {
  javaVersions: Array<{ version: string; feature: string; useWhen: string }>;
  springAnnotations: Array<{ annotation: string; use: string }>;
  kafkaBestPractices: Array<{ config: string; why: string }>;
  kubernetesResources: Array<{ resource: string; use: string }>;
  restApiChecklist: string[];
  securityChecklist: string[];
  genAiPatterns: Array<{ pattern: string; use: string }>;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Skill Map', icon: <AccountTreeIcon fontSize="small" /> },
  { label: 'Roadmap', icon: <MapIcon fontSize="small" /> },
  { label: 'Deep Dives', icon: <MenuBookIcon fontSize="small" /> },
  { label: 'System Design', icon: <DesignServicesIcon fontSize="small" /> },
  { label: 'Interview Q&A', icon: <QuizIcon fontSize="small" /> },
  { label: 'Behavioral', icon: <PeopleIcon fontSize="small" /> },
  { label: 'Code Challenges', icon: <CodeIcon fontSize="small" /> },
  { label: '30-60-90 Plan', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Cheat Sheets', icon: <TipsAndUpdatesIcon fontSize="small" /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <Box mb={3}>
    <Typography variant="h6" fontWeight={800} gutterBottom>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const CodeBlock: React.FC<{ code: string; title?: string }> = ({ code, title }) => (
  <Box
    sx={{
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider',
      mt: title ? 1.5 : 0,
    }}
  >
    {title && (
      <Box
        sx={{
          px: 2,
          py: 0.75,
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CodeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {title}
        </Typography>
      </Box>
    )}
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        overflowX: 'auto',
        fontSize: '0.72rem',
        lineHeight: 1.7,
        fontFamily: 'monospace',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa'),
        color: (theme) => (theme.palette.mode === 'dark' ? '#e6edf3' : '#24292f'),
        whiteSpace: 'pre',
      }}
    >
      {code}
    </Box>
  </Box>
);

const PriorityBadge: React.FC<{ level: 'must' | 'should' | 'nice' }> = ({ level }) => {
  const map = {
    must: { label: 'Must Know', color: '#ef4444', bg: '#fef2f2' },
    should: { label: 'Should Know', color: '#f59e0b', bg: '#fffbeb' },
    nice: { label: 'Good to Have', color: '#6366f1', bg: '#eef2ff' },
  };
  const { label, color, bg } = map[level];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 20,
        borderRadius: '4px',
      }}
    />
  );
};

const DifficultyBadge: React.FC<{ level: string }> = ({ level }) => {
  const colorMap: Record<string, string> = {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444',
  };
  return (
    <Chip
      label={level}
      size="small"
      sx={{
        bgcolor: `${colorMap[level] ?? '#6366f1'}18`,
        color: colorMap[level] ?? '#6366f1',
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 20,
        borderRadius: '4px',
      }}
    />
  );
};

// ─── Tab Panels ───────────────────────────────────────────────────────────────

const SkillTaxonomyTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const { skillTaxonomy } = data;
  const sections: Array<{
    key: keyof typeof skillTaxonomy;
    badge: 'must' | 'should' | 'nice';
    label: string;
    desc: string;
  }> = [
    { key: 'mustKnow', badge: 'must', label: 'Must Know', desc: 'Core skills you will be tested on in every interview round.' },
    { key: 'shouldKnow', badge: 'should', label: 'Should Know', desc: 'Important for the role — expect follow-up questions on these.' },
    { key: 'goodToHave', badge: 'nice', label: 'Good to Have', desc: 'Differentiators that set you apart from other candidates.' },
  ];

  return (
    <Box>
      <SectionHeader
        title="Skill Taxonomy & Priority Matrix"
        subtitle="Not all skills are equal. Focus your energy based on this priority map."
      />
      {sections.map(({ key, badge, label, desc }) => (
        <Box key={key} mb={4}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
            <PriorityBadge level={badge} />
            <Typography variant="subtitle2" fontWeight={700}>
              {label}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            {desc}
          </Typography>
          <Stack gap={1.5}>
            {skillTaxonomy[key].map((item, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 18, color: 'text.disabled', mt: 0.2, flexShrink: 0 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {item.skill}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.why}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

const RoadmapTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box>
      <SectionHeader
        title="12-Week Preparation Roadmap"
        subtitle="A phased, structured approach — one skill area per week, building on the previous."
      />
      {data.phases.map((phase, i) => (
        <Accordion
          key={phase.week}
          expanded={expanded === i}
          onChange={() => setExpanded(expanded === i ? false : i)}
          elevation={0}
          sx={{
            mb: 1.5,
            border: '1px solid',
            borderColor: expanded === i ? 'primary.main' : 'divider',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
            transition: 'border-color 0.2s',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, py: 1.5 }}>
            <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%', pr: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: expanded === i ? 'primary.main' : 'action.hover',
                  color: expanded === i ? 'white' : 'text.secondary',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                }}
              >
                W{phase.week}
              </Avatar>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={700}>
                  {phase.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {phase.goal.length > 90 ? phase.goal.slice(0, 87) + '…' : phase.goal}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((i + 1) / data.phases.length) * 100}
                sx={{ width: 48, borderRadius: 2, height: 4, display: { xs: 'none', sm: 'block' } }}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            <Divider sx={{ mb: 2.5 }} />

            {/* Goal */}
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.82rem' }}>
              <strong>Goal:</strong> {phase.goal}
            </Alert>

            {/* Topics */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              TOPICS COVERED
            </Typography>
            <Stack gap={0.75} mb={2.5}>
              {phase.topics.map((t, j) => (
                <Stack key={j} direction="row" alignItems="flex-start" gap={1}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Theory */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              THEORY (PLAIN ENGLISH)
            </Typography>
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2.5 }}
            >
              <Typography variant="body2" color="text.primary" lineHeight={1.7}>
                {phase.theory}
              </Typography>
            </Paper>

            {/* Practical Exercise */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              PRACTICAL EXERCISE
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.light',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(34,197,94,0.08)' : '#f0fdf4',
                mb: 2.5,
              }}
            >
              <Typography variant="body2" color="text.primary" lineHeight={1.7}>
                {phase.practicalExercise}
              </Typography>
            </Paper>

            {/* Code Snippet */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              CODE SNIPPET
            </Typography>
            <CodeBlock code={phase.codeSnippet.code} title={phase.codeSnippet.title} />

            {/* Mini Challenge */}
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              display="block"
              mt={2.5}
              mb={1}
            >
              SYSTEM DESIGN MINI-CHALLENGE
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.light',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.08)' : '#fffbeb',
                mb: 2.5,
              }}
            >
              <Typography variant="body2" color="text.primary" lineHeight={1.7}>
                {phase.systemDesignMiniChallenge}
              </Typography>
            </Paper>

            {/* Common Mistakes */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              COMMON MISTAKES AT THIS LEVEL
            </Typography>
            <Stack gap={0.75}>
              {phase.commonMistakes.map((m, j) => (
                <Stack key={j} direction="row" alignItems="flex-start" gap={1}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {m}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const SystemDesignTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box>
      <SectionHeader
        title="System Design Problems"
        subtitle="5 financial-domain system design problems with architect-level walkthroughs."
      />
      {data.systemDesign.map((problem, i) => (
        <Accordion
          key={i}
          expanded={expanded === i}
          onChange={() => setExpanded(expanded === i ? false : i)}
          elevation={0}
          sx={{
            mb: 1.5,
            border: '1px solid',
            borderColor: expanded === i ? 'primary.main' : 'divider',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.light',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </Avatar>
              <Typography variant="body2" fontWeight={700}>
                {problem.title}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            <Divider sx={{ mb: 2 }} />

            <Section title="Step 1 — Clarifying Questions to Ask First">
              {problem.clarifyingQuestions.map((q, j) => (
                <Stack key={j} direction="row" gap={1} mb={0.75}>
                  <Typography variant="body2" color="primary.main" fontWeight={700}>
                    Q{j + 1}.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {q}
                  </Typography>
                </Stack>
              ))}
            </Section>

            <Section title="Step 2 — High-Level Architecture">
              <Stack gap={0.5}>
                {problem.architecture.map((step, j) => (
                  <Stack key={j} direction="row" gap={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.1,
                      }}
                    >
                      {j + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {step}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Section>

            <Section title="Step 3 — Key Design Decisions & Trade-offs">
              <Stack gap={1.5}>
                {problem.keyDecisions.map((d, j) => (
                  <Paper
                    key={j}
                    elevation={0}
                    sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Typography variant="body2" fontWeight={700} mb={0.5}>
                      {d.decision}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {d.tradeoff}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Section>

            <Section title="Step 4 — Bottlenecks & How to Scale">
              {problem.bottlenecks.map((b, j) => (
                <Stack key={j} direction="row" gap={1} mb={0.75} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {b}
                  </Typography>
                </Stack>
              ))}
            </Section>

            <Section title="Financial Domain Considerations">
              {problem.financialConsiderations.map((c, j) => (
                <Stack key={j} direction="row" gap={1} mb={0.75} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {c}
                  </Typography>
                </Stack>
              ))}
            </Section>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box mb={2.5}>
    <Typography variant="caption" fontWeight={700} color="text.disabled" display="block" mb={1}>
      {title.toUpperCase()}
    </Typography>
    {children}
  </Box>
);

const InterviewQATab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  return (
    <Box>
      <SectionHeader
        title="Interview Questions & Follow-Up Answers"
        subtitle="Organized by topic. Each question includes the primary answer and a follow-up the interviewer will likely ask."
      />
      {data.interviewQA.map((topic) => (
        <Box key={topic.topic} mb={4}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Chip
              label={topic.topic}
              sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', borderRadius: '6px' }}
            />
            <Typography variant="caption" color="text.disabled">
              {topic.questions.length} questions
            </Typography>
          </Stack>
          {topic.questions.map((qa, i) => {
            const key = `${topic.topic}-${i}`;
            return (
              <Accordion
                key={key}
                expanded={expanded === key}
                onChange={() => setExpanded(expanded === key ? false : key)}
                elevation={0}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: expanded === key ? 'primary.main' : 'divider',
                  borderRadius: '10px !important',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                  <Stack gap={0.5} sx={{ pr: 1 }}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Chip
                        label={qa.type}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          borderRadius: '4px',
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {qa.q}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box mb={2}>
                    <Typography variant="caption" fontWeight={700} color="primary.main" display="block" mb={1}>
                      ANSWER
                    </Typography>
                    <Typography variant="body2" color="text.primary" lineHeight={1.75}>
                      {qa.answer}
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.08)' : '#eef2ff',
                      borderRadius: 2,
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} color="primary.main" display="block" mb={0.75}>
                      FOLLOW-UP: {qa.followUpQ}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {qa.followUpAnswer}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

const BehavioralTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box>
      <SectionHeader
        title="Behavioral & Leadership Questions (Director-Level)"
        subtitle="Use the STAR framework: Situation → Task → Action → Result. Interviewers want specifics, not generalities."
      />
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Director-level tip:</strong> Every behavioral answer should show scale (team size, business impact), trade-offs considered, and a measurable result. Weak: "I led the team." Strong: "I led 8 engineers to deliver X, which reduced P99 latency by 40%."
      </Alert>
      {data.behavioral.map((bq, i) => (
        <Accordion
          key={i}
          expanded={expanded === i}
          onChange={() => setExpanded(expanded === i ? false : i)}
          elevation={0}
          sx={{
            mb: 1.5,
            border: '1px solid',
            borderColor: expanded === i ? 'primary.main' : 'divider',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
            <Box sx={{ pr: 1 }}>
              <Typography variant="body2" fontWeight={700} mb={0.5}>
                {bq.question}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interviewer evaluates: <em>{bq.evaluating}</em>
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" fontWeight={700} color="text.disabled" display="block" mb={2}>
              SAMPLE STAR ANSWER
            </Typography>
            {(['situation', 'task', 'action', 'result'] as const).map((step) => (
              <Box key={step} mb={1.5}>
                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      flexShrink: 0,
                      letterSpacing: '0.05em',
                      mt: 0.2,
                    }}
                  >
                    {step.toUpperCase().slice(0, 1)}
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.primary" lineHeight={1.7}>
                      {bq.starAnswer[step]}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const CodeChallengesTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box>
      <SectionHeader
        title="Code Challenges & Take-Home Exercises"
        subtitle="Production-quality solutions with complexity analysis and follow-up variations."
      />
      {data.codeChallenges.map((challenge, i) => (
        <Accordion
          key={i}
          expanded={expanded === i}
          onChange={() => setExpanded(expanded === i ? false : i)}
          elevation={0}
          sx={{
            mb: 1.5,
            border: '1px solid',
            borderColor: expanded === i ? 'primary.main' : 'divider',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ pr: 1 }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'action.hover', fontSize: '0.75rem', fontWeight: 900 }}
              >
                {i + 1}
              </Avatar>
              <Box>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography variant="body2" fontWeight={700}>
                    {challenge.title}
                  </Typography>
                  <DifficultyBadge level={challenge.difficulty} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {challenge.complexity}
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            <Divider sx={{ mb: 2 }} />

            <Section title="Problem">
              <Typography variant="body2" color="text.primary" lineHeight={1.7}>
                {challenge.description}
              </Typography>
            </Section>

            <Section title="Constraints">
              <Paper
                elevation={0}
                sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}
              >
                <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                  {challenge.constraints}
                </Typography>
              </Paper>
            </Section>

            <Section title="Solution">
              <CodeBlock code={challenge.solution} />
            </Section>

            <Section title="Complexity Analysis">
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                  {challenge.complexity}
                </Typography>
              </Paper>
            </Section>

            <Section title="Follow-Up Questions the Interviewer May Ask">
              {challenge.followUps.map((fu, j) => (
                <Stack key={j} direction="row" gap={1} mb={0.75} alignItems="flex-start">
                  <Typography variant="body2" color="primary.main" fontWeight={700} flexShrink={0}>
                    {j + 1}.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fu}
                  </Typography>
                </Stack>
              ))}
            </Section>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const Plan306090Tab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const { plan306090 } = data;
  const phases = [
    { key: 'days30' as const, label: 'First 30 Days', color: '#3b82f6' },
    { key: 'days60' as const, label: 'Days 31–60', color: '#8b5cf6' },
    { key: 'days90' as const, label: 'Days 61–90', color: '#22c55e' },
  ];

  return (
    <Box>
      <SectionHeader
        title="30-60-90 Day Plan — Post Joining"
        subtitle="What to do in your first 90 days as a Director-level architect to build credibility and drive impact."
      />
      {phases.map(({ key, label, color }) => {
        const phase = plan306090[key];
        return (
          <Paper
            key={key}
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} mb={0.5} sx={{ color }}>
              {label} — {phase.title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" fontWeight={700} color="text.disabled" display="block" mb={1}>
              GOALS
            </Typography>
            <Stack gap={0.75} mb={2.5}>
              {phase.goals.map((goal, i) => (
                <Stack key={i} direction="row" gap={1} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: color,
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {goal}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: `${color}10`,
                borderRadius: 2,
                mb: 1.5,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ color }} display="block" mb={0.5}>
                DELIVERABLE
              </Typography>
              <Typography variant="body2" color="text.primary">
                {phase.deliverable}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#fef2f2',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color="error.main"
                display="block"
                mb={0.5}
              >
                ANTI-PATTERN TO AVOID
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {phase.antipattern}
              </Typography>
            </Paper>
          </Paper>
        );
      })}
    </Box>
  );
};

const CheatSheetsTab: React.FC<{ data: RoadmapData }> = ({ data }) => {
  const { cheatSheets } = data;

  return (
    <Box>
      <SectionHeader
        title="Quick Reference Cheat Sheets"
        subtitle="Save time during prep — dense, actionable reference cards for all major topics."
      />

      {/* Java Versions */}
      <CheatSheetCard title="Java 11–21 Feature Timeline">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Version</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Key Feature</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>When to Use</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cheatSheets.javaVersions.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Chip label={row.version} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>{row.feature}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.useWhen}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CheatSheetCard>

      {/* Spring Annotations */}
      <CheatSheetCard title="Spring Boot Annotations Reference">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Annotation</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Purpose</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cheatSheets.springAnnotations.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="primary.main">
                    {row.annotation}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.use}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CheatSheetCard>

      {/* Kafka Best Practices */}
      <CheatSheetCard title="Kafka Configuration Best Practices">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Config</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Why It Matters</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cheatSheets.kafkaBestPractices.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="warning.dark">
                    {row.config}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.why}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CheatSheetCard>

      {/* Kubernetes Resources */}
      <CheatSheetCard title="Kubernetes Resource Types Cheat Sheet">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Use Case</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cheatSheets.kubernetesResources.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="success.dark">
                    {row.resource}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.use}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CheatSheetCard>

      {/* REST API Checklist */}
      <CheatSheetCard title="REST API Design Checklist">
        <Stack gap={0.75}>
          {cheatSheets.restApiChecklist.map((item, i) => (
            <Stack key={i} direction="row" gap={1.5} alignItems="flex-start">
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main', mt: 0.2, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CheatSheetCard>

      {/* Security Checklist */}
      <CheatSheetCard title="Enterprise API Security Checklist">
        <Stack gap={0.75}>
          {cheatSheets.securityChecklist.map((item, i) => (
            <Stack key={i} direction="row" gap={1.5} alignItems="flex-start">
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'error.main', mt: 0.2, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CheatSheetCard>

      {/* GenAI Patterns */}
      <CheatSheetCard title="GenAI Integration Patterns for Enterprise Java">
        <Stack gap={1.5}>
          {cheatSheets.genAiPatterns.map((p, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography variant="body2" fontWeight={700} mb={0.5} color="primary.main">
                {p.pattern}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.use}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </CheatSheetCard>
    </Box>
  );
};

const CheatSheetCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Paper
    elevation={0}
    sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        bgcolor: 'action.hover',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" fontWeight={800}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 2.5, overflowX: 'auto' }}>{children}</Box>
  </Paper>
);

// The deep-dive tab renders the roadmap phases again from a topic angle
const DeepDiveTab: React.FC<{ data: RoadmapData }> = ({ data }) => (
  <Box>
    <SectionHeader
      title="Topic Deep Dives"
      subtitle="Each weekly phase contains a complete topic deep-dive. Navigate the Roadmap tab for the full breakdown — theory, code, exercise, and production considerations all in one place."
    />
    <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
      Each phase in the <strong>Roadmap</strong> tab includes: plain-English theory, hands-on exercise, annotated code snippet, system design mini-challenge, and production-level common mistakes — together forming the deep-dive for that topic.
    </Alert>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {data.phases.map((phase) => (
        <Paper
          key={phase.week}
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'primary.main',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}
            >
              W{phase.week}
            </Avatar>
            <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
              {phase.title}
            </Typography>
          </Stack>
          <Stack gap={0.5}>
            {phase.topics.slice(0, 3).map((t, i) => (
              <Typography key={i} variant="caption" color="text.secondary" display="block">
                • {t}
              </Typography>
            ))}
            {phase.topics.length > 3 && (
              <Typography variant="caption" color="text.disabled">
                +{phase.topics.length - 3} more topics
              </Typography>
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const MorganStanley: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/companies/morgan-stanley.json')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress sx={{ borderRadius: 2 }} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading Morgan Stanley roadmap…
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to load roadmap data.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 1.5, md: 3 } }}>
      {/* Back button */}
      <Tooltip title="Back to Companies">
        <IconButton
          onClick={() => navigate('/companies')}
          sx={{ mb: 1.5, color: 'text.secondary' }}
          size="small"
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Accent bar */}
        <Box sx={{ height: 6, background: data.color }} />
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: data.color,
                fontSize: '1.1rem',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                flexShrink: 0,
              }}
            >
              MS
            </Avatar>
            <Box flex={1}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
                mb={0.5}
              >
                <Typography variant="h5" fontWeight={900}>
                  {data.company}
                </Typography>
                <Chip
                  label={data.experience}
                  size="small"
                  sx={{
                    bgcolor: `${data.color}15`,
                    color: data.color,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                  }}
                />
              </Stack>
              <Typography variant="body1" fontWeight={600} color="text.primary" mb={0.25}>
                {data.role}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                {data.division}
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.6} maxWidth={700}>
                {data.jdSummary}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
              <Typography variant="h4" fontWeight={900} color="primary.main">
                9
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Part Guide
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 3,
          overflowX: 'auto',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'none',
              gap: 0.5,
            },
            '& .Mui-selected': { fontWeight: 800 },
          }}
        >
          {TABS.map((t, i) => (
            <Tab
              key={i}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box>
        {tab === 0 && <SkillTaxonomyTab data={data} />}
        {tab === 1 && <RoadmapTab data={data} />}
        {tab === 2 && <DeepDiveTab data={data} />}
        {tab === 3 && <SystemDesignTab data={data} />}
        {tab === 4 && <InterviewQATab data={data} />}
        {tab === 5 && <BehavioralTab data={data} />}
        {tab === 6 && <CodeChallengesTab data={data} />}
        {tab === 7 && <Plan306090Tab data={data} />}
        {tab === 8 && <CheatSheetsTab data={data} />}
      </Box>
    </Box>
  );
};

export default MorganStanley;
