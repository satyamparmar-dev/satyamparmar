import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);} 
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
