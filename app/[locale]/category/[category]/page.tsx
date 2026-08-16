import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import { categories, getCategory, getToolsByCategory, locales } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import { copy, isLocale } from '@/src/i18n';
import { isToolLive } from '@/src/lib/live';
import { toolTitle } from '@/src/toolPresentation';
import { categorySeoContent } from '@/src/seoContent';
import Link from 'next/link';

const base='https://controols.com';
export function generateStaticParams(){ return locales.flatMap(locale=>categories.map(category=>({locale,category:category.id}))); }
export async function generateMetadata({params}:{params:Promise<{locale:string;category:string}>}):Promise<Metadata>{
  const {locale,category}=await params;if(!isLocale(locale))return{};
  const cat=getCategory(category);if(!cat)return{};
  const items=getToolsByCategory(category);const seo=categorySeoContent(cat.labels[locale],items.length,locale);const url=`${base}/${locale}/category/${category}/`;
  return{title:seo.heading,description:seo.meta,alternates:{canonical:url,languages:{...Object.fromEntries(locales.map(l=>[l,`${base}/${l}/category/${category}/`])),'x-default':`${base}/en/category/${category}/`}},openGraph:{title:`${seo.heading} | Controols`,description:seo.meta,url,siteName:'Controols',type:'website'}};
}

export default async function CategoryPage({ params }: { params: Promise<{ locale:string; category:string }> }){
  const {locale,category}=await params; if(!isLocale(locale))notFound(); const cat=getCategory(category); if(!cat)notFound(); const items=getToolsByCategory(category); const t=copy[locale];
  const parent=collections.find(collection=>collection.categories.includes(cat.id));
  const seo=categorySeoContent(cat.labels[locale],items.length,locale);
  const featured=items.slice(0,Math.min(12,items.length));
  const pageUrl=`${base}/${locale}/category/${category}/`;
  const breadcrumbSchema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Controols',item:`${base}/${locale}/`},
    ...(parent?[{'@type':'ListItem',position:2,name:parent.labels[locale],item:`${base}/${locale}/collection/${parent.id}/`}]:[]),
    {'@type':'ListItem',position:parent?3:2,name:cat.labels[locale],item:pageUrl}
  ]};
  const itemListSchema={'@context':'https://schema.org','@type':'ItemList',name:seo.heading,itemListElement:featured.map((tool,index)=>({'@type':'ListItem',position:index+1,name:toolTitle(tool,locale),url:`${base}/${locale}/tools/${tool.slug}/`}))};
  return <><Header locale={locale}/><main className="inner"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span>{parent&&<><Link href={`/${locale}/collection/${parent.id}/`}>{parent.labels[locale]}</Link><span>/</span></>}<span>{cat.labels[locale]}</span></div><section className="category-hero"><div className="category-icon large">{cat.icon}</div><div><p className="eyebrow">{items.length} {t.tools}</p><h1>{seo.heading}</h1><p>{seo.intro}</p></div></section>
  <section className="category-seo-intro"><p>{seo.second}</p><h2>{seo.popular}</h2><div className="category-popular-links">{featured.map(tool=><Link href={`/${locale}/tools/${tool.slug}/`} key={tool.slug}>{toolTitle(tool,locale)}<span>→</span></Link>)}</div></section>
  <div className="tool-grid">{items.map(tool=>{const live=isToolLive(tool);return <Link href={`/${locale}/tools/${tool.slug}/`} className="tool-card" key={tool.slug}><span className={`status-dot ${live?'live':''}`}/><div><strong>{toolTitle(tool,locale)}</strong><small>{live?t.ready:t.building}</small></div><span className="arrow">↗</span></Link>})}</div></main>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema).replace(/</g,'\\u003c')}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemListSchema).replace(/</g,'\\u003c')}}/>
  </>;
}
