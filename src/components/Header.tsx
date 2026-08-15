import Link from 'next/link';
import type { Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

export default function Header({ locale }: { locale: Locale }) {
  return <header className="site-header"><Link className="brand" href={`/${locale}/`}><span>CONTR</span><b>OO</b><span>LS</span></Link><nav><Link href={`/${locale}/#categories`}>{copy[locale].categories}</Link><Link href={`/${locale}/#all-tools`}>{copy[locale].allTools}</Link></nav><div className="lang-switch">{(['en','pt','es','zh','hi'] as const).map(l=><Link className={l===locale?'active':''} href={`/${l}/`} key={l}>{l.toUpperCase()}</Link>)}</div></header>;
}
