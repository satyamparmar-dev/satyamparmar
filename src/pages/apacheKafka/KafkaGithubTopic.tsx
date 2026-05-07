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
import { getKafkaStepByParam, kafkaAssetUrl, kafkaKindLabel } from '../../content/apacheKafka/curriculum';
import type { KafkaContentKind } from '../../content/apacheKafka/curriculum';
import { highlightCode } from '../../utils/markdown';

function hljsLanguageForKind(kind: KafkaContentKind): string {
  if (kind === 'java') return 'java';
  if (kind === 'yaml') return 'yaml';
  if (kind === 'xml') return 'xml';
  return 'plaintext';
}

const KafkaGithubTopic: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#7dd3fc' : '#0369a1';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.16 : 0.12);

  const row = useMemo(() => getKafkaStepByParam(step), [step]);

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
    const url = kafkaAssetUrl(row.repoPath);
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

  const codeHtml = useMemo(() => {
    if (!row || raw === null) return '';
    if (row.kind === 'raw') return '';
    return highlightCode(raw, hljsLanguageForKind(row.kind));
  }, [row, raw]);

  if (!row) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/kafka-repo')} sx={{ mb: 2 }}>
          Back to curriculum
        </Button>
        <Typography color="text.secondary">Invalid step.</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/kafka-repo')} sx={{ mb: 2 }}>
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
              ? `linear-gradient(135deg, ${alpha('#0369a1', 0.14)} 0%, ${alpha('#0e7490', 0.1)} 50%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha('#0369a1', 0.08)} 0%, ${alpha('#0e7490', 0.06)} 45%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Chip
          size="small"
          label="Apache Kafka"
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
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          {row.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'JetBrains Mono, monospace' }}>
          {row.repoPath}
        </Typography>
        <Chip size="small" label={kafkaKindLabel(row.kind)} variant="outlined" sx={{ mt: 1.5, height: 24 }} />
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

      {!loading && !loadError && raw !== null && row.kind === 'raw' && (
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
              {row.displayName} (raw)
            </Typography>
          </Box>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              bgcolor: '#0d1117',
              color: '#e6edf3',
              overflow: 'auto',
              maxHeight: 'min(85vh, 1200px)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.82rem',
              lineHeight: 1.65,
            }}
          >
            {raw}
          </Box>
        </Paper>
      )}

      {!loading && !loadError && raw !== null && row.kind !== 'raw' && (
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
              className={`hljs language-${hljsLanguageForKind(row.kind)}`}
              dangerouslySetInnerHTML={{ __html: codeHtml }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default KafkaGithubTopic;
