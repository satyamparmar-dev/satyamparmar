import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Link,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

export type GlossarySourceLink = {
  label: string;
  url: string;
};

export type TermCardTemplateData = {
  term: string;
  domain: string;
  oneLineSummary: string;
  simpleExplanation: string;
  codeIntro?: string;
  codeBlock?: string;
  codeOutro?: string;
  practiceNote?: string;
  realLifeParagraph: string;
  learnMoreLinks: GlossarySourceLink[];
};

type TermCardTemplateProps = {
  data: TermCardTemplateData;
  expanded: boolean;
};

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.84rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
};

const TermCardTemplate: React.FC<TermCardTemplateProps> = ({ data, expanded }) => {
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* PART 1 — TERM HEADER */}
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {data.term}
            </Typography>
            <Chip
              size="small"
              label={data.domain}
              sx={{
                fontWeight: 600,
                bgcolor: alpha(accent, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: accent,
              }}
            />
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: '0.92rem', lineHeight: 1.7 }}>
            {data.oneLineSummary}
          </Typography>
        </Stack>

        <Collapse in={expanded}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Divider />

            {/* PART 2 — SIMPLE EXPLANATION */}
            <Box>
              <Typography sx={sectionTitleSx}>Part 2 — Simple explanation</Typography>
              <Typography sx={{ mt: 0.75, lineHeight: 1.75, fontSize: '0.92rem' }}>
                {data.simpleExplanation}
              </Typography>
            </Box>

            <Divider />

            {/* PART 3 — SEE IT IN CODE / HOW IT WORKS IN PRACTICE */}
            <Box>
              <Typography sx={sectionTitleSx}>Part 3 — See it in code</Typography>
              {data.codeBlock ? (
                <Box sx={{ mt: 0.75 }}>
                  <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                    {data.codeIntro ?? 'Here is what the code below is doing:'}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      mb: 1,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.25) : '#f8fafc',
                      border: '1px solid',
                      borderColor: 'divider',
                      overflowX: 'auto',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {data.codeBlock}
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                    {data.codeOutro ?? 'What you just saw:'}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ mt: 0.75, lineHeight: 1.75, fontSize: '0.92rem' }}>
                  {data.practiceNote ?? 'How it works in practice'}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* PART 4 — WHERE YOU SEE THIS IN REAL LIFE */}
            <Box>
              <Typography sx={sectionTitleSx}>Part 4 — Where you see this in real life</Typography>
              <Typography sx={{ mt: 0.75, lineHeight: 1.75, fontSize: '0.92rem' }}>
                {data.realLifeParagraph}
              </Typography>
            </Box>

            <Divider />

            {/* PART 5 — LEARN MORE */}
            <Box>
              <Typography sx={sectionTitleSx}>Part 5 — Learn more</Typography>
              <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                {data.learnMoreLinks.map((link) => (
                  <Link
                    key={`${data.term}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ fontSize: '0.9rem', lineHeight: 1.7 }}
                  >
                    {link.label} - {link.url}
                  </Link>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TermCardTemplate;
