'use client';

import { useState } from 'react';
import type { Tool, Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { exampleForCategory, runTool } from '@/src/lib/allExecutors';
import { isToolLive } from '@/src/lib/live';
import { FileToolRunner, QRToolRunner } from '@/src/components/AssetToolRunner';
import ImageToolRunner from '@/src/components/ImageToolRunner';
import PdfToolRunner from '@/src/components/PdfToolRunner';
import MediaToolRunner from '@/src/components/MediaToolRunner';

export default function ToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t = copy[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  if (tool.category === 'qr') return <QRToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'file') return <FileToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'image') return <ImageToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'pdf') return <PdfToolRunner tool={tool} locale={locale}/>;
  if (tool.category === 'video' || tool.category === 'audio') return <MediaToolRunner tool={tool} locale={locale}/>;

  async function execute() {
    setBusy(true);
    setOutput(await runTool(tool.slug, tool.category, input));
    setBusy(false);
  }

  if (!isToolLive(tool)) {
    return (
      <section className="runner runner-pending">
        <div className="pending-icon">↻</div>
        <h2>{t.building}</h2>
        <p>{t.browserNote}</p>
      </section>
    );
  }

  return (
    <section className="runner simple-runner">
      <label><span>{t.input}</span><textarea value={input} onChange={(e)=>{setInput(e.target.value);setOutput('')}} placeholder={exampleForCategory(tool.category)} /></label>
      <div className="runner-actions"><button className="primary" onClick={execute} disabled={busy||!input.trim()}>{busy ? '…' : t.run}</button><button onClick={()=>setInput('')} disabled={!input}>{t.clear}</button></div>
      {output&&<div className="simple-output"><div className="result-summary">{output}</div><button onClick={()=>navigator.clipboard.writeText(output)}>{t.copy}</button></div>}
    </section>
  );
}
