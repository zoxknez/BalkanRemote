import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'ncr.com' },
      { protocol: 'https', hostname: 'clutch.co' },
      { protocol: 'https', hostname: 'linkedin.com' },
      { protocol: 'https', hostname: 'gitlab.com' },
      { protocol: 'https', hostname: 'figma.com' },
      { protocol: 'https', hostname: 'zapier.com' },
      { protocol: 'https', hostname: 'toptal.com' },
      { protocol: 'https', hostname: 'buffer.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: "/tax-guide", destination: "/poreski-vodic", permanent: true },
      { source: "/salary-calculator", destination: "/poreski-vodic", permanent: true },
      { source: "/smart-match", destination: "/resursi", permanent: false },
  // removed advanced-calculator
      { source: "/toolbox", destination: "/alati", permanent: false },
    ];
  },
};

export default nextConfig;
