function nums(input: string) {
  return input.split(/[;,\s]+/).map(Number).filter((n) => Number.isFinite(n));
}

function tidy(n: number) {
  return Number.isFinite(n) ? String(Number(n.toFixed(10))) : 'Invalid result';
}

function words(input: string) {
  return input.trim() ? input.trim().split(/\s+/) : [];
}

function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\p{L}/gu, (m) => m.toUpperCase());
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

const morse: Record<string,string> = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};

function runText(slug:string,input:string){
  const w=words(input);
  switch(slug){
    case 'word-counter': return String(w.length);
    case 'character-counter': return String(input.length);
    case 'sentence-counter': return String((input.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).filter(x=>x.trim()).length);
    case 'paragraph-counter': return String(input.trim()?input.trim().split(/\n\s*\n/).length:0);
    case 'line-counter': return String(input?input.split(/\r?\n/).length:0);
    case 'reading-time-calculator': return `${Math.max(1,Math.ceil(w.length/200))} min`;
    case 'uppercase-text': return input.toUpperCase();
    case 'lowercase-text': return input.toLowerCase();
    case 'title-case-text': return titleCase(input);
    case 'sentence-case-text': return input.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu,m=>m.toUpperCase());
    case 'capitalize-words': return input.replace(/\b\p{L}/gu,m=>m.toUpperCase());
    case 'alternating-case-text': {let i=0;return [...input].map(c=>/\p{L}/u.test(c)?(i++%2?c.toLowerCase():c.toUpperCase()):c).join('');}
    case 'reverse-text': return [...input].reverse().join('');
    case 'reverse-words': return w.reverse().join(' ');
    case 'remove-extra-spaces': return input.replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();
    case 'remove-line-breaks': return input.replace(/\s*\r?\n\s*/g,' ');
    case 'add-line-numbers': return input.split(/\r?\n/).map((l,i)=>`${i+1}. ${l}`).join('\n');
    case 'remove-line-numbers': return input.split(/\r?\n/).map(l=>l.replace(/^\s*\d+[.)-]?\s*/, '')).join('\n');
    case 'sort-lines-ascending': return input.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join('\n');
    case 'sort-lines-descending': return input.split(/\r?\n/).sort((a,b)=>b.localeCompare(a)).join('\n');
    case 'remove-duplicate-lines': return [...new Set(input.split(/\r?\n/))].join('\n');
    case 'shuffle-lines': return input.split(/\r?\n/).sort(()=>Math.random()-.5).join('\n');
    case 'deduplicate-words': return [...new Set(w)].join(' ');
    case 'find-and-replace-text': {const [find,repl,...rest]=input.split('|||'); return rest.join('|||').split(find||'').join(repl||'');}
    case 'extract-emails': return [...new Set(input.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)||[])].join('\n');
    case 'extract-urls': return [...new Set(input.match(/https?:\/\/[^\s]+/g)||[])].join('\n');
    case 'extract-numbers': return (input.match(/-?\d+(?:[.,]\d+)?/g)||[]).join('\n');
    case 'extract-hashtags': return (input.match(/#[\p{L}\p{N}_]+/gu)||[]).join('\n');
    case 'remove-accents': return stripAccents(input);
    case 'slug-generator': return stripAccents(input).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    case 'text-to-binary': return [...new TextEncoder().encode(input)].map(b=>b.toString(2).padStart(8,'0')).join(' ');
    case 'binary-to-text': return new TextDecoder().decode(Uint8Array.from(input.trim().split(/\s+/).map(x=>parseInt(x,2))));
    case 'text-to-morse': return input.toUpperCase().split('').map(c=>c===' '?' / ':morse[c]||c).join(' ');
    case 'morse-to-text': {const rev=Object.fromEntries(Object.entries(morse).map(([k,v])=>[v,k]));return input.trim().split(/\s*\/\s*/).map(word=>word.split(/\s+/).map(x=>rev[x]||'?').join('')).join(' ');}
    case 'lorem-ipsum-generator': {const n=Math.max(1,Math.min(20,Number(input)||3));const p='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';return Array(n).fill(p).join('\n\n');}
  }
  return input;
}

function markdown(md:string){return md.replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');}

function runDeveloper(slug:string,input:string){
  switch(slug){
    case 'json-formatter': return JSON.stringify(JSON.parse(input),null,2);
    case 'json-minifier': return JSON.stringify(JSON.parse(input));
    case 'json-validator': JSON.parse(input); return 'Valid JSON ✓';
    case 'json-sorter': {const sort=(v:any):any=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;return JSON.stringify(sort(JSON.parse(input)),null,2);}
    case 'json-escape': return JSON.stringify(input).slice(1,-1);
    case 'json-unescape': return JSON.parse(`"${input.replace(/"/g,'\\"')}"`);
    case 'base64-encode': return btoa(unescape(encodeURIComponent(input)));
    case 'base64-decode': return decodeURIComponent(escape(atob(input.trim())));
    case 'url-encode': return encodeURIComponent(input);
    case 'url-decode': return decodeURIComponent(input);
    case 'html-encode': return input.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
    case 'html-decode': {const d=document.createElement('textarea');d.innerHTML=input;return d.value;}
    case 'unicode-escape': return [...input].map(c=>`\\u{${c.codePointAt(0)!.toString(16)}}`).join('');
    case 'unicode-unescape': return input.replace(/\\u\{([0-9a-f]+)\}/gi,(_,h)=>String.fromCodePoint(parseInt(h,16)));
    case 'text-to-hex': return [...new TextEncoder().encode(input)].map(b=>b.toString(16).padStart(2,'0')).join('');
    case 'hex-to-text': return new TextDecoder().decode(Uint8Array.from(input.trim().match(/.{1,2}/g)?.map(x=>parseInt(x,16))||[]));
    case 'decimal-to-hex': return Number(input).toString(16).toUpperCase();
    case 'hex-to-decimal': return String(parseInt(input,16));
    case 'binary-to-decimal': return String(parseInt(input,2));
    case 'decimal-to-binary': return Number(input).toString(2);
    case 'timestamp-to-date': {let n=Number(input);if(n<1e12)n*=1000;return new Date(n).toISOString();}
    case 'date-to-timestamp': return String(Date.parse(input));
    case 'jwt-decoder': {const p=input.split('.')[1];return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g,'+').replace(/_/g,'/'))))),null,2);}
    case 'uuid-generator': return crypto.randomUUID();
    case 'nanoid-generator': return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n=>'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'[n%64]).join('').slice(0,21);
    case 'regex-tester': {const [pattern,text]=input.split('|||');const r=new RegExp(pattern||'', 'g');return JSON.stringify([...(text||'').matchAll(r)].map(m=>({match:m[0],index:m.index})),null,2);}
    case 'regex-escape': return input.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    case 'html-beautifier': return input.replace(/>\s*</g,'>\n<');
    case 'css-beautifier': return input.replace(/\{/g,' {\n  ').replace(/;/g,';\n  ').replace(/\}/g,'\n}\n');
    case 'javascript-beautifier': return input.replace(/;/g,';\n').replace(/\{/g,'{\n').replace(/\}/g,'\n}');
    case 'html-minifier': return input.replace(/<!--.*?-->/gs,'').replace(/>\s+</g,'><').trim();
    case 'css-minifier': return input.replace(/\/\*.*?\*\//gs,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').trim();
    case 'javascript-minifier': return input.replace(/\/\*.*?\*\//gs,'').replace(/^\s*\/\/.*$/gm,'').replace(/\s+/g,' ').trim();
    case 'sql-formatter': return input.replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|LIMIT|VALUES|SET)\b/gi,'\n$1').trim();
    case 'markdown-preview': case 'markdown-to-html': return markdown(input);
    case 'html-to-markdown': return input.replace(/<h1[^>]*>(.*?)<\/h1>/gi,'# $1\n').replace(/<h2[^>]*>(.*?)<\/h2>/gi,'## $1\n').replace(/<strong[^>]*>(.*?)<\/strong>/gi,'**$1**').replace(/<em[^>]*>(.*?)<\/em>/gi,'*$1*').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'');
    case 'diff-checker': {const [a,b]=input.split('|||');const aa=(a||'').split('\n'),bb=(b||'').split('\n');return [...new Set([...aa,...bb])].map(l=>`${aa.includes(l)?' ':'+'}${bb.includes(l)?' ':'-'} ${l}`).join('\n');}
    case 'query-string-parser': return JSON.stringify(Object.fromEntries(new URLSearchParams(input.replace(/^\?/,''))),null,2);
    case 'user-agent-parser': {const s=input.toLowerCase();return JSON.stringify({mobile:/mobile|android|iphone/.test(s),browser:s.includes('firefox')?'Firefox':s.includes('edg')?'Edge':s.includes('chrome')?'Chrome':s.includes('safari')?'Safari':'Unknown'},null,2);}
  }
  return input;
}

function runCalculator(slug:string,input:string){
  const n=nums(input),[a=0,b=0,c=0]=n;
  switch(slug){
    case 'percentage-calculator': return tidy(a*b/100);
    case 'percentage-change-calculator': return tidy((b-a)/a*100)+'%';
    case 'discount-calculator': return tidy(a*(1-b/100));
    case 'markup-calculator': return tidy(a*(1+b/100));
    case 'margin-calculator': return tidy((b-a)/b*100)+'%';
    case 'profit-calculator': return tidy(b-a);
    case 'vat-calculator': return tidy(a*(1+b/100));
    case 'simple-interest-calculator': return tidy(a*b*c/100);
    case 'compound-interest-calculator': return tidy(a*Math.pow(1+b/100,c));
    case 'loan-payment-calculator': {const r=b/1200,m=a*r*Math.pow(1+r,c)/(Math.pow(1+r,c)-1);return tidy(m);}
    case 'bmi-calculator': return tidy(a/((b/100)**2));
    case 'bmr-calculator': return tidy(10*a+6.25*b-5*c+(n[3]||0));
    case 'age-calculator': {const d=new Date(input);return String(new Date(Date.now()-d.getTime()).getUTCFullYear()-1970);}
    case 'average-calculator': return tidy(n.reduce((x,y)=>x+y,0)/n.length);
    case 'median-calculator': {const x=[...n].sort((x,y)=>x-y),m=Math.floor(x.length/2);return tidy(x.length%2?x[m]:(x[m-1]+x[m])/2);}
    case 'mode-calculator': {const f=new Map<number,number>();n.forEach(x=>f.set(x,(f.get(x)||0)+1));return String([...f].sort((x,y)=>y[1]-x[1])[0]?.[0]??'');}
    case 'standard-deviation-calculator': {const m=n.reduce((x,y)=>x+y,0)/n.length;return tidy(Math.sqrt(n.reduce((s,x)=>s+(x-m)**2,0)/n.length));}
    case 'fraction-calculator': return tidy(a/b);
    case 'ratio-calculator': {const g=gcd(a,b);return `${a/g}:${b/g}`;}
    case 'rule-of-three-calculator': return tidy(b*c/a);
    case 'gcd-calculator': return String(gcd(a,b));
    case 'lcm-calculator': return String(Math.abs(a*b)/gcd(a,b));
    case 'prime-number-checker': {if(a<2)return 'false';for(let i=2;i<=Math.sqrt(a);i++)if(a%i===0)return 'false';return 'true';}
    case 'factorial-calculator': {let r=1;for(let i=2;i<=a;i++)r*=i;return String(r);}
    case 'square-root-calculator': return tidy(Math.sqrt(a));
    case 'power-calculator': return tidy(a**b);
    case 'logarithm-calculator': return tidy(Math.log(a)/Math.log(b||10));
    case 'circle-area-calculator': return tidy(Math.PI*a*a);
    case 'rectangle-area-calculator': return tidy(a*b);
    case 'triangle-area-calculator': return tidy(a*b/2);
  }
  return 'Enter numeric values separated by commas.';
}

function runDate(slug:string,input:string){
  const p=input.split(/[|,]/).map(s=>s.trim()),a=new Date(p[0]),b=p[1]?new Date(p[1]):new Date(),day=864e5;
  switch(slug){
    case 'days-between-dates': return tidy(Math.abs(b.getTime()-a.getTime())/day);
    case 'business-days-between-dates': {let x=new Date(a),n=0;while(x<b){const d=x.getDay();if(d!==0&&d!==6)n++;x.setDate(x.getDate()+1)}return String(n);}
    case 'add-days-to-date': a.setDate(a.getDate()+Number(p[1]));return a.toISOString();
    case 'subtract-days-from-date': a.setDate(a.getDate()-Number(p[1]));return a.toISOString();
    case 'add-months-to-date': a.setMonth(a.getMonth()+Number(p[1]));return a.toISOString();
    case 'subtract-months-from-date': a.setMonth(a.getMonth()-Number(p[1]));return a.toISOString();
    case 'week-number-calculator': {const d=new Date(Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));return String(Math.ceil((((d.getTime()-y.getTime())/day)+1)/7));}
    case 'day-of-year-calculator': return String(Math.floor((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(a.getFullYear(),0,0))/day));
    case 'date-difference-calculator': return `${Math.floor(Math.abs(b.getTime()-a.getTime())/day)} days`;
    case 'countdown-calculator': return `${Math.ceil((a.getTime()-Date.now())/day)} days`;
    case 'time-zone-offset-calculator': return String(a.getTimezoneOffset());
    case 'unix-time-converter': {const n=Number(input);return Number.isFinite(n)?new Date(n*(n<1e12?1000:1)).toISOString():String(Math.floor(a.getTime()/1000));}
    case 'iso-date-converter': return a.toISOString();
    case 'leap-year-checker': {const y=Number(input)||a.getFullYear();return String(y%4===0&&(y%100!==0||y%400===0));}
    case 'calendar-date-calculator': return a.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  }
  return '';
}

export async function runTool(slug:string,category:string,input:string):Promise<string>{
  try {
    if(category==='text')return runText(slug,input);
    if(category==='developer')return runDeveloper(slug,input);
    if(category==='calculator')return runCalculator(slug,input);
    if(category==='date')return runDate(slug,input);
    return 'This browser engine is in the next implementation batch.';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Invalid input'}`;
  }
}

export function exampleForCategory(category:string){
  if(category==='calculator') return '100, 15';
  if(category==='date') return '2026-08-15, 2026-12-31';
  if(category==='developer') return '{"hello":"world"}';
  return 'Type or paste your content here…';
}
