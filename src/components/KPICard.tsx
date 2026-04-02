import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { KPI } from '../types';

interface Props {
  kpi: KPI;
  onClick?: () => void;
}

const KPICard: React.FC<Props> = ({ kpi, onClick }) => {
  const TrendIcon =
    kpi.trend === 'up'
      ? TrendingUpIcon
      : kpi.trend === 'down'
      ? TrendingDownIcon
      : TrendingFlatIcon;

  const trendColor =
    kpi.trend === 'up'
      ? '#3FB950'
      : kpi.trend === 'down'
      ? '#F85149'
      : '#8B949E';

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: kpi.color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
          <Typography variant="overline" color="text.secondary" lineHeight={1}>
            {kpi.label}
          </Typography>
          <Box
            sx={{
              fontSize: '1.5rem',
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            {kpi.icon}
          </Box>
        </Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ color: kpi.color, lineHeight: 1.1, mb: 1 }}
        >
          {kpi.value}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
          <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
            {kpi.change > 0 ? '+' : ''}
            {kpi.change}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs last week
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
