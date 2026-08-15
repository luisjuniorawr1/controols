function clamp(n:number,a:number,b:number){return Math.max(a,Math.min(b,n))}
function hexRgb(value:string){let h=value.trim().replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');if(!/^[0-9a-f]{6}$/i.test(h))throw new Error('Invalid HEX color');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbHex(r:number,g:number,b:number){return'#'+[r,g,b].map(x=>Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbHsl(r:number,g:number,b:number){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h/=6}return[h*360,s*100,l*100]}
function hslRgb(h:number,s:number,l:number){h=((h%360)+360)%360/360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;if(s===0){const v=l*255;return[v,v,v]}const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=(t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255]}
function lightness(hex:string,delta:number){const[r,g,b]=hexRgb(hex),[h,s,l]=rgbHsl(r,g,b),out=hslRgb(h,s,l+delta);return rgbHex(out[0],out[1],out[2])}
function timezoneOffset(zone:string,dateText:string){const instant=dateText?new Date(dateText):new Date();if(Number.isNaN(instant.getTime()))throw new Error('Invalid date');const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(instant);const get=(type:string)=>Number(parts.find(x=>x.type===type)?.value||0);const represented=Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'));const offset=Math.round((represented-instant.getTime())/60000),sign=offset>=0?'+':'-',abs=Math.abs(offset),hh=String(Math.floor(abs/60)).padStart(2,'0'),mm=String(abs%60).padStart(2,'0');return`UTC${sign}${hh}:${mm} (${offset} minutes)`}
function nanoid(length:number){const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',n=clamp(Math.floor(length)||21,1,256),bytes=new Uint8Array(n);crypto.getRandomValues(bytes);return[...bytes].map(x=>chars[x%chars.length]).join('')}

export function runStructuredOverride(slug:string,input:string):string|undefined{
  if(slug==='lighten-color'||slug==='darken-color'){const[color='#22C55E',amountRaw='15']=input.trim().split(/\s+/),amount=Math.abs(Number(amountRaw.replace('%',''))||15);return lightness(color,slug==='lighten-color'?amount:-amount)}
  if(slug==='time-zone-offset-calculator'){const[zone='UTC',date='']=input.split('|');return timezoneOffset(zone,date)}
  if(slug==='nanoid-generator')return nanoid(Number(input)||21);
  if(slug==='css-box-shadow-generator'){const[x='0',y='12',blur='30',spread='0',color='#000000']=input.split('|');return`${Number(x)||0}px ${Number(y)||0}px ${Math.max(0,Number(blur)||0)}px ${Number(spread)||0}px ${color}`}
  if(slug==='css-text-shadow-generator'){const[x='0',y='2',blur='8',color='#000000']=input.split('|');return`${Number(x)||0}px ${Number(y)||0}px ${Math.max(0,Number(blur)||0)}px ${color}`}
  if(slug==='border-radius-generator'){const[a='16',b='16',c='16',d='16']=input.split('|');return`${Math.max(0,Number(a)||0)}px ${Math.max(0,Number(b)||0)}px ${Math.max(0,Number(c)||0)}px ${Math.max(0,Number(d)||0)}px`}
  if(slug==='css-filter-generator'){const[brightness='100',contrast='100',saturation='100',grayscale='0',blur='0']=input.split('|');return`brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`}
  if(slug==='gradient-generator'){const[angle='135',a='#111827',b='#22c55e']=input.split('|');return`linear-gradient(${Number(angle)||0}deg, ${a}, ${b})`}
  return undefined;
}
