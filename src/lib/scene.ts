/**
 * Shared, mutable scene state. DOM sections write to it, the WebGL loop reads it
 * every frame. Deliberately NOT React state — no re-renders on scroll or pointer.
 */
import { smoothstep } from './rng';

export type SceneId =
  | 'hero'
  | 'intro'
  | 'emotions'
  | 'psychology'
  | 'consciousness'
  | 'inner'
  | 'spirit'
  | 'articles'
  | 'final';

export const SCENE_ORDER: SceneId[] = [
  'hero',
  'intro',
  'emotions',
  'psychology',
  'consciousness',
  'inner',
  'spirit',
  'articles',
  'final',
];

/** Morph target indices, matching the shader's uW[] array. */
export const T = { HEAD: 0, FIELD: 1, BRAIN: 2, ORB: 3, LATTICE: 4, STRATA: 5, VORTEX: 6 } as const;
export type TargetIndex = (typeof T)[keyof typeof T];

export interface Mood {
  turb: number;
  jitter: number;
  speed: number;
  expand: number;
  fall: number;
  swirl: number;
  pull: number;
  pulse: number;
  size: number;
  bright: number;
}

export interface Palette {
  a: string;
  b: string;
  c: string;
}

export const NEUTRAL_MOOD: Mood = {
  turb: 0.06,
  jitter: 0,
  speed: 1,
  expand: 0,
  fall: 0,
  swirl: 0.05,
  pull: 0,
  pulse: 0,
  size: 1,
  bright: 1,
};

export const NEUTRAL_PALETTE: Palette = { a: '#2a20b0', b: '#7a5cff', c: '#bfd2ff' };

export interface Keyframe {
  w: number[];
  pos: [number, number, number];
  scale: number;
  rotY: number;
  rotX: number;
  dissolve: number;
  opacity: number;
  glow: number;
  spin: number;
  /** where the volumetric light sits in screen UV */
  light: [number, number];
}

const one = (i: number) => {
  const w = [0, 0, 0, 0, 0, 0, 0];
  w[i] = 1;
  return w;
};

export function keyframeFor(id: SceneId, portrait: boolean): Keyframe {
  const P = portrait;
  switch (id) {
    case 'hero':
      return {
        w: one(T.HEAD),
        pos: P ? [0.05, 0.95, 0] : [1.7, -0.05, 0],
        scale: P ? 0.82 : 1.12,
        rotY: Math.PI + 0.58,
        rotX: 0.02,
        dissolve: 0.12,
        opacity: 1,
        glow: 1,
        spin: 0,
        light: P ? [0.5, 0.8] : [0.72, 0.62],
      };
    case 'intro':
      return {
        w: one(T.HEAD),
        pos: P ? [0.4, 1.4, -2.2] : [2.4, 0.2, -1.8],
        scale: P ? 0.9 : 1.3,
        rotY: Math.PI + 1.05,
        rotX: 0.05,
        dissolve: 0.82,
        opacity: P ? 0.55 : 0.85,
        glow: 0.8,
        spin: 0,
        light: [0.78, 0.55],
      };
    case 'emotions':
      return {
        w: one(T.FIELD),
        pos: [0, P ? 0.9 : 0, 0],
        scale: P ? 0.72 : 1,
        rotY: 0,
        rotX: 0,
        dissolve: 0,
        opacity: 1,
        glow: 1.1,
        spin: 0,
        light: [0.5, 0.5],
      };
    case 'psychology':
      return {
        w: one(T.HEAD),
        pos: P ? [0.2, 1.7, -1.2] : [2.7, 0.1, -1.2],
        scale: P ? 0.6 : 0.95,
        rotY: Math.PI + 0.12,
        rotX: 0,
        dissolve: 0.3,
        opacity: P ? 0.35 : 0.6,
        glow: 0.7,
        spin: 0,
        light: [0.85, 0.4],
      };
    case 'consciousness':
      return {
        w: one(T.BRAIN),
        pos: P ? [0, 0.3, 0] : [0.6, 0.05, 0],
        scale: P ? 0.82 : 1.55,
        rotY: -0.42,
        rotX: 0.12,
        dissolve: 0,
        opacity: 1,
        glow: 1.25,
        spin: 0.05,
        light: [0.5, 0.42],
      };
    case 'inner':
      return {
        w: one(T.BRAIN),
        pos: P ? [0, 1.7, 0] : [1.9, 0, 0],
        scale: P ? 0.62 : 1.0,
        rotY: -0.3,
        rotX: 0.1,
        dissolve: 0,
        opacity: 1,
        glow: 1,
        spin: 0.07,
        light: [0.7, 0.5],
      };
    case 'spirit':
      return {
        w: one(T.ORB),
        pos: [0, P ? 0.5 : 0.1, 0],
        scale: P ? 0.78 : 1.18,
        rotY: 0,
        rotX: 0,
        dissolve: 0,
        opacity: 1,
        glow: 1.3,
        spin: 0.03,
        light: [0.5, 0.5],
      };
    case 'articles':
      return {
        w: one(T.FIELD),
        pos: [0, 0, -1.5],
        scale: 1,
        rotY: 0,
        rotX: 0,
        dissolve: 0.1,
        opacity: 0.32,
        glow: 0.55,
        spin: 0,
        light: [0.5, 0.2],
      };
    case 'final':
    default:
      return {
        w: one(T.HEAD),
        pos: P ? [0, 0.6, 0] : [0, 0.2, 0],
        scale: P ? 0.9 : 1.22,
        rotY: -0.62,
        rotX: 0.02,
        dissolve: 0.1,
        opacity: 1,
        glow: 0.9,
        spin: 0,
        light: [0.5, 0.6],
      };
  }
}

export type EmotionId =
  | 'fear'
  | 'love'
  | 'anger'
  | 'grief'
  | 'joy'
  | 'anxiety'
  | 'desire'
  | 'shame'
  | 'hope';

export type ConceptId = 'thoughts' | 'emotions' | 'memories' | 'beliefs' | 'identity' | 'desire';

export interface SectionBox {
  id: SceneId;
  top: number;
  height: number;
}

export const scene = {
  scroll: 0,
  vel: 0,
  idx: 0,
  pointerX: 0,
  pointerY: 0,
  pointerActive: false,
  lastMove: 0,
  emotion: null as EmotionId | null,
  concept: 'thoughts' as ConceptId,
  /** 0..1 scroll progress through the sticky consciousness section */
  consciousness: 0,
  /** 0..1 progress through the final section */
  final: 0,
  vh: 800,
  portrait: false,
  ready: false,
  reduced: false,
  sections: [] as SectionBox[],
};

export function measureSections() {
  const boxes: SectionBox[] = [];
  const y = window.scrollY;
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
    const r = el.getBoundingClientRect();
    boxes.push({ id: el.dataset.scene as SceneId, top: r.top + y, height: r.height });
  });
  scene.sections = boxes;
  scene.vh = window.innerHeight;
  scene.portrait = window.innerWidth / window.innerHeight < 0.85;
}

/** Fractional section index for a scroll offset: integer part = section, fraction = blend toward the next. */
export function computeIdx(scrollY: number): number {
  const s = scene.sections;
  if (s.length < 2) return 0;
  const line = scrollY + scene.vh * 0.58;
  let idx = 0;
  for (let i = 0; i < s.length - 1; i++) {
    const boundary = s[i + 1].top;
    const win = Math.min(scene.vh * 0.9, 0.55 * Math.min(s[i].height, s[i + 1].height));
    idx += smoothstep(boundary - win / 2, boundary + win / 2, line);
  }
  return idx;
}

export function sectionProgress(id: SceneId): number {
  const b = scene.sections.find((s) => s.id === id);
  if (!b) return 0;
  const span = Math.max(1, b.height - scene.vh);
  return Math.min(1, Math.max(0, (scene.scroll - b.top) / span));
}

export function sectionProximity(id: SceneId, idx: number): number {
  const i = SCENE_ORDER.indexOf(id);
  return Math.max(0, 1 - Math.abs(idx - i) * 1.5);
}
