import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
  fullPage?: boolean;
  size?: number;
}

const LoadingSpinner: React.FC<Props> = ({
  message = 'Loading...',
  fullPage = false,
  size = 48,
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={4}
    >
      <CircularProgress
        size={size}
        thickness={3}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
