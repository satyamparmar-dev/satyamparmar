import { Metadata } from 'next';
import AboutPageClient from '@/components/AboutPageClient';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Backend Engineering Blog - our mission to share knowledge about backend development, AI integration, and tech innovations.',
};

export default function AboutPage() {
  return <AboutPageClient />;
}