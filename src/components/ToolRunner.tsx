'use client';

import { useState } from 'react';
import type { Tool, Locale } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { exampleForCategory, runTool } from '@/src/lib/allExecutors';

export default function ToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t = copy[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  async function execute() {
    setBusy(true);
    setOutput(await runTool(tool.slug, tool.category, input));
    setBusy(false);
  }

  if (!tool.live) {
    return (
      <section className="runner runner-pending">
        <div className="pending-icon">↻</div>
        <h2>{t.building}</h2>
        <p>{t.browserNote}</p>
        <div className="engine-pill">WASM / browser file engine</div>
      </section>
    );
  }

  return (
    <section className="runner">
      <div className="runner-grid">
        <label><span>{t.input}</span><textarea value={input} onChange={(e: {target:{value:string}})=>setInput(e.target.value)} placeholder={exampleForCategory(tool.category)} /></label>
        <label><span>{t.output}</span><textarea readOnly value={output} placeholder="—" /></label>
      </div>
      <div className="runner-actions">
        <button className="primary" onClick={execute} disabled={busy}>{busy ? '…' : t.run}</button>
        <button onClick={()=>navigator.clipboard.writeText(output)} disabled={!output}>{t.copy}</button>
        <button onClick={()=>{setInput('');setOutput('')}}>{t.clear}</button>
      </div>
    </section>
  );
}
