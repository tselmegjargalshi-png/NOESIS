import { mulberry32 } from '../rng';
import { sampleHead } from './head';
import {
  buildNeuralLines,
  sampleBrain,
  sampleField,
  sampleLattice,
  sampleOrb,
  sampleStrata,
  sampleVortex,
  type NeuralLines,
  type Target,
} from './targets';

export interface ParticleData {
  count: number;
  head: Float32Array;
  headN: Float32Array;
  field: Float32Array;
  brain: Float32Array;
  brainN: Float32Array;
  orb: Float32Array;
  lattice: Float32Array;
  strata: Float32Array;
  vortex: Float32Array;
  rand: Float32Array; // vec4
  toneA: Float32Array; // vec4: head, brain, field, orb
  toneB: Float32Array; // vec4: lattice, strata, vortex, strata-layer
  neural: NeuralLines;
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Order that sorts a target by height (with jitter) so index i maps to a similar place in every form. */
function orderByHeight(pos: Float32Array, n: number, seed: number): Uint32Array {
  const rand = mulberry32(seed);
  const keys = new Float32Array(n);
  for (let i = 0; i < n; i++) keys[i] = pos[i * 3 + 1] + (rand() - 0.5) * 0.32;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  return idx.sort((a, b) => keys[b] - keys[a]);
}

function permute3(src: Float32Array, order: Uint32Array): Float32Array {
  const out = new Float32Array(src.length);
  for (let i = 0; i < order.length; i++) {
    const s = order[i] * 3;
    out[i * 3] = src[s];
    out[i * 3 + 1] = src[s + 1];
    out[i * 3 + 2] = src[s + 2];
  }
  return out;
}

function permute1(src: Float32Array, order: Uint32Array): Float32Array {
  const out = new Float32Array(src.length);
  for (let i = 0; i < order.length; i++) out[i] = src[order[i]];
  return out;
}

export async function buildParticleData(count: number): Promise<ParticleData> {
  const seed = 20240611;
  const rand = mulberry32(seed);
  const n = count;

  const head = sampleHead(n, mulberry32(seed + 1));
  await nextFrame();
  const brainT: Target = sampleBrain(n, mulberry32(seed + 2));
  const neural = buildNeuralLines(brainT, mulberry32(seed + 3), Math.min(520, Math.round(n / 100)), 3);
  await nextFrame();
  const field = sampleField(n, mulberry32(seed + 4));
  const orb = sampleOrb(n, mulberry32(seed + 5));
  const lattice = sampleLattice(n, mulberry32(seed + 6));
  const strata = sampleStrata(n, mulberry32(seed + 7));
  const vortex = sampleVortex(n, mulberry32(seed + 8));
  await nextFrame();

  const oH = orderByHeight(head.pos, n, 11);
  const oB = orderByHeight(brainT.pos, n, 12);
  const oF = orderByHeight(field.pos, n, 13);
  const oO = orderByHeight(orb.pos, n, 14);
  const oL = orderByHeight(lattice.pos, n, 15);
  const oS = orderByHeight(strata.pos, n, 16);
  const oV = orderByHeight(vortex.pos, n, 17);

  const toneA = new Float32Array(n * 4);
  const toneB = new Float32Array(n * 4);
  const tH = permute1(head.tone, oH);
  const tB = permute1(brainT.tone, oB);
  const tF = permute1(field.tone, oF);
  const tO = permute1(orb.tone, oO);
  const tL = permute1(lattice.tone, oL);
  const tS = permute1(strata.tone, oS);
  const tV = permute1(vortex.tone, oV);
  const layer = permute1(strata.layer, oS);
  const r4 = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    toneA[i * 4] = tH[i];
    toneA[i * 4 + 1] = tB[i];
    toneA[i * 4 + 2] = tF[i];
    toneA[i * 4 + 3] = tO[i];
    toneB[i * 4] = tL[i];
    toneB[i * 4 + 1] = tS[i];
    toneB[i * 4 + 2] = tV[i];
    toneB[i * 4 + 3] = layer[i];
    r4[i * 4] = rand();
    r4[i * 4 + 1] = rand();
    r4[i * 4 + 2] = rand();
    r4[i * 4 + 3] = rand();
  }

  return {
    count: n,
    head: permute3(head.pos, oH),
    headN: permute3(head.nrm, oH),
    field: permute3(field.pos, oF),
    brain: permute3(brainT.pos, oB),
    brainN: permute3(brainT.nrm, oB),
    orb: permute3(orb.pos, oO),
    lattice: permute3(lattice.pos, oL),
    strata: permute3(strata.pos, oS),
    vortex: permute3(vortex.pos, oV),
    rand: r4,
    toneA,
    toneB,
    neural,
  };
}
