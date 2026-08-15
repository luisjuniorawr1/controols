function nums(input:string){return input.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite)||[]}
function tidy(n:number){return Number.isFinite(n)?String(Number(n.toFixed(10))):'Invalid result'}
function lines(input:string){return input.split(/\r?\n/)}
function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n))}

function hexRgb(hex:string){let h=hex.trim().replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');if(!/^[0-9a-f]{6}$/i.test(h))throw new Error('Use a HEX color such as #22C55E');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbHex(r:number,g:number,b:number){return '#'+[r,g,b].map(x=>Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbHsl(r:number,g:number,b:number){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h/=6}return [h*360,s*100,l*100]}
function hslRgb(h:number,s:number,l:number):[number,number,number]{h=((h%360)+360)%360/360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;if(s===0){const v=l*255;return[v,v,v]}const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=(t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255]}
function shift(hex:string, dh=0, ds=0, dl=0){const [r,g,b]=hexRgb(hex),[h,s,l]=rgbHsl(r,g,b);return rgbHex(...hslRgb(h+dh,s+ds,l+dl))}

function roman(n:number){const map:[[number,string]]|any=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let out='';n=Math.floor(n);for(const [v,s] of map)while(n>=v){out+=s;n-=v}return out}
function fromRoman(s:string){const vals:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let total=0,prev=0;for(const ch of s.toUpperCase().split('').reverse()){const v=vals[ch]||0;if(v<prev)total-=v;else{total+=v;prev=v}}return total}
function gaussian(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

export function runPineExtra(slug:string,category:string,input:string):string|undefined{
  const n=nums(input),[a=0,b=0,c=0]=n;
  if(category==='calculator')switch(slug){
    case'calculator':{const expr=input.trim().replace(/\^/g,'**');if(!/^[0-9+\-*/().%\s*]+$/.test(expr))return 'Use numbers and arithmetic operators only.';try{return tidy(Function(`"use strict";return (${expr})`)())}catch{return 'Invalid expression'}}
    case'area-calculator':{const shape=input.trim().split(/\s+/)[0]?.toLowerCase();if(shape==='circle')return tidy(Math.PI*a*a);if(shape==='triangle')return tidy(a*b/2);if(shape==='rectangle'||shape==='square')return tidy(shape==='square'?a*a:a*b);return JSON.stringify({circleRadius:a,circleArea:Math.PI*a*a,rectangleArea:a*b,triangleArea:a*b/2},null,2)}
    case'single-rule-of-three-direct':return tidy(b*c/a);
    case'single-rule-of-three-inverse':return tidy(a*b/c);
    case'trigonometric-functions':{const rad=a*Math.PI/180;return JSON.stringify({degrees:a,radians:rad,sin:Math.sin(rad),cos:Math.cos(rad),tan:Math.tan(rad)},null,2)}
    case'radians-degrees-converter':return /rad/i.test(input)?`${tidy(a*180/Math.PI)}°`:`${tidy(a*Math.PI/180)} rad`;
    case'generate-list-of-numbers':{const start=a,end=b,step=c||1,out:number[]=[];if(!step)return'';for(let x=start;step>0?x<=end:x>=end;x+=step){out.push(Number(x.toFixed(12)));if(out.length>=10000)break}return out.join('\n')}
    case'filter-numbers':{const [rule='',raw='']=input.split('|||'),values=nums(raw||input);const m=rule.match(/(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)/);if(!m)return values.join('\n');const v=Number(m[2]);return values.filter(x=>m[1]==='>'?x>v:m[1]==='<'?x<v:m[1]==='>='?x>=v:m[1]==='<='?x<=v:x===v).join('\n')}
    case'sort-numbers':return [...n].sort((x,y)=>x-y).join('\n');
    case'minimum-maximum-list':return JSON.stringify({minimum:Math.min(...n),maximum:Math.max(...n)},null,2);
    case'average-list':return tidy(n.reduce((x,y)=>x+y,0)/n.length);
    case'number-base-converter':{const parts=input.trim().split(/\s+/);const value=parts[0]||'0',from=Number(parts[1]||10),to=Number(parts[2]||16);return parseInt(value,from).toString(to).toUpperCase()}
    case'binary-converter':return /^[01]+$/.test(input.trim())?String(parseInt(input.trim(),2)):Math.round(a).toString(2);
    case'hexadecimal-converter':return /^[0-9a-f]+$/i.test(input.trim())&&/[a-f]/i.test(input.trim())?String(parseInt(input.trim(),16)):Math.round(a).toString(16).toUpperCase();
    case'roman-numerals-converter':return /^[ivxlcdm]+$/i.test(input.trim())?String(fromRoman(input.trim())):roman(a);
  }
  if(category==='design')switch(slug){
    case'lighten-color':return shift(input.split(/\s+/)[0],0,0,n[0]&&input.includes('%')?n[0]:15);
    case'darken-color':return shift(input.split(/\s+/)[0],0,0,-(n[0]&&input.includes('%')?n[0]:15));
    case'change-color-saturation':return shift(input.split(/\s+/)[0],0,(n.at(-1)??15),0);
    case'greyscale-color':{const [r,g,b]=hexRgb(input);const y=.2126*r+.7152*g+.0722*b;return rgbHex(y,y,y)}
    case'invert-color':{const [r,g,b]=hexRgb(input);return rgbHex(255-r,255-g,255-b)}
    case'blend-colors':{const colors=input.match(/#[0-9a-f]{3,6}/gi)||[];const x=hexRgb(colors[0]||'#000'),y=hexRgb(colors[1]||'#fff'),p=clamp((n.at(-1)??50)/100,0,1);return rgbHex(x[0]*(1-p)+y[0]*p,x[1]*(1-p)+y[1]*p,x[2]*(1-p)+y[2]*p)}
    case'shift-color-hue':return shift(input.split(/\s+/)[0],n.at(-1)??30,0,0);
    case'split-complementary-colors':return [shift(input,150),shift(input,210)].join('\n');
    case'monochromatic-colors':return [-30,-20,-10,10,20,30].map(v=>shift(input,0,0,v)).join('\n');
    case'square-color-scheme':return [0,90,180,270].map(v=>shift(input,v)).join('\n');
  }
  if(category==='text')switch(slug){
    case'reverse-list':return lines(input).reverse().join('\n');
    case'list-randomizer':return lines(input).sort(()=>Math.random()-.5).join('\n');
    case'sort-list':return lines(input).sort((x,y)=>x.localeCompare(y,undefined,{numeric:true,sensitivity:'base'})).join('\n');
    case'add-text-to-each-line':{const [prefix='',suffix='',body='']=input.split('|||');return lines(body).map(x=>prefix+x+suffix).join('\n')}
    case'convert-tabs-to-spaces':{const [countRaw='4',...body]=input.split('|||');return body.join('|||').replace(/\t/g,' '.repeat(Math.max(1,Number(countRaw)||4)))}
    case'convert-spaces-to-tabs':{const [countRaw='4',...body]=input.split('|||');return body.join('|||').replace(new RegExp(` {${Math.max(1,Number(countRaw)||4)}}`,'g'),'\t')}
    case'remove-empty-lines':return lines(input).filter(x=>x.trim()).join('\n');
    case'filter-lines':{const [q='',...body]=input.split('|||');return lines(body.join('|||')).filter(x=>x.toLowerCase().includes(q.toLowerCase())).join('\n')}
    case'repeat-text':{const [countRaw='2',...body]=input.split('|||');return Array(Math.max(1,Math.min(1000,Number(countRaw)||2))).fill(body.join('|||')).join('\n')}
    case'case-converter':{const [mode='upper',...body]=input.split('|||'),s=body.length?body.join('|||'):input;return /lower/i.test(mode)?s.toLowerCase():/title/i.test(mode)?s.toLowerCase().replace(/\b\p{L}/gu,m=>m.toUpperCase()):s.toUpperCase()}
    case'count-lines':return String(input?lines(input).length:0);
    case'count-words':return String(input.trim()?input.trim().split(/\s+/).length:0);
    case'count-letters':return String([...input].filter(x=>/\p{L}/u.test(x)).length);
  }
  if(category==='date')switch(slug){
    case'date-time-difference':{const p=input.split('|').map(x=>new Date(x.trim()));const ms=Math.abs(p[1].getTime()-p[0].getTime());return JSON.stringify({milliseconds:ms,seconds:ms/1000,minutes:ms/60000,hours:ms/3600000,days:ms/86400000},null,2)}
    case'add-to-a-date':case'subtract-from-a-date':{const [rawDate,...rest]=input.split('|'),d=new Date(rawDate),v=nums(rest.join('|')),sign=slug.startsWith('subtract')?-1:1;d.setFullYear(d.getFullYear()+sign*(v[0]||0));d.setMonth(d.getMonth()+sign*(v[1]||0));d.setDate(d.getDate()+sign*((v[2]||0)*7+(v[3]||0)));d.setHours(d.getHours()+sign*(v[4]||0));d.setMinutes(d.getMinutes()+sign*(v[5]||0));d.setSeconds(d.getSeconds()+sign*(v[6]||0));return d.toISOString()}
    case'unix-timestamp-to-date-time':{let x=a;if(x<1e12)x*=1000;return new Date(x).toISOString()}
    case'date-time-to-unix-timestamp':return String(Math.floor(new Date(input).getTime()/1000));
  }
  if(category==='security')switch(slug){
    case'random-number-generator':{const min=n[0]??0,max=n[1]??100,count=Math.max(1,Math.min(10000,n[2]??1));return Array.from({length:count},()=>String(Math.floor(Math.random()*(max-min+1))+min)).join('\n')}
    case'coin-flipper':{const count=Math.max(1,Math.min(10000,a||1));return Array.from({length:count},()=>Math.random()<.5?'Heads':'Tails').join('\n')}
    case'dice-roller':{const sides=Math.max(2,a||6),count=Math.max(1,Math.min(10000,b||1));return Array.from({length:count},()=>String(1+Math.floor(Math.random()*sides))).join('\n')}
    case'gaussian-random-number-generator':{const mean=a||0,sd=b||1,count=Math.max(1,Math.min(10000,c||1));return Array.from({length:count},()=>tidy(mean+gaussian()*sd)).join('\n')}
    case'password-generator':{const len=Math.max(4,Math.min(256,a||20)),chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';const arr=new Uint32Array(len);crypto.getRandomValues(arr);return [...arr].map(x=>chars[x%chars.length]).join('')}
    case'random-string-generator':{const len=Math.max(1,Math.min(10000,a||32)),chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';const arr=new Uint32Array(len);crypto.getRandomValues(arr);return [...arr].map(x=>chars[x%chars.length]).join('')}
  }
  if(category==='developer')switch(slug){
    case'syntax-highlighter':{const esc=input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return esc.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await)\b/g,'<strong>$1</strong>')}
    case'css-inliner':{const doc=new DOMParser().parseFromString(input,'text/html');for(const style of [...doc.querySelectorAll('style')]){const css=style.textContent||'';for(const rule of css.split('}')){const [sel,body]=rule.split('{');if(!sel||!body)continue;try{doc.querySelectorAll(sel.trim()).forEach(el=>{const old=el.getAttribute('style');el.setAttribute('style',`${old?old+';':''}${body.trim()}`)})}catch{}}style.remove()}return doc.documentElement.outerHTML}
  }
  return undefined;
}
