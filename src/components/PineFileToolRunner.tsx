'use client';

import { useState } from 'react';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

type Dl={name:string;url:string};
const ui:Record<Locale,{choose:string;chooseMany:string;drag:string;options:string;download:string}>={
  en:{choose:'Choose file',chooseMany:'Choose files',drag:'or drag and drop here',options:'Options',download:'Download'},
  pt:{choose:'Escolher arquivo',chooseMany:'Escolher arquivos',drag:'ou arraste e solte aqui',options:'Opções',download:'Baixar'},
  es:{choose:'Elegir archivo',chooseMany:'Elegir archivos',drag:'o arrastra y suelta aquí',options:'Opciones',download:'Descargar'},
  zh:{choose:'选择文件',chooseMany:'选择多个文件',drag:'或拖放到这里',options:'选项',download:'下载'},
  hi:{choose:'फ़ाइल चुनें',chooseMany:'फ़ाइलें चुनें',drag:'या यहाँ खींचकर छोड़ें',options:'विकल्प',download:'डाउनलोड'}
};
function sizeFrom(text:string,def=1024*1024){const m=text.trim().match(/([\d.]+)\s*(b|kb|mb|gb)?/i);if(!m)return def;const n=Number(m[1]),u=(m[2]||'b').toLowerCase(),mul=u==='gb'?1073741824:u==='mb'?1048576:u==='kb'?1024:1;return Math.max(1,Math.floor(n*mul))}
function randomBytes(size:number){const out=new Uint8Array(size);for(let offset=0;offset<size;offset+=65536)crypto.getRandomValues(out.subarray(offset,Math.min(size,offset+65536)));return out}
export default function PineFileToolRunner({tool,locale}:{tool:Tool;locale:Locale}){
  const t=copy[locale],u=ui[locale],[files,setFiles]=useState<File[]>([]),[text,setText]=useState(''),[option,setOption]=useState(''),[downloads,setDownloads]=useState<Dl[]>([]),[output,setOutput]=useState(''),[busy,setBusy]=useState(false);
  const multiple=tool.slug==='join-files',textInput=tool.slug==='base64-decode-file',generator=['random-file-generator','corrupt-file-generator'].includes(tool.slug),hasInput=textInput?Boolean(text.trim()):generator||files.length>0;
  function clear(){downloads.forEach(d=>URL.revokeObjectURL(d.url));setDownloads([]);setOutput('')}
  async function process(){setBusy(true);clear();try{
    if(tool.slug==='random-file-generator'||tool.slug==='corrupt-file-generator'){const sz=Math.min(sizeFrom(option||'1mb'),128*1048576),ext=(option.match(/\.(\w+)/)?.[1]||option.match(/\b(pdf|zip|jpg|png|docx|bin)\b/i)?.[1]||'bin').toLowerCase(),bytes=randomBytes(sz),blob=new Blob([bytes]),d={name:`controols-${tool.slug}.${ext}`,url:URL.createObjectURL(blob)};setDownloads([d]);setOutput(`${(sz/1048576).toFixed(2)} MB`);return}
    if(tool.slug==='base64-decode-file'){const raw=text.includes(',')?text.split(',').pop()!:text,bin=atob(raw.replace(/\s+/g,'')),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0)),d={name:'controols-decoded-file.bin',url:URL.createObjectURL(new Blob([bytes]))};setDownloads([d]);setOutput(`${bytes.length} bytes`);return}
    if(!files.length)throw new Error('Choose a file first.');
    if(tool.slug==='base64-encode-file'){const value=await new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',').pop()||'');r.onerror=()=>rej(r.error);r.readAsDataURL(files[0])});setOutput(value);return}
    if(tool.slug==='split-files'){const file=files[0],chunk=Math.min(sizeFrom(option||'1mb'),Math.max(1,file.size)),buf=new Uint8Array(await file.arrayBuffer()),ds:Dl[]=[];for(let start=0,i=1;start<buf.length;start+=chunk,i++){const part=buf.slice(start,Math.min(buf.length,start+chunk)),name=`${file.name}.part${String(i).padStart(3,'0')}`;ds.push({name,url:URL.createObjectURL(new Blob([part]))})}setDownloads(ds);setOutput(`${ds.length} parts · ${(chunk/1048576).toFixed(2)} MB max each`);return}
    if(tool.slug==='join-files'){const buffers=await Promise.all(files.map(f=>f.arrayBuffer())),d={name:option.trim()||'controols-joined-file.bin',url:URL.createObjectURL(new Blob(buffers))};setDownloads([d]);setOutput(`${files.length} parts joined`);return}
    if(tool.slug==='corrupt-file'){const file=files[0],bytes=new Uint8Array(await file.arrayBuffer()),pct=Math.max(.001,Math.min(.25,(Number(option)||1)/100)),changes=Math.max(1,Math.floor(bytes.length*pct));for(let i=0;i<changes;i++){const p=Math.floor(Math.random()*bytes.length);bytes[p]=Math.floor(Math.random()*256)}const d={name:`corrupted-${file.name}`,url:URL.createObjectURL(new Blob([bytes],{type:file.type}))};setDownloads([d]);setOutput(`${changes} bytes modified (${(pct*100).toFixed(2)}%)`);return}
  }catch(e){setOutput(`Error: ${e instanceof Error?e.message:'Unable to process file'}`)}finally{setBusy(false)}}
  return <section className="runner asset-runner"><div className="asset-controls">{textInput?<label><span>{t.input}</span><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Base64…"/></label>:!generator&&<label className="drop-zone compact-upload"><input type="file" multiple={multiple} onChange={e=>{clear();setFiles(Array.from(e.target.files||[]))}}/><strong>{multiple?u.chooseMany:u.choose}</strong><span>{files.length?files.map(f=>f.name).join('\n'):u.drag}</span></label>}{hasInput&&<div className="tool-options"><div className="tool-options-title">{u.options}</div><label className="option-field"><input value={option} onChange={e=>setOption(e.target.value)} placeholder={tool.slug==='split-files'?'1 MB':tool.slug==='join-files'?'output.bin':tool.slug==='corrupt-file'?'1 (%)':'1 MB .bin'}/></label></div>}{hasInput&&<button className="primary big-action" onClick={process} disabled={busy}>{busy?'…':t.run}</button>}</div>{(output||downloads.length>0)&&<div className="asset-result result-after">{output&&<pre className="result-text">{output}</pre>}{downloads.length>0&&<div className="download-list">{downloads.map((d,i)=><a className="download-button" href={d.url} download={d.name} key={i}>↓ {d.name}</a>)}</div>}</div>}</section>
}
