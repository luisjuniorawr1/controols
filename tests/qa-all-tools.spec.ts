import { test, expect, type Page } from '@playwright/test';
import { tools } from '../src/data/extendedCatalog';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import pako from 'pako';

const PNG_BASE64='iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAG0lEQVR4nGP8z8DAwMDAxMDAwMDAgAkYGBgAAB0LAQH3N9qAAAAAAElFTkSuQmCC';
let png:Buffer;
let qrPng:Buffer;
let pdf:Buffer;
let zip:Buffer;
let gzip:Buffer;
let wav:Buffer;
let webm:Buffer;

function makeWav(){
  const sampleRate=8000,seconds=1,samples=sampleRate*seconds,dataSize=samples*2,b=Buffer.alloc(44+dataSize);
  b.write('RIFF',0);b.writeUInt32LE(36+dataSize,4);b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(dataSize,40);
  return b;
}

async function createWebm(page:Page){
  const base64=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d')!;
    const stream=canvas.captureStream(12);const chunks:BlobPart[]=[];const recorder=new MediaRecorder(stream);
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    const stopped=new Promise<void>(resolve=>recorder.onstop=()=>resolve());
    recorder.start();
    for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#ff7a1a':'#111419';ctx.fillRect(0,0,64,64);ctx.fillStyle='#fff';ctx.fillText(String(i),28,34);await new Promise(r=>setTimeout(r,45));}
    recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());
    const blob=new Blob(chunks,{type:recorder.mimeType||'video/webm'}),bytes=new Uint8Array(await blob.arrayBuffer());
    let binary='';for(const x of bytes)binary+=String.fromCharCode(x);return btoa(binary);
  });
  return Buffer.from(base64,'base64');
}

test.beforeAll(async({browser})=>{
  png=Buffer.from(PNG_BASE64,'base64');
  qrPng=await QRCode.toBuffer('CONTROOLS-QA-OK',{type:'png',width:240,margin:2});
  const d=await PDFDocument.create(),page=d.addPage([320,240]),font=await d.embedFont(StandardFonts.Helvetica);page.drawText('CONTROOLS QA',{x:40,y:150,size:24,font});pdf=Buffer.from(await d.save());
  const z=new JSZip();z.file('qa.txt','CONTROOLS QA');zip=await z.generateAsync({type:'nodebuffer'});
  gzip=Buffer.from(pako.gzip(Buffer.from('CONTROOLS QA')));
  wav=makeWav();
  const p=await browser.newPage();try{webm=await createWebm(p)}finally{await p.close()}
});

function idKey(id:string|null){return (id||'').replace(/^tool-/,'')}
function semanticValue(slug:string,key:string,type:string,index:number){
  if(slug==='jwt-decoder')return 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQ29udHJvb2xzIn0.';
  if(slug==='binary-to-text'||slug==='binary-to-decimal')return '01000001';
  if(slug==='hex-to-text')return '48656c6c6f';
  if(slug==='hex-to-decimal'||slug==='hexadecimal-converter')return 'FF';
  if(slug==='base64-decode')return 'SGVsbG8gQ29udHJvb2xz';
  if(slug==='base32-decode')return 'JBSWY3DPEBLW64TMMQ======';
  if(slug==='morse-to-text')return '.... . .-.. .-.. ---';
  if(slug==='roman-numerals-converter')return '42';
  if(slug==='regex-tester'&&key==='pattern')return '\\d+';
  if(slug==='regex-tester'&&key==='source')return 'Teste 123 e 456';
  if(slug.includes('json')||key==='json')return '{"name":"Controols","value":42,"items":[1,2]}';
  if(slug.includes('yaml')||key==='yaml')return 'name: Controols\nvalue: 42';
  if(slug.includes('xml')||key==='xml')return '<root><name>Controols</name><value>42</value></root>';
  if(slug.includes('csv')||key==='csv')return 'name,age\nAna,31\nCarlos,28';
  if(key==='html')return '<!doctype html><html><head><title>Controols QA</title><meta name="description" content="Teste de qualidade da Controols"><link rel="canonical" href="https://example.com/qa"></head><body><h1>Título</h1><h2>Seção</h2><a href="https://example.com/page">Link</a></body></html>';
  if(key==='markdown')return '# Controols QA\n\nTexto **forte**.';
  if(key==='query')return 'name=controols&value=42';
  if(key==='expression')return '10+5*2';
  if(key==='url'||/url$/i.test(key)||['image','logo','defaultUrl','searchUrl','target'].includes(key))return key==='image'||key==='logo'?'https://example.com/image.png':key==='target'?'https://example.com/new-page':'https://example.com/page?utm_source=qa&utm_medium=test';
  if(key==='email')return 'qa@example.com';
  if(key==='phone')return '5511999999999';
  if(key==='latitude')return '-7.0769';if(key==='longitude')return '-41.4669';if(key==='latitude2')return '-5.0919';if(key==='longitude2')return '-42.8034';
  if(key==='date'||key==='date1'||key==='birth'||key==='startDate')return '2026-08-01';
  if(key==='date2')return '2026-08-15';
  if(key==='start')return type==='datetime-local'?'2026-08-15T10:00':'00:00:00';
  if(key==='end')return type==='datetime-local'?'2026-08-15T11:00':'00:00:00.5';
  if(key==='time')return '10:30';
  if(key==='pattern')return '\\d+';
  if(key==='keyword')return 'ferramentas online';
  if(key==='languages')return 'pt=https://example.com/pt/\nen=https://example.com/en/';
  if(key==='questions')return 'O que é a Controols?\nÉ grátis?';
  if(key==='answers')return 'Uma coleção de ferramentas online.\nSim.';
  if(key==='variables')return 'topic=SEO\ntone=claro';
  if(key==='template')return 'Crie um conteúdo sobre {{topic}} em tom {{tone}}.';
  if(key==='role')return 'engenheiro especialista';
  if(key==='goal')return 'criar uma solução prática e completa';
  if(key==='context')return 'O resultado será usado por uma pequena empresa e precisa ser fácil de aplicar.';
  if(key==='constraints')return 'Não inventar dados\nEvitar respostas genéricas';
  if(key==='rules')return 'Ser objetivo\nExplicar decisões importantes';
  if(key==='output'||key==='format')return 'Resposta clara, estruturada e pronta para uso';
  if(key==='tone')return 'profissional e claro';
  if(key==='topic')return 'como melhorar a presença digital de um negócio local';
  if(key==='audience')return 'pequenos empresários';
  if(key==='subject')return 'um produto premium sobre uma mesa';
  if(key==='scene')return 'estúdio minimalista';
  if(key==='style')return 'fotografia comercial realista';
  if(key==='lighting')return 'luz suave lateral';
  if(key==='camera')return '50mm, profundidade de campo suave';
  if(key==='negative')return 'texto ilegível, artefatos, baixa resolução';
  if(key==='brand')return 'Controols';
  if(key==='industry')return 'tecnologia e utilidades online';
  if(key==='values')return 'clareza, velocidade, privacidade';
  if(key==='colors')return 'laranja, preto e branco';
  if(key==='product')return 'embalagem premium';
  if(key==='background')return 'fundo cinza escuro limpo';
  if(key==='task')return 'criar uma função de validação com testes';
  if(key==='stack')return 'TypeScript e React';
  if(key==='requirements')return 'Código tipado, legível e com tratamento de erro';
  if(key==='expertise')return 'produto digital e UX';
  if(key==='boundaries')return 'Não inventar dados nem esconder limitações';
  if(key==='text'||key==='source'||key==='body'||key==='message'||key==='notes')return 'Controols QA teste 123. Este texto existe para validar a ferramenta no navegador.';
  if(key==='find')return 'QA';if(key==='replace')return 'QUALIDADE';
  if(key==='column')return 'name';if(key==='columns')return 'name,age';if(key==='term')return 'Ana';
  if(key==='title')return 'Controols — ferramentas online';if(key==='description')return 'Ferramentas gratuitas e práticas para trabalhar com arquivos, dados, SEO e muito mais.';
  if(key==='name')return 'Controols';if(key==='address')return 'Rua Teste, 100';if(key==='city')return 'Picos';if(key==='region')return 'PI';if(key==='country')return 'BR';
  if(key==='sku')return 'QA-001';if(key==='currency')return 'BRL';
  if(key==='allow')return '/';if(key==='disallow')return '/private/';if(key==='sitemap')return 'https://example.com/sitemap.xml';
  if(key==='parameters')return 'utm_source fbclid';if(key==='source')return 'google';if(key==='medium')return 'social';if(key==='campaign')return 'qa';if(key==='content')return 'card-a';
  if(type==='password')return 'Controols123!';
  if(type==='color')return '#ff7a1a';
  if(type==='number')return String(index%3===0?10:index%3===1?20:30);
  return 'Controols QA';
}

async function fillSmart(page:Page,slug:string){
  const fields=page.locator('.smart-form-runner input, .smart-form-runner textarea');
  const count=await fields.count();let numberIndex=0;
  for(let i=0;i<count;i++){
    const el=fields.nth(i),type=(await el.getAttribute('type'))||((await el.evaluate(e=>e.tagName)).toLowerCase()==='textarea'?'textarea':'text');
    if(type==='file'||type==='hidden'||type==='color')continue;
    const current=await el.inputValue();if(current.trim())continue;
    const key=idKey(await el.getAttribute('id'));
    const value=semanticValue(slug,key,type,type==='number'?numberIndex++:i);
    await el.fill(value);
  }
  const colors=page.locator('.smart-form-runner input[type=color]');for(let i=0;i<await colors.count();i++)await colors.nth(i).fill('#ff7a1a');
  const primary=page.locator('.smart-form-runner .runner-actions button.primary');await expect(primary,`${slug}: execute button`).toBeEnabled();await primary.click();
  await expect(page.locator('.smart-form-runner .simple-output'),`${slug}: expected output`).toBeVisible({timeout:20_000});
  await expect(page.locator('.smart-form-runner .form-error')).toHaveCount(0);
  const out=(await page.locator('.smart-form-runner .result-text').innerText()).trim();expect(out.length,`${slug}: empty output`).toBeGreaterThan(0);expect(out,`${slug}: executor returned error`).not.toMatch(/^Error\b/i);
  if(slug==='prompt-builder'){expect(out.length,'prompt-builder must create a substantial prompt').toBeGreaterThan(220);expect(out).toMatch(/Instruções|Execution instructions|Instrucciones/i)}
}

async function clickAssetAndCheck(page:Page,slug:string,timeout=25_000){
  const button=page.locator('.asset-controls button.primary, .asset-controls button.big-action').first();await expect(button,`${slug}: process button`).toBeEnabled({timeout:10_000});await button.click();
  await expect(page.locator('.asset-result'),`${slug}: asset result`).toBeVisible({timeout});const result=(await page.locator('.asset-result').innerText()).trim();expect(result,`${slug}: asset error`).not.toMatch(/^Error:/im);expect(result.length,`${slug}: empty asset result`).toBeGreaterThan(0);
}

async function exerciseImage(page:Page,slug:string){
  if(slug==='base64-to-image'){
    const ta=page.locator('.asset-controls textarea').first();await ta.fill(`data:image/png;base64,${PNG_BASE64}`);await clickAssetAndCheck(page,slug);return;
  }
  if(slug==='take-screenshot'){test.info().annotations.push({type:'qa-limited',description:'Requires interactive display-capture permission; runner and control presence validated.'});await expect(page.locator('.asset-controls button')).toBeVisible();return;}
  const input=page.locator('.asset-controls input[type=file]').first();await expect(input,`${slug}: image upload`).toBeVisible();
  const multiple=await input.getAttribute('multiple');const needsTwo=slug==='add-image-watermark'||slug.includes('overlay')||slug.includes('merge-images')||Boolean(multiple);
  const files=needsTwo?[{name:'qa-a.png',mimeType:'image/png',buffer:png},{name:'qa-b.png',mimeType:'image/png',buffer:png}]:[{name:'qa.png',mimeType:'image/png',buffer:png}];
  await input.setInputFiles(files);await clickAssetAndCheck(page,slug,35_000);
}

async function exerciseQr(page:Page,slug:string){
  if(['qr-code-reader','barcode-reader'].includes(slug)){
    const input=page.locator('.asset-controls input[type=file]').first();await input.setInputFiles({name:'qa-qr.png',mimeType:'image/png',buffer:qrPng});await expect(page.locator('.asset-result')).toBeVisible({timeout:20_000});const out=(await page.locator('.asset-result').innerText()).trim();expect(out).toContain('CONTROOLS-QA-OK');return;
  }
  const fields=page.locator('.asset-controls input, .asset-controls textarea');for(let i=0;i<await fields.count();i++){const el=fields.nth(i),type=(await el.getAttribute('type'))||'textarea';if(type==='file')continue;const name=(await el.getAttribute('name'))||'';let value=semanticValue(slug,name,type,i);if(slug.includes('ean13'))value='5901234123457';if(slug.includes('ean8'))value='96385074';if(slug.includes('upca'))value='036000291452';if(slug.includes('itf'))value='12345678901231';if(slug.includes('code39'))value='CONTROOLS42';if(slug.includes('codabar'))value='A123456A';if(slug==='wifi-qr-code'&&name==='network')value='Controols QA';if(name==='password')value='Senha123';if(name==='latitude')value='-7.0769';if(name==='longitude')value='-41.4669';if(name==='start')value='2026-08-15T10:00';if(name==='end')value='2026-08-15T11:00';if(name==='text')value=slug.includes('barcode')?'CONTROOLS42':'CONTROOLS QA';await el.fill(value)}
  await clickAssetAndCheck(page,slug);
}

async function exercisePdf(page:Page,slug:string){
  if(slug==='blank-pdf-creator'){await clickAssetAndCheck(page,slug,30_000);return;}
  const input=page.locator('.asset-controls input[type=file]').first();await expect(input,`${slug}: PDF upload`).toBeVisible();
  if(['jpg-to-pdf','png-to-pdf','images-to-pdf'].includes(slug)){
    const imgs=slug==='images-to-pdf'?[{name:'a.png',mimeType:'image/png',buffer:png},{name:'b.png',mimeType:'image/png',buffer:png}]:[{name:'a.png',mimeType:'image/png',buffer:png}];await input.setInputFiles(imgs);
  }else if(slug==='add-image-to-pdf')await input.setInputFiles([{name:'qa.pdf',mimeType:'application/pdf',buffer:pdf},{name:'qa.png',mimeType:'image/png',buffer:png}]);
  else if(slug==='merge-pdf')await input.setInputFiles([{name:'a.pdf',mimeType:'application/pdf',buffer:pdf},{name:'b.pdf',mimeType:'application/pdf',buffer:pdf}]);
  else await input.setInputFiles({name:'qa.pdf',mimeType:'application/pdf',buffer:pdf});
  const textareas=page.locator('.pdf-runner textarea');for(let i=0;i<await textareas.count();i++){const ta=textareas.nth(i);if(!(await ta.inputValue()).trim())await ta.fill('{}')}
  const password=page.locator('.pdf-runner input[type=password]');for(let i=0;i<await password.count();i++)await password.nth(i).fill('Controols123!');
  await clickAssetAndCheck(page,slug,45_000);
}

async function exerciseFile(page:Page,slug:string){
  if(slug==='base64-to-file'||slug==='base64-decode-file'){
    const ta=page.locator('.asset-controls textarea').first();await ta.fill(Buffer.from('CONTROOLS QA').toString('base64'));await clickAssetAndCheck(page,slug);return;
  }
  if(slug==='random-file-generator'){
    const size=page.locator('.asset-controls input[type=number]').first();if(await size.count())await size.fill('0.001');await clickAssetAndCheck(page,slug);return;
  }
  const input=page.locator('.asset-controls input[type=file]').first();await expect(input).toBeVisible();
  if(slug==='unzip-files')await input.setInputFiles({name:'qa.zip',mimeType:'application/zip',buffer:zip});
  else if(slug==='ungzip-file')await input.setInputFiles({name:'qa.txt.gz',mimeType:'application/gzip',buffer:gzip});
  else if(slug==='zip-files'||slug==='join-files')await input.setInputFiles([{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('A')},{name:'b.txt',mimeType:'text/plain',buffer:Buffer.from('B')}]);
  else await input.setInputFiles({name:'qa.txt',mimeType:'text/plain',buffer:Buffer.from('CONTROOLS QA')});
  const size=page.locator('.asset-controls input[type=number]').first();if(await size.count())await size.fill('0.001');await clickAssetAndCheck(page,slug,30_000);
}

async function exerciseMedia(page:Page,slug:string,category:string){
  test.slow();
  const input=page.locator('.asset-controls input[type=file]').first();await expect(input,`${slug}: media upload`).toBeVisible();
  if(category==='audio'){
    const multi=slug==='merge-audio';await input.setInputFiles(multi?[{name:'a.wav',mimeType:'audio/wav',buffer:wav},{name:'b.wav',mimeType:'audio/wav',buffer:wav}]:[{name:'qa.wav',mimeType:'audio/wav',buffer:wav}]);
  }else{
    if(slug==='add-watermark-to-video')await input.setInputFiles([{name:'qa.webm',mimeType:'video/webm',buffer:webm},{name:'wm.png',mimeType:'image/png',buffer:png}]);
    else if(slug==='merge-videos')await input.setInputFiles([{name:'a.webm',mimeType:'video/webm',buffer:webm},{name:'b.webm',mimeType:'video/webm',buffer:webm}]);
    else await input.setInputFiles({name:'qa.webm',mimeType:'video/webm',buffer:webm});
  }
  const end=page.locator('.asset-controls input[type=time]').last();if(await end.count())await end.fill('00:00:00.3');
  await clickAssetAndCheck(page,slug,80_000);
}

async function exerciseInteractive(page:Page,slug:string){
  const button=page.locator('.runner button').first();await expect(button).toBeVisible();
  if(slug==='screen-recorder'){test.info().annotations.push({type:'qa-limited',description:'Screen recording requires an interactive permission picker; page and controls validated in headless CI.'});return;}
  await button.click();await expect(page.locator('.runner')).toBeVisible();
}

async function exercise(page:Page,tool:(typeof tools)[number]){
  const category=String(tool.category),slug=tool.slug;
  if(await page.locator('.runner-pending').count())throw new Error(`${slug} is still routed to pending UI`);
  if(await page.locator('.smart-form-runner').count()){await fillSmart(page,slug);return;}
  if(category==='image'||slug.startsWith('bulk-')||await page.locator('.asset-runner').count()&&['take-screenshot','random-bitmap-generator','image-gradient-generator','image-radial-gradient-generator'].includes(slug)){await exerciseImage(page,slug);return;}
  if(category==='qr'){await exerciseQr(page,slug);return;}
  if(category==='pdf'){await exercisePdf(page,slug);return;}
  if(category==='file'||slug==='file-sha256-checksum'){await exerciseFile(page,slug);return;}
  if(category==='video'||category==='audio'){await exerciseMedia(page,slug,category);return;}
  if(['timer','stopwatch','screen-recorder'].includes(slug)){await exerciseInteractive(page,slug);return;}
  if(await page.locator('.asset-runner').count()){await exerciseImage(page,slug);return;}
  throw new Error(`${slug}: runner type not covered by QA`);
}

test.describe('CONTROOLS — functional QA for every registered tool',()=>{
  test.describe.configure({mode:'parallel'});
  for(const [index,tool] of tools.entries()){
    test(`${String(index+1).padStart(3,'0')}/${tools.length} ${tool.slug}`,async({page})=>{
      const pageErrors:string[]=[];page.on('pageerror',e=>pageErrors.push(e.message));
      const response=await page.goto(`/pt/tools/${tool.slug}/`,{waitUntil:'domcontentloaded'});
      expect(response?.ok(),`${tool.slug}: HTTP response`).toBeTruthy();
      await expect(page.locator('h1'),`${tool.slug}: page title`).toBeVisible();
      const description=page.locator('.simple-tool-hero p').first();await expect(description,`${tool.slug}: SEO/tool description`).toBeVisible();expect((await description.innerText()).trim().length,`${tool.slug}: missing description`).toBeGreaterThan(20);
      await expect(page.locator('.runner'),`${tool.slug}: runner`).toBeVisible();
      await exercise(page,tool);
      expect(pageErrors,`${tool.slug}: uncaught browser errors`).toEqual([]);
    });
  }
});
