import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';

interface CompanyCard {
  id: string;
  name: string;
  role: string;
  division: string;
  experience: string;
  color: string;
  tags: string[];
  path: string;
}

const COMPANIES: CompanyCard[] = [
  {
    id: 'morgan-stanley',
    name: 'Morgan Stanley',
    role: 'Senior Java Full Stack Architect / Director',
    division: 'Enterprise Technology — Workforce Technology & Services',
    experience: '12+ years',
    color: '#003087',
    tags: ['Java', 'Microservices', 'Kafka', 'K8s', 'Spring Boot', 'GenAI'],
    path: '/companies/morgan-stanley',
  },
];

const CompaniesHome: React.FC = () => {
  usePageTitle('Company Guides');
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
          <BusinessIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={800}>
            Company Preparation
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" maxWidth={600}>
          Structured, role-specific preparation roadmaps for top-tier companies. Each guide
          covers skill taxonomy, phased roadmap, deep-dive topics, system design, interview
          Q&amp;A, behavioral prep, code challenges, and cheat sheets.
        </Typography>
      </Box>

      {/* Company Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {COMPANIES.map((company) => (
          <Card
            key={company.id}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: company.color,
                boxShadow: `0 4px 20px ${company.color}22`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate(company.path)}
              sx={{ p: 0, borderRadius: 3 }}
            >
              {/* Top accent bar */}
              <Box
                sx={{
                  height: 6,
                  background: company.color,
                  borderRadius: '12px 12px 0 0',
                }}
              />
              <CardContent sx={{ p: 3 }}>
                {/* Logo + Name */}
                <Stack direction="row" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: company.color,
                      fontSize: '1rem',
                      fontWeight: 900,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {company.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                      {company.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {company.experience} experience
                    </Typography>
                  </Box>
                </Stack>

                {/* Role */}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  mb={0.5}
                >
                  {company.role}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  {company.division}
                </Typography>

                {/* Tags */}
                <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2.5}>
                  {company.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: `${company.color}12`,
                        color: company.color,
                        fontWeight: 600,
                        borderRadius: '4px',
                      }}
                    />
                  ))}
                </Stack>

                {/* CTA */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.disabled">
                    9-part preparation guide
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: company.color }}
                    >
                      Start Prep
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: company.color }} />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

        {/* Coming soon placeholder */}
        <Card
          elevation={0}
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 220,
            bgcolor: 'action.hover',
          }}
        >
          <Box textAlign="center" p={3}>
            <BusinessIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled" fontWeight={600}>
              More Companies Coming Soon
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Goldman Sachs · Google · Amazon · JPMorgan
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default CompaniesHome;
