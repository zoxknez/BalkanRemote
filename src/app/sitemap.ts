import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://remotebalkan.example');
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/saveti`, lastModified: new Date() },
    { url: `${base}/resursi`, lastModified: new Date() },
    { url: `${base}/alati`, lastModified: new Date() },
    { url: `${base}/kompanije`, lastModified: new Date() },
    { url: `${base}/poreski-vodic`, lastModified: new Date() },
    { url: `${base}/poslovi`, lastModified: new Date() },
    { url: `${base}/kontakt`, lastModified: new Date() },
    { url: `${base}/tax-guide`, lastModified: new Date() },
  ];
}
