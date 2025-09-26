import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://remotebalkan.example';
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/saveti`, lastModified: new Date() },
    { url: `${base}/resursi`, lastModified: new Date() },
    { url: `${base}/alati`, lastModified: new Date() },
    { url: `${base}/kompanije`, lastModified: new Date() },
    { url: `${base}/poreski-vodic`, lastModified: new Date() },
  ];
}
