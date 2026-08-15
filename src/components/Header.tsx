import Link from 'next/link';
import type { Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

const homeLabel:Record<Locale,string>={en:'Home',pt:'Início',es:'Inicio',zh:'首页',hi:'होम'};
const languageNames:Record<Locale,string>={en:'English',pt:'Português',es:'Español',zh:'中文',hi:'हिन्दी'};

export default function Header({locale}:{locale:Locale}){
  return <header className="site-header stream-header">
    <Link className="brand" href={`/${locale}/`}><span>CONTR</span><b>OO</b><span>LS</span></Link>
    <nav><Link href={`/${locale}/`}>{homeLabel[locale]}</Link><Link href={`/${locale}/#tool-shelves`}>{copy[locale].allTools}</Link></nav>
    <details className="language-menu">
      <summary>{locale.toUpperCase()}</summary>
      <div>{(['en','pt','es','zh','hi'] as const).map(l=><Link className={l===locale?'active':''} href={`/${l}/`} key={l}><span>{l.toUpperCase()}</span>{languageNames[l]}</Link>)}</div>
    </details>
  </header>;
}
