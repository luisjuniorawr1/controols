import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import CollectionArt from '@/src/components/CollectionArt';
import { collections, getCollection } from '@/src/data/collections';
import { categories, locales, tools } from '@/src/data/extendedCatalog';
import { isLocale } from '@/src/i18n';
import { toolTitle } from '@/src/toolLocale';

const base='https://controols.com';
const labels={
  en:{back:'Collections',tools:'tools',search:'Choose a tool',privacy:'Processed in your browser whenever possible'},
  pt:{back:'Coleções',tools:'ferramentas',search:'Escolha uma ferramenta',privacy:'Processado no seu navegador sempre que possível'},
  es:{back:'Colecciones',tools:'herramientas',search:'Elige una herramienta',privacy:'Procesado en tu navegador siempre que sea posible'},
  zh:{back:'合集',tools:'工具',search:'选择一个工具',privacy:'尽可能在浏览器中处理'},
  hi:{back:'कलेक्शन',tools:'टूल',search:'एक टूल चुनें',privacy:'जहाँ संभव हो, आपके ब्राउज़र में प्रोसेस किया जाता है'}
} as const;

export function generateStaticParams(){return locales.flatMap(locale=>collections.map(collection=>({locale,collection:collection.id})));}
export async function generateMetadata({params}:{params:Promise<{locale:string;collection:string}>}):Promise<Metadata>{
  const {locale,collection}=await params;if(!isLocale(locale))return{};const item=getCollection(collection);if(!item)return{};const url=`${base}/${locale}/collection/${collection}/`;return{title:`${item.labels[locale]} | Controols`,description:item.descriptions[locale],alternates:{canonical:url,languages:Object.fromEntries(locales.map(l=>[l,`${base}/${l}/collection/${collection}/`]))}};
}

export default async function CollectionPage({params}:{params:Promise<{locale:string;collection:string}>}){
  const {locale,collection}=await params;if(!isLocale(locale))notFound();const item=getCollection(collection);if(!item)notFound();const l=labels[locale];const items=tools.filter(tool=>item.categories.includes(tool.category));
  return <><Header locale={locale}/><main className="collection-page">
    <div className="collection-page-hero">
      <div className="collection-page-copy"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span><Link href={`/${locale}/#collections`}>{l.back}</Link><span>/</span><span>{item.labels[locale]}</span></div><span className="collection-page-kicker">{item.eyebrow[locale]}</span><h1>{item.labels[locale]}</h1><p>{item.descriptions[locale]}</p><div className="collection-page-meta"><b>{items.length} {l.tools}</b><span>{l.privacy}</span></div></div>
      <div className="collection-page-art"><CollectionArt id={item.id}/></div>
    </div>
    <section className="collection-tools"><header><h2>{l.search}</h2><span>{items.length}</span></header><div className="collection-tool-grid">{items.map(tool=>{const cat=categories.find(c=>c.id===tool.category);return <Link href={`/${locale}/tools/${tool.slug}/`} className="collection-tool-card" key={tool.slug}><span>{cat?.labels[locale]}</span><strong>{toolTitle(tool,locale)}</strong><i>↗</i></Link>})}</div></section>
  </main></>;
}
