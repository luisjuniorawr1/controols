'use client';

import { useMemo, useState } from 'react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

type Download = { name: string; url: string };
type QpdfModule = { FS: { writeFile(path:string,data:Uint8Array):void; readFile(path:string):Uint8Array; unlink(path:string):void }; callMain(args:string[]): number };

declare global { interface Window { Module?: (options: Record<string, unknown>) => Promise<QpdfModule> } }

let qpdfPromise: Promise<QpdfModule> | null = null;
function loadQpdf() {
  if (qpdfPromise) return qpdfPromise;
  qpdfPromise = new Promise<QpdfModule>((resolve, reject) => {
    const init = async () => {
      try {
        if (!window.Module) throw new Error('QPDF module was not exposed by the browser script.');
        resolve(await window.Module({ locateFile: () => '/wasm/qpdf.wasm', noInitialRun: true, noExitRuntime: true }));
      } catch (e) { reject(e); }
    };
    if (window.Module) { void init(); return; }
    const script = document.createElement('script'); script.src='/wasm/qpdf.js'; script.async=true; script.onload=()=>void init(); script.onerror=()=>reject(new Error('Unable to load QPDF WebAssembly.')); document.head.appendChild(script);
  });
  return qpdfPromise;
}

function urlFor(bytes: Uint8Array | Blob, name: string) {
  const blob = bytes instanceof Blob ? bytes : new Blob([new Uint8Array(bytes)], { type:'application/pdf' });
  return { name, url: URL.createObjectURL(blob) };
}
function rangePages(input:string,total:number){const set=new Set<number>();for(const piece of input.split(',')){const p=piece.trim();if(!p)continue;if(p.includes('-')){const[a,b]=p.split('-').map(Number);for(let i=Math.max(1,a);i<=Math.min(total,b||a);i++)set.add(i-1)}else{const n=Number(p);if(n>=1&&n<=total)set.add(n-1)}}return [...set]}
function allPages(total:number){return Array.from({length:total},(_,i)=>i)}
async function save(doc:PDFDocument,name:string){return urlFor(await doc.save(),name)}
async function embedImage(doc:PDFDocument,file:File){const bytes=new Uint8Array(await file.arrayBuffer());if(file.type==='image/png'||file.name.toLowerCase().endsWith('.png'))return doc.embedPng(bytes);return doc.embedJpg(bytes)}

async function qpdfRun(file:File, args:(input:string,output:string)=>string[]){const qpdf=await loadQpdf(),stamp=`${Date.now()}-${Math.random().toString(36).slice(2)}`,input=`/input-${stamp}.pdf`,output=`/output-${stamp}.pdf`;qpdf.FS.writeFile(input,new Uint8Array(await file.arrayBuffer()));try{const code=qpdf.callMain(args(input,output));if(code!==0)throw new Error(`QPDF exited with code ${code}`);const out=qpdf.FS.readFile(output);return new Uint8Array(out)}finally{try{qpdf.FS.unlink(input)}catch{}try{qpdf.FS.unlink(output)}catch{}}}

async function renderPdf(file:File,type:'image/png'|'image/jpeg'){const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/wasm/pdf.worker.min.mjs';const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,downloads:Download[]=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),viewport=page.getViewport({scale:2}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext('2d')!;await page.render({canvasContext:ctx,viewport} as any).promise;const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Unable to render page')),type,.92));downloads.push({name:`controols-page-${i}.${type==='image/png'?'png':'jpg'}`,url:URL.createObjectURL(blob)})}return downloads}

export default function PdfToolRunner({tool,locale}:{tool:Tool;locale:Locale}){
  const t=copy[locale], [files,setFiles]=useState<File[]>([]),[option,setOption]=useState(''),[output,setOutput]=useState(''),[downloads,setDownloads]=useState<Download[]>([]),[busy,setBusy]=useState(false),[preview,setPreview]=useState('');
  const multiple=['merge-pdf','images-to-pdf','add-image-to-pdf'].includes(tool.slug);
  const imageInput=['jpg-to-pdf','png-to-pdf','images-to-pdf'].includes(tool.slug);
  const hint=useMemo(()=>({
    'split-pdf':'Leave blank to split every page','extract-pdf-pages':'1-3,5','delete-pdf-pages':'2,4','reorder-pdf-pages':'3,1,2,4','rotate-pdf-pages':'90|1-3','add-pdf-watermark':'CONFIDENTIAL|0.18','add-page-numbers-to-pdf':'Page {n} of {total}','add-text-to-pdf':'Text|x|y|size|1-3','add-image-to-pdf':'opacity|width|x|y','sign-pdf':'Your Name|40|40|26','fill-pdf-form':'{"fullName":"Ana","agree":true}','protect-pdf':'password','unlock-pdf':'password','blank-pdf-creator':'A4|3'
  } as Record<string,string>)[tool.slug]||'Optional settings',[tool.slug]);
  function clearDownloads(){downloads.forEach(d=>URL.revokeObjectURL(d.url));setDownloads([])}
  async function process(){setBusy(true);setOutput('');clearDownloads();try{
    if(tool.slug==='blank-pdf-creator'){const [size='A4',countRaw='1']=option.split('|'),count=Math.max(1,Math.min(100,Number(countRaw)||1)),sizes:Record<string,[number,number]>={A4:[595.28,841.89],LETTER:[612,792],LEGAL:[612,1008],A3:[841.89,1190.55]},dims=sizes[size.toUpperCase()]||size.split(/[x,]/).map(Number) as [number,number],doc=await PDFDocument.create();for(let i=0;i<count;i++)doc.addPage(dims);const d=await save(doc,'controols-blank.pdf');setDownloads([d]);setPreview(d.url);setOutput(`${count} pages · ${dims[0]} × ${dims[1]} pt`);setBusy(false);return}
    if(!files.length)throw new Error('Select a file first.');
    if(tool.slug==='pdf-to-jpg'||tool.slug==='pdf-to-png'){const ds=await renderPdf(files[0],tool.slug.endsWith('png')?'image/png':'image/jpeg');setDownloads(ds);setOutput(`${ds.length} pages rendered locally.`);setBusy(false);return}
    if(tool.slug==='merge-pdf'){const out=await PDFDocument.create();for(const file of files){const doc=await PDFDocument.load(await file.arrayBuffer());const pages=await out.copyPages(doc,doc.getPageIndices());pages.forEach(p=>out.addPage(p))}const d=await save(out,'controols-merged.pdf');setDownloads([d]);setPreview(d.url);setOutput(`${files.length} PDFs merged · ${out.getPageCount()} pages`);setBusy(false);return}
    if(imageInput){const doc=await PDFDocument.create();for(const file of files){const img=await embedImage(doc,file),page=doc.addPage([img.width,img.height]);page.drawImage(img,{x:0,y:0,width:img.width,height:img.height})}const d=await save(doc,'controols-images.pdf');setDownloads([d]);setPreview(d.url);setOutput(`${files.length} image(s) · ${doc.getPageCount()} page(s)`);setBusy(false);return}
    if(['compress-pdf','protect-pdf','unlock-pdf'].includes(tool.slug)){let bytes:Uint8Array;if(tool.slug==='compress-pdf')bytes=await qpdfRun(files[0],(input,out)=>['--object-streams=generate','--compress-streams=y','--recompress-flate','--compression-level=9',input,out]);else if(tool.slug==='protect-pdf'){const password=option||'controols';bytes=await qpdfRun(files[0],(input,out)=>['--encrypt',password,password,'256','--',input,out])}else{const password=option||'';bytes=await qpdfRun(files[0],(input,out)=>[`--password=${password}`,'--decrypt',input,out])}const d=urlFor(bytes,`controols-${tool.slug}.pdf`);setDownloads([d]);setPreview(d.url);setOutput(`${(files[0].size/1024).toFixed(1)} KB → ${(bytes.length/1024).toFixed(1)} KB`);setBusy(false);return}
    const original=await PDFDocument.load(await files[0].arrayBuffer());const total=original.getPageCount();
    if(tool.slug==='split-pdf'){const groups=option.trim()?option.split(';'):allPages(total).map(i=>String(i+1));const ds:Download[]=[];for(let i=0;i<groups.length;i++){const ids=rangePages(groups[i],total),doc=await PDFDocument.create(),pages=await doc.copyPages(original,ids);pages.forEach(p=>doc.addPage(p));ds.push(await save(doc,`controols-split-${i+1}.pdf`))}setDownloads(ds);setOutput(`${ds.length} PDF files created.`);setBusy(false);return}
    if(tool.slug==='extract-pdf-pages'||tool.slug==='reorder-pdf-pages'){const ids=tool.slug==='reorder-pdf-pages'?option.split(',').map(x=>Number(x.trim())-1).filter(x=>x>=0&&x<total):rangePages(option||'1',total),doc=await PDFDocument.create(),pages=await doc.copyPages(original,ids);pages.forEach(p=>doc.addPage(p));const d=await save(doc,`controols-${tool.slug}.pdf`);setDownloads([d]);setPreview(d.url);setOutput(`${ids.length} pages`);setBusy(false);return}
    if(tool.slug==='delete-pdf-pages'){const ids=rangePages(option,total).sort((a,b)=>b-a);ids.forEach(i=>original.removePage(i))}
    else if(tool.slug==='rotate-pdf-pages'){const [degRaw='90',range='']=option.split('|'),deg=Number(degRaw)||90,ids=range?rangePages(range,total):allPages(total);ids.forEach(i=>original.getPage(i).setRotation(degrees(deg)))}
    else if(tool.slug==='add-pdf-watermark'){const [text='CONTROOLS',opacityRaw='.18']=option.split('|'),font=await original.embedFont(StandardFonts.HelveticaBold),opacity=Math.max(.05,Math.min(1,Number(opacityRaw)||.18));original.getPages().forEach(page=>{const {width,height}=page.getSize(),size=Math.max(24,Math.min(72,width/9));page.drawText(text,{x:width*.12,y:height*.48,size,font,color:rgb(.45,.45,.45),opacity,rotate:degrees(35)})})}
    else if(tool.slug==='add-page-numbers-to-pdf'){const font=await original.embedFont(StandardFonts.Helvetica),template=option||'Page {n} of {total}';original.getPages().forEach((page,i)=>{const text=template.replace('{n}',String(i+1)).replace('{total}',String(total)),size=10,width=font.widthOfTextAtSize(text,size);page.drawText(text,{x:(page.getWidth()-width)/2,y:18,size,font,color:rgb(.25,.25,.25)})})}
    else if(tool.slug==='add-text-to-pdf'){const [text='Text',x='40',y='40',size='18',range='']=option.split('|'),font=await original.embedFont(StandardFonts.Helvetica),ids=range?rangePages(range,total):allPages(total);ids.forEach(i=>original.getPage(i).drawText(text,{x:Number(x)||40,y:Number(y)||40,size:Number(size)||18,font,color:rgb(.1,.1,.1)}))}
    else if(tool.slug==='add-image-to-pdf'){if(!files[1])throw new Error('Select a PDF and a PNG/JPG image.');const img=await embedImage(original,files[1]),[opacityRaw='.8',widthRaw='150',xRaw='30',yRaw='30']=option.split('|'),w=Number(widthRaw)||150,h=img.height*w/img.width;original.getPages().forEach(page=>page.drawImage(img,{x:Number(xRaw)||30,y:Number(yRaw)||30,width:w,height:h,opacity:Number(opacityRaw)||.8}))}
    else if(tool.slug==='sign-pdf'){const [name='Signature',x='40',y='40',size='28']=option.split('|'),font=await original.embedFont(StandardFonts.HelveticaOblique);original.getPage(0).drawText(name,{x:Number(x)||40,y:Number(y)||40,size:Number(size)||28,font,color:rgb(.05,.12,.25)})}
    else if(tool.slug==='fill-pdf-form'){const values=JSON.parse(option||'{}') as Record<string,unknown>,form=original.getForm();for(const field of form.getFields()){const value=values[field.getName()];if(value===undefined)continue;const f=field as any;if(typeof f.setText==='function')f.setText(String(value));else if(typeof f.check==='function'&&value)f.check();else if(typeof f.uncheck==='function'&&!value)f.uncheck();else if(typeof f.select==='function')f.select(String(value))}}
    else if(tool.slug==='flatten-pdf'){original.getForm().flatten()}
    else if(tool.slug==='pdf-page-size'){setOutput(JSON.stringify(original.getPages().map((p,i)=>({page:i+1,widthPt:Number(p.getWidth().toFixed(2)),heightPt:Number(p.getHeight().toFixed(2)),widthMm:Number((p.getWidth()*25.4/72).toFixed(2)),heightMm:Number((p.getHeight()*25.4/72).toFixed(2))})),null,2));setBusy(false);return}
    else if(tool.slug==='pdf-metadata-viewer'){setOutput(JSON.stringify({title:original.getTitle(),author:original.getAuthor(),subject:original.getSubject(),keywords:original.getKeywords(),creator:original.getCreator(),producer:original.getProducer(),creationDate:original.getCreationDate(),modificationDate:original.getModificationDate(),pages:total},null,2));setBusy(false);return}
    else if(tool.slug==='pdf-metadata-remover'){original.setTitle('');original.setAuthor('');original.setSubject('');original.setKeywords([]);original.setCreator('');original.setProducer('')}
    const d=await save(original,`controols-${tool.slug}.pdf`);setDownloads([d]);setPreview(d.url);setOutput(`${original.getPageCount()} pages · ready`)
  }catch(e){setOutput(`Error: ${e instanceof Error?e.message:'Unable to process PDF'}`)}setBusy(false)}

  return <section className="runner asset-runner pdf-runner"><div className="asset-controls"><label className="drop-zone"><input type="file" accept={imageInput?'image/jpeg,image/png':multiple?'application/pdf,image/jpeg,image/png':'application/pdf'} multiple={multiple} onChange={e=>setFiles(Array.from(e.target.files||[]))}/><strong>Select {multiple?'files':'file'}</strong><span>{files.map(f=>`${f.name} · ${(f.size/1024).toFixed(1)} KB`).join('\n')||'PDF processing stays on this device'}</span></label>{!['pdf-page-size','pdf-metadata-viewer','pdf-metadata-remover','flatten-pdf','merge-pdf','jpg-to-pdf','png-to-pdf','images-to-pdf','pdf-to-jpg','pdf-to-png','compress-pdf'].includes(tool.slug)&&<label><span>Settings</span><textarea className="small-option" value={option} onChange={e=>setOption(e.target.value)} placeholder={hint}/></label>}<button className="primary" onClick={process} disabled={busy}>{busy?'…':t.run}</button></div><div className="asset-result">{preview?<iframe className="pdf-preview" src={preview} title="PDF preview"/>:<div className="preview-empty">▤</div>}<textarea readOnly value={output} placeholder={t.output}/>{downloads.length>0&&<div className="download-list">{downloads.map((d,i)=><a className="download-button" href={d.url} download={d.name} key={`${d.name}-${i}`}>↓ {d.name}</a>)}</div>}</div></section>
}
