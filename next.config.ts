import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
