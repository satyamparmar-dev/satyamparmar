import React, { useState } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Collapse,
  Divider, LinearProgress, Tooltip, Stack,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ScenarioIcon from '@mui/icons-material/AccountTreeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { AssignmentSection, AssignmentQuestion } from '../types';
import { useAppStore } from '../store/useAppStore';
import CodeBlock from './CodeBlock';
import { parseMarkdown } from '../utils/markdown';

// ─── Question Type Config ─────────────────────────────────────────────────────

const TYPE_CONFIG = {
  conceptual: {
    label: 'Conceptual',
    color: '#58A6FF',
    bg: 'rgba(88,166,255,0.1)',
    border: 'rgba(88,166,255,0.25)',
    Icon: PsychologyOutlinedIcon,
  },
  scenario: {
    label: 'Scenario',
    color: '#D29922',
    bg: 'rgba(210,153,34,0.1)',
    border: 'rgba(210,153,34,0.25)',
    Icon: ScenarioIcon,
  },
  coding: {
    label: 'Coding',
    color: '#3FB950',
    bg: 'rgba(63,185,80,0.1)',
    border: 'rgba(63,185,80,0.25)',
    Icon: CodeIcon,
  },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#3FB950',
  Intermediate: '#58A6FF',
  Advanced: '#D29922',
  Expert: '#F85149',
};

// ─── Single Question Card ─────────────────────────────────────────────────────

interface QuestionCardProps {
  question: AssignmentQuestion;
  index: number;
  dayNumber: number;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question, index, dayNumber, isCompleted, onToggleComplete,
}) => {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const cfg = TYPE_CONFIG[question.type] ?? TYPE_CONFIG.conceptual;

  const handleRevealNextHint = () => {
    setRevealedHints((n) => Math.min(n + 1, question.hints.length));
    setShowHints(true);
  };

  const solutionHtml = parseMarkdown(question.solution);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isCompleted ? 'rgba(63,185,80,0.4)' : 'divider',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        bgcolor: isCompleted ? 'rgba(63,185,80,0.03)' : 'background.paper',
      }}
    >
      {/* Question Header */}
      <Box sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1.5}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* Q number */}
            <Box
              sx={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: isCompleted
                  ? 'linear-gradient(135deg, #3FB950, #2da044)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>
                {index + 1}
              </Typography>
            </Box>

            {/* Type badge */}
            <Chip
              icon={<cfg.Icon sx={{ fontSize: '14px !important', color: `${cfg.color} !important` }} />}
              label={cfg.label}
              size="small"
              sx={{
                bgcolor: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
                fontWeight: 600, fontSize: '0.7rem', height: 22,
              }}
            />

            {/* Difficulty */}
            <Chip
              label={question.difficulty ?? '—'}
              size="small"
              sx={{
                bgcolor: `${DIFFICULTY_COLOR[question.difficulty ?? 'Intermediate'] ?? '#58A6FF'}18`,
                color: DIFFICULTY_COLOR[question.difficulty ?? 'Intermediate'] ?? '#58A6FF',
                fontWeight: 600, fontSize: '0.7rem', height: 22,
                border: `1px solid ${DIFFICULTY_COLOR[question.difficulty ?? 'Intermediate'] ?? '#58A6FF'}33`,
              }}
            />

            {/* Points */}
            <Chip
              label={`${question.points} pts`}
              size="small"
              sx={{ bgcolor: 'action.hover', fontSize: '0.7rem', height: 22 }}
            />
          </Box>

          {/* Complete toggle */}
          <Tooltip title={isCompleted ? 'Mark incomplete' : 'Mark as done'}>
            <Box
              onClick={() => onToggleComplete(question.id)}
              sx={{ cursor: 'pointer', color: isCompleted ? '#3FB950' : 'text.disabled', flexShrink: 0 }}
            >
              {isCompleted
                ? <CheckCircleIcon sx={{ fontSize: 22 }} />
                : <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />}
            </Box>
          </Tooltip>
        </Box>

        {/* Title */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          {question.title}
        </Typography>

        {/* Question text */}
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {question.question}
        </Typography>

        {/* Code template for coding questions */}
        {question.type === 'coding' && question.codeTemplate && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5} display="block">
              Starter code:
            </Typography>
            <CodeBlock
              section={{
                type: 'code',
                title: 'Starter code',
                language: 'java',
                filename: 'Starter.java',
                code: question.codeTemplate,
                level: 'basic',
              }}
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Action buttons */}
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', bgcolor: 'action.hover' }}>
        {/* Progressive hint reveal */}
        {question.hints.length > 0 && (
          <Button
            size="small"
            startIcon={<LightbulbOutlinedIcon fontSize="small" />}
            onClick={handleRevealNextHint}
            disabled={revealedHints >= question.hints.length}
            sx={{ fontSize: '0.75rem', textTransform: 'none' }}
          >
            {revealedHints === 0
              ? 'Show Hint'
              : revealedHints >= question.hints.length
              ? `All ${question.hints.length} hints shown`
              : `Next Hint (${revealedHints}/${question.hints.length})`}
          </Button>
        )}

        {/* Show/hide solution */}
        <Button
          size="small"
          startIcon={showSolution ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
          onClick={() => setShowSolution((v) => !v)}
          color={showSolution ? 'error' : 'primary'}
          sx={{ fontSize: '0.75rem', textTransform: 'none' }}
        >
          {showSolution ? 'Hide Solution' : 'Reveal Solution'}
        </Button>
      </Box>

      {/* Hints (progressive) */}
      <Collapse in={showHints && revealedHints > 0}>
        <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={700} color="warning.main" display="block" mb={1}>
            💡 Hints
          </Typography>
          {question.hints.slice(0, revealedHints).map((hint, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', gap: 1, mb: 0.75,
                p: 1.5, borderRadius: 1.5,
                bgcolor: 'rgba(210,153,34,0.08)',
                border: '1px solid rgba(210,153,34,0.2)',
              }}
            >
              <Typography variant="caption" color="warning.main" fontWeight={700} sx={{ flexShrink: 0 }}>
                {i + 1}.
              </Typography>
              <Typography variant="caption" color="text.secondary">{hint}</Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Solution */}
      <Collapse in={showSolution}>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
            <Typography variant="caption" fontWeight={700} color="success.main" display="block" mb={1.5}>
              ✅ Solution
            </Typography>
          </Box>

          {/* Coding solution with code block */}
          {question.type === 'coding' ? (
            <Box sx={{ px: 2.5, pb: 2 }}>
              <CodeBlock
                section={{
                  type: 'code',
                  title: 'Solution',
                  language: 'java',
                  filename: 'Solution.java',
                  code: question.solution,
                  level: 'intermediate',
                  output: question.expectedOutput,
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{ px: 2.5, pb: 2 }}
              dangerouslySetInnerHTML={{ __html: solutionHtml }}
              className="markdown-body"
            />
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ─── Main AssignmentBlock ─────────────────────────────────────────────────────

interface Props {
  section: AssignmentSection;
  dayNumber: number;
}

const AssignmentBlock: React.FC<Props> = ({ section, dayNumber }) => {
  const { progress, markAssignmentQuestion, unmarkAssignmentQuestion } = useAppStore();
  const completedIds =
    progress.assignmentsCompleted?.[String(dayNumber)] ?? [];

  const earnedPoints = section.questions
    .filter((q) => completedIds.includes(q.id))
    .reduce((sum, q) => sum + q.points, 0);

  const pct = section.totalPoints > 0 ? (earnedPoints / section.totalPoints) * 100 : 0;

  const byType = {
    conceptual: section.questions.filter((q) => q.type === 'conceptual'),
    scenario:   section.questions.filter((q) => q.type === 'scenario'),
    coding:     section.questions.filter((q) => q.type === 'coding'),
  };

  const handleToggle = (id: string) => {
    if (completedIds.includes(id)) {
      unmarkAssignmentQuestion(dayNumber, id);
    } else {
      markAssignmentQuestion(dayNumber, id);
    }
  };

  return (
    <Box>
      {/* Score card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5, mb: 3, borderRadius: 2.5,
          border: '1px solid', borderColor: 'divider',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmojiEventsOutlinedIcon sx={{ color: '#D29922' }} />
            <Typography variant="subtitle1" fontWeight={700}>{section.title}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1 }}>
              {earnedPoints}
              <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                /{section.totalPoints} pts
              </Typography>
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8, borderRadius: 4, bgcolor: 'action.hover', mb: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: pct === 100
                ? 'linear-gradient(90deg, #3FB950, #2da044)'
                : 'linear-gradient(90deg, #667eea, #764ba2)',
            },
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {completedIds.length}/{section.questions.length} questions done
          </Typography>
          <Stack direction="row" spacing={1}>
            {Object.entries(byType).map(([type, qs]) => {
              const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
              const done = qs.filter((q) => completedIds.includes(q.id)).length;
              return (
                <Chip
                  key={type}
                  label={`${cfg.label}: ${done}/${qs.length}`}
                  size="small"
                  sx={{
                    fontSize: '0.65rem', height: 20,
                    bgcolor: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {section.description && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
            {section.description}
          </Typography>
        )}
      </Paper>

      {/* Questions grouped by type */}
      {(['conceptual', 'scenario', 'coding'] as const).map((type) => {
        const qs = byType[type];
        if (qs.length === 0) return null;
        const cfg = TYPE_CONFIG[type];
        return (
          <Box key={type} mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <cfg.Icon sx={{ fontSize: 18, color: cfg.color }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: cfg.color }}>
                {cfg.label} Questions
              </Typography>
              <Chip
                label={`${qs.filter((q) => completedIds.includes(q.id)).length}/${qs.length}`}
                size="small"
                sx={{ fontSize: '0.65rem', height: 18, bgcolor: cfg.bg, color: cfg.color }}
              />
            </Box>
            <Stack spacing={2}>
              {qs.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={section.questions.indexOf(q)}
                  dayNumber={dayNumber}
                  isCompleted={completedIds.includes(q.id)}
                  onToggleComplete={handleToggle}
                />
              ))}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
};

export default AssignmentBlock;
