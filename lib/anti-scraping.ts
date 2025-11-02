/**
 * Anti-Scraping Backend Utilities
 * 
 * 100% Free, Open-Source Anti-Scraping Protection
 * 
 * Features:
 * - Rate limiting
 * - Bot detection
 * - Honeypot traps
 * - Request fingerprinting
 * 
 * License: MIT (Free forever)
 */

import { NextRequest, NextResponse } from 'next/server';

export interface BotDetectionConfig {
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  enableHoneypot?: boolean;
  enableFingerprinting?: boolean;
}

export interface RequestFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  accept: string;
  connection: string;
  referer?: string;
  ip: string;
}

/**
 * Bot detection - Check if request looks like a bot
 */
export function detectBot(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';

  // Known bot User-Agents
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
    /insomnia/i,
    /httpie/i,
    /go-http-client/i,
    /java/i,
    /okhttp/i,
    /axios/i,
    /fetch/i,
    /node-fetch/i,
    /puppeteer/i,
    /selenium/i,
    /playwright/i,
    /phantomjs/i,
    /headless/i,
  ];

  // Check User-Agent
  const isBotUA = botPatterns.some(pattern => pattern.test(userAgent));

  // Check for missing browser headers
  const hasBrowserHeaders = 
    req.headers.has('accept') &&
    req.headers.has('accept-language') &&
    req.headers.has('accept-encoding');

  // Check for suspicious patterns
  const suspiciousPatterns = [
    !hasBrowserHeaders, // Missing typical browser headers
    userAgent.length < 10, // Too short
    !userAgent.includes('Mozilla'), // Not a browser
    !req.headers.has('sec-fetch-site') && !req.headers.has('origin'), // Missing modern browser headers
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern === true);

  return isBotUA || isSuspicious;
}

/**
 * Create request fingerprint
 */
export function createFingerprint(req: NextRequest): RequestFingerprint {
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';

  return {
    userAgent: req.headers.get('user-agent') || '',
    acceptLanguage: req.headers.get('accept-language') || '',
    acceptEncoding: req.headers.get('accept-encoding') || '',
    accept: req.headers.get('accept') || '',
    connection: req.headers.get('connection') || '',
    referer: req.headers.get('referer') || undefined,
    ip,
  };
}

/**
 * Honeypot trap check
 * Checks for bots filling hidden form fields
 */
export function checkHoneypot(req: NextRequest): boolean {
  // For Next.js, check in request body or query params
  // This should be called from API route or server component
  return false; // Implement based on your form structure
}

/**
 * Log security events
 */
export function logSecurityEvent(
  req: NextRequest,
  eventType: string,
  metadata?: Record<string, any>
): void {
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const log = {
    timestamp: new Date().toISOString(),
    event: eventType,
    ip,
    userAgent: req.headers.get('user-agent'),
    url: req.nextUrl.pathname,
    method: req.method,
    ...metadata,
  };

  // Log to console (in production, send to logging service)
  console.warn('[SECURITY]', log);

  // Optionally save to file or database
  // fs.appendFileSync('security.log', JSON.stringify(log) + '\n');
}

/**
 * Rate limiting configuration
 * For Next.js middleware - use in middleware.ts
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
};

/**
 * Strict rate limiting for blog endpoints
 */
export const strictRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Lower limit for blog posts
  message: 'Rate limit exceeded for this resource',
};

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'X-Robots-Tag': 'noindex, noarchive, nosnippet, nofollow',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

