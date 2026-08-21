'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * CONTROOLS consumes the immutable pose contract established in MexeMundo.
 * Source of truth: luisjuniorawr1/mexemundo / public/js/tv.js + public/js/realtime.js.
 * Do not add pose detection, filters or gesture reinterpretation here.
 */
export type MexeMundoPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  visible: boolean;
};

export type MexeMundoPose = {
  detected: boolean;
  left: MexeMundoPoint;
  right: MexeMundoPoint;
  leftShoulder: MexeMundoPoint;
  rightShoulder: MexeMundoPoint;
  sequence?: number;
  processingMs?: number;
  sourceIntervalMs?: number;
};

export type MotionStatus = 'connecting' | 'pairing' | 'calibrating' | 'ready' | 'disconnected' | 'error';

const POSE_TIMEOUT_MS = 240;
const CALIBRATION_MS = 1100;
const DEFAULT_MEXEMUNDO_ORIGIN = process.env.NEXT_PUBLIC_MEXEMUNDO_MOTION_ORIGIN || 'https://mexemundo.onrender.com';

const emptyPoint = (x: number, y: number): MexeMundoPoint => ({ x, y, vx: 0, vy: 0, visible: false });
const emptyPose = (): MexeMundoPose => ({
  detected: false,
  left: emptyPoint(.35, .55),
  right: emptyPoint(.65, .55),
  leftShoulder: emptyPoint(.44, .35),
  rightShoulder: emptyPoint(.56, .35),
});

function cleanPoint(value: Partial<MexeMundoPoint> | undefined, fallback: MexeMundoPoint): MexeMundoPoint {
  const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  return {
    x: clamp(Number.isFinite(value?.x) ? Number(value?.x) : fallback.x),
    y: clamp(Number.isFinite(value?.y) ? Number(value?.y) : fallback.y),
    vx: clamp(Number.isFinite(value?.vx) ? Number(value?.vx) : 0, -4, 4),
    vy: clamp(Number.isFinite(value?.vy) ? Number(value?.vy) : 0, -4, 4),
    visible: Boolean(value?.visible),
  };
}

function cleanPose(value: Partial<MexeMundoPose>): MexeMundoPose {
  const fallback = emptyPose();
  return {
    detected: Boolean(value.detected),
    left: cleanPoint(value.left, fallback.left),
    right: cleanPoint(value.right, fallback.right),
    leftShoulder: cleanPoint(value.leftShoulder, fallback.leftShoulder),
    rightShoulder: cleanPoint(value.rightShoulder, fallback.rightShoulder),
    sequence: Number(value.sequence || 0),
    processingMs: Number(value.processingMs || 0),
    sourceIntervalMs: Number(value.sourceIntervalMs || 0),
  };
}

function handsRaised(pose: MexeMundoPose) {
  if (!pose.left.visible || !pose.right.visible) return false;
  const shoulderY = Math.min(pose.leftShoulder.y, pose.rightShoulder.y);
  return pose.left.y < shoulderY && pose.right.y < shoulderY;
}

function randomRoom() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function useMexeMundoMotion() {
  const [room] = useState(randomRoom);
  const [status, setStatus] = useState<MotionStatus>('connecting');
  const [pose, setPose] = useState<MexeMundoPose>(emptyPose);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const receivedAt = useRef(0);
  const calibrationStartedAt = useRef(0);

  const phoneUrl = useMemo(() => `${DEFAULT_MEXEMUNDO_ORIGIN}/celular?sala=${encodeURIComponent(room)}`, [room]);

  useEffect(() => {
    let active = true;
    let socket: WebSocket | null = null;
    let reconnect: number | undefined;
    let requestId = 0;

    const connect = () => {
      if (!active) return;
      setStatus('connecting');
      const wsOrigin = DEFAULT_MEXEMUNDO_ORIGIN.replace(/^http/, 'ws').replace(/\/$/, '');
      socket = new WebSocket(`${wsOrigin}/ws`);

      socket.addEventListener('open', () => {
        if (!active || !socket) return;
        requestId += 1;
        socket.send(JSON.stringify({ type: 'join', id: `controols-${requestId}`, payload: { room, role: 'tv' } }));
        setStatus('pairing');
      });

      socket.addEventListener('message', event => {
        if (!active) return;
        let message: { type?: string; payload?: unknown };
        try { message = JSON.parse(String(event.data)); } catch { return; }

        if (message.type === 'room-status') {
          const connected = Boolean((message.payload as { phone?: boolean } | undefined)?.phone);
          setPhoneConnected(connected);
          if (!connected) {
            setStatus('pairing');
            calibrationStartedAt.current = 0;
            setCalibrationProgress(0);
          } else {
            setStatus(current => current === 'ready' ? 'ready' : 'calibrating');
          }
          return;
        }

        if (message.type === 'pose') {
          const next = cleanPose((message.payload || {}) as Partial<MexeMundoPose>);
          receivedAt.current = performance.now();
          setPose(next);
        }
      });

      socket.addEventListener('close', () => {
        if (!active) return;
        setPhoneConnected(false);
        setStatus('disconnected');
        reconnect = window.setTimeout(connect, 1800);
      });

      socket.addEventListener('error', () => {
        if (active) setStatus('error');
      });
    };

    connect();
    return () => {
      active = false;
      if (reconnect) window.clearTimeout(reconnect);
      socket?.close();
    };
  }, [room]);

  useEffect(() => {
    if (!phoneConnected || status === 'ready') return;
    let frame = 0;
    const tick = (now: number) => {
      const fresh = now - receivedAt.current < POSE_TIMEOUT_MS;
      const ready = fresh && pose.detected && pose.left.visible && pose.right.visible;
      const raised = ready && handsRaised(pose);

      if (!raised) {
        calibrationStartedAt.current = 0;
        setCalibrationProgress(0);
      } else {
        if (!calibrationStartedAt.current) calibrationStartedAt.current = now;
        const progress = Math.min(1, (now - calibrationStartedAt.current) / CALIBRATION_MS);
        setCalibrationProgress(progress);
        if (progress >= 1) setStatus('ready');
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phoneConnected, pose, status]);

  return { room, status, pose, phoneConnected, calibrationProgress, phoneUrl };
}
