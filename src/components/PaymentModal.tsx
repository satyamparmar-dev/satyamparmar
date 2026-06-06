import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { CourseDefinition } from '../config/courses';
import { BUNDLE_PRICE, COURSE_CATALOG } from '../config/courses';
import { useAuthStore } from '../auth/useAuthStore';
import { usePaymentStore } from '../store/usePaymentStore';

type Step = 'form' | 'processing' | 'success';

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  course: CourseDefinition | null;
  isBundle: boolean;
  onSuccess: (result: string | 'bundle') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  course,
  isBundle,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>('form');
  const [displayOrderId, setDisplayOrderId] = useState<string>('');

  const price = isBundle ? BUNDLE_PRICE : course?.price ?? 0;
  const titleName = isBundle ? 'All 4 Courses Bundle' : course?.name ?? '';

  useEffect(() => {
    if (!open) {
      setStep('form');
      setDisplayOrderId('');
    }
  }, [open]);

  const handlePay = () => {
    setStep('processing');
    window.setTimeout(() => {
      const userId = useAuthStore.getState().currentUser?.userId;
      if (!userId) {
        setStep('form');
        return;
      }
      if (isBundle) {
        usePaymentStore.getState().purchaseBundle(userId);
        const purchases = usePaymentStore.getState().purchasesByUser[userId];
        const first = COURSE_CATALOG[0]?.id;
        const oid = first ? purchases?.[first]?.orderId : undefined;
        setDisplayOrderId(oid ?? '');
      } else if (course) {
        usePaymentStore.getState().purchaseCourse(userId, course.id, course.price);
        const oid = usePaymentStore.getState().purchasesByUser[userId]?.[course.id]?.orderId;
        setDisplayOrderId(oid ?? '');
      }
      setStep('success');
    }, 2500);
  };

  const handleStartLearning = () => {
    if (isBundle) onSuccess('bundle');
    else if (course) onSuccess(course.id);
    onClose();
  };

  const payLabel = `Pay ₹${price.toLocaleString('en-IN')}`;

  return (
    <Dialog open={open} onClose={step === 'processing' ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Purchase</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          This is a demo payment. No real transaction occurs. Card fields are not saved or validated.
        </Typography>

        {step === 'form' && (
          <>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {titleName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total: <strong>₹{price.toLocaleString('en-IN')}</strong>
            </Typography>

            <Box component="form" sx={{ mt: 2 }} noValidate autoComplete="off">
              <TextField
                fullWidth
                margin="dense"
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                variant="outlined"
              />
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  margin="dense"
                  label="Expiry"
                  placeholder="MM/YY"
                  variant="outlined"
                  sx={{ maxWidth: 120 }}
                />
                <TextField
                  margin="dense"
                  label="CVV"
                  placeholder="***"
                  type="password"
                  variant="outlined"
                  sx={{ maxWidth: 80 }}
                />
              </Box>
              <TextField fullWidth margin="dense" label="Name on Card" variant="outlined" />
            </Box>
          </>
        )}

        {step === 'processing' && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4} gap={2}>
            <CircularProgress />
            <Typography variant="caption" color="text.secondary">
              Processing payment…
            </Typography>
          </Box>
        )}

        {step === 'success' && (
          <Box display="flex" flexDirection="column" alignItems="center" py={2} gap={1.5}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981' }} />
            <Typography variant="h6" fontWeight={700}>
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order ID: {displayOrderId || '—'}
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              You now have lifetime access to {isBundle ? 'all courses in the bundle' : titleName}.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        {step === 'form' && (
          <Button
            variant="contained"
            fullWidth
            onClick={handlePay}
            sx={{
              py: 1.25,
              fontWeight: 800,
              ...(isBundle
                ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                  }
                : course
                  ? {
                      background: course.gradient,
                      color: '#fff',
                      '&:hover': { opacity: 0.95 },
                    }
                  : {}),
            }}
          >
            {payLabel}
          </Button>
        )}
        {step === 'success' && (
          <Button variant="contained" fullWidth onClick={handleStartLearning} sx={{ fontWeight: 700 }}>
            Start Learning
          </Button>
        )}
        {step !== 'processing' && (
          <Button onClick={onClose} color="inherit" fullWidth>
            {step === 'success' ? 'Close' : 'Cancel'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
