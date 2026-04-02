import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { Level } from '../types';
import { getLevelColor } from '../utils/formatters';

interface Props extends Omit<ChipProps, 'color'> {
  level: Level;
}

const LevelBadge: React.FC<Props> = ({ level, ...props }) => {
  const color = getLevelColor(level);

  return (
    <Chip
      label={level}
      size="small"
      sx={{
        color,
        bgcolor: `${color}18`,
        borderRadius: '6px',
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        border: `1px solid ${color}30`,
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default LevelBadge;
