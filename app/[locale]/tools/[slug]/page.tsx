import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import ToolRunner from '@/src/components/ToolRunner';
import { getCategory, getTool, locales, tools } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import { copy, isLocale } from '@/src/i18n';
import { toolTitle } from '@/src/toolLocale';

const base='https://controols.com';
export function generateStaticParams(){ return locales.flatMap(locale=>tools.map(tool=>({locale,slug:tool.slug}))); }

export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}):Promise<Metadata>{const {locale,slug}=await params;if(!isLocale(locale))return{};const tool=getTool(slug);if(!tool)return{};const title=toolTitle(tool,locale),url=`${base}/${locale}/tools/${slug}/`;return {title,description:`${title} — ${copy[locale].subtitle}`,alternates:{canonical:url,languages:Object.fromEntries(locales.map(l=>[l,`${base}/${l}/tools/${slug}/`]))},openGraph:{title:`${title} | Controols`,description:copy[locale].subtitle,url,siteName:'Controols',type:'website'}};}

export default async function ToolPage({params}:{params:Promise<{locale:string;slug:string}>}){
  const {locale,slug}=await params;if(!isLocale(locale))notFound();const tool=getTool(slug);if(!tool)notFound();const cat=getCategory(tool.category)!;const parent=collections.find(collection=>collection.categories.includes(cat.id));const t=copy[locale];const related=tools.filter(x=>x.category===tool.category&&x.slug!==slug).slice(0,6);const title=toolTitle(tool,locale);
  return <><Header locale={locale}/><main className="inner tool-page"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span>{parent&&<><Link href={`/${locale}/collection/${parent.id}/`}>{parent.labels[locale]}</Link><span>/</span></>}<Link href={`/${locale}/category/${cat.id}/`}>{cat.labels[locale]}</Link><span>/</span><span>{title}</span></div><section className="tool-hero simple-tool-hero"><h1>{title}</h1><p>{t.browserNote}</p></section><ToolRunner tool={tool} locale={locale}/><section className="section compact"><div className="section-title"><h2>{cat.labels[locale]}</h2><Link href={`/${locale}/category/${cat.id}/`}>{t.allTools} →</Link></div><div className="related-grid">{related.map(x=><Link href={`/${locale}/tools/${x.slug}/`} key={x.slug}>{toolTitle(x,locale)}<span>↗</span></Link>)}</div></section></main></>;
}