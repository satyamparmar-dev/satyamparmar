import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tabs,
  Tab,
  alpha,
  useTheme,
} from '@mui/material';
import { buildLlmTabSections, llmOverviewFullMarkdown } from '../content/llm/bundle';
import plainLanguageScript from '../content/llm/plain-language-script.md?raw';
import { parseMarkdown } from '../utils/markdown';

const baseMdSx = {
  lineHeight: 1.8,
  fontSize: '0.95rem',
  '& h1': { fontSize: '1.35rem', mt: 0, mb: 2 },
  '& h2': { fontSize: '1.12rem', mt: 2.75, mb: 1.25 },
  '& h3': { fontSize: '1.02rem', mt: 2, mb: 0.75 },
  '& table': {
    fontSize: '0.82rem',
    display: 'block',
    overflowX: 'auto',
    whiteSpace: 'nowrap' as const,
  },
  '& th, & td': { py: 0.75, px: 1 },
  '& code': { fontSize: '0.82em' },
  '& pre': { borderRadius: 1, fontSize: '0.8rem' },
};

const LlmOverview: React.FC = () => {
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.14 : 0.1);

  const sections = useMemo(
    () => [
      ...buildLlmTabSections(),
      { id: 'plain', label: 'Plain-language script', markdown: plainLanguageScript },
    ],
    []
  );

  const [tabIndex, setTabIndex] = useState(0);
  const fullOverviewHtml = useMemo(() => parseMarkdown(llmOverviewFullMarkdown), []);

  const sectionHtml = useMemo(() => {
    return sections.map((s) => parseMarkdown(s.markdown));
  }, [sections]);

  const isFullTab = tabIndex === sections.length;
  const activeHtml = isFullTab ? fullOverviewHtml : sectionHtml[tabIndex] ?? '';

  return (
    <Box className="fade-in">
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          p: { xs: 2.25, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha('#667eea', 0.12)} 0%, ${alpha('#764ba2', 0.08)} 50%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha('#667eea', 0.08)} 0%, ${alpha('#764ba2', 0.05)} 45%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Chip
          size="small"
          label="LLM & GenAI"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            bgcolor: accentSoft,
            color: accent,
            border: 'none',
          }}
        />
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Overview for interviews
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.75, fontSize: '0.95rem' }}>
          Concepts, RAG, prompting, and talking points—aligned with how Java engineers ship GenAI features.
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: { xs: 0.5, sm: 1 },
            '& .MuiTab-root': { minWidth: 'auto', fontSize: '0.8rem' },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        >
          {sections.map((s, i) => (
            <Tab key={s.id} label={s.label} value={i} />
          ))}
          <Tab label="All sections" value={sections.length} />
        </Tabs>

        <Box
          className="md-content"
          dangerouslySetInnerHTML={{ __html: activeHtml }}
          sx={{
            p: { xs: 2, sm: 3 },
            ...baseMdSx,
            '& blockquote': {
              borderLeft: `3px solid ${accent}`,
              pl: 2,
              my: 2,
              color: 'text.secondary',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default LlmOverview;
