import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import TermCardTemplate from './TermCardTemplate';
import { GLOSSARY_DOMAINS, type GlossaryDomain, glossaryShellTerms } from '../../content/llm/glossary-shell';
import { aiGlossaryContent } from '../../content/llm/glossary-ai-content';
import { mlGlossaryContent } from '../../content/llm/glossary-ml-content';
import { deepLearningGlossaryContent } from '../../content/llm/glossary-deep-learning-content';

const ConceptsGlossarySection: React.FC = () => {
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';
  const [opened, setOpened] = useState(false);
  const [domain, setDomain] = useState<GlossaryDomain>('All Terms');
  const [query, setQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const populatedContentByDomain = useMemo(
    () => ({
      AI: aiGlossaryContent,
      ML: mlGlossaryContent,
      'Deep Learning': deepLearningGlossaryContent,
    }),
    []
  );

  const filteredTerms = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return glossaryShellTerms.filter((item) => {
      const domainMatches = domain === 'All Terms' ? true : item.domain === domain;
      const searchMatches = lowered.length === 0 ? true : item.term.toLowerCase().includes(lowered);
      return domainMatches && searchMatches;
    });
  }, [domain, query]);

  const openLabel = opened ? 'Hide Concepts & Glossary' : 'Open Concepts & Glossary';

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: opened ? '1px solid' : 'none', borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.015em' }}>
          Concepts & Glossary — Every Term Explained
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.8, lineHeight: 1.7, maxWidth: 840, fontSize: '0.92rem' }}>
          Browse terms by domain, search as you type, and expand any card to view the full 5-part learning template.
        </Typography>
        <Button
          onClick={() => setOpened((prev) => !prev)}
          variant="outlined"
          sx={{
            mt: 1.5,
            borderColor: alpha(accent, 0.35),
            color: accent,
            fontWeight: 600,
            '&:hover': { borderColor: alpha(accent, 0.65), background: alpha(accent, 0.06) },
          }}
        >
          {openLabel}
        </Button>
      </Box>

      {opened && (
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Tabs
            value={domain}
            onChange={(_, value: GlossaryDomain) => setDomain(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              px: 0.5,
              mb: 1.5,
              '& .MuiTab-root': { minHeight: 40, minWidth: 'auto', fontSize: '0.8rem', fontWeight: 600 },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
            }}
          >
            {GLOSSARY_DOMAINS.map((item) => (
              <Tab key={item} value={item} label={item} />
            ))}
          </Tabs>

          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms in real time..."
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: '0.86rem' }}>
            Showing {filteredTerms.length} terms
          </Typography>

          <Grid container spacing={1.5}>
            {filteredTerms.map((item) => (
              <Grid key={`${item.domain}-${item.term}`} xs={12} md={6}>
                {/* Phase 4 batches: Only approved domains are populated with real content. */}
                {(() => {
                  const domainContent = populatedContentByDomain[item.domain as keyof typeof populatedContentByDomain];
                  const termContent = domainContent?.[item.term];
                  const cardData = termContent
                    ? {
                        term: item.term,
                        domain: item.domain,
                        oneLineSummary: termContent.oneLineSummary,
                        simpleExplanation: termContent.simpleExplanation,
                        codeBlock: termContent.codeBlock,
                        codeIntro: termContent.codeIntro,
                        codeOutro: termContent.codeOutro,
                        practiceNote: termContent.practiceNote,
                        realLifeParagraph: termContent.realLifeParagraph,
                        learnMoreLinks: termContent.learnMoreLinks,
                      }
                    : {
                        term: item.term,
                        domain: item.domain,
                        oneLineSummary: 'Summary content will be added in its domain batch.',
                        simpleExplanation: 'Simple explanation content will be added in its domain batch.',
                        practiceNote: 'How this works in practice will be added in its domain batch.',
                        realLifeParagraph: 'Real-life examples will be added in its domain batch.',
                        learnMoreLinks: [
                          { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
                          { label: 'OpenAI Docs Introduction', url: 'https://platform.openai.com/docs/introduction' },
                        ],
                      };

                  return (
                <Box
                  onClick={() => setExpandedTerm((prev) => (prev === item.term ? null : item.term))}
                  sx={{ cursor: 'pointer', '&:focus-within': { outline: 'none' } }}
                >
                  <TermCardTemplate expanded={expandedTerm === item.term} data={cardData} />
                </Box>
                  );
                })()}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ConceptsGlossarySection;
