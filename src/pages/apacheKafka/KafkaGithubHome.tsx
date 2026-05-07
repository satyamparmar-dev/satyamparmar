import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KAFKA_CURRICULUM, kafkaKindLabel } from '../../content/apacheKafka/curriculum';

const basePaperSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 3,
};

const KafkaGithubHome: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const accent = theme.palette.mode === 'dark' ? '#7dd3fc' : '#0369a1';
  const accentSoft = alpha(accent, theme.palette.mode === 'dark' ? 0.16 : 0.12);

  return (
    <Box className="fade-in">
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          p: { xs: 2.25, sm: 3 },
          ...basePaperSx,
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
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Apache Kafka
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Curriculum from Satyverse-Satyam-Parmar/Apache-Kafka (main). Each step is one repository file; content is shown
          verbatim.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ ...basePaperSx, overflow: 'hidden', maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {KAFKA_CURRICULUM.length} steps
          </Typography>
        </Box>
        <List disablePadding>
          {KAFKA_CURRICULUM.map((row) => (
            <ListItemButton
              key={`${row.step}-${row.repoPath}`}
              onClick={() => navigate(`/kafka-repo/topic/${row.step}`)}
              sx={{
                alignItems: 'flex-start',
                py: 1.5,
                px: 2,
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: 28 }}>
                      {row.step}.
                    </Typography>
                    <Typography component="span" variant="body1" fontWeight={700}>
                      {row.displayName}
                    </Typography>
                    <Chip
                      size="small"
                      label={kafkaKindLabel(row.kind)}
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.65rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {row.repoPath}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default KafkaGithubHome;
