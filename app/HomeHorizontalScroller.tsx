'use client';

import { Children, type PropsWithChildren, useEffect, useRef, useState } from 'react';

const panelLabels = ['Início', 'Projeto', 'Turma', 'Temas', 'Demo', 'Próximos passos'];

export default function HomeHorizontalScroller({ children }: PropsWithChildren) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const [activePanel, setActivePanel] = useState(0);
  const panelCount = Children.count(children);

  const goToPanel = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const safeIndex = Math.max(0, Math.min(panelCount - 1, index));
    track.scrollTo({ left: safeIndex * track.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const width = track.clientWidth || 1;
      setActivePanel(Math.max(0, Math.min(panelCount - 1, Math.round(track.scrollLeft / width))));
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('wheel', onWheel);
    };
  }, [panelCount]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    if ((event.target as HTMLElement).closest('a,button,input,textarea,select')) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { active: true, startX: event.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.dataset.dragging = 'true';
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    track.scrollLeft = dragRef.current.startScroll - (event.clientX - dragRef.current.startX);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    dragRef.current.active = false;
    delete track.dataset.dragging;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    const width = track.clientWidth || 1;
    goToPanel(Math.round(track.scrollLeft / width));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goToPanel(activePanel + 1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goToPanel(activePanel - 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      goToPanel(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      goToPanel(panelCount - 1);
    }
  };

  return (
    <>
      <div
        ref={trackRef}
        className="marketing-horizontal-track"
        tabIndex={0}
        aria-label="Página inicial do CONTROOLS. Navegue horizontalmente entre as seções."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>

      <div className="marketing-horizontal-controls" aria-label="Seções da página inicial">
        <button type="button" className="marketing-horizontal-arrow" onClick={() => goToPanel(activePanel - 1)} disabled={activePanel === 0} aria-label="Seção anterior">←</button>
        <div className="marketing-horizontal-dots">
          {Array.from({ length: panelCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={index === activePanel ? 'is-active' : ''}
              onClick={() => goToPanel(index)}
              aria-label={panelLabels[index] ?? `Seção ${index + 1}`}
              aria-current={index === activePanel ? 'step' : undefined}
              title={panelLabels[index] ?? `Seção ${index + 1}`}
            />
          ))}
        </div>
        <span className="marketing-horizontal-count"><b>{String(activePanel + 1).padStart(2, '0')}</b> / {String(panelCount).padStart(2, '0')}</span>
        <button type="button" className="marketing-horizontal-arrow" onClick={() => goToPanel(activePanel + 1)} disabled={activePanel === panelCount - 1} aria-label="Próxima seção">→</button>
      </div>

      <div className="marketing-horizontal-hint" aria-hidden="true"><span>ARRASTE</span><i>→</i></div>
    </>
  );
}
