import React from 'react'
import { Box, Typography } from '@mui/material'

const PRO_BG = '#0f172a'
const PRO_TEXT = '#f1f5f9'

interface Props {
  children: React.ReactNode
  title?: string
  subtitle?: string
  noPadding?: boolean
}

const ProShell: React.FC<Props> = ({ children, title, subtitle, noPadding }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: PRO_BG, color: PRO_TEXT, width: '100%' }}>
    {title && (
      <Box
        sx={{
          minHeight: 120,
          px: { xs: 2, md: 4 },
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255,255,255,0.92)', maxWidth: 640 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    )}
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: noPadding ? 0 : 3 }}>{children}</Box>
  </Box>
)

export default ProShell
