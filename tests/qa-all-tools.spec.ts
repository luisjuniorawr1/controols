import { test, expect, type Page, type Locator } from '@playwright/test';
import { tools } from '../src/data/extendedCatalog';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import pako from 'pako';

const PNG_BASE64='iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAG0lEQVR4nGP8z8DAwMDAxMDAwMDAgAkYGBgAAB0LAQH3N9qAAAAAAElFTkSuQmCC';
const expansionCategories=new Set(['ai','webseo','print','business','social']);
const imageGenerators=new Set(['random-bitmap-generator','image-gradient-generator','image-radial-gradient-generator','bulk-random-bitmap-generator']);
let png:Buffer,qrPng:Buffer,pdf:Buffer,zip:Buffer,gzip:Buffer,wav:Buffer,webm:Buffer;

function makeWav(){
  const rate=8000,samples=rate,dataSize=samples*2,b=Buffer.alloc(44+dataSize);
  b.write('RIFF',0);b.writeUInt32LE(36+dataSize,4);b.write('WAVE',8);b.write('fmt ',12);
  b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);
  b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(dataSize,40);
  for(let i=0;i<samples;i++){const s=Math.sin(i/rate*Math.PI*2*440)*.18;b.writeInt16LE(Math.round(s*32767),44+i*2)}
  return b;
}
async function createWebm(page:Page){
  const base64=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=64;const ctx=canvas.getContext('2d')!;
    const video=canvas.captureStream(12),AC=window.AudioContext||(window as any).webkitAudioContext,audio=new AC(),osc=audio.createOscillator(),gain=audio.createGain(),dest=audio.createMediaStreamDestination();
    gain.gain.value=.05;osc.frequency.value=440;osc.connect(gain);gain.connect(dest);osc.start();
    const stream=new MediaStream([...video.getVideoTracks(),...dest.stream.getAudioTracks()]);
    const mime=['video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||'video/webm';
    const chunks:BlobPart[]=[];const recorder=new MediaRecorder(stream,{mimeType:mime});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    const stopped=new Promise<void>(resolve=>recorder.onstop=()=>resolve());recorder.start(100);
    for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#ff7a1a':'#111419';ctx.fillRect(0,0,96,64);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(`QA ${i}`,18,36);await new Promise(r=>setTimeout(r,55))}
    recorder.stop();await stopped;osc.stop();stream.getTracks().forEach(t=>t.stop());await audio.close();
    const bytes=new Uint8Array(await new Blob(chunks,{type:mime}).arrayBuffer());let binary='';for(const x of bytes)binary+=String.fromCharCode(x);return btoa(binary);
  });
  return Buffer.from(base64,'base64');
}
test.beforeAll(async({browser})=>{
  png=Buffer.from(PNG_BASE64,'base64');qrPng=await QRCode.toBuffer('CONTROOLS-QA-OK',{type:'png',width:240,margin:2});
  const d=await PDFDocument.create(),p=d.addPage([320,240]),f=await d.embedFont(StandardFonts.Helvetica);p.drawText('CONTROOLS QA',{x:40,y:150,size:24,font:f});pdf=Buffer.from(await d.save());
  const z=new JSZip();z.file('qa.txt','CONTROOLS QA');zip=await z.generateAsync({type:'nodebuffer'});gzip=Buffer.from(pako.gzip(Buffer.from('CONTROOLS QA')));wav=makeWav();
  const page=await browser.newPage();try{webm=await createWebm(page)}finally{await page.close()}
});

function keyOf(elId:string|null){return (elId||'').replace(/^tool-/,'')}
function numericFor(key:string,min:string|null,max:string|null,index:number){
  const exact:Record<string,number>={latitude:-7.0769,longitude:-41.4669,latitude2:-5.0919,longitude2:-42.8034,pixelWidth:1200,pixelHeight:800,width:20,height:10,printWidth:10,printHeight:10,dpi:300,price:100,cost:60,unitCost:10,quantity:10,rate:10,percent:10,percentage:10,amount:10,age:30,year:2026,days:5,months:2,hours:2,minutes:30,seconds:10,count:3,length:12};
  if(key in exact)return String(exact[key]);
  const lo=min!==null?Number(min):NaN,hi=max!==null?Number(max):NaN;
  if(Number.isFinite(lo)&&Number.isFinite(hi))return String(lo<=10&&hi>=10?10:(lo+hi)/2);
  if(Number.isFinite(lo)&&lo>0)return String(Math.max(lo,1));
  if(Number.isFinite(hi)&&hi<10)return String(Math.min(hi,1));
  return String([10,20,30][index%3]);
}
async function encryptedBundle(page:Page,password='Controols123!',message='CONTROOLS QA DECRYPTED'){
  return page.evaluate(async({password,message})=>{
    const enc=new TextEncoder(),digest=await crypto.subtle.digest('SHA-256',enc.encode(password)),key=await crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
    const data=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(message)));
    const b64=(x:Uint8Array)=>btoa(String.fromCharCode(...x));return `${b64(iv)}.${b64(data)}`;
  },{password,message});
}
async function valueFor(page:Page,slug:string,el:Locator,index:number){
  const type=(await el.getAttribute('type'))||((await el.evaluate(e=>e.tagName)).toLowerCase()==='textarea'?'textarea':'text'),key=keyOf(await el.getAttribute('id'));
  if(type==='datetime-local')return '2026-08-15T10:30';
  if(type==='date')return '2026-08-15';
  if(type==='time')return '10:30';
  if(type==='email')return 'qa@example.com';
  if(type==='url')return key==='image'||key==='logo'?'https://example.com/image.png':key==='target'?'https://example.com/new-page':'https://example.com/page?utm_source=qa&utm_medium=test';
  if(type==='password')return 'Controols123!';
  if(type==='number')return numericFor(key,await el.getAttribute('min'),await el.getAttribute('max'),index);
  if(slug==='aes-decrypt-text'&&key==='message')return encryptedBundle(page);
  if(slug==='jwt-decoder')return 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQ29udHJvb2xzIn0.';
  if(['binary-to-text','binary-to-decimal'].includes(slug))return '01000001';
  if(slug==='binary-converter')return '42';
  if(slug==='hex-to-text')return '48656c6c6f';
  if(['hex-to-decimal','hexadecimal-converter'].includes(slug))return 'FF';
  if(slug==='base64-decode')return 'SGVsbG8gQ29udHJvb2xz';
  if(slug==='base32-decode')return 'JBSWY3DPEBLW64TMMQ======';
  if(slug==='morse-to-text')return '.... . .-.. .-.. ---';
  if(slug==='roman-numerals-converter')return '42';
  if(key==='expression')return '10+5*2';
  if(key==='pattern')return '\\d+';
  if(key==='json')return '{"name":"Controols","value":42,"items":[1,2]}';
  if(key==='csv')return 'name,age\nAna,31\nCarlos,28';
  if(key==='yaml')return 'name: Controols\nvalue: 42';
  if(key==='xml')return '<root><name>Controols</name><value>42</value></root>';
  if(key==='html')return '<!doctype html><html><head><title>Controols QA</title><meta name="description" content="Teste de qualidade da Controols"><link rel="canonical" href="https://example.com/qa"></head><body><h1>Título</h1><h2>Seção</h2><a href="https://example.com/page">Link</a></body></html>';
  if(key==='markdown')return '# Controols QA\n\nTexto **forte**.';
  if(key==='query')return 'name=controols&value=42';
  if(key==='email')return 'qa@example.com';if(key==='phone')return '5511999999999';
  if(key==='url'||/url$/i.test(key))return 'https://example.com/page?utm_source=qa&utm_medium=test';
  if(key==='languages')return 'pt=https://example.com/pt/\nen=https://example.com/en/';
  if(key==='questions')return 'O que é a Controols?\nÉ grátis?';if(key==='answers')return 'Uma coleção de ferramentas online.\nSim.';
  if(key==='variables')return 'topic=SEO\ntone=claro';if(key==='template')return 'Crie um conteúdo sobre {{topic}} em tom {{tone}}.';
  if(key==='role')return 'engenheiro especialista';if(key==='goal')return 'criar uma solução prática e completa';if(key==='context')return 'O resultado será usado por uma pequena empresa e precisa ser fácil de aplicar.';
  if(key==='constraints')return 'Não inventar dados\nEvitar respostas genéricas';if(key==='rules')return 'Ser objetivo\nExplicar decisões importantes';if(key==='output'||key==='format')return 'Resposta clara, estruturada e pronta para uso';
  if(key==='tone')return 'profissional e claro';if(key==='topic')return 'como melhorar a presença digital de um negócio local';if(key==='audience')return 'pequenos empresários';
  if(key==='subject')return 'um produto premium sobre uma mesa';if(key==='scene')return 'estúdio minimalista';if(key==='style')return 'fotografia comercial realista';if(key==='lighting')return 'luz suave lateral';if(key==='camera')return '50mm, profundidade de campo suave';if(key==='negative')return 'texto ilegível, artefatos, baixa resolução';
  if(key==='brand')return 'Controols';if(key==='industry')return 'tecnologia e utilidades online';if(key==='values')return 'clareza, velocidade, privacidade';if(key==='colors')return 'laranja, preto e branco';if(key==='product')return 'embalagem premium';if(key==='background')return 'fundo cinza escuro limpo';
  if(key==='task')return 'criar uma função de validação com testes';if(key==='stack')return 'TypeScript e React';if(key==='requirements')return 'Código tipado, legível e com tratamento de erro';if(key==='expertise')return 'produto digital e UX';if(key==='boundaries')return 'Não inventar dados nem esconder limitações';
  if(key==='find')return 'QA';if(key==='replace')return 'QUALIDADE';if(key==='column')return 'name';if(key==='columns')return 'name,age';if(key==='term')return 'Ana';
  if(key==='title')return 'Controols — ferramentas online';if(key==='description')return 'Ferramentas gratuitas e práticas para trabalhar com arquivos, dados, SEO e muito mais.';
  if(key==='name')return 'Controols';if(key==='address')return 'Rua Teste, 100';if(key==='city')return 'Picos';if(key==='region')return 'PI';if(key==='country')return 'BR';if(key==='sku')return 'QA-001';if(key==='currency')return 'BRL';
  if(key==='allow')return '/';if(key==='disallow')return '/private/';if(key==='sitemap')return 'https://example.com/sitemap.xml';if(key==='parameters')return 'utm_source fbclid';if(key==='source'&&slug==='utm-builder')return 'google';if(key==='medium')return 'social';if(key==='campaign')return 'qa';if(key==='content')return 'card-a';
  if(key==='source'){
    if(slug==='extract-emails')return 'Contato principal: qa@example.com e suporte@example.org';
    if(slug==='extract-urls')return 'Veja https://example.com e https://openai.com/teste';
    if(slug==='extract-hashtags')return 'Conteúdo #Controols #QA #Ferramentas';
    if(slug==='extract-numbers')return 'Pedido 123, valor 45.67 e lote 890';
    if(slug==='filter-lines')return 'Ana\nCarlos\nAna QA';
    if(slug.includes('json'))return '{"name":"Controols","value":42}';
    return 'Controols QA teste 123. qa@example.com https://example.com #Controols\nAna QA\nCarlos';
  }
  if(key==='text'||key==='body'||key==='message'||key==='notes')return 'Controols QA teste 123. qa@example.com https://example.com #Controols. Este texto valida a ferramenta.';
  if(slug.includes('json'))return '{"name":"Controols","value":42}';
  if(slug.includes('csv'))return 'name,age\nAna,31\nCarlos,28';
  return 'Controols QA';
}
async function formValues(page:Page){
  return page.locator('.smart-form-runner input[id], .smart-form-runner textarea[id], .smart-form-runner select[id]').evaluateAll(els=>Object.fromEntries(els.map((e:any)=>[e.id.replace(/^tool-/,''),e.value])));
}
async function fillSmart(page:Page,tool:(typeof tools)[number]){
  const slug=tool.slug,fields=page.locator('.smart-form-runner input, .smart-form-runner textarea'),count=await fields.count();let n=0;
  for(let i=0;i<count;i++){const el=fields.nth(i),type=(await el.getAttribute('type'))||'text';if(['file','hidden','color'].includes(type))continue;if((await el.inputValue()).trim())continue;await el.fill(await valueFor(page,slug,el,type==='number'?n++:i))}
  const colors=page.locator('.smart-form-runner input[type=color]');for(let i=0;i<await colors.count();i++)await colors.nth(i).fill('#ff7a1a');
  const before=await formValues(page),button=page.locator('.smart-form-runner .runner-actions button.primary');await expect(button,`${slug}: execute button`).toBeEnabled({timeout:20_000});await button.click();
  await expect(page.locator('.smart-form-runner .simple-output'),`${slug}: expected output`).toBeVisible({timeout:25_000});await expect(page.locator('.smart-form-runner .form-error')).toHaveCount(0);
  const out=(await page.locator('.smart-form-runner .result-text').innerText()).trim();expect(out.length,`${slug}: empty output`).toBeGreaterThan(0);expect(out,`${slug}: executor error`).not.toMatch(/^(Error|Unable|Invalid result|Format:)/im);
  if(expansionCategories.has(String(tool.category)))expect(out,`${slug}: expansion tool only echoed its serialized input`).not.toBe(JSON.stringify(before));
  if(slug==='prompt-builder'){expect(out.length).toBeGreaterThan(300);expect(out).toMatch(/Instruções de execução|Execution instructions|Instrucciones/i)}
  if(slug==='system-prompt-builder')expect(out.length).toBeGreaterThan(220);
  if(slug==='meta-tags-generator'){expect(out).toContain('<title>');expect(out).toContain('meta name="description"')}
  if(slug==='bleed-calculator')expect(out).toMatch(/artworkWithBleed/i);
  if(slug==='aes-decrypt-text')expect(out).toContain('CONTROOLS QA DECRYPTED');
}
async function clickAsset(page:Page,slug:string,timeout=35_000){
  const button=page.locator('.asset-controls button.primary, .asset-controls button.big-action').first();await expect(button,`${slug}: process button`).toBeEnabled({timeout:20_000});await button.click();
  await expect(page.locator('.asset-result'),`${slug}: asset result`).toBeVisible({timeout});const out=(await page.locator('.asset-result').innerText()).trim();expect(out,`${slug}: asset error`).not.toMatch(/^Error:/im);expect(out.length,`${slug}: empty asset result`).toBeGreaterThan(0);
}
async function exerciseImage(page:Page,slug:string){
  if(slug==='base64-to-image'){await page.locator('.asset-controls textarea').first().fill(`data:image/png;base64,${PNG_BASE64}`);await clickAsset(page,slug);return}
  if(slug==='take-screenshot'){test.info().annotations.push({type:'permission',description:'Display-capture picker cannot be automated headlessly; UI presence validated.'});await expect(page.locator('.asset-controls button')).toBeVisible();return}
  if(imageGenerators.has(slug)||await page.locator('.asset-controls input[type=file]').count()===0){await clickAsset(page,slug);return}
  const input=page.locator('.asset-controls input[type=file]').first(),multiple=await input.getAttribute('multiple'),two=slug==='add-image-watermark'||slug.includes('overlay')||slug.includes('merge-images')||Boolean(multiple);
  await input.setInputFiles(two?[{name:'qa-a.png',mimeType:'image/png',buffer:png},{name:'qa-b.png',mimeType:'image/png',buffer:png}]:[{name:'qa.png',mimeType:'image/png',buffer:png}]);await clickAsset(page,slug,45_000);
}
async function exerciseQr(page:Page,slug:string){
  if(['qr-code-reader','barcode-reader'].includes(slug)){const input=page.locator('.asset-controls input[type=file]').first();await input.setInputFiles({name:'qa-qr.png',mimeType:'image/png',buffer:qrPng});await expect(page.locator('.asset-result')).toBeVisible({timeout:25_000});expect((await page.locator('.asset-result').innerText())).toContain('CONTROOLS-QA-OK');return}
  const fields=page.locator('.asset-controls input, .asset-controls textarea');
  for(let i=0;i<await fields.count();i++){const el=fields.nth(i),type=(await el.getAttribute('type'))||'text';if(type==='file')continue;const name=(await el.getAttribute('name'))||'';let value='CONTROOLS QA';
    if(name==='text'){value=slug==='ean13-barcode-generator'?'5901234123457':slug==='ean8-barcode-generator'?'96385074':slug==='upca-barcode-generator'?'036000291452':slug==='itf-barcode-generator'?'12345678901231':slug==='code39-barcode-generator'?'CONTROOLS42':slug==='codabar-generator'?'A123456A':'CONTROOLS QA'}
    else if(name==='network')value='Controols QA';else if(name==='password')value='Senha123';else if(name==='email')value='qa@example.com';else if(name==='phone')value='5511999999999';else if(name==='url')value='https://example.com';else if(name==='latitude')value='-7.0769';else if(name==='longitude')value='-41.4669';else if(name==='start')value='2026-08-15T10:00';else if(name==='end')value='2026-08-15T11:00';else if(name==='title')value='Evento QA';else if(name==='name')value='Controols QA';
    await el.fill(value)
  }await clickAsset(page,slug);
}
async function protectedPdf(page:Page){
  const p=await page.context().newPage();try{
    await p.goto('/pt/tools/protect-pdf/',{waitUntil:'domcontentloaded'});await p.locator('.asset-controls input[type=file]').setInputFiles({name:'qa.pdf',mimeType:'application/pdf',buffer:pdf});
    const passwords=p.locator('.asset-controls input[type=password]');for(let i=0;i<await passwords.count();i++)await passwords.nth(i).fill('Controols123!');
    await p.locator('.asset-controls button.primary').click();await expect(p.locator('.asset-result')).toBeVisible({timeout:40_000});const href=await p.locator('a.download-button').getAttribute('href');if(!href)throw new Error('protected PDF download missing');
    const bytes=await p.evaluate(async href=>Array.from(new Uint8Array(await (await fetch(href)).arrayBuffer())),href);return Buffer.from(bytes);
  }finally{await p.close()}
}
async function exercisePdf(page:Page,slug:string){
  if(slug==='blank-pdf-creator'){await clickAsset(page,slug,40_000);return}
  const input=page.locator('.asset-controls input[type=file]').first();await expect(input).toBeVisible();
  if(slug==='unlock-pdf')await input.setInputFiles({name:'protected.pdf',mimeType:'application/pdf',buffer:await protectedPdf(page)});
  else if(['jpg-to-pdf','png-to-pdf','images-to-pdf'].includes(slug))await input.setInputFiles(slug==='images-to-pdf'?[{name:'a.png',mimeType:'image/png',buffer:png},{name:'b.png',mimeType:'image/png',buffer:png}]:[{name:'a.png',mimeType:'image/png',buffer:png}]);
  else if(slug==='add-image-to-pdf')await input.setInputFiles([{name:'qa.pdf',mimeType:'application/pdf',buffer:pdf},{name:'qa.png',mimeType:'image/png',buffer:png}]);
  else if(slug==='merge-pdf')await input.setInputFiles([{name:'a.pdf',mimeType:'application/pdf',buffer:pdf},{name:'b.pdf',mimeType:'application/pdf',buffer:pdf}]);
  else await input.setInputFiles({name:'qa.pdf',mimeType:'application/pdf',buffer:pdf});
  const passwords=page.locator('.asset-controls input[type=password]');for(let i=0;i<await passwords.count();i++)await passwords.nth(i).fill('Controols123!');
  const tas=page.locator('.asset-controls textarea');for(let i=0;i<await tas.count();i++)if(!(await tas.nth(i).inputValue()).trim())await tas.nth(i).fill('{}');
  await clickAsset(page,slug,55_000);
}
async function exerciseFile(page:Page,slug:string){
  if(['base64-to-file','base64-decode-file'].includes(slug)){await page.locator('.asset-controls textarea').first().fill(Buffer.from('CONTROOLS QA').toString('base64'));await clickAsset(page,slug);return}
  if(await page.locator('.asset-controls input[type=file]').count()===0){const size=page.locator('.asset-controls input[type=number]').first();if(await size.count())await size.fill('0.001');await clickAsset(page,slug);return}
  const input=page.locator('.asset-controls input[type=file]').first();
  if(slug==='unzip-files')await input.setInputFiles({name:'qa.zip',mimeType:'application/zip',buffer:zip});else if(slug==='ungzip-file')await input.setInputFiles({name:'qa.txt.gz',mimeType:'application/gzip',buffer:gzip});
  else if(['zip-files','join-files'].includes(slug))await input.setInputFiles([{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('A')},{name:'b.txt',mimeType:'text/plain',buffer:Buffer.from('B')}]);else await input.setInputFiles({name:'qa.txt',mimeType:'text/plain',buffer:Buffer.from('CONTROOLS QA')});
  const size=page.locator('.asset-controls input[type=number]').first();if(await size.count())await size.fill('0.001');await clickAsset(page,slug,40_000);
}
async function exerciseMedia(page:Page,slug:string,category:string){
  test.slow();const input=page.locator('.asset-controls input[type=file]').first();await expect(input).toBeVisible();
  if(category==='audio')await input.setInputFiles(slug==='merge-audio'?[{name:'a.wav',mimeType:'audio/wav',buffer:wav},{name:'b.wav',mimeType:'audio/wav',buffer:wav}]:[{name:'qa.wav',mimeType:'audio/wav',buffer:wav}]);
  else if(slug==='add-watermark-to-video')await input.setInputFiles([{name:'qa.webm',mimeType:'video/webm',buffer:webm},{name:'wm.png',mimeType:'image/png',buffer:png}]);
  else if(slug==='merge-videos')await input.setInputFiles([{name:'a.webm',mimeType:'video/webm',buffer:webm},{name:'b.webm',mimeType:'video/webm',buffer:webm}]);
  else await input.setInputFiles({name:'qa.webm',mimeType:'video/webm',buffer:webm});
  await clickAsset(page,slug,85_000);
}
async function exerciseInteractive(page:Page,slug:string){
  const button=page.locator('.runner button').first();await expect(button).toBeVisible();if(slug==='screen-recorder'){test.info().annotations.push({type:'permission',description:'Screen recorder requires interactive permission picker; controls validated.'});return}await button.click();await expect(page.locator('.runner')).toBeVisible()
}
async function exercise(page:Page,tool:(typeof tools)[number]){
  const slug=tool.slug,category=String(tool.category);if(await page.locator('.runner-pending').count())throw new Error(`${slug}: still routed to pending UI`);
  if(['timer','stopwatch','screen-recorder'].includes(slug)){await exerciseInteractive(page,slug);return}
  if(category==='qr'){await exerciseQr(page,slug);return}
  if(category==='pdf'){await exercisePdf(page,slug);return}
  if(category==='file'||slug==='file-sha256-checksum'){await exerciseFile(page,slug);return}
  if(category==='video'||category==='audio'){await exerciseMedia(page,slug,category);return}
  if(category==='image'||await page.locator('.asset-runner').count()){await exerciseImage(page,slug);return}
  if(await page.locator('.smart-form-runner').count()){await fillSmart(page,tool);return}
  throw new Error(`${slug}: runner type not covered by QA`);
}

test.describe('CONTROOLS — functional QA for every registered tool',()=>{
  test.describe.configure({mode:'parallel'});
  for(const [index,tool] of tools.entries())test(`${String(index+1).padStart(3,'0')}/${tools.length} ${tool.slug}`,async({page})=>{
    const pageErrors:string[]=[];page.on('pageerror',e=>pageErrors.push(e.message));const response=await page.goto(`/pt/tools/${tool.slug}/`,{waitUntil:'domcontentloaded'});
    expect(response?.ok(),`${tool.slug}: HTTP`).toBeTruthy();await expect(page.locator('h1')).toBeVisible();const description=page.locator('.tool-description').first();await expect(description,`${tool.slug}: description`).toBeVisible();expect((await description.innerText()).trim().length).toBeGreaterThan(20);await expect(page.locator('.runner')).toBeVisible();
    await exercise(page,tool);expect(pageErrors,`${tool.slug}: uncaught browser errors`).toEqual([]);
  });
});
