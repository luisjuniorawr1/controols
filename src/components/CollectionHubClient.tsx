'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import CollectionArt from '@/src/components/CollectionArt';
import SubcategoryArt from '@/src/components/SubcategoryArt';
import { categories, tools, type Locale } from '@/src/data/extendedCatalog';
import { getCollection, type CollectionId } from '@/src/data/collections';
import { toolTitle } from '@/src/toolPresentation';

const ui:Record<Locale,{back:string;search:string;subcategories:string;subhint:string;results:string;empty:string;tools:string;open:string;privacy:string;clear:string}>={
  en:{back:'All categories',search:'Search within this category…',subcategories:'Choose a subcategory',subhint:'Pick an area to see only the tools for that task.',results:'Search results',empty:'No tools found in this category.',tools:'tools',open:'Explore',privacy:'Processed in your browser whenever possible',clear:'Clear search'},
  pt:{back:'Todas as categorias',search:'Busque dentro desta categoria…',subcategories:'Escolha uma subcategoria',subhint:'Entre em uma área para ver apenas as ferramentas daquela tarefa.',results:'Resultados da busca',empty:'Nenhuma ferramenta encontrada nesta categoria.',tools:'ferramentas',open:'Explorar',privacy:'Processado no navegador sempre que possível',clear:'Limpar busca'},
  es:{back:'Todas las categorías',search:'Busca dentro de esta categoría…',subcategories:'Elige una subcategoría',subhint:'Entra en un área para ver solo las herramientas de esa tarea.',results:'Resultados de búsqueda',empty:'No se encontraron herramientas en esta categoría.',tools:'herramientas',open:'Explorar',privacy:'Procesado en el navegador siempre que sea posible',clear:'Limpiar búsqueda'},
  zh:{back:'全部分类',search:'在此分类中搜索…',subcategories:'选择子分类',subhint:'进入一个领域，只查看该任务相关的工具。',results:'搜索结果',empty:'此分类中未找到工具。',tools:'工具',open:'浏览',privacy:'尽可能在浏览器中处理',clear:'清除搜索'},
  hi:{back:'सभी श्रेणियाँ',search:'इस श्रेणी में खोजें…',subcategories:'एक उपश्रेणी चुनें',subhint:'उस काम के टूल देखने के लिए एक क्षेत्र चुनें।',results:'खोज परिणाम',empty:'इस श्रेणी में कोई टूल नहीं मिला।',tools:'टूल',open:'देखें',privacy:'जहाँ संभव हो, ब्राउज़र में प्रोसेस किया जाता है',clear:'खोज साफ़ करें'}
};

export default function CollectionHubClient({locale,collectionId}:{locale:Locale;collectionId:CollectionId}){
  const collection=getCollection(collectionId)!;
  const l=ui[locale];
  const [query,setQuery]=useState('');
  const normalized=query.trim().toLowerCase();
  const scopedTools=useMemo(()=>tools.filter(tool=>collection.categories.includes(tool.category)),[collection]);
  const filtered=useMemo(()=>normalized?scopedTools.filter(tool=>`${toolTitle(tool,locale)} ${tool.title} ${tool.category}`.toLowerCase().includes(normalized)).slice(0,60):[],[normalized,scopedTools,locale]);

  return <div className={`collection-hub collection-hub-${collection.id}`}>
    <section className="collection-hub-hero">
      <div className="collection-hub-hero-glow" aria-hidden="true"/>
      <div className="collection-hub-hero-inner">
        <div className="collection-hub-copy">
          <Link className="collection-back" href={`/${locale}/#collections`}>← {l.back}</Link>
          <span className="collection-page-kicker">{collection.eyebrow[locale]}</span>
          <h1>{collection.labels[locale]}</h1>
          <p>{collection.descriptions[locale]}</p>
          <label className="hub-search collection-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={l.search} autoComplete="off"/>
            {query&&<button type="button" onClick={()=>setQuery('')} aria-label={l.clear}>×</button>}
          </label>
          <div className="hub-meta"><b>CONTROOLS</b><span>{scopedTools.length} {l.tools}</span><span>{l.privacy}</span></div>
        </div>
        <div className="collection-hub-art"><CollectionArt id={collection.id}/></div>
      </div>
    </section>

    <main className="collection-hub-content">
      {normalized?<SearchResults locale={locale} title={l.results} empty={l.empty} items={filtered}/>:<>
        <header className="hub-section-head"><div><h2>{l.subcategories}</h2><p>{l.subhint}</p></div><span>{collection.categories.length}</span></header>
        <div className={`subcategory-grid count-${collection.categories.length}`}>
          {collection.categories.map(categoryId=>{
            const cat=categories.find(c=>c.id===categoryId)!;
            const count=scopedTools.filter(tool=>tool.category===categoryId).length;
            return <Link href={`/${locale}/category/${categoryId}/`} className={`subcategory-card subcategory-${categoryId}`} key={categoryId}>
              <div className="subcategory-card-art"><SubcategoryArt id={categoryId}/></div>
              <div className="subcategory-card-body"><div><span>{collection.eyebrow[locale]}</span><h3>{cat.labels[locale]}</h3></div><footer><small>{count} {l.tools}</small><strong>{l.open} <i>→</i></strong></footer></div>
            </Link>;
          })}
        </div>
      </>}
    </main>
  </div>;
}

function SearchResults({locale,title,empty,items}:{locale:Locale;title:string;empty:string;items:typeof tools}){
  return <section className="hub-results"><header className="hub-section-head"><div><h2>{title}</h2><p>{items.length?`${items.length}`:empty}</p></div></header>{items.length>0&&<div className="hub-result-grid">{items.map(tool=>{const cat=categories.find(c=>c.id===tool.category);return <Link href={`/${locale}/tools/${tool.slug}/`} className="hub-result-card" key={tool.slug}><span>{cat?.labels[locale]}</span><strong>{toolTitle(tool,locale)}</strong><i>↗</i></Link>})}</div>}</section>;
}
