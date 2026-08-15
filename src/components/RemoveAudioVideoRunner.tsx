'use client';

import { useState } from 'react';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';

type FFmpegInstance={load(config:{coreURL:string;wasmURL:string}):Promise<boolean>;writeFile(path:string,data:Uint8Array):Promise<void>;readFile(path:string):Promise<Uint8Array|string>;deleteFile(path:string):Promise<void>;exec(args:string[]):Promise<number>};
let ffmpegPromise:Promise<FFmpegInstance>|null=null;
async function getFFmpeg(){if(!ffmpegPromise)ffmpegPromise=(async()=>{const{FFmpeg}=await import('@ffmpeg/ffmpeg');const f=new FFmpeg() as unknown as FFmpegInstance;await f.load({coreURL:'/wasm/ffmpeg-core.js',wasmURL:'/wasm/ffmpeg-core.wasm'});return f})();return ffmpegPromise}
function ext(name:string){return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'bin'}
const T:Record<Locale,{choose:string;drag:string;run:string;working:string;download:string;done:string}>={
 en:{choose:'Choose video',drag:'or drag and drop here',run:'Remove audio',working:'Processing…',download:'Download video',done:'Video without audio'},
 pt:{choose:'Escolher vídeo',drag:'ou arraste e solte aqui',run:'Remover áudio',working:'Processando…',download:'Baixar vídeo',done:'Vídeo sem áudio'},
 es:{choose:'Elegir video',drag:'o arrastra y suelta aquí',run:'Quitar audio',working:'Procesando…',download:'Descargar video',done:'Video sin audio'},
 zh:{choose:'选择视频',drag:'或拖放到这里',run:'移除音频',working:'处理中…',download:'下载视频',done:'无音频视频'},
 hi:{choose:'वीडियो चुनें',drag:'या यहाँ खींचकर छोड़ें',run:'ऑडियो हटाएँ',working:'प्रोसेस हो रहा है…',download:'वीडियो डाउनलोड करें',done:'बिना ऑडियो का वीडियो'}
};

export default function RemoveAudioVideoRunner({tool,locale}:{tool:Tool;locale:Locale}){
  const t=T[locale],common=copy[locale],[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<{url:string;size:number}|null>(null);
  function clearResult(){if(result)URL.revokeObjectURL(result.url);setResult(null)}
  async function process(){if(!file||busy)return;setBusy(true);setError('');clearResult();const ff=await getFFmpeg(),input=`remove-audio-input.${ext(file.name)}`,output='remove-audio-output.mp4';
    try{
      await ff.writeFile(input,new Uint8Array(await file.arrayBuffer()));
      const code=await ff.exec(['-i',input,'-map','0:v:0','-an','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',output]);
      if(code!==0)throw new Error('FFmpeg could not process this video.');
      const raw=await ff.readFile(output),bytes=typeof raw==='string'?new TextEncoder().encode(raw):new Uint8Array(raw),blob=new Blob([bytes],{type:'video/mp4'});
      setResult({url:URL.createObjectURL(blob),size:blob.size});
    }catch(e){setError(e instanceof Error?e.message:'Unable to remove audio from this video.')}finally{
      try{await ff.deleteFile(input)}catch{}try{await ff.deleteFile(output)}catch{}setBusy(false);
    }
  }
  return <section className="runner asset-runner">
    <div className="asset-controls">
      <label className="drop-zone"><input type="file" accept="video/*" onChange={e=>{setFile(e.target.files?.[0]||null);setError('');clearResult()}}/><strong>{file?file.name:t.choose}</strong><span>{t.drag}</span></label>
      <button className="primary" disabled={!file||busy} onClick={process}>{busy?t.working:t.run}</button>
    </div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {result&&<div className="asset-result"><div className="result-summary">{t.done} · {(result.size/1024/1024).toFixed(2)} MB</div><video src={result.url} controls/><a className="download-button" href={result.url} download={`controols-${tool.slug}.mp4`}>{t.download}</a></div>}
    <p className="runner-note">{common.browserNote}</p>
  </section>;
}
