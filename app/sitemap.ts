import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const base = 'https://controols.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pt/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ];
}
