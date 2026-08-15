import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="locale-gate">
      <div className="brand brand-large"><span>CONTR</span><b>OO</b><span>LS</span></div>
      <h1>Everything. Under control.</h1>
      <p>Choose your language</p>
      <div className="language-grid">
        <Link href="/en/">English</Link>
        <Link href="/pt/">Português</Link>
        <Link href="/es/">Español</Link>
        <Link href="/zh/">中文</Link>
        <Link href="/hi/">हिन्दी</Link>
      </div>
    </main>
  );
}
