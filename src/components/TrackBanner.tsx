import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Track } from '../types';
import { getTrackColor } from '../utils/formatters';
import { gradients } from '../theme/theme';

interface Props {
  track: Track;
  dayRange?: string;
  compact?: boolean;
}

const trackDescriptions: Record<Track, string> = {
  Fresher: 'Java Foundations & Core APIs',
  'Mid-Level': 'Spring, REST APIs & Microservices',
  Senior: 'Advanced Architecture & System Design',
  Staff: 'Staff-Level Expertise',
};

const trackGradients: Record<Track, string> = {
  Fresher: gradients.fresher,
  'Mid-Level': gradients.midLevel,
  Senior: gradients.senior,
  Staff: gradients.danger,
};

const TrackBanner: React.FC<Props> = ({ track, dayRange, compact = false }) => {
  const color = getTrackColor(track);
  const gradient = trackGradients[track];

  if (compact) {
    return (
      <Chip
        label={track}
        size="small"
        sx={{
          background: `${color}18`,
          color,
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 22,
          border: `1px solid ${color}30`,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        background: gradient,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff',
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.85, color: '#fff', display: 'block' }}>
          Learning Track
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
          {track}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85, color: '#fff' }}>
          {trackDescriptions[track]}
        </Typography>
      </Box>
      {dayRange && (
        <Box textAlign="right">
          <Typography variant="overline" sx={{ opacity: 0.85, color: '#fff', display: 'block' }}>
            Days
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
            {dayRange}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TrackBanner;
