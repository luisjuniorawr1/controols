import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import HomeClient from '@/src/components/HomeClient';
import { isLocale } from '@/src/i18n';
import { locales } from '@/src/data/catalog';

export function generateStaticParams(){ return locales.map(locale=>({locale})); }

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Header locale={locale}/><main><HomeClient locale={locale}/></main><footer><div className="brand"><span>CONTR</span><b>OO</b><span>LS</span></div><p>400 tools · Browser first · Open web</p></footer></>;
}
