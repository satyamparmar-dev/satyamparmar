import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getJavaGithubStepByParam,
  javaGithubAssetUrl,
} from '../../content/javaGithub/curriculum';
import { parseMarkdown, highlightCode } from '../../utils/markdown';
import { usePageTitle } from '../../hooks/usePageTitle';

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

const JavaGithubTopic: React.FC = () => {
  usePageTitle('Java Reference');
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.14 : 0.1);

  const row = useMemo(() => getJavaGithubStepByParam(step), [step]);

  const [raw, setRaw] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!row) {
      setRaw(null);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setRaw(null);
    const url = javaGithubAssetUrl(row.repoPath);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (!cancelled) {
          setRaw(text);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setLoadError(e.message || 'Failed to load');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [row]);

  const mdHtml = useMemo(() => {
    if (!row || row.kind !== 'markdown' || raw === null) return '';
    return parseMarkdown(raw);
  }, [row, raw]);

  const javaHtml = useMemo(() => {
    if (!row || row.kind !== 'java' || raw === null) return '';
    return highlightCode(raw, 'java');
  }, [row, raw]);

  if (!row) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/java-repo')} sx={{ mb: 2 }}>
          Back to curriculum
        </Button>
        <Typography color="text.secondary">Invalid step.</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/java-repo')} sx={{ mb: 2 }}>
        Back to curriculum
      </Button>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
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
          label="Java"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            bgcolor: accentSoft,
            color: accent,
            border: 'none',
          }}
        />
        <Typography variant="overline" color="text.secondary" display="block">
          Step {row.step}
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          {row.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'JetBrains Mono, monospace' }}>
          {row.repoPath}
        </Typography>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={36} sx={{ color: accent }} />
        </Box>
      )}

      {loadError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {loadError}
        </Typography>
      )}

      {!loading && !loadError && raw !== null && row.kind === 'markdown' && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Box
            className="md-content"
            dangerouslySetInnerHTML={{ __html: mdHtml }}
            sx={{
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
      )}

      {!loading && !loadError && raw !== null && row.kind === 'java' && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#1c2128',
              px: 2,
              py: 1,
              borderBottom: '1px solid #30363d',
            }}
          >
            <Typography variant="caption" sx={{ color: '#8B949E', fontFamily: 'JetBrains Mono, monospace' }}>
              {row.displayName}
            </Typography>
          </Box>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 0,
              bgcolor: '#0d1117',
              overflow: 'auto',
              maxHeight: 'min(85vh, 1200px)',
              '& .hljs': {
                background: 'transparent !important',
                padding: '1.25em !important',
                fontFamily: 'JetBrains Mono, monospace !important',
                fontSize: '0.85rem !important',
                lineHeight: '1.7 !important',
              },
            }}
          >
            <code
              className="hljs language-java"
              dangerouslySetInnerHTML={{ __html: javaHtml }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default JavaGithubTopic;
