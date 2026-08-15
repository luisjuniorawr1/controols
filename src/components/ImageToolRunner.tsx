'use client';

import { useMemo, useState } from 'react';
import * as exifr from 'exifr';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

type Loaded = { image: HTMLImageElement; width: number; height: number };

function loadSource(src: string): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ image, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('This image cannot be decoded by your browser.'));
    image.src = src;
  });
}

async function loadFile(file: File) {
  const url = URL.createObjectURL(file);
  try { return await loadSource(url); } finally { URL.revokeObjectURL(url); }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c;
}

function blobFromCanvas(c: HTMLCanvasElement, type = 'image/png', quality?: number) {
  return new Promise<Blob>((resolve, reject) => c.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to export image.')), type, quality));
}

function drawBase(source: Loaded, width = source.width, height = source.height) {
  const c = canvas(width, height); const ctx = c.getContext('2d')!; ctx.drawImage(source.image, 0, 0, width, height); return c;
}

function nums(input: string) { return input.split(/[|,;\s]+/).map(Number).filter(Number.isFinite); }
function extFor(type: string) { return type === 'image/jpeg' ? 'jpg' : type === 'image/webp' ? 'webp' : 'png'; }
function objectDownload(blob: Blob, slug: string) { return { url: URL.createObjectURL(blob), name: `controols-${slug}.${extFor(blob.type)}` }; }

function outputType(slug: string, original: string) {
  if (['png-to-jpg','webp-to-jpg','bmp-to-jpg'].includes(slug) || slug === 'compress-jpg') return 'image/jpeg';
  if (['jpg-to-webp','png-to-webp'].includes(slug) || slug === 'compress-webp') return 'image/webp';
  if (['jpg-to-png','webp-to-png','bmp-to-png','svg-to-png','gif-to-png','compress-png'].includes(slug)) return 'image/png';
  return ['image/jpeg','image/png','image/webp'].includes(original) ? original : 'image/png';
}

function applyConvolution(c: HTMLCanvasElement, kernel: number[]) {
  const ctx=c.getContext('2d')!,src=ctx.getImageData(0,0,c.width,c.height),out=ctx.createImageData(c.width,c.height),side=Math.round(Math.sqrt(kernel.length)),half=Math.floor(side/2);
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)for(let ch=0;ch<4;ch++){if(ch===3){out.data[(y*c.width+x)*4+ch]=src.data[(y*c.width+x)*4+ch];continue}let sum=0;for(let ky=0;ky<side;ky++)for(let kx=0;kx<side;kx++){const px=Math.min(c.width-1,Math.max(0,x+kx-half)),py=Math.min(c.height-1,Math.max(0,y+ky-half));sum+=src.data[(py*c.width+px)*4+ch]*kernel[ky*side+kx]}out.data[(y*c.width+x)*4+ch]=Math.max(0,Math.min(255,sum))}ctx.putImageData(out,0,0);
}

function crcTable() { const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}return table; }
const CRC_TABLE=crcTable();
function crc32(data: Uint8Array){let c=0xffffffff;for(const b of data)c=CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function u32(n:number){return new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255])}
async function pngWithDpi(blob: Blob, dpi: number) {
  const src=new Uint8Array(await blob.arrayBuffer());
  if(src.length<8||String.fromCharCode(...src.slice(1,4))!=='PNG') return blob;
  const ppm=Math.round(dpi/0.0254),type=new TextEncoder().encode('pHYs'),data=new Uint8Array(9);data.set(u32(ppm),0);data.set(u32(ppm),4);data[8]=1;
  const crcInput=new Uint8Array(type.length+data.length);crcInput.set(type);crcInput.set(data,type.length);
  const chunk=new Uint8Array(4+4+9+4);chunk.set(u32(9),0);chunk.set(type,4);chunk.set(data,8);chunk.set(u32(crc32(crcInput)),17);
  let pos=8;while(pos+8<src.length){const len=(src[pos]<<24)|(src[pos+1]<<16)|(src[pos+2]<<8)|src[pos+3],name=String.fromCharCode(...src.slice(pos+4,pos+8));if(name==='IDAT')break;pos+=12+len}
  const out=new Uint8Array(src.length+chunk.length);out.set(src.slice(0,pos));out.set(chunk,pos);out.set(src.slice(pos),pos+chunk.length);return new Blob([out],{type:'image/png'});
}

const ui:Record<Locale,{choose:string;chooseTwo:string;drag:string;options:string;width:string;height:string;download:string}>={
  en:{choose:'Choose image',chooseTwo:'Choose 2 images',drag:'or drag and drop here',options:'Options',width:'Width',height:'Height',download:'Download image'},
  pt:{choose:'Escolher imagem',chooseTwo:'Escolher 2 imagens',drag:'ou arraste e solte aqui',options:'Opções',width:'Largura',height:'Altura',download:'Baixar imagem'},
  es:{choose:'Elegir imagen',chooseTwo:'Elegir 2 imágenes',drag:'o arrastra y suelta aquí',options:'Opciones',width:'Ancho',height:'Alto',download:'Descargar imagen'},
  zh:{choose:'选择图片',chooseTwo:'选择 2 张图片',drag:'或拖放到这里',options:'选项',width:'宽度',height:'高度',download:'下载图片'},
  hi:{choose:'चित्र चुनें',chooseTwo:'2 चित्र चुनें',drag:'या यहाँ खींचकर छोड़ें',options:'विकल्प',width:'चौड़ाई',height:'ऊँचाई',download:'चित्र डाउनलोड करें'}
};

export default function ImageToolRunner({ tool, locale }: { tool: Tool; locale: Locale }) {
  const t=copy[locale],u=ui[locale]; const [files,setFiles]=useState<File[]>([]); const [option,setOption]=useState(''); const [base64,setBase64]=useState(''); const [preview,setPreview]=useState(''); const [output,setOutput]=useState(''); const [download,setDownload]=useState<{url:string;name:string}|null>(null); const [busy,setBusy]=useState(false);
  const needsSecond=tool.slug==='add-image-watermark'; const base64Input=tool.slug==='base64-to-image';
  const hint=useMemo(()=>({
    'resize-image-by-percent':'50','crop-image':'x, y, width, height','adjust-image-brightness':'120','adjust-image-contrast':'120','adjust-image-saturation':'120','blur-image':'6','pixelate-image':'12','add-text-watermark':'CONTROOLS | x | y | size','add-image-watermark':'0.45','image-color-picker':'x, y','change-image-dpi':'300','compress-jpg':'75','compress-webp':'75'
  } as Record<string,string>)[tool.slug]||'', [tool.slug]);
  const noOptions=['view-image-metadata','image-to-base64','image-dimensions','remove-image-metadata','make-square-image','create-favicon','jpg-to-png','png-to-jpg','jpg-to-webp','png-to-webp','webp-to-jpg','webp-to-png','bmp-to-jpg','bmp-to-png','svg-to-png','gif-to-png','grayscale-image','sepia-image','invert-image-colors','sharpen-image','rotate-image-left','rotate-image-right','flip-image-horizontal','flip-image-vertical'].includes(tool.slug);
  const hasInput=base64Input?Boolean(base64.trim()):files.length>0;
  const hasResult=Boolean(preview||output||download);

  function setResizePart(index:number,value:string){const parts=option.split(',');parts[index]=value;setOption(parts.join(','))}
  function clearDownload(){ if(download)URL.revokeObjectURL(download.url);setDownload(null); }
  async function process(){setBusy(true);setOutput('');clearDownload();try{
    if(base64Input){const src=base64.trim();const loaded=await loadSource(src);setPreview(src);setOutput(`${loaded.width} × ${loaded.height}px`);const res=await fetch(src);const blob=await res.blob();setDownload(objectDownload(blob,tool.slug));setBusy(false);return}
    const file=files[0];if(!file)throw new Error('Select an image first.');
    if(tool.slug==='view-image-metadata'){const meta=await exifr.parse(file,{tiff:true,exif:true,gps:true,icc:true,iptc:true,xmp:true});setOutput(JSON.stringify({file:{name:file.name,size:file.size,type:file.type},metadata:meta||{}},null,2));setPreview(URL.createObjectURL(file));setBusy(false);return}
    if(tool.slug==='image-to-base64'){const value=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(file)});setBase64(value);setOutput(value);setPreview(value);setBusy(false);return}
    const source=await loadFile(file); let c=drawBase(source); let type=outputType(tool.slug,file.type); let quality=0.9; const n=nums(option);
    if(tool.slug.startsWith('compress-'))quality=Math.max(.05,Math.min(1,(n[0]||75)/100));
    if(tool.slug==='resize-image'){const w=n[0]||source.width,h=n[1]||Math.round(source.height*w/source.width);c=drawBase(source,w,h)}
    if(tool.slug==='resize-image-by-percent'){const p=(n[0]||50)/100;c=drawBase(source,source.width*p,source.height*p)}
    if(tool.slug==='crop-image'){const [x=0,y=0,w=source.width,h=source.height]=n;c=canvas(w,h);c.getContext('2d')!.drawImage(source.image,x,y,w,h,0,0,w,h)}
    if(tool.slug==='rotate-image-left'||tool.slug==='rotate-image-right'){c=canvas(source.height,source.width);const ctx=c.getContext('2d')!;ctx.translate(c.width/2,c.height/2);ctx.rotate((tool.slug.endsWith('left')?-90:90)*Math.PI/180);ctx.drawImage(source.image,-source.width/2,-source.height/2)}
    if(tool.slug==='flip-image-horizontal'||tool.slug==='flip-image-vertical'){c=canvas(source.width,source.height);const ctx=c.getContext('2d')!;ctx.translate(tool.slug.endsWith('horizontal')?source.width:0,tool.slug.endsWith('vertical')?source.height:0);ctx.scale(tool.slug.endsWith('horizontal')?-1:1,tool.slug.endsWith('vertical')?-1:1);ctx.drawImage(source.image,0,0)}
    const filter:Record<string,string>={'grayscale-image':'grayscale(1)','sepia-image':'sepia(1)','invert-image-colors':'invert(1)','adjust-image-brightness':`brightness(${n[0]||120}%)`,'adjust-image-contrast':`contrast(${n[0]||120}%)`,'adjust-image-saturation':`saturate(${n[0]||120}%)`,'blur-image':`blur(${n[0]||6}px)`};
    if(filter[tool.slug]){c=canvas(source.width,source.height);const ctx=c.getContext('2d')!;ctx.filter=filter[tool.slug];ctx.drawImage(source.image,0,0)}
    if(tool.slug==='sharpen-image'){c=drawBase(source);applyConvolution(c,[0,-1,0,-1,5,-1,0,-1,0])}
    if(tool.slug==='pixelate-image'){const size=Math.max(2,n[0]||12),small=canvas(Math.ceil(source.width/size),Math.ceil(source.height/size));small.getContext('2d')!.drawImage(source.image,0,0,small.width,small.height);c=canvas(source.width,source.height);const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(small,0,0,c.width,c.height)}
    if(tool.slug==='add-text-watermark'){const [text='CONTROOLS',xs='40',ys='40',ss='36']=option.split('|');c=drawBase(source);const ctx=c.getContext('2d')!;ctx.font=`700 ${Number(ss)||36}px system-ui`;ctx.fillStyle='rgba(255,255,255,.72)';ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.strokeText(text,Number(xs)||40,Number(ys)||40);ctx.fillText(text,Number(xs)||40,Number(ys)||40)}
    if(tool.slug==='add-image-watermark'){if(!files[1])throw new Error('Select the main image and a watermark image.');const wm=await loadFile(files[1]);c=drawBase(source);const ctx=c.getContext('2d')!,opacity=Math.max(0,Math.min(1,n[0]||.45)),w=Math.min(source.width*.28,wm.width),h=wm.height*w/wm.width;ctx.globalAlpha=opacity;ctx.drawImage(wm.image,source.width-w-24,source.height-h-24,w,h);ctx.globalAlpha=1}
    if(tool.slug==='image-color-picker'){const [x=0,y=0]=n;c=drawBase(source);const d=c.getContext('2d')!.getImageData(Math.min(c.width-1,Math.max(0,x)),Math.min(c.height-1,Math.max(0,y)),1,1).data;setOutput(`RGB(${d[0]}, ${d[1]}, ${d[2]}) · #${[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()}`);setPreview(URL.createObjectURL(file));setBusy(false);return}
    if(tool.slug==='image-dimensions'){setOutput(JSON.stringify({width:source.width,height:source.height,megapixels:Number((source.width*source.height/1e6).toFixed(2)),aspectRatio:Number((source.width/source.height).toFixed(4))},null,2));setPreview(URL.createObjectURL(file));setBusy(false);return}
    if(tool.slug==='make-square-image'){const size=Math.max(source.width,source.height);c=canvas(size,size);const ctx=c.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.drawImage(source.image,(size-source.width)/2,(size-source.height)/2)}
    if(tool.slug==='create-favicon'){c=drawBase(source,32,32);type='image/png'}
    if(tool.slug==='remove-image-metadata'){type=file.type==='image/jpeg'?'image/jpeg':'image/png'}
    if(tool.slug==='change-image-dpi'){type='image/png'}
    let blob=await blobFromCanvas(c,type,quality);if(tool.slug==='change-image-dpi')blob=await pngWithDpi(blob,n[0]||300);
    const d=objectDownload(blob,tool.slug);setDownload(d);setPreview(d.url);setOutput(`${c.width} × ${c.height}px · ${(blob.size/1024).toFixed(1)} KB${tool.slug==='change-image-dpi'?` · ${n[0]||300} DPI`:''}`)
  }catch(e){setOutput(`Error: ${e instanceof Error?e.message:'Unable to process image'}`)}setBusy(false)}

  const optionPanel=!base64Input&&hasInput&&!noOptions?(<div className="tool-options"><div className="tool-options-title">{u.options}</div>{tool.slug==='resize-image'?<div className="option-grid"><label className="option-field"><span>{u.width}</span><input type="number" min="1" value={option.split(',')[0]||''} placeholder="1200" onChange={e=>setResizePart(0,e.target.value)}/></label><label className="option-field"><span>{u.height}</span><input type="number" min="1" value={option.split(',')[1]||''} placeholder="800" onChange={e=>setResizePart(1,e.target.value)}/></label></div>:<label className="option-field"><span>{hint||u.options}</span><input value={option} onChange={e=>setOption(e.target.value)} placeholder={hint}/></label>}</div>):null;

  return <section className="runner asset-runner image-runner"><div className="asset-controls">{base64Input?<label><span>{t.input}</span><textarea value={base64} onChange={e=>setBase64(e.target.value)} placeholder="data:image/png;base64,…"/></label>:<label className="drop-zone"><input type="file" accept="image/*,.svg,.bmp" multiple={needsSecond} onChange={e=>{setFiles(Array.from(e.target.files||[]));setOutput('');setPreview('');clearDownload()}}/><strong>{needsSecond?u.chooseTwo:u.choose}</strong><span>{files.length?files.map(f=>`${f.name} · ${(f.size/1024).toFixed(1)} KB`).join('\n'):u.drag}</span></label>}{optionPanel}{hasInput&&<button className="primary" onClick={process} disabled={busy}>{busy?'…':t.run}</button>}</div>{hasResult&&<div className="asset-result">{preview&&<img src={preview} alt="Image preview"/>}{output&&(output.length>240?<textarea readOnly value={output}/>:<div className="result-summary">{output}</div>)}{download&&<a className="download-button" href={download.url} download={download.name}>{u.download}</a>}</div>}</section>
}
