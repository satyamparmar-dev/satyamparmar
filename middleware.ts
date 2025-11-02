/**
 * Next.js Middleware for Anti-Scraping Protection
 * 
 * Implements:
 * - Rate limiting
 * - Bot detection
 * - Security headers
 * 
 * 100% Free - No dependencies
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

function getRateLimitKey(request: NextRequest): string {
  // Use IP address as key
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

function detectBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Known bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scrapy/i,
    /requests/i,
    /python/i,
    /curl/i,
    /wget/i,
    /postman/i,
    /go-http-client/i,
    /java/i,
    /okhttp/i,
    /axios/i,
    /puppeteer/i,
    /selenium/i,
    /playwright/i,
    /phantomjs/i,
    /headless/i,
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  // Check for missing browser headers
  const hasAccept = request.headers.has('accept');
  const hasAcceptLanguage = request.headers.has('accept-language');
  const hasAcceptEncoding = request.headers.has('accept-encoding');
  const hasBrowserHeaders = hasAccept && hasAcceptLanguage && hasAcceptEncoding;

  return isBot || !hasBrowserHeaders;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply protection only to blog pages
  if (pathname.startsWith('/blog') || pathname.startsWith('/category')) {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Bot detection
    if (detectBot(request)) {
      return NextResponse.json(
        { error: 'Access denied. Automated access is not allowed.' },
        { status: 403 }
      );
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Prevent indexing
    response.headers.set('X-Robots-Tag', 'noindex, noarchive, nosnippet, nofollow');
    
    // Prevent iframe embedding
    response.headers.set('X-Frame-Options', 'DENY');
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
    );
    
    // Prevent content type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Referrer policy
    response.headers.set('Referrer-Policy', 'no-referrer');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/blog/:path*',
    '/category/:path*',
  ],
};

