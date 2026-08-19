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
          img.style.objectPosition = `${preset.x}% ${preset.y}%`;
          img.style.transform = `scale(${preset.zoom})`;
          img.style.transformOrigin = 'center center';
          img.style.willChange = 'transform';
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
