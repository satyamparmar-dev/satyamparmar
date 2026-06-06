import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { useAuthStore } from '../auth/useAuthStore';
import { usePaymentStore } from '../store/usePaymentStore';
import {
  BUNDLE_PRICE,
  BUNDLE_SAVINGS,
  COURSE_CATALOG,
  LIST_SUM,
  type CourseDefinition,
} from '../config/courses';
import AccessEnquiryNotice from '../components/AccessEnquiryNotice';
import { useAccessibleCourseIds } from '../hooks/useCourseAccess';
import { usePageTitle } from '../hooks/usePageTitle';

const LIST_TOTAL = LIST_SUM;

const Pricing: React.FC = () => {
  usePageTitle('Courses & Pricing');
  const theme = useTheme();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessibleCourseIds = useAccessibleCourseIds();
  const [paymentHydrated, setPaymentHydrated] = useState(() => usePaymentStore.persist.hasHydrated());
  const enquiryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (usePaymentStore.persist.hasHydrated()) {
      setPaymentHydrated(true);
      return;
    }
    return usePaymentStore.persist.onFinishHydration(() => setPaymentHydrated(true));
  }, []);

  const availableCourses = useMemo(
    () => COURSE_CATALOG.filter((c) => c.isAvailable),
    []
  );

  const allOwned = useMemo(() => {
    if (!isAuthenticated) return false;
    return availableCourses.every((c) => accessibleCourseIds.includes(c.id));
  }, [accessibleCourseIds, availableCourses, isAuthenticated]);

  const scrollToEnquiry = () => {
    enquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    scrollToEnquiry();
  };

  const renderCourseAction = (course: CourseDefinition) => {
    const isOwned = isAuthenticated && accessibleCourseIds.includes(course.id);

    if (!course.isAvailable) {
      return (
        <Button variant="contained" disabled fullWidth sx={{ fontWeight: 700 }}>
          Coming Soon
        </Button>
      );
    }

    if (isOwned) {
      return (
        <Button
          variant="outlined"
          color="success"
          fullWidth
          onClick={() => navigate(course.route)}
          sx={{ fontWeight: 700, py: 1.25, borderColor: '#10b981', color: '#10b981' }}
        >
          Access Course
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        fullWidth
        startIcon={<ContactMailIcon />}
        onClick={handleEnroll}
        sx={{
          fontWeight: 800,
          py: 1.25,
          background: course.gradient,
          color: '#fff',
          '&:hover': { opacity: 0.95 },
        }}
      >
        Contact to Enroll — ₹{course.price.toLocaleString('en-IN')}
      </Button>
    );
  };

  if (!paymentHydrated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Box className="fade-in" sx={{ pb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
        Choose Your Learning Path
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        One-time payment. Lifetime access. Contact us by phone, WhatsApp, or email to complete enrollment.
      </Typography>

      <Grid container spacing={2}>
        {COURSE_CATALOG.map((course) => (
          <Grid item xs={12} sm={6} key={course.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: course.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  mb: 1.5,
                }}
              >
                {course.icon}
              </Box>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                {course.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                {course.tagline}
              </Typography>

              <Box sx={{ flex: 1, mb: 1.5 }}>
                {course.features.map((f) => (
                  <Box key={f} display="flex" alignItems="flex-start" gap={0.75} mb={0.75}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', mt: 0.15, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary">
                      {f}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box display="flex" flexWrap="wrap" gap={0.75} mb={1.5}>
                <Chip label={course.difficulty} size="small" variant="outlined" />
                <Chip label={`${course.lessons} lessons`} size="small" variant="outlined" />
                <Chip label={`${course.hours}h`} size="small" variant="outlined" />
              </Box>

              <Typography variant="h5" fontWeight={900} sx={{ color: course.color, mb: 2 }}>
                ₹{course.price.toLocaleString('en-IN')}
              </Typography>

              {renderCourseAction(course)}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #4338ca 100%)',
            borderRadius: 2,
            p: 3,
            color: '#fff',
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                All Courses Bundle
              </Typography>
              <Chip
                label={`Save ₹${BUNDLE_SAVINGS.toLocaleString('en-IN')}`}
                sx={{
                  bgcolor: '#fbbf24',
                  color: '#1c1917',
                  fontWeight: 800,
                  mb: 1,
                }}
              />
              <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                <Typography variant="h4" fontWeight={900}>
                  ₹{BUNDLE_PRICE.toLocaleString('en-IN')}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'rgba(255,255,255,0.65)',
                    fontWeight: 600,
                  }}
                >
                  ₹{LIST_TOTAL.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box mt={2}>
            {COURSE_CATALOG.filter((c) => c.isAvailable).map((c) => (
              <Box key={c.id} display="flex" alignItems="center" gap={1} mb={0.75}>
                <CheckCircleIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.95)' }} />
                <Typography variant="body2" fontWeight={600}>
                  {c.name}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box mt={3}>
            {allOwned ? (
              <Typography variant="h6" fontWeight={700}>
                You have access to all available courses
              </Typography>
            ) : (
              <Button
                variant="contained"
                startIcon={<ContactMailIcon />}
                onClick={handleEnroll}
                sx={{
                  bgcolor: '#fff',
                  color: theme.palette.mode === 'dark' ? '#1e1b4b' : '#312e81',
                  fontWeight: 900,
                  py: 1.5,
                  px: 3,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                Contact for Bundle — ₹{BUNDLE_PRICE.toLocaleString('en-IN')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper
        ref={enquiryRef}
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Enroll via contact
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
          {isAuthenticated
            ? 'Share your registered email when you reach us on telephone, WhatsApp, or email so we can activate your course access after payment.'
            : 'Create an account first, then contact us by telephone, WhatsApp, or email with your registered email to complete enrollment.'}
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            onClick={() => navigate('/login', { state: { from: '/pricing' } })}
            sx={{
              mb: 2.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Sign in / Register
          </Button>
        )}
        <AccessEnquiryNotice embedded={false} />
      </Paper>
    </Box>
  );
};

export default Pricing;
