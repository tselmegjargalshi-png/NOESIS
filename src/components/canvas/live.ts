/**
 * Per-frame derived state shared between the Director (writes) and the
 * drawable components (read). Mutable on purpose: no React renders in the loop.
 */
import * as THREE from 'three';
import { NEUTRAL_MOOD, NEUTRAL_PALETTE, type Mood } from '@/lib/scene';

export const live = {
  time: 0,
  w: [1, 0, 0, 0, 0, 0, 0] as number[],
  pos: new THREE.Vector3(),
  scale: 1,
  rotY: 0,
  rotX: 0,
  spin: 0,
  spinAcc: 0,
  dissolve: 0,
  opacity: 1,
  glow: 1,
  fade: 1,
  light: new THREE.Vector2(0.7, 0.6),
  flux: 0,
  mood: { ...NEUTRAL_MOOD } as Mood,
  colA: new THREE.Color(NEUTRAL_PALETTE.a),
  colB: new THREE.Color(NEUTRAL_PALETTE.b),
  colC: new THREE.Color(NEUTRAL_PALETTE.c),
  tintA: new THREE.Color('#2a20b0'),
  tintB: new THREE.Color('#5a3cff'),
  neural: 0,
  neuralSpeed: 1,
  cut: 1,
  cutOn: 0,
  calm: 0,
  vel: 0,
  /** pointer in world units on the z=0 plane, z = interaction strength */
  pointer: new THREE.Vector3(),
  pointerR: 1.1,
  parallax: new THREE.Vector2(),
  /** 0..1 fraction of particles drawn (governor) */
  density: 1,
  sizeScale: 1,
  halfH: 2.6,
  halfW: 4.6,
};
