import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import HomeClient from '@/src/components/HomeClient';
import { copy, isLocale } from '@/src/i18n';
import { locales } from '@/src/data/catalog';

const base='https://controols.com';
export function generateStaticParams(){ return locales.map(locale=>({locale})); }
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale))return{};const url=`${base}/${locale}/`;return{title:'Controols',description:copy[locale].subtitle,alternates:{canonical:url,languages:Object.fromEntries(locales.map(l=>[l,`${base}/${l}/`]))},openGraph:{title:`Controols — ${copy[locale].tagline}`,description:copy[locale].subtitle,url,siteName:'Controols',type:'website'}};}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Header locale={locale}/><main><HomeClient locale={locale}/></main><footer><div className="brand"><span>CONTR</span><b>OO</b><span>LS</span></div><p>400 tools · Browser first · Open web</p></footer></>;
}
