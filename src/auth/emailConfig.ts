// ─── EmailJS Configuration ────────────────────────────────────────────────────
//
// HOW TO SET UP (one-time, 5 minutes):
//
// 1. Go to https://www.emailjs.com and create a FREE account
//    (free tier = 200 emails/month, no credit card needed)
//
// 2. Dashboard → "Email Services" → "Add New Service"
//    Choose Gmail / Outlook / Yahoo — sign in and authorise EmailJS to send via your account
//    Copy the SERVICE_ID shown (e.g. "service_abc12345")
//
// 3. Dashboard → "Email Templates" → "Create New Template"
//    Paste the template below, then click "Save":
//
//    Subject: Your Satyverse(Satyam Parmar) verification code
//
//    Hi {{to_name}},
//
//    Your one-time verification code is:
//
//    ┌──────────────────────┐
//    │   {{otp_code}}       │
//    └──────────────────────┘
//
//    This code expires in 10 minutes.
//    If you did not request this, please ignore this email.
//
//    — Satyverse(Satyam Parmar) Team
//
//    Copy the TEMPLATE_ID shown (e.g. "template_xyz67890")
//
// 4. Dashboard → "Account" → "General" tab → copy your PUBLIC_KEY (e.g. "aBcDeFgHiJ")
//
// 5. Replace the three placeholder values below and save this file.
//    Then run: npm run build
//
// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_CONFIG = {
  SERVICE_ID:  'service_vjhuzcl',
  TEMPLATE_ID: 'template_z2ob1pk',
  PUBLIC_KEY:  'lBPWgaAEO1HzS0uoj',
} as const;

// Returns true once you've filled in real values
export function isEmailConfigured(): boolean {
  return (
    !EMAIL_CONFIG.SERVICE_ID.startsWith('YOUR_') &&
    !EMAIL_CONFIG.TEMPLATE_ID.startsWith('YOUR_') &&
    !EMAIL_CONFIG.PUBLIC_KEY.startsWith('YOUR_')
  );
}
