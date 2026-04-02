import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LockIcon from '@mui/icons-material/Lock';

type Status = 'completed' | 'current' | 'available' | 'locked';

interface Props extends Omit<ChipProps, 'color'> {
  status: Status;
  showLabel?: boolean;
}

const configs: Record<Status, { label: string; color: string; bg: string; icon: React.ReactElement }> = {
  completed: {
    label: 'Completed',
    color: '#3FB950',
    bg: 'rgba(63,185,80,0.12)',
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  },
  current: {
    label: 'Current',
    color: '#667eea',
    bg: 'rgba(102,126,234,0.12)',
    icon: <PlayCircleIcon sx={{ fontSize: 14 }} />,
  },
  available: {
    label: 'Available',
    color: '#8B949E',
    bg: 'rgba(139,148,158,0.1)',
    icon: <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />,
  },
  locked: {
    label: 'Locked',
    color: '#484F58',
    bg: 'rgba(72,79,88,0.1)',
    icon: <LockIcon sx={{ fontSize: 14 }} />,
  },
};

const StatusBadge: React.FC<Props> = ({ status, showLabel = true, ...props }) => {
  const cfg = configs[status];

  return (
    <Chip
      size="small"
      icon={cfg.icon}
      label={showLabel ? cfg.label : undefined}
      sx={{
        color: cfg.color,
        bgcolor: cfg.bg,
        borderRadius: '6px',
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        '& .MuiChip-icon': { color: cfg.color },
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
