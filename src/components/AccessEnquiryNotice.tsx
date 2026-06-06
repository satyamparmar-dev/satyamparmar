import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const ACCESS_ENQUIRY_PHONE = '08618905855';
export const ACCESS_ENQUIRY_PHONE_DISPLAY = '08618905855';
/** E.164 without + for wa.me links (India). */
export const ACCESS_ENQUIRY_WHATSAPP = '918618905855';
export const ACCESS_ENQUIRY_EMAIL = 'Satyverse008@gmail.com';

interface Props {
  /** When true (default), top divider separates this block inside a card. When false, use below a full card (e.g. legacy login page). */
  embedded?: boolean;
}

/**
 * Formal notice for users who need to request access to the course.
 */
const AccessEnquiryNotice: React.FC<Props> = ({ embedded = true }) => {
  return (
    <Box
      sx={{
        mt: embedded ? 2.5 : 2,
        pt: embedded ? 2.5 : 0,
        borderTop: embedded ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.65, mb: 1.75 }}
      >
        Access to this course and its learning materials is restricted to authorised
        participants. If you require access or wish to enquire about enrolment, please
        contact us by telephone, WhatsApp, or email using the details below.
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        component="div"
        sx={{ lineHeight: 1.7 }}
      >
        <Box component="span" sx={{ display: 'block', fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
          Telephone
        </Box>
        <Link href={`tel:${ACCESS_ENQUIRY_PHONE}`} underline="hover" color="primary">
          {ACCESS_ENQUIRY_PHONE_DISPLAY}
        </Link>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontWeight: 600,
            color: 'text.primary',
            mt: 1.25,
            mb: 0.25,
          }}
        >
          WhatsApp
        </Box>
        <Link
          href={`https://wa.me/${ACCESS_ENQUIRY_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
        >
          {ACCESS_ENQUIRY_PHONE_DISPLAY}
        </Link>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontWeight: 600,
            color: 'text.primary',
            mt: 1.25,
            mb: 0.25,
          }}
        >
          Email
        </Box>
        <Link href={`mailto:${ACCESS_ENQUIRY_EMAIL}`} underline="hover" color="primary">
          {ACCESS_ENQUIRY_EMAIL}
        </Link>
      </Typography>
    </Box>
  );
};

export default AccessEnquiryNotice;
