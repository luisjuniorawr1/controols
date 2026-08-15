'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/src/data/catalog';
import { collections } from '@/src/data/collections';

const labels:Record<Locale,{home:string;collections:string;blog:string;language:string;menu:string;close:string;choose:string}>={
  en:{home:'Home',collections:'Categories',blog:'Blog',language:'Language',menu:'Menu',close:'Close menu',choose:'Choose a category'},
  pt:{home:'Início',collections:'Categorias',blog:'Blog',language:'Idioma',menu:'Menu',close:'Fechar menu',choose:'Escolha uma categoria'},
  es:{home:'Inicio',collections:'Categorías',blog:'Blog',language:'Idioma',menu:'Menú',close:'Cerrar menú',choose:'Elige una categoría'},
  zh:{home:'首页',collections:'分类',blog:'博客',language:'语言',menu:'菜单',close:'关闭菜单',choose:'选择一个分类'},
  hi:{home:'होम',collections:'श्रेणियाँ',blog:'ब्लॉग',language:'भाषा',menu:'मेनू',close:'मेनू बंद करें',choose:'एक श्रेणी चुनें'}
};
const languageNames:Record<Locale,string>={en:'English',pt:'Português',es:'Español',zh:'中文',hi:'हिन्दी'};
const languageCodes=['en','pt','es','zh','hi'] as const;

export default function Header({locale}:{locale:Locale}){
  const l=labels[locale];
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;};
  },[open]);

  return <header className="site-header stream-header">
    <Link className="brand" href={`/${locale}/`} aria-label="Controols" onClick={()=>setOpen(false)}><span>CONTR</span><b>OO</b><span>LS</span></Link>

    <nav className="desktop-nav"><Link href={`/${locale}/`}>{l.home}</Link><Link href={`/${locale}/#collections`}>{l.collections}</Link><Link href={`/${locale}/blog/`}>{l.blog}</Link></nav>

    <details className="language-menu desktop-language">
      <summary aria-label={l.language}>{locale.toUpperCase()} <span>⌄</span></summary>
      <div>{languageCodes.map(code=><Link className={code===locale?'active':''} href={`/${code}/`} key={code}><span>{code.toUpperCase()}</span>{languageNames[code]}</Link>)}</div>
    </details>

    <button type="button" className={`mobile-menu-toggle${open?' open':''}`} aria-label={open?l.close:l.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(value=>!value)}>
      <span/><span/><span/>
    </button>

    <div id="mobile-navigation" className={`mobile-nav-panel${open?' open':''}`} aria-hidden={!open}>
      <div className="mobile-nav-top">
        <Link href={`/${locale}/`} onClick={()=>setOpen(false)} className="mobile-home-link"><span>⌂</span><strong>{l.home}</strong><i>→</i></Link>
        <Link href={`/${locale}/blog/`} onClick={()=>setOpen(false)} className="mobile-home-link"><span>✦</span><strong>{l.blog}</strong><i>→</i></Link>
      </div>

      <section className="mobile-nav-section">
        <div className="mobile-nav-label"><span>{l.collections}</span><small>{l.choose}</small></div>
        <div className="mobile-category-list">
          {collections.map((collection,index)=><Link href={`/${locale}/collection/${collection.id}/`} key={collection.id} onClick={()=>setOpen(false)}>
            <span className="mobile-category-index">{String(index+1).padStart(2,'0')}</span>
            <strong>{collection.labels[locale]}</strong>
            <i>→</i>
          </Link>)}
        </div>
      </section>

      <section className="mobile-nav-section mobile-language-section">
        <div className="mobile-nav-label"><span>{l.language}</span></div>
        <div className="mobile-language-grid">
          {languageCodes.map(code=><Link href={`/${code}/`} key={code} className={code===locale?'active':''} onClick={()=>setOpen(false)}><b>{code.toUpperCase()}</b><span>{languageNames[code]}</span></Link>)}
        </div>
      </section>
    </div>
  </header>;
}
