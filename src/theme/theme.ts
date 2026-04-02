import { createTheme, PaletteMode } from '@mui/material';

// ─── Level & Track Colors ──────────────────────────────────
export const levelColors = {
  Beginner: '#3FB950',
  Intermediate: '#58A6FF',
  Advanced: '#D29922',
  Expert: '#F85149',
} as const;

export const trackColors = {
  Fresher: '#1D9E75',
  'Mid-Level': '#378ADD',
  Senior: '#764ba2',
  Staff: '#F85149',
} as const;

export const phaseColors = [
  '#3FB950', // Phase 1 - green
  '#3FB950', // Phase 2 - green
  '#58A6FF', // Phase 3 - blue
  '#58A6FF', // Phase 4 - blue
  '#764ba2', // Phase 5 - purple
  '#764ba2', // Phase 6 - purple
  '#D29922', // Phase 7 - amber
  '#D29922', // Phase 8 - amber
  '#F85149', // Phase 9 - red
  '#F85149', // Phase 10 - red
];

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fresher: 'linear-gradient(135deg, #1D9E75 0%, #3FB950 100%)',
  midLevel: 'linear-gradient(135deg, #378ADD 0%, #58A6FF 100%)',
  senior: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  dark: 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
  success: 'linear-gradient(135deg, #3FB950 0%, #2EA043 100%)',
  warning: 'linear-gradient(135deg, #D29922 0%, #BB8009 100%)',
  danger: 'linear-gradient(135deg, #F85149 0%, #DA3633 100%)',
};

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#667eea',
        dark: '#4a5fd4',
        light: '#8fa4f3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#764ba2',
        dark: '#5a3880',
        light: '#9a72c4',
        contrastText: '#ffffff',
      },
      background:
        mode === 'dark'
          ? {
              default: '#0D1117',
              paper: '#161B22',
            }
          : {
              default: '#F6F8FA',
              paper: '#FFFFFF',
            },
      text:
        mode === 'dark'
          ? {
              primary: '#E6EDF3',
              secondary: '#8B949E',
              disabled: '#484F58',
            }
          : {
              primary: '#1F2328',
              secondary: '#57606A',
              disabled: '#8C959F',
            },
      divider: mode === 'dark' ? '#30363D' : '#D0D7DE',
      success: { main: '#3FB950', dark: '#2EA043' },
      warning: { main: '#D29922', dark: '#BB8009' },
      error: { main: '#F85149', dark: '#DA3633' },
      info: { main: '#58A6FF', dark: '#1F6FEB' },
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
      h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.35 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.7 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5 },
      overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: '#30363D transparent',
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: '#30363D',
            borderRadius: 3,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${mode === 'dark' ? '#30363D' : '#D0D7DE'}`,
            boxShadow: mode === 'dark'
              ? '0 1px 3px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 4px 16px rgba(0,0,0,0.5)'
                : '0 4px 16px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(102,126,234,0.4)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6 },
          bar: { borderRadius: 4 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            borderRadius: 6,
            backgroundColor: mode === 'dark' ? '#30363D' : '#1F2328',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? '#30363D' : '#D0D7DE'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
            borderRight: `1px solid ${mode === 'dark' ? '#30363D' : '#D0D7DE'}`,
          },
        },
      },
    },
  });

export default createAppTheme;
