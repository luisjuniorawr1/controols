import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import { categories, getCategory, getToolsByCategory, locales } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import { copy, isLocale } from '@/src/i18n';
import { isToolLive } from '@/src/lib/live';
import { toolTitle } from '@/src/toolPresentation';
import Link from 'next/link';

const base='https://controols.com';
export function generateStaticParams(){ return locales.flatMap(locale=>categories.map(category=>({locale,category:category.id}))); }
export async function generateMetadata({params}:{params:Promise<{locale:string;category:string}>}):Promise<Metadata>{const {locale,category}=await params;if(!isLocale(locale))return{};const cat=getCategory(category);if(!cat)return{};const url=`${base}/${locale}/category/${category}/`;return{title:`${cat.labels[locale]} | Controols`,description:`${getToolsByCategory(category).length} ${cat.labels[locale]} tools on Controols.`,alternates:{canonical:url,languages:Object.fromEntries(locales.map(l=>[l,`${base}/${l}/category/${category}/`]))}};}

export default async function CategoryPage({ params }: { params: Promise<{ locale:string; category:string }> }){
  const {locale,category}=await params; if(!isLocale(locale))notFound(); const cat=getCategory(category); if(!cat)notFound(); const items=getToolsByCategory(category); const t=copy[locale];
  const parent=collections.find(collection=>collection.categories.includes(cat.id));
  return <><Header locale={locale}/><main className="inner"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span>{parent&&<><Link href={`/${locale}/collection/${parent.id}/`}>{parent.labels[locale]}</Link><span>/</span></>}<span>{cat.labels[locale]}</span></div><section className="category-hero"><div className="category-icon large">{cat.icon}</div><div><p className="eyebrow">{items.length} {t.tools}</p><h1>{cat.labels[locale]}</h1><p>{t.browserNote}</p></div></section><div className="tool-grid">{items.map(tool=>{const live=isToolLive(tool);return <Link href={`/${locale}/tools/${tool.slug}/`} className="tool-card" key={tool.slug}><span className={`status-dot ${live?'live':''}`}/><div><strong>{toolTitle(tool,locale)}</strong><small>{live?t.ready:t.building}</small></div><span className="arrow">↗</span></Link>})}</div></main></>;
}
