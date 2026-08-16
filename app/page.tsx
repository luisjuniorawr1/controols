'use client';

import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    window.location.replace('/pt/');
  }, []);

  return <main className="story-shell story-boot" aria-live="polite">
    <div className="story-brand" aria-label="Controols"><span>CONTR</span><b>OO</b><span>LS</span></div>
    <p>Carregando o Caso 001...</p>
  </main>;
}
