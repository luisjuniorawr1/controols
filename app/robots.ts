import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/tools/',
        '/*/category/',
        '/*/collection/',
        '/*/blog/',
      ],
    },
    sitemap: 'https://controols.com/sitemap.xml',
    host: 'https://controols.com',
  };
}
