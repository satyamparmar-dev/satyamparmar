import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../content/blog/registry';

const BlogIndex: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.14 : 0.1);

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
          label="Topics & blog"
          icon={<ArticleIcon sx={{ fontSize: '1rem !important' }} />}
          sx={{
            fontWeight: 600,
            mb: 1.5,
            bgcolor: accentSoft,
            color: accent,
            border: 'none',
            '& .MuiChip-icon': { color: accent },
          }}
        />
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Extra topics
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.75, fontSize: '0.95rem' }}>
          Short reads and reference posts that sit outside the day-by-day curriculum. Add more anytime by dropping a
          markdown file in the blog folder and registering it in{' '}
          <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
            src/content/blog/registry.ts
          </Typography>
          .
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          maxWidth: 900,
        }}
      >
        {BLOG_POSTS.map((post) => (
          <Card
            key={post.slug}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <CardActionArea onClick={() => navigate(`/blog/${post.slug}`)} sx={{ alignItems: 'stretch', height: '100%' }}>
              <CardContent sx={{ p: 2.25, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {post.tag && (
                  <Chip
                    size="small"
                    label={post.tag}
                    sx={{
                      alignSelf: 'flex-start',
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      bgcolor: accentSoft,
                      color: accent,
                    }}
                  />
                )}
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.65 }}>
                  {post.description}
                </Typography>
                <Typography variant="caption" color="primary" fontWeight={600} sx={{ mt: 1.5 }}>
                  Read →
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default BlogIndex;
