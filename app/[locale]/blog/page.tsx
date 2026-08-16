import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import { blogLocaleMap, blogPath, blogPosts, blogUi } from '@/src/data/blog';
import { locales, tools } from '@/src/data/extendedCatalog';
import { isLocale } from '@/src/i18n';
import { safeContentDate } from '@/src/seoContent';

const base = 'https://controols.com';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ui = blogUi[locale];
  const url = `${base}/${locale}/blog/`;
  return {
    title: 'Blog',
    description: ui.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map(code => [code, `${base}/${code}/blog/`])),
        'x-default': `${base}/en/blog/`
      }
    },
    openGraph: {
      title: `Blog — Controols`,
      description: ui.description,
      url,
      siteName: 'Controols',
      type: 'website',
      images: [{ url: `${base}/blog/jpg-png-webp.svg`, width: 1200, height: 630, alt: blogPosts[2].translations[locale].alt }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Blog — Controols`,
      description: ui.description,
      images: [`${base}/blog/jpg-png-webp.svg`]
    }
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = blogUi[locale];
  const dateFormat = new Intl.DateTimeFormat(blogLocaleMap[locale], { day: '2-digit', month: 'short', year: 'numeric' });

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Controols Blog`,
    itemListElement: blogPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${base}${blogPath(post, locale)}`,
      name: post.translations[locale].title
    }))
  };

  return <>
    <Header locale={locale}/>
    <main className="blog-shell">
      <div className="blog-breadcrumbs"><Link href={`/${locale}/`}>Controols</Link><span>/</span><span>Blog</span></div>

      <section className="blog-hero">
        <div className="blog-hero-copy">
          <p className="blog-eyebrow">{ui.eyebrow}</p>
          <h1>{ui.title}</h1>
          <p>{ui.description}</p>
        </div>
        <div className="blog-hero-mark" aria-hidden="true"><span/><span/><span/></div>
      </section>

      <section className="blog-latest" aria-labelledby="latest-blog-posts">
        <div className="blog-section-heading">
          <div><span className="status-dot live"/><p>{ui.freeBrowserTools}</p></div>
          <h2 id="latest-blog-posts">{ui.latest}</h2>
        </div>

        <div className="blog-grid">
          {blogPosts.map(post => {
            const article = post.translations[locale];
            const publishedAt=safeContentDate(post.publishedAt);
            return <article className="blog-card" key={post.id}>
              <Link className="blog-card-cover" href={blogPath(post, locale)} aria-label={article.title}>
                <img src={post.cover} alt={article.alt} width="1200" height="630" loading="lazy"/>
              </Link>
              <div className="blog-card-body">
                <div className="blog-card-meta"><span>{article.category}</span><time dateTime={publishedAt}>{dateFormat.format(new Date(`${publishedAt}T12:00:00Z`))}</time></div>
                <h3><Link href={blogPath(post, locale)}>{article.title}</Link></h3>
                <p>{article.description}</p>
                <Link className="blog-read-link" href={blogPath(post, locale)}>{ui.readArticle}<span>→</span></Link>
              </div>
            </article>;
          })}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }}/>
    </main>
    <footer><div className="brand"><span>CONTR</span><b>OO</b><span>LS</span></div><p>{tools.length} tools · Browser first · Open web</p></footer>
  </>;
}
