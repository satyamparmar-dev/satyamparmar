import { Metadata } from 'next';
import ContactPageClient from '@/components/ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Backend Engineering Blog. Have questions about backend development, AI integration, or tech innovations? We\'d love to hear from you.',
};

export default function ContactPage() {
  return <ContactPageClient />;
}