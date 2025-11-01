/**
 * Unit tests for NewsletterSignup component (components/NewsletterSignup.tsx)
 * 
 * Priority: P0 (Critical)
 * Coverage Target: ≥95%
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterSignup from '@/components/NewsletterSignup';
import * as newsletter from '@/lib/newsletter';
import * as analytics from '@/lib/analytics';

// Mock dependencies
jest.mock('@/lib/newsletter', () => ({
  submitNewsletterEmail: jest.fn(),
  GOOGLE_FORMS_ACTION_URL: 'https://forms.google.com/test',
  GOOGLE_FORMS_EMAIL_ENTRY: 'entry.123456789',
}));

jest.mock('@/lib/analytics', () => ({
  trackNewsletterSignup: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  CheckCircle: () => <div data-testid="check-icon">CheckCircle</div>,
  AlertCircle: () => <div data-testid="alert-icon">AlertCircle</div>,
}));

describe('NewsletterSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render email input', () => {
    render(<NewsletterSignup />);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should render submit button', () => {
    render(<NewsletterSignup />);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(newsletter.submitNewsletterEmail).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, message: 'Success' }), 100))
    );

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(newsletter.submitNewsletterEmail).toHaveBeenCalled();
    });
  });

  it('should show success message on success', async () => {
    const user = userEvent.setup();
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: true,
      message: 'Successfully subscribed!',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument();
    });
  });

  it('should show error message on failure', async () => {
    const user = userEvent.setup();
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: false,
      message: 'Something went wrong. Please try again.',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should clear form on success', async () => {
    const user = userEvent.setup();
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: true,
      message: 'Successfully subscribed!',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');

    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
    });
  });

  it('should call submitNewsletterEmail with correct parameters', async () => {
    const user = userEvent.setup();
    const submitMock = jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: true,
      message: 'Success',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith('test@example.com', 'auto');
    });
  });

  it('should track analytics on success', async () => {
    const user = userEvent.setup();
    const trackMock = jest.spyOn(analytics, 'trackNewsletterSignup');
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: true,
      message: 'Success',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockRejectedValue(
      new Error('Network error')
    );

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should handle Google Forms not configured', async () => {
    const user = userEvent.setup();
    // Mock Google Forms not configured
    jest.spyOn(newsletter, 'submitNewsletterEmail').mockResolvedValue({
      ok: false,
      message: 'Google Forms is not configured.',
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/not configured/i)).toBeInTheDocument();
    });
  });

  it('should prevent form submission without email', async () => {
    render(<NewsletterSignup />);

    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    fireEvent.click(submitButton);

    // Should not call API without email
    expect(newsletter.submitNewsletterEmail).not.toHaveBeenCalled();
  });
});

