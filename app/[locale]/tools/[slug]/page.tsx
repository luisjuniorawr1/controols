import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import ToolRunner from '@/src/components/ToolRunner';
import { getCategory, getTool, locales, tools } from '@/src/data/catalog';
import { copy, isLocale } from '@/src/i18n';

export function generateStaticParams(){ return locales.flatMap(locale=>tools.map(tool=>({locale,slug:tool.slug}))); }

export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}):Promise<Metadata>{const {slug}=await params;const tool=getTool(slug);return {title:tool?.title||'Tool',description:`${tool?.title||'Online tool'} — free, fast and browser-first on Controols.`};}

export default async function ToolPage({params}:{params:Promise<{locale:string;slug:string}>}){
  const {locale,slug}=await params;if(!isLocale(locale))notFound();const tool=getTool(slug);if(!tool)notFound();const cat=getCategory(tool.category)!;const t=copy[locale];const related=tools.filter(x=>x.category===tool.category&&x.slug!==slug).slice(0,6);
  return <><Header locale={locale}/><main className="inner"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span><Link href={`/${locale}/category/${cat.id}/`}>{cat.labels[locale]}</Link><span>/</span><span>{tool.title}</span></div><section className="tool-hero"><div><div className="eyebrow"><span className={`status-dot ${tool.live?'live':''}`}/>{tool.live?t.ready:t.building}</div><h1>{tool.title}</h1><p>{t.browserNote}</p></div><div className="tool-category-badge"><span>{cat.icon}</span>{cat.labels[locale]}</div></section><ToolRunner tool={tool} locale={locale}/><section className="section compact"><div className="section-title"><h2>{cat.labels[locale]}</h2><Link href={`/${locale}/category/${cat.id}/`}>View all →</Link></div><div className="related-grid">{related.map(x=><Link href={`/${locale}/tools/${x.slug}/`} key={x.slug}>{x.title}<span>↗</span></Link>)}</div></section></main></>;
}
