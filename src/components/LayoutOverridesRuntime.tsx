'use client';

import { useEffect } from 'react';
import {
  LAYOUT_EVENT,
  activeDevice,
  assetPathFromImage,
  loadLocalOverrides,
  loadPublishedOverrides,
  mergeOverrides,
  type LayoutOverrides,
} from '@/src/game/layoutOverrides';

export default function LayoutOverridesRuntime() {
  useEffect(() => {
    let cancelled = false;
    let published: LayoutOverrides = {};
    let frame = 0;

    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const merged = mergeOverrides(published, loadLocalOverrides());
        const device = activeDevice();

        document.querySelectorAll<HTMLImageElement>('img').forEach(img => {
          const key = assetPathFromImage(img);
          const preset = merged[key]?.[device];
          const managed = img.dataset.controolsLayoutManaged === 'true';

          if (!preset) {
            if (managed) {
              img.style.removeProperty('object-position');
              img.style.removeProperty('transform');
              img.style.removeProperty('transform-origin');
              img.style.removeProperty('will-change');
              delete img.dataset.controolsLayoutManaged;
            }
            return;
          }

          img.dataset.controolsLayoutManaged = 'true';
          // Some legacy layout layers use !important for safe-zone crops. The
          // editor is the explicit per-asset source of truth, so managed values
          // intentionally receive the same priority and win at inline scope.
          img.style.setProperty('object-position', `${preset.x}% ${preset.y}%`, 'important');
          img.style.setProperty('transform', `scale(${preset.zoom})`, 'important');
          img.style.setProperty('transform-origin', 'center center', 'important');
          img.style.setProperty('will-change', 'transform', 'important');
        });
      });
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    const media = window.matchMedia('(max-width: 760px)');
    const onMediaChange = () => apply();
    media.addEventListener('change', onMediaChange);
    window.addEventListener(LAYOUT_EVENT, apply);
    window.addEventListener('storage', apply);

    loadPublishedOverrides().then(value => {
      if (cancelled) return;
      published = value;
      apply();
    });
    apply();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', onMediaChange);
      window.removeEventListener(LAYOUT_EVENT, apply);
      window.removeEventListener('storage', apply);
    };
  }, []);

  return null;
}
