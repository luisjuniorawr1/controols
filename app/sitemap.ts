import type { MetadataRoute } from 'next';
import { categories, locales, tools } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import { blogPath, blogPosts } from '@/src/data/blog';

export const dynamic = 'force-static';

const base='https://controols.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now=new Date('2026-08-15T00:00:00.000Z');
  const homes=locales.map(locale=>({url:`${base}/${locale}/`,lastModified:now,changeFrequency:'weekly' as const,priority:1}));
  const collectionPages=locales.flatMap(locale=>collections.map(collection=>({url:`${base}/${locale}/collection/${collection.id}/`,lastModified:now,changeFrequency:'weekly' as const,priority:.9})));
  const categoryPages=locales.flatMap(locale=>categories.map(category=>({url:`${base}/${locale}/category/${category.id}/`,lastModified:now,changeFrequency:'weekly' as const,priority:.7})));
  const toolPages=locales.flatMap(locale=>tools.map(tool=>({url:`${base}/${locale}/tools/${tool.slug}/`,lastModified:now,changeFrequency:'monthly' as const,priority:.9})));
  const blogHomes=locales.map(locale=>({url:`${base}/${locale}/blog/`,lastModified:now,changeFrequency:'daily' as const,priority:.8}));
  const blogPages=locales.flatMap(locale=>blogPosts.map(post=>({url:`${base}${blogPath(post,locale)}`,lastModified:new Date(`${post.updatedAt}T12:00:00.000Z`),changeFrequency:'monthly' as const,priority:.8})));
  return [{url:base,lastModified:now,changeFrequency:'monthly',priority:.5},...homes,...collectionPages,...categoryPages,...toolPages,...blogHomes,...blogPages];
}
