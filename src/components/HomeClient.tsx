'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, tools, type Locale } from '@/src/data/extendedCatalog';
import { copy } from '@/src/i18n';
import { toolTitle } from '@/src/toolLocale';

const ui:Record<Locale,{featured:string;open:string;browse:string;popular:string;collections:string;results:string;private:string;searchHint:string;collectionNames:string[]}>={
  en:{featured:'Featured tool',open:'Open tool',browse:'Explore tools',popular:'Popular right now',collections:'Browse by collection',results:'Search results',private:'Private by design',searchHint:'What do you need to do?',collectionNames:['Image & Design','PDF & Files','Video & Audio','Text & Data','Dev & Security','Calculators & Utilities']},
  pt:{featured:'Ferramenta em destaque',open:'Abrir ferramenta',browse:'Explorar ferramentas',popular:'Populares agora',collections:'Explore por coleção',results:'Resultados da busca',private:'Privacidade por padrão',searchHint:'O que você precisa fazer?',collectionNames:['Imagem e Design','PDF e Arquivos','Vídeo e Áudio','Texto e Dados','Dev e Segurança','Cálculos e Utilidades']},
  es:{featured:'Herramienta destacada',open:'Abrir herramienta',browse:'Explorar herramientas',popular:'Populares ahora',collections:'Explorar por colección',results:'Resultados de búsqueda',private:'Privacidad por defecto',searchHint:'¿Qué necesitas hacer?',collectionNames:['Imagen y Diseño','PDF y Archivos','Video y Audio','Texto y Datos','Dev y Seguridad','Cálculos y Utilidades']},
  zh:{featured:'精选工具',open:'打开工具',browse:'探索工具',popular:'热门工具',collections:'按合集浏览',results:'搜索结果',private:'默认保护隐私',searchHint:'你想完成什么？',collectionNames:['图像与设计','PDF 与文件','视频与音频','文本与数据','开发与安全','计算与实用工具']},
  hi:{featured:'फ़ीचर्ड टूल',open:'टूल खोलें',browse:'टूल एक्सप्लोर करें',popular:'लोकप्रिय टूल',collections:'कलेक्शन के अनुसार',results:'खोज परिणाम',private:'डिफ़ॉल्ट रूप से निजी',searchHint:'आप क्या करना चाहते हैं?',collectionNames:['इमेज और डिज़ाइन','PDF और फ़ाइलें','वीडियो और ऑडियो','टेक्स्ट और डेटा','डेव और सुरक्षा','कैलकुलेटर और यूटिलिटीज']}
};

const collectionCats:string[][]=[
  ['image','design'],
  ['pdf','document','file'],
  ['video','audio'],
  ['text','data'],
  ['developer','security','qr'],
  ['calculator','unit','date','geo']
];

const popularSlugs=['resize-image','compress-jpg','merge-pdf','pdf-to-jpg','qr-code-generator','json-formatter','percentage-calculator','remove-background','image-to-base64','mp4-to-webm','word-counter','length-converter'];

export default function HomeClient({locale}:{locale:Locale}){
  const [query,setQuery]=useState('');
  const t=copy[locale],u=ui[locale];
  const normalized=query.trim().toLowerCase();
  const filtered=useMemo(()=>normalized?tools.filter(x=>`${toolTitle(x,locale)} ${x.title} ${x.category}`.toLowerCase().includes(normalized)):[],[normalized,locale]);
  const featured=tools.find(x=>x.slug==='resize-image')||tools[0];
  const popular=popularSlugs.map(slug=>tools.find(x=>x.slug===slug)).filter(Boolean) as typeof tools;

  return <div className="stream-home">
    <section className="stream-hero">
      <div className="stream-hero-shade"/>
      <div className="stream-hero-copy">
        <div className="featured-label"><span/> {u.featured}</div>
        <h1>{toolTitle(featured,locale)}</h1>
        <p>{t.browserNote}</p>
        <div className="hero-meta"><b>CONTROOLS</b><span>{tools.length} {t.tools}</span><span>{u.private}</span></div>
        <div className="hero-actions">
          <Link className="hero-primary" href={`/${locale}/tools/${featured.slug}/`}><span>▶</span>{u.open}</Link>
          <a className="hero-secondary" href="#popular"><span>⌄</span>{u.browse}</a>
        </div>
        <label className="stream-search">
          <span className="search-icon">⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={u.searchHint}/>
          {query&&<button type="button" onClick={()=>setQuery('')} aria-label="Clear">×</button>}
        </label>
      </div>
      <div className="hero-tool-art" aria-hidden="true">
        <div className="hero-core"><span>OO</span></div>
        <div className="hero-orbit hero-orbit-a"><span>◫</span><b>IMAGE</b></div>
        <div className="hero-orbit hero-orbit-b"><span>▤</span><b>PDF</b></div>
        <div className="hero-orbit hero-orbit-c"><span>&lt;/&gt;</span><b>DEV</b></div>
        <div className="hero-orbit hero-orbit-d"><span>∑</span><b>CALC</b></div>
      </div>
    </section>

    <div id="tool-shelves" className="tool-shelves">
      {normalized?<Shelf title={`${u.results} · ${filtered.length}`} toolsToShow={filtered.slice(0,80)} locale={locale} searchResults/>:<>
        <Shelf id="popular" title={u.popular} toolsToShow={popular} locale={locale} featured/>
        <div id="collections" className="shelves-kicker"><span>{u.collections}</span><i>{collectionCats.length}</i></div>
        {collectionCats.map((cats,index)=><Shelf key={cats.join('-')} title={u.collectionNames[index]} toolsToShow={tools.filter(tool=>cats.includes(tool.category)).slice(0,18)} locale={locale}/>) }
      </>}
    </div>
  </div>;
}

function Shelf({id,title,toolsToShow,locale,featured=false,searchResults=false}:{id?:string;title:string;toolsToShow:typeof tools;locale:Locale;featured?:boolean;searchResults?:boolean}){
  return <section id={id} className={`tool-shelf${featured?' shelf-featured':''}${searchResults?' shelf-search-results':''}`}>
    <div className="shelf-heading"><h2>{title}</h2><span className="shelf-count">{toolsToShow.length}</span></div>
    <div className="shelf-track">
      {toolsToShow.map(tool=>{
        const category=categories.find(c=>c.id===tool.category);
        return <Link href={`/${locale}/tools/${tool.slug}/`} className={`stream-tool-card cat-${tool.category}`} key={tool.slug}>
          <div className="stream-card-visual">
            <span className="stream-card-icon">{category?.icon||'●'}</span>
            <i>{category?.labels[locale]}</i>
            <em>↗</em>
          </div>
          <div className="stream-card-copy"><strong>{toolTitle(tool,locale)}</strong><small>{category?.labels[locale]}</small></div>
        </Link>;
      })}
    </div>
  </section>;
}
