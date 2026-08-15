import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import ToolRunner from '@/src/components/ToolRunner';
import { getCategory, getTool, locales, tools } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import { copy, isLocale } from '@/src/i18n';
import { toolDescription, toolTitle } from '@/src/toolPresentation';
import { toolSeoContent } from '@/src/seoContent';

const base='https://controols.com';
export function generateStaticParams(){ return locales.flatMap(locale=>tools.map(tool=>({locale,slug:tool.slug}))); }

export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}):Promise<Metadata>{
  const {locale,slug}=await params;
  if(!isLocale(locale))return{};
  const tool=getTool(slug);if(!tool)return{};
  const title=toolTitle(tool,locale),description=toolDescription(tool,locale),url=`${base}/${locale}/tools/${slug}/`;
  return {
    title,
    description,
    alternates:{canonical:url,languages:{...Object.fromEntries(locales.map(l=>[l,`${base}/${l}/tools/${slug}/`])),'x-default':`${base}/en/tools/${slug}/`}},
    openGraph:{title:`${title} | Controols`,description,url,siteName:'Controols',type:'website'},
    twitter:{card:'summary',title:`${title} | Controols`,description}
  };
}

export default async function ToolPage({params}:{params:Promise<{locale:string;slug:string}>}){
  const {locale,slug}=await params;if(!isLocale(locale))notFound();
  const tool=getTool(slug);if(!tool)notFound();
  const cat=getCategory(tool.category)!;
  const parent=collections.find(collection=>collection.categories.includes(cat.id));
  const t=copy[locale];
  const related=tools.filter(x=>x.category===tool.category&&x.slug!==slug).slice(0,6);
  const title=toolTitle(tool,locale),description=toolDescription(tool,locale);
  const seo=toolSeoContent(tool,title,locale);
  const pageUrl=`${base}/${locale}/tools/${slug}/`;
  const applicationSchema={
    '@context':'https://schema.org','@type':'WebApplication',name:title,description,url:pageUrl,
    applicationCategory:String(cat.labels[locale]),operatingSystem:'Any',browserRequirements:'Requires a modern web browser',
    offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},isAccessibleForFree:true
  };
  const breadcrumbItems=[
    {'@type':'ListItem',position:1,name:'Controols',item:`${base}/${locale}/`},
    ...(parent?[{'@type':'ListItem',position:2,name:parent.labels[locale],item:`${base}/${locale}/collection/${parent.id}/`}]:[]),
    {'@type':'ListItem',position:parent?3:2,name:cat.labels[locale],item:`${base}/${locale}/category/${cat.id}/`},
    {'@type':'ListItem',position:parent?4:3,name:title,item:pageUrl}
  ];
  const breadcrumbSchema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:breadcrumbItems};
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:seo.faqs.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))};

  return <><Header locale={locale}/><main className="inner tool-page"><div className="breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span>{parent&&<><Link href={`/${locale}/collection/${parent.id}/`}>{parent.labels[locale]}</Link><span>/</span></>}<Link href={`/${locale}/category/${cat.id}/`}>{cat.labels[locale]}</Link><span>/</span><span>{title}</span></div><section className="tool-hero simple-tool-hero"><h1>{title}</h1><p className="tool-description">{description}</p><p className="tool-browser-note">{t.browserNote}</p></section><ToolRunner tool={tool} locale={locale}/>

  <section className="seo-guide" aria-labelledby="tool-guide-heading">
    <div className="seo-guide-main">
      <section><h2 id="tool-guide-heading">{seo.howToHeading}</h2><p>{seo.howToIntro}</p><ol className="seo-steps">{seo.steps.map((step,index)=><li key={step.title}><span>{index+1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section>
      <section><h2>{seo.usesHeading}</h2><ul className="seo-use-list">{seo.useCases.map(item=><li key={item}>{item}</li>)}</ul></section>
      <section><h2>{seo.privacyHeading}</h2><p>{seo.privacyText}</p></section>
      <section className="seo-faq"><h2>{seo.faqHeading}</h2>{seo.faqs.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
    </div>
  </section>

  <section className="section compact"><div className="section-title"><h2>{cat.labels[locale]}</h2><Link href={`/${locale}/category/${cat.id}/`}>{t.allTools} →</Link></div><div className="related-grid">{related.map(x=><Link href={`/${locale}/tools/${x.slug}/`} key={x.slug}>{toolTitle(x,locale)}<span>↗</span></Link>)}</div></section></main>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(applicationSchema).replace(/</g,'\\u003c')}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema).replace(/</g,'\\u003c')}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema).replace(/</g,'\\u003c')}}/>
  </>;
}
