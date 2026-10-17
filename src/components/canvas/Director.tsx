'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONCEPTS, EMOTIONS } from '@/lib/content';
import {
  NEUTRAL_MOOD,
  NEUTRAL_PALETTE,
  SCENE_ORDER,
  computeIdx,
  keyframeFor,
  scene,
  sectionProgress,
  sectionProximity,
  type Keyframe,
  type Mood,
} from '@/lib/scene';
import { clamp, lerp, smoothstep } from '@/lib/rng';
import { live } from './live';

const MOOD_KEYS = Object.keys(NEUTRAL_MOOD) as (keyof Mood)[];
const damp = (a: number, b: number, rate: number, dt: number) => lerp(a, b, 1 - Math.exp(-rate * dt));

const _ca = new THREE.Color();
const _cb = new THREE.Color();
const _cc = new THREE.Color();

interface Props {
  reduced: boolean;
  govern: boolean;
  onDegrade: (stage: number) => void;
}

/**
 * Runs first every frame. Turns scroll position + interaction state into the
 * continuous values the particle shaders consume.
 */
export function Director({ reduced, govern, onDegrade }: Props) {
  const { camera, size } = useThree();
  const gov = useRef({ acc: 0, frames: 0, bad: 0, stage: 0, warm: 0 });
  const kfCache = useRef<{ portrait: boolean; kfs: Keyframe[] } | null>(null);
  const tmpW = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const lastScroll = useRef(0);
  // `?step=0.3` lifts the per-frame delta cap — only useful for QA on software renderers
  const maxDt = useRef(0.05);
  // set when the loader lifts: the head assembles out of dispersed particles
  const introAt = useRef<number | null>(null);
  useEffect(() => {
    const v = parseFloat(new URLSearchParams(window.location.search).get('step') ?? '');
    if (v > 0 && v <= 0.5) maxDt.current = v;
    const enter = () => (introAt.current = live.time);
    window.addEventListener('noesis:enter', enter);
    return () => window.removeEventListener('noesis:enter', enter);
  }, []);
  const velTarget = useRef(0);

  useEffect(() => {
    kfCache.current = null;
  }, [size.width, size.height]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, maxDt.current);
    const timeScale = reduced ? 0.18 : 1;
    live.time += dt * timeScale;

    // ---- keyframes ---------------------------------------------------------
    const portrait = scene.portrait;
    if (!kfCache.current || kfCache.current.portrait !== portrait) {
      kfCache.current = { portrait, kfs: SCENE_ORDER.map((id) => keyframeFor(id, portrait)) };
    }
    const kfs = kfCache.current.kfs;

    // raw fractional section index → eased
    const rawIdx = computeIdx(scene.scroll);
    scene.idx = damp(scene.idx, rawIdx, reduced ? 4 : 7, dt);
    const idx = clamp(scene.idx, 0, kfs.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, kfs.length - 1);
    const f = idx - i0;
    const A = kfs[i0];
    const B = kfs[i1];

    // The "inner world" keyframe is driven by the selected concept
    const concept = CONCEPTS.find((c) => c.id === scene.concept) ?? CONCEPTS[0];
    const innerI = SCENE_ORDER.indexOf('inner');
    const wOf = (k: Keyframe, i: number) => {
      if (i === innerI) {
        const w = [0, 0, 0, 0, 0, 0, 0];
        w[concept.target] = 1;
        return w;
      }
      return k.w;
    };
    const wa = wOf(A, i0);
    const wb = wOf(B, i1);
    const tw = tmpW.current;
    let maxW = 0;
    for (let k = 0; k < 7; k++) {
      tw[k] = lerp(wa[k], wb[k], f);
      // smooth weights toward the target: this is what makes forms melt into each other
      live.w[k] = damp(live.w[k], tw[k], 2.6, dt);
      if (live.w[k] > maxW) maxW = live.w[k];
    }
    const wSum = live.w.reduce((a, b) => a + b, 0) || 1;
    for (let k = 0; k < 7; k++) live.w[k] /= wSum;
    const flux = clamp((1 - maxW / 1) * 1.6, 0, 1);
    live.flux = damp(live.flux, flux, 6, dt);

    const sc = (k: Keyframe, i: number) => (i === innerI ? k.scale * concept.scale : k.scale);
    const pInner = sectionProximity('inner', idx);

    const tx = lerp(A.pos[0], B.pos[0], f);
    const ty = lerp(A.pos[1], B.pos[1], f);
    const tz = lerp(A.pos[2], B.pos[2], f);
    live.pos.x = damp(live.pos.x, tx, 4, dt);
    live.pos.y = damp(live.pos.y, ty, 4, dt);
    live.pos.z = damp(live.pos.z, tz, 4, dt);
    live.scale = damp(live.scale, lerp(sc(A, i0), sc(B, i1), f), 4, dt);
    live.rotY = damp(live.rotY, lerp(A.rotY, B.rotY, f), 3, dt);
    live.rotX = damp(live.rotX, lerp(A.rotX, B.rotX, f), 3, dt);
    live.spin = damp(live.spin, lerp(A.spin, B.spin, f) + concept.spin * pInner, 3, dt);
    live.glow = damp(live.glow, lerp(A.glow, B.glow, f), 3, dt);

    let dissolve = lerp(A.dissolve, B.dissolve, f);
    let opacity = lerp(A.opacity, B.opacity, f);
    let fade = 1;

    // gentle dissolve/reform cycle on the hero head — "alive", not static
    const pHero = sectionProximity('hero', idx);
    if (pHero > 0 && !reduced) {
      dissolve += pHero * 0.09 * (0.5 + 0.5 * Math.sin(live.time * 0.35));
    }

    // final section: dissolve into darkness
    const fin = sectionProgress('final');
    const pFinal = sectionProximity('final', idx);
    scene.final = fin;
    if (pFinal > 0 || idx > SCENE_ORDER.length - 1.5) {
      const k = smoothstep(0.3, 1.0, fin) * clamp((idx - (SCENE_ORDER.length - 2)) * 2, 0, 1);
      dissolve += k * 1.25;
      opacity *= 1 - smoothstep(0.55, 1, k) * 0.95;
      fade = 1 - smoothstep(0.55, 1, k) * 0.99;
    }
    // opening: dispersed → head, over ~4s
    const intro = reduced ? 0 : introAt.current === null ? 1 : 1 - smoothstep(0, 4.4, live.time - introAt.current);
    dissolve += intro * 1.3;
    live.dissolve = damp(live.dissolve, dissolve, intro > 0 ? 2.2 : 3.5, dt);
    live.opacity = damp(live.opacity, opacity, 4, dt);
    live.fade = damp(live.fade, fade, 3, dt);

    live.light.x = damp(live.light.x, lerp(A.light[0], B.light[0], f), 2.5, dt);
    live.light.y = damp(live.light.y, lerp(A.light[1], B.light[1], f), 2.5, dt);

    // ---- mood & palette ---------------------------------------------------
    const target: Mood = { ...NEUTRAL_MOOD };
    let pa = NEUTRAL_PALETTE;
    const pEmo = sectionProximity('emotions', idx);
    const emo = scene.emotion ? EMOTIONS.find((e) => e.id === scene.emotion) : undefined;
    if (emo && pEmo > 0) {
      for (const k of MOOD_KEYS) target[k] = lerp(target[k], emo.mood[k], pEmo);
      pa = pEmo > 0.4 ? emo.palette : pa;
    }
    if (pInner > 0) {
      for (const k of MOOD_KEYS) target[k] = lerp(target[k], concept.mood[k], pInner);
      pa = pInner > 0.4 ? concept.palette : pa;
    }
    // stillness section: calm as the pointer rests
    const pSpirit = sectionProximity('spirit', idx);
    const still = clamp((performance.now() - scene.lastMove) / 7000, 0, 1);
    const calmTarget = pSpirit * (reduced ? 1 : still);
    live.calm = damp(live.calm, calmTarget, 1.2, dt);
    if (pSpirit > 0) {
      target.speed = lerp(target.speed, 0.55, pSpirit * live.calm);
      target.bright = lerp(target.bright, 1.25, pSpirit * live.calm);
      target.pulse = lerp(target.pulse, 0.0, pSpirit);
    }
    for (const k of MOOD_KEYS) live.mood[k] = damp(live.mood[k], target[k], 2.2, dt);
    _ca.set(pa.a);
    _cb.set(pa.b);
    _cc.set(pa.c);
    live.colA.lerp(_ca, 1 - Math.exp(-3 * dt));
    live.colB.lerp(_cb, 1 - Math.exp(-3 * dt));
    live.colC.lerp(_cc, 1 - Math.exp(-3 * dt));
    live.tintA.copy(live.colA).multiplyScalar(1.2);
    live.tintB.copy(live.colB).multiplyScalar(0.9);

    // ---- consciousness sweep ---------------------------------------------
    const pCon = sectionProximity('consciousness', idx);
    const cp = scene.consciousness;
    const cut = lerp(0.84, -0.22, smoothstep(0.3, 0.68, cp)) + 0.015 * Math.sin(live.time * 1.3);
    live.cut = damp(live.cut, cut, 5, dt);
    live.cutOn = damp(live.cutOn, pCon > 0.01 ? clamp(pCon * 1.4, 0, 1) : 0, 4, dt);
    live.neural = damp(
      live.neural,
      clamp(pCon * 1.2, 0, 1) * 0.9 + pInner * concept.neural * 0.9,
      3,
      dt,
    );
    live.neuralSpeed = 0.7 + cp * 1.2 + pInner * concept.neural * 1.2;

    // ---- pointer & scroll velocity -------------------------------------
    const fovRad = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const cz = portrait ? 9.4 : 7.6;
    live.halfH = Math.tan(fovRad / 2) * cz;
    live.halfW = live.halfH * (size.width / size.height);
    const px = scene.pointerX * live.halfW;
    const py = scene.pointerY * live.halfH;
    const active = scene.pointerActive ? 1 : 0;
    live.pointer.x = damp(live.pointer.x, px, 14, dt);
    live.pointer.y = damp(live.pointer.y, py, 14, dt);
    live.pointer.z = damp(live.pointer.z, active * (reduced ? 0.2 : 0.55), 5, dt);
    live.pointerR = portrait ? 0.9 : 1.15;
    live.parallax.x = damp(live.parallax.x, scene.pointerX * 0.45, 2.5, dt);
    live.parallax.y = damp(live.parallax.y, scene.pointerY * 0.3, 2.5, dt);

    const dScroll = scene.scroll - lastScroll.current;
    lastScroll.current = scene.scroll;
    velTarget.current = clamp(dScroll / Math.max(1, scene.vh) / Math.max(dt, 0.001) / 6, -1, 1);
    live.vel = damp(live.vel, velTarget.current, 6, dt);
    scene.vel = live.vel;

    // ---- camera -------------------------------------------------------------
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.x = damp(cam.position.x, live.parallax.x * (reduced ? 0.2 : 1), 3, dt);
    cam.position.y = damp(cam.position.y, live.parallax.y * (reduced ? 0.2 : 1) - live.vel * 0.15, 3, dt);
    cam.position.z = damp(cam.position.z, cz, 2, dt);
    cam.lookAt(0, 0, 0);
    live.spinAcc += live.spin * dt * (reduced ? 0.2 : 1);

    // ---- performance governor --------------------------------------------
    const g = gov.current;
    g.warm += dt;
    if (govern && g.warm > 4 && g.stage < 3 && !reduced) {
      g.acc += rawDt;
      g.frames++;
      if (g.acc >= 2) {
        const fps = g.frames / g.acc;
        g.bad = fps < 36 ? g.bad + 1 : 0;
        g.acc = 0;
        g.frames = 0;
        if (g.bad >= 2) {
          g.stage++;
          g.bad = 0;
          g.warm = 2;
          onDegrade(g.stage);
        }
      }
    }
  }, -10);

  return null;
}
