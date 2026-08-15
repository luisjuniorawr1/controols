import Link from 'next/link';
import type { Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

const labels:Record<Locale,{home:string;tools:string;collections:string}>={
  en:{home:'Home',tools:'Tools',collections:'Collections'},
  pt:{home:'Início',tools:'Ferramentas',collections:'Coleções'},
  es:{home:'Inicio',tools:'Herramientas',collections:'Colecciones'},
  zh:{home:'首页',tools:'工具',collections:'合集'},
  hi:{home:'होम',tools:'टूल्स',collections:'कलेक्शन'}
};
const languageNames:Record<Locale,string>={en:'English',pt:'Português',es:'Español',zh:'中文',hi:'हिन्दी'};

export default function Header({locale}:{locale:Locale}){
  const l=labels[locale];
  return <header className="site-header stream-header">
    <Link className="brand" href={`/${locale}/`} aria-label="Controols"><span>CONTR</span><b>OO</b><span>LS</span></Link>
    <nav>
      <Link href={`/${locale}/`}>{l.home}</Link>
      <Link href={`/${locale}/#popular`}>{l.tools}</Link>
      <Link href={`/${locale}/#collections`}>{l.collections}</Link>
    </nav>
    <details className="language-menu">
      <summary aria-label={copy[locale].language || 'Language'}>{locale.toUpperCase()} <span>⌄</span></summary>
      <div>{(['en','pt','es','zh','hi'] as const).map(code=><Link className={code===locale?'active':''} href={`/${code}/`} key={code}><span>{code.toUpperCase()}</span>{languageNames[code]}</Link>)}</div>
    </details>
  </header>;
}
