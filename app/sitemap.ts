import type { MetadataRoute } from 'next';
import { categories, locales, tools } from '@/src/data/catalog';

const base='https://controols.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now=new Date();
  const homes=locales.map(locale=>({url:`${base}/${locale}/`,lastModified:now,changeFrequency:'weekly' as const,priority:1}));
  const categoryPages=locales.flatMap(locale=>categories.map(category=>({url:`${base}/${locale}/category/${category.id}/`,lastModified:now,changeFrequency:'weekly' as const,priority:.8})));
  const toolPages=locales.flatMap(locale=>tools.map(tool=>({url:`${base}/${locale}/tools/${tool.slug}/`,lastModified:now,changeFrequency:'monthly' as const,priority:.9})));
  return [{url:base,lastModified:now,changeFrequency:'monthly',priority:.5},...homes,...categoryPages,...toolPages];
}
