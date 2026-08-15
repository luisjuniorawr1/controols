'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, tools, type Locale } from '@/src/data/extendedCatalog';
import { collections } from '@/src/data/collections';
import CollectionArt from '@/src/components/CollectionArt';
import { copy } from '@/src/i18n';
import { toolTitle } from '@/src/toolPresentation';

const ui:Record<Locale,{eyebrow:string;headline:string;intro:string;collections:string;collectionsHint:string;results:string;noResults:string;searchHint:string;tools:string;open:string;clear:string}>={
  en:{eyebrow:'Free browser tools',headline:'Everything. Under control.',intro:'Choose what you want to work with. Your files stay in your browser whenever possible.',collections:'What do you want to do?',collectionsHint:'Choose an area to see the tools made for that task.',results:'Search results',noResults:'No tools found.',searchHint:'Search a tool or task…',tools:'tools',open:'Explore',clear:'Clear search'},
  pt:{eyebrow:'Ferramentas gratuitas no navegador',headline:'Tudo sob controle.',intro:'Escolha com o que você quer trabalhar. Seus arquivos ficam no navegador sempre que possível.',collections:'O que você precisa fazer?',collectionsHint:'Escolha uma área para ver apenas as ferramentas feitas para aquela tarefa.',results:'Resultados da busca',noResults:'Nenhuma ferramenta encontrada.',searchHint:'Busque uma ferramenta ou tarefa…',tools:'ferramentas',open:'Explorar',clear:'Limpar busca'},
  es:{eyebrow:'Herramientas gratuitas en el navegador',headline:'Todo bajo control.',intro:'Elige con qué quieres trabajar. Tus archivos permanecen en el navegador siempre que sea posible.',collections:'¿Qué necesitas hacer?',collectionsHint:'Elige un área para ver solo las herramientas creadas para esa tarea.',results:'Resultados de búsqueda',noResults:'No se encontraron herramientas.',searchHint:'Busca una herramienta o tarea…',tools:'herramientas',open:'Explorar',clear:'Limpiar búsqueda'},
  zh:{eyebrow:'免费浏览器工具',headline:'一切尽在掌控。',intro:'选择你要处理的内容。只要条件允许，文件都会留在你的浏览器中。',collections:'你想完成什么？',collectionsHint:'选择一个领域，只查看适合该任务的工具。',results:'搜索结果',noResults:'未找到工具。',searchHint:'搜索工具或任务…',tools:'工具',open:'浏览',clear:'清除搜索'},
  hi:{eyebrow:'मुफ़्त ब्राउज़र टूल',headline:'सब कुछ आपके नियंत्रण में।',intro:'चुनें कि आप किस पर काम करना चाहते हैं। जहाँ संभव हो, आपकी फ़ाइलें ब्राउज़र में ही रहती हैं।',collections:'आप क्या करना चाहते हैं?',collectionsHint:'उस काम के लिए बने टूल देखने हेतु एक क्षेत्र चुनें।',results:'खोज परिणाम',noResults:'कोई टूल नहीं मिला।',searchHint:'टूल या काम खोजें…',tools:'टूल',open:'देखें',clear:'खोज साफ़ करें'}
};

export default function HomeClient({locale}:{locale:Locale}){
  const [query,setQuery]=useState('');
  const u=ui[locale];
  const normalized=query.trim().toLowerCase();
  const filtered=useMemo(()=>normalized?tools.filter(x=>`${toolTitle(x,locale)} ${x.title} ${x.category}`.toLowerCase().includes(normalized)).slice(0,60):[],[normalized,locale]);

  return <div className="hub-home">
    <section className="hub-hero">
      <div className="hub-hero-glow" aria-hidden="true"/>
      <div className="hub-hero-inner">
        <div className="hub-eyebrow"><span/> {u.eyebrow}</div>
        <h1>{u.headline}</h1>
        <p>{u.intro}</p>
        <label className="hub-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={u.searchHint} autoComplete="off"/>
          {query&&<button type="button" onClick={()=>setQuery('')} aria-label={u.clear}>×</button>}
        </label>
        <div className="hub-meta"><b>CONTROOLS</b><span>{tools.length} {u.tools}</span><span>{copy[locale].browserNote}</span></div>
      </div>
    </section>

    <main className="hub-content">
      {normalized?<SearchResults locale={locale} title={u.results} empty={u.noResults} items={filtered}/>:<>
        <header className="hub-section-head"><div><h2>{u.collections}</h2><p>{u.collectionsHint}</p></div><span>{collections.length}</span></header>
        <div id="collections" className="collection-grid">
          {collections.map(collection=>{
            const count=tools.filter(tool=>collection.categories.includes(tool.category)).length;
            return <Link href={`/${locale}/collection/${collection.id}/`} key={collection.id} className={`collection-card collection-${collection.id}`}>
              <div className="collection-card-art"><CollectionArt id={collection.id}/></div>
              <div className="collection-card-body">
                <div><span className="collection-eyebrow">{collection.eyebrow[locale]}</span><h3>{collection.labels[locale]}</h3><p>{collection.descriptions[locale]}</p></div>
                <div className="collection-card-foot"><span>{count} {u.tools}</span><strong>{u.open} <i>→</i></strong></div>
              </div>
            </Link>;
          })}
        </div>
      </>}
    </main>
  </div>;
}

function SearchResults({locale,title,empty,items}:{locale:Locale;title:string;empty:string;items:typeof tools}){
  return <section className="hub-results"><header className="hub-section-head"><div><h2>{title}</h2><p>{items.length?`${items.length}`:empty}</p></div></header>{items.length>0&&<div className="hub-result-grid">{items.map(tool=>{const category=categories.find(c=>c.id===tool.category);return <Link href={`/${locale}/tools/${tool.slug}/`} key={tool.slug} className="hub-result-card"><span>{category?.labels[locale]}</span><strong>{toolTitle(tool,locale)}</strong><i>↗</i></Link>})}</div>}</section>;
}
