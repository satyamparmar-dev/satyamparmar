import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip, Button, alpha, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { parseMarkdown } from '../utils/markdown';
import { getBlogMarkdown, getBlogPostMeta } from '../content/blog/registry';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.14 : 0.1);

  const meta = slug ? getBlogPostMeta(slug) : undefined;
  const raw = slug ? getBlogMarkdown(slug) : undefined;

  const html = useMemo(() => (raw ? parseMarkdown(raw) : ''), [raw]);

  if (!slug || !meta || !raw) {
    return (
      <Box className="fade-in" sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Post not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          This topic is missing or the link is outdated.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/blog')} variant="outlined">
          Back to topics
        </Button>
      </Box>
    );
  }

  const chipLabel = meta.tag ? `Blog · ${meta.tag}` : 'Blog';

  return (
    <Box className="fade-in">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        All topics
      </Button>

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
          label={chipLabel}
          sx={{
            fontWeight: 600,
            mb: 1.5,
            bgcolor: accentSoft,
            color: accent,
            border: 'none',
          }}
        />
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          {meta.title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.75, fontSize: '0.95rem' }}>
          {meta.description}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Box
          className="md-content"
          dangerouslySetInnerHTML={{ __html: html }}
          sx={{
            lineHeight: 1.8,
            fontSize: '0.95rem',
            '& h1': { fontSize: '1.35rem', mt: 0, mb: 2 },
            '& h2': { fontSize: '1.12rem', mt: 2.75, mb: 1.25 },
            '& h3': { fontSize: '1.02rem', mt: 2, mb: 0.75 },
            '& table': {
              fontSize: '0.82rem',
              display: 'block',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            },
            '& th, & td': { py: 0.75, px: 1 },
            '& code': { fontSize: '0.82em' },
            '& pre': { borderRadius: 1, fontSize: '0.8rem' },
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

export default BlogPost;
