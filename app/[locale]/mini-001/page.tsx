import { notFound } from 'next/navigation';
import MiniGame001OlhoVivo from '@/src/components/MiniGame001OlhoVivo';

const locales = ['en', 'pt', 'es', 'zh', 'hi'] as const;

export default async function Mini001Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  return <MiniGame001OlhoVivo locale={locale} />;
}
