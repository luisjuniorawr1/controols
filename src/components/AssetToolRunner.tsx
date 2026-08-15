'use client';

import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import JSZip from 'jszip';
import pako from 'pako';
import { BrowserMultiFormatReader, BrowserQRCodeReader } from '@zxing/browser';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

type Download = { name: string; url: string };

function downloadName(slug: string, ext: string) {
  return `controols-${slug}.${ext}`;
}

function payloadFor(slug: string, value: string) {
  switch (slug) {
    case 'url-qr-code': return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    case 'wifi-qr-code': {
      const [ssid = '', password = '', security = 'WPA'] = value.split('|');
      return `WIFI:T:${security};S:${ssid};P:${password};;`;
    }
    case 'email-qr-code': return `mailto:${value}`;
    case 'phone-qr-code': return `tel:${value}`;
    case 'sms-qr-code': {
      const [phone = '', message = ''] = value.split('|'); return `SMSTO:${phone}:${message}`;
    }
    case 'whatsapp-qr-code': {
      const [phone = '', message = ''] = value.split('|'); return `https://wa.me/${phone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    }
    case 'location-qr-code': {
      const [lat = '0', lng = '0'] = value.split(/[|,]/); return `geo:${lat.trim()},${lng.trim()}`;
    }
    case 'contact-vcard-qr-code': {
      const [name = '', phone = '', email = ''] = value.split('|');
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    case 'event-qr-code': {
      const [title = '', start = '', end = '', location = ''] = value.split('|');
      return `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${start.replace(/[-:]/g, '')}\nDTEND:${end.replace(/[-:]/g, '')}\nLOCATION:${location}\nEND:VEVENT`;
    }
    default: return value;
  }
}

const barcodeFormats: Record<string, string> = {
  'text-barcode-code128': 'CODE128',
  'ean13-barcode-generator': 'EAN13',
  'ean8-barcode-generator': 'EAN8',
  'upca-barcode-generator': 'UPC',
  'code39-barcode-generator': 'CODE39',
  'itf-barcode-generator': 'ITF14',
  'codabar-generator': 'codabar',
};

export function QRToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t = copy[locale];
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const isReader = tool.slug === 'qr-code-reader' || tool.slug === 'barcode-reader';

  async function generate() {
    setBusy(true); setResult(''); setImage('');
    try {
      if (tool.slug === 'qr-code-svg-generator') {
        const svg = await QRCode.toString(payloadFor(tool.slug, value), { type: 'svg', margin: 2, width: 640, errorCorrectionLevel: 'M' });
        setImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`); setResult(svg);
      } else if (barcodeFormats[tool.slug]) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svg, value || '123456789012', { format: barcodeFormats[tool.slug], displayValue: true, margin: 24, height: 100 });
        const text = new XMLSerializer().serializeToString(svg);
        setImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`); setResult(text);
      } else {
        const dataUrl = await QRCode.toDataURL(payloadFor(tool.slug, value), { width: 640, margin: 2, errorCorrectionLevel: 'M' });
        setImage(dataUrl); setResult(payloadFor(tool.slug, value));
      }
    } catch (e) { setResult(`Error: ${e instanceof Error ? e.message : 'Invalid value'}`); }
    setBusy(false);
  }

  async function read(file: File) {
    setBusy(true); setResult(''); setImage(URL.createObjectURL(file));
    const url = URL.createObjectURL(file);
    try {
      const reader = tool.slug === 'qr-code-reader' ? new BrowserQRCodeReader() : new BrowserMultiFormatReader();
      const decoded = await reader.decodeFromImageUrl(url);
      setResult(decoded.getText());
    } catch (e) { setResult(`Error: ${e instanceof Error ? e.message : 'Code not found'}`); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  }

  return <section className="runner asset-runner">
    <div className="asset-controls">
      {isReader ? <label className="drop-zone"><input type="file" accept="image/*" onChange={(e)=>e.target.files?.[0]&&read(e.target.files[0])}/><strong>{busy ? '…' : 'Select image'}</strong><span>PNG, JPG, WebP</span></label> : <>
        <label><span>{t.input}</span><textarea value={value} onChange={(e)=>setValue(e.target.value)} placeholder={tool.slug==='wifi-qr-code'?'Network|password|WPA':tool.slug.includes('vcard')?'Name|phone|email':'Type the content…'}/></label>
        <button className="primary" onClick={generate} disabled={busy}>{busy?'…':t.run}</button>
      </>}
    </div>
    <div className="asset-result">
      {image ? <img src={image} alt="Generated result"/> : <div className="preview-empty">⌗</div>}
      <textarea readOnly value={result} placeholder={t.output}/>
      {image && !isReader && <a className="download-button" href={image} download={downloadName(tool.slug, tool.slug.includes('qr')&&!tool.slug.includes('svg')?'png':'svg')}>Download</a>}
    </div>
  </section>;
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((x)=>x.toString(16).padStart(2,'0')).join('');
}

export function FileToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t=copy[locale];
  const [files,setFiles]=useState<File[]>([]); const [output,setOutput]=useState(''); const [downloads,setDownloads]=useState<Download[]>([]); const [text,setText]=useState(''); const [busy,setBusy]=useState(false);
  const acceptMultiple=tool.slug==='zip-files';
  const needsText=tool.slug==='base64-to-file';
  const fileSummary=useMemo(()=>files.map(f=>`${f.name} · ${(f.size/1024).toFixed(1)} KB`).join('\n'),[files]);
  function resetDownloads(){downloads.forEach(d=>URL.revokeObjectURL(d.url));setDownloads([])}
  async function process(){setBusy(true);setOutput('');resetDownloads();try{
    if(tool.slug==='base64-to-file'){const raw=text.includes(',')?text.split(',').pop()!:text;const bytes=Uint8Array.from(atob(raw.trim()),c=>c.charCodeAt(0));const blob=new Blob([bytes]);setDownloads([{name:'controols-decoded-file.bin',url:URL.createObjectURL(blob)}]);setOutput(`${bytes.length} bytes`);setBusy(false);return}
    const file=files[0];if(!file&&tool.slug!=='zip-files')throw new Error('Select a file first');
    if(tool.slug==='zip-files'){if(!files.length)throw new Error('Select files first');const zip=new JSZip();files.forEach(f=>zip.file(f.name,f));const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});setDownloads([{name:'controols-files.zip',url:URL.createObjectURL(blob)}]);setOutput(`${files.length} files · ${(blob.size/1024).toFixed(1)} KB`)}
    else if(tool.slug==='unzip-files'){const zip=await JSZip.loadAsync(file);const ds:Download[]=[];const names:string[]=[];for(const [name,entry] of Object.entries(zip.files)){if(entry.dir)continue;const blob=await entry.async('blob');ds.push({name:name.split('/').pop()||name,url:URL.createObjectURL(blob)});names.push(`${name} · ${(blob.size/1024).toFixed(1)} KB`)}setDownloads(ds);setOutput(names.join('\n'))}
    else if(tool.slug==='gzip-file'){const data=pako.gzip(new Uint8Array(await file.arrayBuffer()));const blob=new Blob([data],{type:'application/gzip'});setDownloads([{name:`${file.name}.gz`,url:URL.createObjectURL(blob)}]);setOutput(`${file.size} → ${blob.size} bytes`)}
    else if(tool.slug==='ungzip-file'){const data=pako.ungzip(new Uint8Array(await file.arrayBuffer()));const blob=new Blob([data]);setDownloads([{name:file.name.replace(/\.gz$/i,'')||'decompressed.bin',url:URL.createObjectURL(blob)}]);setOutput(`${file.size} → ${blob.size} bytes`)}
    else if(tool.slug==='file-size-viewer')setOutput(JSON.stringify({bytes:file.size,kilobytes:file.size/1024,megabytes:file.size/1048576},null,2));
    else if(tool.slug==='file-mime-type-checker')setOutput(file.type||'application/octet-stream');
    else if(tool.slug==='file-extension-checker')setOutput(file.name.includes('.')?file.name.split('.').pop()!.toLowerCase():'No extension');
    else if(tool.slug==='file-to-base64'){const reader=new FileReader();const value=await new Promise<string>((resolve,reject)=>{reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});setOutput(value)}
    else if(tool.slug==='file-checksum')setOutput(await sha256(file));
  }catch(e){setOutput(`Error: ${e instanceof Error?e.message:'Unable to process file'}`)}setBusy(false)}
  return <section className="runner asset-runner file-runner"><div className="asset-controls">{needsText?<label><span>{t.input}</span><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste Base64 here…"/></label>:<label className="drop-zone"><input type="file" multiple={acceptMultiple} onChange={e=>setFiles(Array.from(e.target.files||[]))}/><strong>Select {acceptMultiple?'files':'file'}</strong><span>{fileSummary||'Processed locally in your browser'}</span></label>}<button className="primary" onClick={process} disabled={busy}>{busy?'…':t.run}</button></div><div className="asset-result"><textarea readOnly value={output} placeholder={t.output}/>{downloads.length>0&&<div className="download-list">{downloads.map((d,i)=><a className="download-button" href={d.url} download={d.name} key={`${d.name}-${i}`}>↓ {d.name}</a>)}</div>}</div></section>
}
