import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import CollectionHubClient from '@/src/components/CollectionHubClient';
import { collections, getCollection, type CollectionId } from '@/src/data/collections';
import { locales } from '@/src/data/extendedCatalog';
import { isLocale } from '@/src/i18n';

const base='https://controols.com';

export function generateStaticParams(){return locales.flatMap(locale=>collections.map(collection=>({locale,collection:collection.id})));}

export async function generateMetadata({params}:{params:Promise<{locale:string;collection:string}>}):Promise<Metadata>{
  const {locale,collection}=await params;
  if(!isLocale(locale))return{};
  const item=getCollection(collection);
  if(!item)return{};
  const url=`${base}/${locale}/collection/${collection}/`;
  return{title:item.labels[locale],description:item.descriptions[locale],alternates:{canonical:url,languages:{...Object.fromEntries(locales.map(l=>[l,`${base}/${l}/collection/${collection}/`])),'x-default':`${base}/en/collection/${collection}/`}},openGraph:{title:`${item.labels[locale]} | Controols`,description:item.descriptions[locale],url,siteName:'Controols',type:'website'}};
}

export default async function CollectionPage({params}:{params:Promise<{locale:string;collection:string}>}){
  const {locale,collection}=await params;
  if(!isLocale(locale))notFound();
  const item=getCollection(collection);
  if(!item)notFound();
  return <><Header locale={locale}/><CollectionHubClient locale={locale} collectionId={item.id as CollectionId}/></>;
}
