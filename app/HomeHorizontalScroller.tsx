'use client';

import { Children, type PropsWithChildren, useEffect, useRef, useState } from 'react';

const panelLabels = ['Início', 'Projeto', 'Turma', 'Temas', 'Demo', 'Próximos passos'];

export default function HomeHorizontalScroller({ children }: PropsWithChildren) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    let dragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    const snapToPanel = (index: number, behavior: ScrollBehavior = 'smooth') => {
      const width = track.clientWidth || 1;
      const safeIndex = Math.max(0, Math.min(panelCount - 1, index));
      track.scrollTo({ left: safeIndex * width, behavior });
    };

    const restoreSnap = () => {
      track.style.removeProperty('scroll-snap-type');
      track.style.removeProperty('scroll-behavior');
    };

    const onScroll = () => {
      const width = track.clientWidth || 1;
      setActivePanel(Math.max(0, Math.min(panelCount - 1, Math.round(track.scrollLeft / width))));
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (wheelLockRef.current) return;

      const width = track.clientWidth || 1;
      const current = Math.round(track.scrollLeft / width);
      const direction = event.deltaY > 0 ? 1 : -1;
      snapToPanel(current + direction);

      wheelLockRef.current = true;
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        wheelLockRef.current = false;
      }, 420);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest('a,button,input,textarea,select')) return;
      event.preventDefault();
      dragging = true;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      track.dataset.dragging = 'true';
      track.style.setProperty('scroll-snap-type', 'none', 'important');
      track.style.setProperty('scroll-behavior', 'auto', 'important');
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!dragging) return;
      event.preventDefault();
      track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
    };

    const finishMouseDrag = () => {
      if (!dragging) return;
      const width = track.clientWidth || 1;
      const delta = track.scrollLeft - dragStartScroll;
      const startPanel = Math.round(dragStartScroll / width);
      const threshold = Math.min(120, width * 0.12);
      const targetPanel = Math.abs(delta) >= threshold
        ? startPanel + (delta > 0 ? 1 : -1)
        : startPanel;

      dragging = false;
      delete track.dataset.dragging;
      snapToPanel(targetPanel, 'auto');
      requestAnimationFrame(() => requestAnimationFrame(restoreSnap));
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', finishMouseDrag);
    window.addEventListener('blur', finishMouseDrag);
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', finishMouseDrag);
      window.removeEventListener('blur', finishMouseDrag);
      window.removeEventListener('wheel', onWheel);
      restoreSnap();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [panelCount]);

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
        onDragStart={event => event.preventDefault()}
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
