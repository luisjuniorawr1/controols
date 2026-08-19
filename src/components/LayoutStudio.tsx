'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { kidsGames } from '@/src/game/kidsStory';
import {
  DEFAULT_LAYOUT_PRESET,
  clearLocalOverrides,
  loadLocalOverrides,
  loadPublishedOverrides,
  mergeOverrides,
  normalizeOverrides,
  normalizePreset,
  saveLocalOverrides,
  type LayoutDevice,
  type LayoutOverrides,
  type LayoutPreset,
} from '@/src/game/layoutOverrides';
import styles from '@/app/layout-studio/layout-studio.module.css';

type StudioAsset = {
  path: string;
  story: string;
  label: string;
  kind: 'capa' | 'cena';
};

const assets: StudioAsset[] = kidsGames.flatMap(story => [
  { path: story.cover, story: story.title, label: 'Capa', kind: 'capa' as const },
  ...Object.entries(story.scenes).map(([key, path]) => ({
    path,
    story: story.title,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()),
    kind: 'cena' as const,
  })),
]);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function LayoutStudio() {
  const [published, setPublished] = useState<LayoutOverrides>({});
  const [local, setLocal] = useState<LayoutOverrides>({});
  const [ready, setReady] = useState(false);
  const [selectedPath, setSelectedPath] = useState(assets[0]?.path ?? '');
  const [device, setDevice] = useState<LayoutDevice>('desktop');
  const [query, setQuery] = useState('');
  const [grid, setGrid] = useState(true);
  const [savedAt, setSavedAt] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ x: number; y: number; preset: LayoutPreset } | null>(null);

  useEffect(() => {
    Promise.all([loadPublishedOverrides(), Promise.resolve(loadLocalOverrides())]).then(([base, browser]) => {
      setPublished(base);
      setLocal(browser);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLocalOverrides(local);
    setSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  }, [local, ready]);

  const currentAsset = assets.find(asset => asset.path === selectedPath) ?? assets[0];
  const effective = mergeOverrides(published, local);
  const preset = normalizePreset(effective[selectedPath]?.[device] ?? DEFAULT_LAYOUT_PRESET);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return assets;
    return assets.filter(asset => `${asset.story} ${asset.label} ${asset.path}`.toLowerCase().includes(term));
  }, [query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, StudioAsset[]>();
    for (const asset of filtered) {
      const list = groups.get(asset.story) ?? [];
      list.push(asset);
      groups.set(asset.story, list);
    }
    return [...groups.entries()];
  }, [filtered]);

  const setPreset = (patch: Partial<LayoutPreset>) => {
    const nextPreset = normalizePreset({ ...preset, ...patch });
    setLocal(current => ({
      ...current,
      [selectedPath]: {
        ...(current[selectedPath] ?? {}),
        [device]: nextPreset,
      },
    }));
  };

  const resetCurrent = () => {
    setLocal(current => {
      const next = { ...current };
      const entry = { ...(next[selectedPath] ?? {}) };
      delete entry[device];
      if (entry.desktop || entry.mobile) next[selectedPath] = entry;
      else delete next[selectedPath];
      return next;
    });
  };

  const copyPreset = (target: LayoutDevice) => {
    setLocal(current => ({
      ...current,
      [selectedPath]: {
        ...(current[selectedPath] ?? {}),
        [target]: { ...preset },
      },
    }));
  };

  const exportJson = () => {
    const payload = JSON.stringify(mergeOverrides(published, local), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'layout-overrides.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(mergeOverrides(published, local), null, 2));
    setSavedAt('JSON copiado');
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = normalizeOverrides(JSON.parse(await file.text()));
      setLocal(parsed);
      setSavedAt('Arquivo importado');
    } catch {
      setSavedAt('JSON inválido');
    }
  };

  const restorePublished = () => {
    clearLocalOverrides();
    setLocal({});
    setSavedAt('Ajustes locais removidos');
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { x: event.clientX, y: event.clientY, preset };
  };

  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragState.current;
    if (!start) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    setPreset({
      x: clamp(start.preset.x - (dx / rect.width) * 100, 0, 100),
      y: clamp(start.preset.y - (dy / rect.height) * 100, 0, 100),
    });
  };

  const stopDrag = () => {
    dragState.current = null;
  };

  if (!ready || !currentAsset) {
    return <main className={styles.loading}>Carregando Studio de Enquadramento…</main>;
  }

  const previewClass = device === 'desktop' ? styles.previewDesktop : styles.previewMobile;

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <small>CONTROOLS · ADMIN</small>
          <h1>Studio de Enquadramento</h1>
          <p>Ajuste o foco das imagens sem mexer em CSS.</p>
        </div>
        <div className={styles.headerActions}>
          <a href="/pt/" target="_blank" rel="noreferrer">Abrir o jogo ↗</a>
          <button type="button" onClick={copyJson}>Copiar JSON</button>
          <button type="button" onClick={exportJson}>Exportar</button>
          <button type="button" onClick={() => fileInput.current?.click()}>Importar</button>
          <input ref={fileInput} hidden type="file" accept="application/json" onChange={event => importJson(event.target.files?.[0])} />
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar história ou cena…" />
          </div>
          <div className={styles.assetList}>
            {grouped.map(([story, storyAssets]) => (
              <section key={story}>
                <h2>{story}</h2>
                {storyAssets.map(asset => (
                  <button
                    key={asset.path}
                    type="button"
                    className={asset.path === selectedPath ? styles.assetActive : styles.assetButton}
                    onClick={() => setSelectedPath(asset.path)}
                  >
                    <img src={asset.path} alt="" />
                    <span><small>{asset.kind}</small><b>{asset.label}</b></span>
                  </button>
                ))}
              </section>
            ))}
          </div>
        </aside>

        <section className={styles.stageColumn}>
          <div className={styles.stageToolbar}>
            <div className={styles.segmented}>
              <button type="button" className={device === 'desktop' ? styles.segmentActive : ''} onClick={() => setDevice('desktop')}>Desktop / TV</button>
              <button type="button" className={device === 'mobile' ? styles.segmentActive : ''} onClick={() => setDevice('mobile')}>Celular</button>
            </div>
            <label><input type="checkbox" checked={grid} onChange={event => setGrid(event.target.checked)} /> Grade e safe zone</label>
          </div>

          <div className={styles.stageShell}>
            <div
              className={`${styles.preview} ${previewClass}`}
              onPointerDown={startDrag}
              onPointerMove={drag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <img
                src={selectedPath}
                alt={currentAsset.label}
                style={{ objectPosition: `${preset.x}% ${preset.y}%`, transform: `scale(${preset.zoom})` }}
              />
              {grid && <>
                <div className={styles.gridOverlay} />
                <div className={device === 'desktop' ? styles.safeDesktop : styles.safeMobile}><span>ÁREA DE INTERAÇÃO</span></div>
                <div className={styles.focusDot} style={{ left: `${preset.x}%`, top: `${preset.y}%` }} />
              </>}
              <div className={styles.dragHint}>Arraste a imagem para reposicionar</div>
            </div>
          </div>

          <div className={styles.currentMeta}>
            <div><small>{currentAsset.story}</small><strong>{currentAsset.label}</strong></div>
            <code>{selectedPath}</code>
          </div>
        </section>

        <aside className={styles.controls}>
          <div className={styles.status}><span>●</span> Salvo neste navegador {savedAt && `· ${savedAt}`}</div>

          <section className={styles.controlCard}>
            <h2>Posição</h2>
            <label>
              <span>Horizontal <b>{Math.round(preset.x)}%</b></span>
              <input aria-label="Posição horizontal" type="range" min="0" max="100" step="1" value={preset.x} onChange={event => setPreset({ x: Number(event.target.value) })} />
            </label>
            <label>
              <span>Vertical <b>{Math.round(preset.y)}%</b></span>
              <input aria-label="Posição vertical" type="range" min="0" max="100" step="1" value={preset.y} onChange={event => setPreset({ y: Number(event.target.value) })} />
            </label>
            <label>
              <span>Zoom <b>{Math.round(preset.zoom * 100)}%</b></span>
              <input aria-label="Zoom" type="range" min="1" max="1.8" step="0.01" value={preset.zoom} onChange={event => setPreset({ zoom: Number(event.target.value) })} />
            </label>
          </section>

          <section className={styles.controlCard}>
            <h2>Ações rápidas</h2>
            <div className={styles.nudgeGrid}>
              <button type="button" onClick={() => setPreset({ y: preset.y - 2 })}>↑</button>
              <button type="button" onClick={() => setPreset({ x: preset.x - 2 })}>←</button>
              <button type="button" onClick={() => setPreset({ x: preset.x + 2 })}>→</button>
              <button type="button" onClick={() => setPreset({ y: preset.y + 2 })}>↓</button>
            </div>
            <button type="button" onClick={() => copyPreset(device === 'desktop' ? 'mobile' : 'desktop')}>Copiar para {device === 'desktop' ? 'celular' : 'desktop'}</button>
            <button type="button" onClick={resetCurrent}>Resetar esta visualização</button>
          </section>

          <section className={styles.controlCard}>
            <h2>Publicação</h2>
            <p>As mudanças já valem no jogo neste navegador. Para transformar os ajustes em padrão global, exporte o JSON e publique o arquivo no projeto.</p>
            <button type="button" className={styles.primary} onClick={exportJson}>Baixar layout-overrides.json</button>
            <button type="button" className={styles.danger} onClick={restorePublished}>Voltar ao layout publicado</button>
          </section>
        </aside>
      </section>
    </main>
  );
}
