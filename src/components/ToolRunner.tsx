'use client';

import type { Tool, Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { isToolLive } from '@/src/lib/live';
import { FileToolRunner } from '@/src/components/AssetToolRunner';
import StructuredQRToolRunner from '@/src/components/StructuredQRToolRunner';
import StructuredImageToolRunner from '@/src/components/StructuredImageToolRunner';
import StructuredPdfToolRunner from '@/src/components/StructuredPdfToolRunner';
import PdfPasswordToolRunner from '@/src/components/PdfPasswordToolRunner';
import StructuredMediaToolRunner from '@/src/components/StructuredMediaToolRunner';
import RemoveAudioVideoRunner from '@/src/components/RemoveAudioVideoRunner';
import StructuredPineImageToolRunner from '@/src/components/StructuredPineImageToolRunner';
import BulkSimpleImageRunner from '@/src/components/BulkSimpleImageRunner';
import PineFileToolRunner from '@/src/components/PineFileToolRunner';
import PineInteractiveRunner from '@/src/components/PineInteractiveRunner';
import SmartToolForm from '@/src/components/SmartToolForm';
import { pineFileExtraSlugs, pineImageExtraSlugs } from '@/src/data/pineToolsExtras';

const simpleBulk=new Set(['bulk-change-brightness','bulk-change-contrast','bulk-change-saturation','bulk-flip-image']);

export default function ToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t = copy[locale];
  if(simpleBulk.has(tool.slug)) return <BulkSimpleImageRunner tool={tool} locale={locale}/>;
  if (pineImageExtraSlugs.has(tool.slug)) return <StructuredPineImageToolRunner tool={tool} locale={locale}/>;
  if (pineFileExtraSlugs.has(tool.slug)) return <PineFileToolRunner tool={tool} locale={locale}/>;
  if (['timer','stopwatch','screen-recorder'].includes(tool.slug)) return <PineInteractiveRunner tool={tool} locale={locale}/>;
  if (tool.category === 'qr') return <StructuredQRToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'file' || tool.slug==='file-sha256-checksum') return <FileToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'image') return <StructuredImageToolRunner tool={tool} locale={locale}/>;
  if (['protect-pdf','unlock-pdf'].includes(tool.slug)) return <PdfPasswordToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'pdf') return <StructuredPdfToolRunner tool={tool} locale={locale}/>;
  if (tool.slug === 'remove-audio-from-video') return <RemoveAudioVideoRunner tool={tool} locale={locale}/>;
  if (tool.category === 'video' || tool.category === 'audio') return <StructuredMediaToolRunner tool={tool} locale={locale}/>;
  if (!isToolLive(tool)) return <section className="runner runner-pending"><div className="pending-icon">↻</div><h2>{t.building}</h2><p>{t.browserNote}</p></section>;
  return <SmartToolForm tool={tool} locale={locale}/>;
}
