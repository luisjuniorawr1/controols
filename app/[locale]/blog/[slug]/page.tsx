import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header';
import { blogLocaleMap, blogPath, blogPosts, blogUi, getBlogPost } from '@/src/data/blog';
import { getTool, locales } from '@/src/data/extendedCatalog';
import { isLocale } from '@/src/i18n';
import { toolTitle } from '@/src/toolPresentation';

const base = 'https://controols.com';

export function generateStaticParams() {
  return locales.flatMap(locale => blogPosts.map(post => ({ locale, slug: post.translations[locale].slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getBlogPost(locale, slug);
  if (!post) return {};
  const article = post.translations[locale];
  const url = `${base}${blogPath(post, locale)}`;
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map(code => [code, `${base}${blogPath(post, code)}`])),
        'x-default': `${base}${blogPath(post, 'en')}`
      }
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: 'Controols',
      type: 'article',
      publishedTime: `${post.publishedAt}T12:00:00Z`,
      modifiedTime: `${post.updatedAt}T12:00:00Z`,
      images: [{ url: `${base}${post.cover}`, width: 1200, height: 630, alt: article.alt }]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [`${base}${post.cover}`]
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const article = post.translations[locale];
  const ui = blogUi[locale];
  const dateFormat = new Intl.DateTimeFormat(blogLocaleMap[locale], { day: '2-digit', month: 'long', year: 'numeric' });
  const related = blogPosts.filter(item => item.id !== post.id).slice(0, 2);
  const pageUrl = `${base}${blogPath(post, locale)}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: `${base}${post.cover}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: blogLocaleMap[locale],
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Organization', name: 'Controols', url: base },
    publisher: { '@type': 'Organization', name: 'Controols', url: base }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Controols', item: `${base}/${locale}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/${locale}/blog/` },
      { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl }
    ]
  };

  return <>
    <Header locale={locale}/>
    <main className="blog-article-shell">
      <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
        <Link href={`/${locale}/`}>Controols</Link><span>/</span><Link href={`/${locale}/blog/`}>Blog</Link><span>/</span><span>{article.category}</span>
      </nav>

      <article className="blog-article">
        <header className="blog-article-header">
          <p className="blog-eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="blog-article-deck">{article.description}</p>
          <div className="blog-article-dates">
            <span>{ui.published} <time dateTime={post.publishedAt}>{dateFormat.format(new Date(`${post.publishedAt}T12:00:00Z`))}</time></span>
            {post.updatedAt !== post.publishedAt && <span>{ui.updated} <time dateTime={post.updatedAt}>{dateFormat.format(new Date(`${post.updatedAt}T12:00:00Z`))}</time></span>}
          </div>
        </header>

        <figure className="blog-article-cover">
          <img src={post.cover} alt={article.alt} width="1200" height="630"/>
        </figure>

        <div className="blog-prose">
          <p className="blog-lead">{article.intro}</p>
          {article.sections.map((section, index) => <section key={`${post.id}-${index}`}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>}
          </section>)}
          <p>{article.conclusion}</p>
        </div>

        <aside className="blog-tools-panel">
          <div className="blog-tools-heading"><span className="status-dot live"/><div><small>CONTROOLS</small><h2>{ui.relatedTools}</h2></div></div>
          <div className="blog-tool-links">
            {post.relatedTools.map(slug => {
              const tool = getTool(slug);
              if (!tool) return null;
              return <Link href={`/${locale}/tools/${slug}/`} key={slug}><span><strong>{toolTitle(tool, locale)}</strong><small>{ui.useTool}</small></span><b>↗</b></Link>;
            })}
          </div>
        </aside>
      </article>

      <section className="blog-related-posts">
        <div className="blog-section-heading"><h2>{ui.relatedPosts}</h2></div>
        <div className="blog-related-grid">
          {related.map(item => {
            const relatedArticle = item.translations[locale];
            return <Link href={blogPath(item, locale)} key={item.id}>
              <img src={item.cover} alt={relatedArticle.alt} width="1200" height="630" loading="lazy"/>
              <span>{relatedArticle.category}</span>
              <strong>{relatedArticle.title}</strong>
            </Link>;
          })}
        </div>
        <Link className="blog-back-link" href={`/${locale}/blog/`}>← {ui.back}</Link>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}/>
    </main>
  </>;
}
