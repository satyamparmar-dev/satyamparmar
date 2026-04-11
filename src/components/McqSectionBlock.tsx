import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import type { McqSection } from '../types';
import { parseMarkdown } from '../utils/markdown';
import SignInToContinueCallout from './SignInToContinueCallout';

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

/** First non-empty line of the stem, before fenced code — for compact accordion titles. */
function questionPreview(raw: string, maxLen = 140): string {
  const noFence = raw.replace(/```[\s\S]*?```/g, ' ').trim();
  const line = noFence.split(/\n+/).find((l) => l.trim().length > 0) ?? '';
  const t = line.replace(/`+/g, '').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

type Props = {
  section: McqSection;
  hasFullAccess: boolean;
};

const McqSectionBlock: React.FC<Props> = ({ section, hasFullAccess }) => {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const ids = useMemo(
    () => (section.questions ?? []).map((q) => q.id),
    [section.questions]
  );
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const onPick = useCallback(
    (questionId: number, letter: string) => {
      if (!hasFullAccess) return;
      setPicked((prev) => ({ ...prev, [questionId]: letter }));
    },
    [hasFullAccess]
  );

  const expandAll = useCallback(() => {
    const next: Record<number, boolean> = {};
    ids.forEach((id) => {
      next[id] = true;
    });
    setExpanded(next);
  }, [ids]);

  const collapseAll = useCallback(() => setExpanded({}), []);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>
        {section.title}
      </Typography>
      {section.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7, maxWidth: 720 }}>
          {section.description}
        </Typography>
      )}

      {!hasFullAccess && (
        <SignInToContinueCallout
          sx={{ mb: 3 }}
          message="MCQ answers, scoring, and explanations are available after you sign in with an authorized email."
        />
      )}

      {ids.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UnfoldMoreIcon />}
            onClick={expandAll}
          >
            Expand all
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UnfoldLessIcon />}
            onClick={collapseAll}
          >
            Collapse all
          </Button>
        </Stack>
      )}

      <Stack spacing={0}>
        {(section.questions ?? []).map((q) => {
          const choice = picked[q.id];
          const correct = q.answer;
          const showResult = hasFullAccess && choice !== undefined;
          const isOpen = expanded[q.id] ?? false;

          return (
            <Accordion
              key={q.id}
              expanded={isOpen}
              onChange={(_, next) => setExpanded((prev) => ({ ...prev, [q.id]: next }))}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  minHeight: 56,
                  '& .MuiAccordionSummary-content': { my: 1, alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' },
                }}
              >
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mt: 0.35 }}>
                  Q{q.id}
                </Typography>
                <Chip label={q.level} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                <Chip label={q.category} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                <Typography fontWeight={600} variant="body2" sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  {questionPreview(q.question)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                <Box
                  className="md-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(q.question) }}
                  sx={{ mb: 2, lineHeight: 1.75, '& pre': { fontSize: '0.8rem' } }}
                />

                <FormControl component="fieldset" fullWidth disabled={!hasFullAccess}>
                  <RadioGroup
                    value={choice ?? ''}
                    onChange={(e) => onPick(q.id, e.target.value)}
                  >
                    {OPTION_KEYS.map((key) => (
                      <FormControlLabel
                        key={key}
                        value={key}
                        control={<Radio size="small" />}
                        label={
                          <Typography variant="body2" component="span">
                            <strong>{key}.</strong> {q.options[key]}
                          </Typography>
                        }
                        sx={{ alignItems: 'flex-start', ml: 0, mr: 0, mb: 0.25 }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                {showResult && (
                  <Alert
                    severity={choice === correct ? 'success' : 'error'}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      {choice === correct ? 'Correct' : `Correct answer: ${correct}`}
                    </Typography>
                    <Box
                      className="md-content"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(q.explanation) }}
                      sx={{ '& p': { mb: 0.75 }, '& p:last-child': { mb: 0 } }}
                    />
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
};

export default McqSectionBlock;
