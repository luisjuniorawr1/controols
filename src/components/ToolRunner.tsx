'use client';

import type { Tool, Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { isToolLive } from '@/src/lib/live';
import { FileToolRunner } from '@/src/components/AssetToolRunner';
import StructuredQRToolRunner from '@/src/components/StructuredQRToolRunner';
import ImageToolRunner from '@/src/components/ImageToolRunner';
import StructuredPdfToolRunner from '@/src/components/StructuredPdfToolRunner';
import StructuredMediaToolRunner from '@/src/components/StructuredMediaToolRunner';
import PineImageToolRunner from '@/src/components/PineImageToolRunner';
import PineFileToolRunner from '@/src/components/PineFileToolRunner';
import PineInteractiveRunner from '@/src/components/PineInteractiveRunner';
import SmartToolForm from '@/src/components/SmartToolForm';
import { pineFileExtraSlugs, pineImageExtraSlugs } from '@/src/data/pineToolsExtras';

export default function ToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t = copy[locale];
  if (pineImageExtraSlugs.has(tool.slug)) return <PineImageToolRunner tool={tool} locale={locale}/>;
  if (pineFileExtraSlugs.has(tool.slug)) return <PineFileToolRunner tool={tool} locale={locale}/>;
  if (['timer','stopwatch','screen-recorder'].includes(tool.slug)) return <PineInteractiveRunner tool={tool} locale={locale}/>;
  if (tool.category === 'qr') return <StructuredQRToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'file' || tool.slug==='file-sha256-checksum') return <FileToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'image') return <ImageToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'pdf') return <StructuredPdfToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'video' || tool.category === 'audio') return <StructuredMediaToolRunner tool={tool} locale={locale}/>;
  if (!isToolLive(tool)) return <section className="runner runner-pending"><div className="pending-icon">↻</div><h2>{t.building}</h2><p>{t.browserNote}</p></section>;
  return <SmartToolForm tool={tool} locale={locale}/>;
}
