'use client';

import { useEffect } from 'react';

const supported=['en','pt','es','zh','hi'] as const;
type Supported=(typeof supported)[number];

function detectedLocale():Supported{
  if(typeof navigator==='undefined')return'en';
  const prefs=[...(navigator.languages||[]),navigator.language].filter(Boolean);
  for(const raw of prefs){
    const tag=raw.toLowerCase();
    const language=tag.split('-')[0];
    if(language==='pt')return'pt';
    if(language==='es')return'es';
    if(language==='zh')return'zh';
    if(language==='hi')return'hi';
    if(language==='en')return'en';
  }
  return'en';
}

export default function RootPage(){
  useEffect(()=>{window.location.replace(`/${detectedLocale()}/`);},[]);
  return <main className="auto-locale-splash" aria-live="polite">
    <div className="brand brand-large"><span>CONTR</span><b>OO</b><span>LS</span></div>
    <div className="locale-loader"><span/><span/><span/></div>
  </main>;
}
