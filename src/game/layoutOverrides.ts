export type LayoutDevice = 'desktop' | 'mobile';

export type LayoutPreset = {
  x: number;
  y: number;
  zoom: number;
};

export type AssetLayout = Partial<Record<LayoutDevice, LayoutPreset>>;
export type LayoutOverrides = Record<string, AssetLayout>;

export const LAYOUT_STORAGE_KEY = 'controols.layoutOverrides.v1';
export const LAYOUT_EVENT = 'controols-layout-update';
export const DEFAULT_LAYOUT_PRESET: LayoutPreset = { x: 50, y: 50, zoom: 1 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function normalizePreset(value?: Partial<LayoutPreset> | null): LayoutPreset {
  return {
    x: clamp(Number(value?.x ?? 50), 0, 100),
    y: clamp(Number(value?.y ?? 50), 0, 100),
    zoom: clamp(Number(value?.zoom ?? 1), 1, 1.8),
  };
}

export function normalizeOverrides(value: unknown): LayoutOverrides {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: LayoutOverrides = {};
  for (const [asset, rawLayout] of Object.entries(value as Record<string, unknown>)) {
    if (!asset.startsWith('/') || !rawLayout || typeof rawLayout !== 'object' || Array.isArray(rawLayout)) continue;
    const layout = rawLayout as Record<string, unknown>;
    const normalized: AssetLayout = {};
    for (const device of ['desktop', 'mobile'] as const) {
      const rawPreset = layout[device];
      if (rawPreset && typeof rawPreset === 'object' && !Array.isArray(rawPreset)) {
        normalized[device] = normalizePreset(rawPreset as Partial<LayoutPreset>);
      }
    }
    if (normalized.desktop || normalized.mobile) result[asset] = normalized;
  }
  return result;
}

export function mergeOverrides(base: LayoutOverrides, local: LayoutOverrides): LayoutOverrides {
  const merged: LayoutOverrides = { ...base };
  for (const [asset, layout] of Object.entries(local)) {
    merged[asset] = { ...(base[asset] ?? {}), ...layout };
  }
  return merged;
}

export function assetPathFromImage(img: HTMLImageElement): string {
  try {
    return new URL(img.currentSrc || img.src, window.location.origin).pathname;
  } catch {
    return img.getAttribute('src') ?? '';
  }
}

export function loadLocalOverrides(): LayoutOverrides {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? normalizeOverrides(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function saveLocalOverrides(value: LayoutOverrides) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(normalizeOverrides(value)));
  window.dispatchEvent(new CustomEvent(LAYOUT_EVENT));
}

export function clearLocalOverrides() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(LAYOUT_EVENT));
}

export async function loadPublishedOverrides(): Promise<LayoutOverrides> {
  if (typeof window === 'undefined') return {};
  try {
    const response = await fetch('/game/layout-overrides.json', { cache: 'no-store' });
    if (!response.ok) return {};
    return normalizeOverrides(await response.json());
  } catch {
    return {};
  }
}

export function activeDevice(): LayoutDevice {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop';
}
