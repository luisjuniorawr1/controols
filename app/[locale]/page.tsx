import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KidsStoryPrototype from '@/src/components/KidsStoryPrototype';

const locales = ['en', 'pt', 'es', 'zh', 'hi'] as const;
const base = 'https://controols.com';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) return {};
  const url = `${base}/${locale}/`;
  return {
    title: 'CONTROOLS — A Mensagem Misteriosa',
    description: 'Aventura cooperativa de segurança digital para crianças de 7 a 10 anos. Jogue sozinho ou em dupla e aprenda a pensar antes de clicar.',
    alternates: { canonical: url },
    openGraph: {
      title: 'CONTROOLS — A Mensagem Misteriosa',
      description: 'Uma aventura visual e cooperativa sobre segurança digital para crianças.',
      url,
      siteName: 'CONTROOLS',
      type: 'website',
    },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  return <KidsStoryPrototype />;
}
