import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Satyverse',
    template: '%s | Satyverse',
  },
  description: 'A modern technical blog focused on backend engineering, AI, tech innovations, and the startup world. Built for developers, by developers.',
  keywords: ['backend engineering', 'AI', 'tech innovations', 'startup', 'software development', 'architecture', 'devops'],
  authors: [{ name: 'Pass Gen' }],
  creator: 'Pass Gen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://satyamparmar.blog',
    title: 'Satyverse',
    description: 'A modern technical blog focused on backend engineering, AI, tech innovations, and the startup world.',
    siteName: 'Satyverse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satyverse',
    description: 'A modern technical blog focused on backend engineering, AI, tech innovations, and the startup world.',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script id="ga-consent-defaults" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  analytics_storage: 'granted',
                  functionality_storage: 'granted',
                  personalization_storage: 'denied',
                  security_storage: 'granted'
                });
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
                if (dnt) {
                  gtag('consent', 'update', { analytics_storage: 'denied' });
                }
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID ? <Analytics /> : null}
        {process.env.NEXT_PUBLIC_GA_ID ? <ConsentBanner /> : null}
      </body>
    </html>
  );
}
