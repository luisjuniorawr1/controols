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
    title: 'CONTROOLS — Aventuras de Segurança Digital',
    description: 'Jogos visuais de segurança digital para crianças de 7 a 10 anos. Resolva casos, reconheça golpes e aprenda a proteger contas e senhas.',
    alternates: { canonical: url },
    openGraph: {
      title: 'CONTROOLS — Aventuras de Segurança Digital',
      description: 'Aventuras visuais sobre segurança digital para crianças.',
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
