'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';
import QRCode from 'qrcode';
import { MINI001_HOLD_MS, mini001Scenes, type Mini001Hand, type Mini001Hotspot } from '@/src/game/miniGame001';
import { useMexeMundoMotion, type MexeMundoPoint } from '@/src/game/motion/mexeMundoMotion';

type HandName = 'left' | 'right';
type DwellState = { id: string; startedAt: number } | null;

function inHotspot(point: MexeMundoPoint, hotspot: Mini001Hotspot) {
  return point.visible
    && point.x >= hotspot.x
    && point.x <= hotspot.x + hotspot.width
    && point.y >= hotspot.y
    && point.y <= hotspot.y + hotspot.height;
}

function handAllowed(hand: HandName, hotspotHand: Mini001Hand, point: MexeMundoPoint) {
  if (hotspotHand !== 'either' && hotspotHand !== hand) return false;
  // CONTROOLS convention: no crossing. Neutral band remains available to either hand.
  if (hand === 'left' && point.x > .58) return false;
  if (hand === 'right' && point.x < .42) return false;
  return true;
}

export default function MiniGame001OlhoVivo({ locale = 'pt' }: { locale?: string }) {
  const motion = useMexeMundoMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [protectedIds, setProtectedIds] = useState<string[]>([]);
  const [leftDwell, setLeftDwell] = useState<DwellState>(null);
  const [rightDwell, setRightDwell] = useState<DwellState>(null);
  const [leftProgress, setLeftProgress] = useState(0);
  const [rightProgress, setRightProgress] = useState(0);
  const [qrSrc, setQrSrc] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const lastActionAt = useRef(0);
  const advancing = useRef(false);

  const scene = mini001Scenes[sceneIndex];
  const required = scene.hotspots.filter(item => !['play_again', 'menu', 'start'].includes(item.id));
  const remaining = required.filter(item => !protectedIds.includes(item.id));
  const sceneComplete = required.length > 0 && remaining.length === 0;

  useEffect(() => {
    QRCode.toDataURL(motion.phoneUrl, { width: 300, margin: 1 }).then(setQrSrc).catch(() => setQrSrc(''));
  }, [motion.phoneUrl]);

  useEffect(() => {
    setProtectedIds([]);
    setLeftDwell(null);
    setRightDwell(null);
    setLeftProgress(0);
    setRightProgress(0);
    setHintLevel(0);
    lastActionAt.current = performance.now();
    advancing.current = false;
  }, [sceneIndex]);

  useEffect(() => {
    if (motion.status !== 'ready') return;
    const timer = window.setInterval(() => {
      const idle = performance.now() - lastActionAt.current;
      setHintLevel(idle > 22000 ? 3 : idle > 15000 ? 2 : idle > 8000 ? 1 : 0);
    }, 500);
    return () => window.clearInterval(timer);
  }, [motion.status, sceneIndex]);

  const activeHotspots = useMemo(() => scene.hotspots.filter(h => !protectedIds.includes(h.id)), [scene.hotspots, protectedIds]);

  useEffect(() => {
    if (motion.status !== 'ready') return;
    let frame = 0;

    const processHand = (
      now: number,
      hand: HandName,
      point: MexeMundoPoint,
      dwell: DwellState,
      setDwell: Dispatch<SetStateAction<DwellState>>,
      setProgress: Dispatch<SetStateAction<number>>,
    ) => {
      const hit = activeHotspots.find(h => handAllowed(hand, h.hand, point) && inHotspot(point, h));
      if (!hit) {
        if (dwell) setDwell(null);
        setProgress(0);
        return;
      }

      lastActionAt.current = now;
      setHintLevel(0);
      const current = dwell?.id === hit.id ? dwell : { id: hit.id, startedAt: now };
      if (!dwell || dwell.id !== hit.id) setDwell(current);
      const holdMs = hit.holdMs ?? MINI001_HOLD_MS;
      const progress = Math.min(1, (now - current.startedAt) / holdMs);
      setProgress(progress);

      if (progress < 1) return;
      setDwell(null);
      setProgress(0);

      if (hit.id === 'start') {
        setSceneIndex(1);
        return;
      }
      if (hit.id === 'play_again') {
        setSceneIndex(0);
        return;
      }
      if (hit.id === 'menu') {
        window.location.href = `/${locale}/`;
        return;
      }
      setProtectedIds(currentIds => currentIds.includes(hit.id) ? currentIds : [...currentIds, hit.id]);
    };

    const tick = (now: number) => {
      processHand(now, 'left', motion.pose.left, leftDwell, setLeftDwell, setLeftProgress);
      processHand(now, 'right', motion.pose.right, rightDwell, setRightDwell, setRightProgress);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeHotspots, leftDwell, locale, motion.pose.left, motion.pose.right, motion.status, rightDwell]);

  useEffect(() => {
    if (!scene.autoAdvance || !sceneComplete || advancing.current) return;
    advancing.current = true;
    const timer = window.setTimeout(() => setSceneIndex(current => Math.min(current + 1, mini001Scenes.length - 1)), 950);
    return () => window.clearTimeout(timer);
  }, [scene.autoAdvance, sceneComplete]);

  const highlighted = hintLevel >= 2 ? remaining[0] : null;

  return (
    <main className="mg001-root" data-scene={scene.id}>
      <img className="mg001-scene" src={scene.image} alt="" draggable={false} />

      {motion.status !== 'ready' && (
        <section className="mg001-pairing" aria-live="polite">
          <div className="mg001-pairing-card">
            <span>MINI JOGO · OLHO VIVO!</span>
            {!motion.phoneConnected ? <>
              <h1>Conecte o celular</h1>
              <p>Use a câmera do celular como sensor de movimento, do mesmo jeito que no MexeMundo.</p>
              {qrSrc && <img src={qrSrc} alt="QR Code para abrir o sensor MexeMundo no celular" />}
              <strong>{motion.room}</strong>
              <small>Ou abra o MexeMundo no celular e digite este código.</small>
            </> : <>
              <h1>Calibração</h1>
              <p>Fique de frente para a câmera e levante as duas mãos.</p>
              <div className="mg001-calibration"><i style={{ width: `${Math.round(motion.calibrationProgress * 100)}%` }} /></div>
              <strong>{Math.round(motion.calibrationProgress * 100)}%</strong>
            </>}
          </div>
        </section>
      )}

      {motion.status === 'ready' && <>
        {protectedIds.map(id => {
          const hotspot = scene.hotspots.find(item => item.id === id);
          if (!hotspot) return null;
          return <div key={id} className="mg001-protected" style={{ left: `${(hotspot.x + hotspot.width / 2) * 100}%`, top: `${(hotspot.y + hotspot.height / 2) * 100}%` }} aria-label="Informação protegida">🛡️</div>;
        })}

        {highlighted && <div className="mg001-hint" style={{ left: `${highlighted.x * 100}%`, top: `${highlighted.y * 100}%`, width: `${highlighted.width * 100}%`, height: `${highlighted.height * 100}%` }} />}

        <div className={`mg001-hand left${leftDwell ? ' is-holding' : ''}`} style={{ left: `${motion.pose.left.x * 100}%`, top: `${motion.pose.left.y * 100}%`, '--hold': leftProgress } as CSSProperties}><i /></div>
        <div className={`mg001-hand right${rightDwell ? ' is-holding' : ''}`} style={{ left: `${motion.pose.right.x * 100}%`, top: `${motion.pose.right.y * 100}%`, '--hold': rightProgress } as CSSProperties}><i /></div>

        {hintLevel === 1 && <div className="mg001-hint-copy">👀 Olhe com atenção para a foto.</div>}
        {hintLevel >= 3 && remaining[0] && <div className="mg001-hint-copy strong">💡 Procure uma informação pessoal nesta região.</div>}
      </>}
    </main>
  );
}
