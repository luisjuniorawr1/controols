import Link from 'next/link';
import type { Locale } from '@/src/data/catalog';

const labels:Record<Locale,{home:string;collections:string;language:string}>={
  en:{home:'Home',collections:'Categories',language:'Language'},
  pt:{home:'Início',collections:'Categorias',language:'Idioma'},
  es:{home:'Inicio',collections:'Categorías',language:'Idioma'},
  zh:{home:'首页',collections:'分类',language:'语言'},
  hi:{home:'होम',collections:'श्रेणियाँ',language:'भाषा'}
};
const languageNames:Record<Locale,string>={en:'English',pt:'Português',es:'Español',zh:'中文',hi:'हिन्दी'};

export default function Header({locale}:{locale:Locale}){
  const l=labels[locale];
  return <header className="site-header stream-header">
    <Link className="brand" href={`/${locale}/`} aria-label="Controols"><span>CONTR</span><b>OO</b><span>LS</span></Link>
    <nav><Link href={`/${locale}/`}>{l.home}</Link><Link href={`/${locale}/#collections`}>{l.collections}</Link></nav>
    <details className="language-menu">
      <summary aria-label={l.language}>{locale.toUpperCase()} <span>⌄</span></summary>
      <div>{(['en','pt','es','zh','hi'] as const).map(code=><Link className={code===locale?'active':''} href={`/${code}/`} key={code}><span>{code.toUpperCase()}</span>{languageNames[code]}</Link>)}</div>
    </details>
  </header>;
}
