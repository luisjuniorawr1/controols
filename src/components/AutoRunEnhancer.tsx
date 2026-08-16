'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  enabled?: boolean;
  delay?: number;
};

export default function AutoRunEnhancer({ children, enabled = true, delay = 220 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const generationRef = useRef(0);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(() => {
    if (!enabled) return;
    const generation = ++generationRef.current;
    cancelTimer();

    const attempt = (tries = 0) => {
      if (generation !== generationRef.current) return;
      const root = rootRef.current;
      if (!root) return;

      const button = root.querySelector<HTMLButtonElement>('button.primary');
      if (!button) return;

      const form = button.form;
      if (form && !form.checkValidity()) return;

      if (button.disabled) {
        if (tries < 20) timerRef.current = window.setTimeout(() => attempt(tries + 1), 120);
        return;
      }

      button.click();
    };

    timerRef.current = window.setTimeout(() => attempt(), delay);
  }, [cancelTimer, delay, enabled]);

  useEffect(() => {
    schedule();
    return () => {
      generationRef.current += 1;
      cancelTimer();
    };
  }, [cancelTimer, schedule]);

  return (
    <div
      ref={rootRef}
      style={{ display: 'contents' }}
      onInputCapture={enabled ? () => schedule() : undefined}
      onChangeCapture={enabled ? () => schedule() : undefined}
    >
      {children}
    </div>
  );
}
