import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryPrototype from '@/src/components/StoryPrototype';
import { isLocale } from '@/src/i18n';
import { locales } from '@/src/data/extendedCatalog';

const base = 'https://controols.com';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const url = `${base}/${locale}/`;
  return {
    title: 'Controols — O Login da Meia-Noite',
    description: 'Uma aventura de investigação e segurança digital para jogar sozinho ou com amigos. Cinco personagens, papéis secretos, pistas e decisões.',
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(locales.map((item) => [item, `${base}/${item}/`])), 'x-default': `${base}/pt/` },
    },
    openGraph: {
      title: 'Controols — O Login da Meia-Noite',
      description: 'Investigue um incidente digital, confronte evidências e descubra quem está manipulando o grupo.',
      url,
      siteName: 'Controols',
      type: 'website',
    },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <StoryPrototype />;
}
