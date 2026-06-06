import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

interface Props {
  title: string;
  description?: string;
}

const ComingSoonPage: React.FC<Props> = ({
  title,
  description = 'We are polishing this content and will launch it soon. Check back later!',
}) => {
  usePageTitle(`${title} — Coming Soon`);
  const navigate = useNavigate();

  return (
    <Box
      className="fade-in"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      textAlign="center"
      px={2}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(99,102,241,0.12)',
          color: '#6366f1',
          mb: 2,
        }}
      >
        <HourglassTopIcon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing="0.12em">
        Coming Soon
      </Typography>
      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom mt={0.5}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={480} mb={3}>
        {description}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ fontWeight: 700, borderRadius: 2 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ComingSoonPage;
