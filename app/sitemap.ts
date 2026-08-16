import type { MetadataRoute } from 'next';
import { locales } from '@/src/data/extendedCatalog';

export const dynamic = 'force-static';

const base = 'https://controols.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const homes = locales.map((locale) => ({
    url: `${base}/${locale}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...homes,
  ];
}
