import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuthStore } from '../auth/useAuthStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { getCourseDef } from '../config/courses';
import { useHasCourseAccess } from '../hooks/useCourseAccess';
import SignInToContinueCallout from './SignInToContinueCallout';
import AccessEnquiryNotice from './AccessEnquiryNotice';
import LoadingSpinner from './LoadingSpinner';

export interface CourseAccessGuardProps {
  courseId: string;
  children?: React.ReactNode;
}

const CourseAccessGuard: React.FC<CourseAccessGuardProps> = ({ courseId, children }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasAccess = useHasCourseAccess(courseId);
  const course = getCourseDef(courseId);
  const [paymentHydrated, setPaymentHydrated] = useState(() => usePaymentStore.persist.hasHydrated());

  useEffect(() => {
    if (usePaymentStore.persist.hasHydrated()) {
      setPaymentHydrated(true);
      return;
    }
    return usePaymentStore.persist.onFinishHydration(() => setPaymentHydrated(true));
  }, []);

  if (!paymentHydrated) {
    return <LoadingSpinner message="Checking course access…" />;
  }

  if (!isAuthenticated) {
    return (
      <Box py={2}>
        <SignInToContinueCallout message="Sign in or create an account to access premium courses like Apache Kafka and Java." />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box py={2} maxWidth={640} mx="auto">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
            <LockOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" component="h1" fontWeight={800}>
              {course?.name ?? 'Premium course'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 2 }}>
            This course is available to enrolled learners only. After you register, contact us to
            complete payment and we will activate your access.
          </Typography>
          <AccessEnquiryNotice embedded={false} />
          <Button
            variant="outlined"
            onClick={() => navigate('/pricing')}
            sx={{ mt: 2.5, fontWeight: 700, borderRadius: 2 }}
          >
            View course pricing
          </Button>
        </Paper>
      </Box>
    );
  }

  return children != null ? <>{children}</> : <Outlet />;
};

export default CourseAccessGuard;
