'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, tools, type Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

export default function HomeClient({ locale }: { locale: Locale }) {
  const [query,setQuery]=useState(''); const t=copy[locale];
  const filtered=useMemo(()=>tools.filter(x=>x.title.toLowerCase().includes(query.toLowerCase())||x.category.includes(query.toLowerCase())),[query]);
  return <>
    <section className="hero"><div className="eyebrow"><span className="dot"/> {t.privateBadge}</div><h1>{t.tagline}</h1><p>{t.subtitle}</p><div className="search-wrap"><span>⌕</span><input value={query} onChange={(e: {target:{value:string}})=>setQuery(e.target.value)} placeholder={t.search}/><kbd>{filtered.length}</kbd></div><p className="privacy-note">{t.browserNote}</p></section>
    <section id="categories" className="section"><div className="section-title"><h2>{t.categories}</h2><span>16</span></div><div className="category-grid">{categories.map(c=><Link href={`/${locale}/category/${c.id}/`} key={c.id} className="category-card"><div className="category-icon">{c.icon}</div><div><strong>{c.labels[locale]}</strong><small>{tools.filter(x=>x.category===c.id).length} {t.tools}</small></div><span>→</span></Link>)}</div></section>
    <section id="all-tools" className="section"><div className="section-title"><h2>{query ? `${t.allTools} · ${filtered.length}` : t.allTools}</h2><span>400</span></div><div className="tool-grid">{filtered.map(tool=><Link href={`/${locale}/tools/${tool.slug}/`} className="tool-card" key={tool.slug}><span className={`status-dot ${tool.live?'live':''}`}/><div><strong>{tool.title}</strong><small>{categories.find(c=>c.id===tool.category)?.labels[locale]}</small></div><span className="arrow">↗</span></Link>)}</div></section>
  </>;
}
