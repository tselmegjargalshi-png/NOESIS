import { gauss, smoothstep, type Rng } from '../rng';
import { snoise3 } from './noise';

export interface Target {
  pos: Float32Array;
  nrm: Float32Array;
  /** brightness multiplier per particle */
  tone: Float32Array;
  /** 0..1 auxiliary (strata layer index) */
  layer: Float32Array;
}

function alloc(n: number): Target {
  return {
    pos: new Float32Array(n * 3),
    nrm: new Float32Array(n * 3),
    tone: new Float32Array(n).fill(1),
    layer: new Float32Array(n),
  };
}

function setP(t: Target, i: number, x: number, y: number, z: number) {
  t.pos[i * 3] = x;
  t.pos[i * 3 + 1] = y;
  t.pos[i * 3 + 2] = z;
}

function setN(t: Target, i: number, x: number, y: number, z: number) {
  const l = Math.hypot(x, y, z) || 1;
  t.nrm[i * 3] = x / l;
  t.nrm[i * 3 + 1] = y / l;
  t.nrm[i * 3 + 2] = z / l;
}

/* ------------------------------------------------------------------ BRAIN */

export const BRAIN_Y_MIN = -1.45;
export const BRAIN_Y_MAX = 1.0;

// Cerebrum ellipsoid, front is +X.
const CRX = 1.68;
const CRY_TOP = 1.0;
const CRY_BOT = 0.72;
const CRZ = 1.32;

function cerebrumRadii(dx: number, dy: number, dz: number): [number, number, number] {
  const ry = dy >= 0 ? CRY_TOP : CRY_BOT;
  // narrower frontal pole, fuller temporal region
  const frontal = 1 - 0.18 * smoothstep(0.1, 1, dx);
  const temporal = 1 + 0.07 * smoothstep(0.1, -0.7, dy) * (1 - Math.abs(dx));
  return [CRX, ry, CRZ * frontal * temporal * (1 + 0 * dz)];
}

function gyri(x: number, y: number, z: number): number {
  // ridged noise → winding folds. returns 0..1 where high = ridge crest
  const n1 = 1 - Math.abs(snoise3(x * 2.2, y * 2.2, z * 2.2));
  const n2 = 1 - Math.abs(snoise3(x * 4.6 + 9.1, y * 4.6, z * 4.6 + 3.3));
  return Math.min(1, (n1 * n1 * 0.7 + n2 * n2 * 0.45) * 0.9);
}

export function sampleBrain(count: number, rand: Rng): Target {
  const t = alloc(count);
  let i = 0;
  const nCerebrum = Math.floor(count * 0.74);
  const nCerebellum = Math.floor(count * 0.1);
  const nStem = Math.floor(count * 0.03);

  // Cerebrum surface (area-weighted rejection on the ellipsoid)
  const maxArea = 1.0;
  let guard = 0;
  while (i < nCerebrum && guard++ < count * 40) {
    const dx = gauss(rand);
    const dy = gauss(rand);
    const dz = gauss(rand);
    const l = Math.hypot(dx, dy, dz) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const uz = dz / l;
    const [rx, ry, rz] = cerebrumRadii(ux, uy, uz);
    const area = Math.sqrt((ry * rz * ux) ** 2 + (rx * rz * uy) ** 2 + (rx * ry * uz) ** 2);
    const aMax = Math.max(rx * ry, rx * rz, ry * rz);
    if (rand() * aMax * maxArea > area) continue;

    let x = ux * rx;
    let y = uy * ry;
    let z = uz * rz;
    const nl = Math.hypot(ux / rx, uy / ry, uz / rz) || 1;
    const nx = ux / rx / nl;
    const ny = uy / ry / nl;
    const nz = uz / rz / nl;

    // longitudinal fissure
    const fissure = Math.exp(-((z / 0.09) ** 2)) * (y > -0.2 ? 0.16 : 0.07);
    const gy = gyri(x, y, z);
    const bump = (gy - 0.5) * 0.17 - fissure;
    x += nx * bump;
    y += ny * bump;
    z += nz * bump + Math.sign(z || 1) * 0.05; // gap between hemispheres

    setP(t, i, x, y, z);
    setN(t, i, nx + (gy - 0.5) * 0.15 * nx, ny, nz);
    t.tone[i] = 0.55 + gy * 0.95;
    i++;
  }

  // Cerebellum — finely striated, tucked behind and below
  const cbStart = i;
  while (i < cbStart + nCerebellum) {
    const dx = gauss(rand);
    const dy = gauss(rand);
    const dz = gauss(rand);
    const l = Math.hypot(dx, dy, dz) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const uz = dz / l;
    const rx = 0.66;
    const ry = 0.4;
    const rz = 0.78;
    const area = Math.sqrt((ry * rz * ux) ** 2 + (rx * rz * uy) ** 2 + (rx * ry * uz) ** 2);
    if (rand() * rx * rz > area) continue;
    const stripes = 0.5 + 0.5 * Math.sin(uy * ry * 46 + snoise3(ux * 2, uy * 2, uz * 2) * 3);
    const k = 1 + (stripes - 0.5) * 0.07;
    const x = -1.0 + ux * rx * k;
    const y = -0.82 + uy * ry * k;
    const z = uz * rz * k;
    setP(t, i, x, y, z);
    setN(t, i, ux / rx, uy / ry, uz / rz);
    t.tone[i] = 0.55 + stripes * 0.8;
    i++;
  }

  // Brain stem
  const stStart = i;
  while (i < stStart + nStem) {
    const s = rand();
    const a = rand() * Math.PI * 2;
    const r = 0.23 - 0.07 * s;
    const cx = -0.45 + s * 0.35;
    const cy = -0.5 - s * 0.95;
    setP(t, i, cx + Math.cos(a) * r, cy, Math.sin(a) * r);
    setN(t, i, Math.cos(a), 0, Math.sin(a));
    t.tone[i] = 0.7 + rand() * 0.4;
    i++;
  }

  // Inner volume: the deep, quiet part of the mind
  while (i < count) {
    const dx = gauss(rand);
    const dy = gauss(rand);
    const dz = gauss(rand);
    const l = Math.hypot(dx, dy, dz) || 1;
    const k = Math.pow(rand(), 0.55) * 0.9;
    setP(t, i, (dx / l) * CRX * k, (dy / l) * (dy > 0 ? CRY_TOP : CRY_BOT) * k, (dz / l) * CRZ * k * 0.95);
    setN(t, i, 0, 0, 0);
    t.tone[i] = 0.4 + rand() * 0.35;
    i++;
  }
  return t;
}

/** Neural arcs between nearby points on the brain, as a flat LineSegments buffer. */
export interface NeuralLines {
  position: Float32Array;
  along: Float32Array;
  phase: Float32Array;
}

export function buildNeuralLines(brain: Target, rand: Rng, nodes: number, links: number): NeuralLines {
  const n = brain.pos.length / 3;
  const pick: number[] = [];
  const tries = nodes * 6;
  for (let k = 0; k < tries && pick.length < nodes; k++) {
    const idx = Math.floor(rand() * n);
    // surface points only (non-zero normals)
    if (brain.nrm[idx * 3] === 0 && brain.nrm[idx * 3 + 1] === 0 && brain.nrm[idx * 3 + 2] === 0) continue;
    pick.push(idx);
  }
  const SEG = 7;
  const pos: number[] = [];
  const along: number[] = [];
  const phase: number[] = [];
  const P = brain.pos;
  const seen = new Set<string>();

  for (let a = 0; a < pick.length; a++) {
    const ia = pick[a];
    const ax = P[ia * 3];
    const ay = P[ia * 3 + 1];
    const az = P[ia * 3 + 2];
    const cand: [number, number][] = [];
    for (let b = 0; b < pick.length; b++) {
      if (a === b) continue;
      const ib = pick[b];
      const d = Math.hypot(P[ib * 3] - ax, P[ib * 3 + 1] - ay, P[ib * 3 + 2] - az);
      if (d > 0.25 && d < 1.15) cand.push([d, ib]);
    }
    cand.sort((p, q) => p[0] - q[0]);
    for (let c = 0; c < Math.min(links, cand.length); c++) {
      const ib = cand[c][1];
      const key = ia < ib ? `${ia}-${ib}` : `${ib}-${ia}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const bx = P[ib * 3];
      const by = P[ib * 3 + 1];
      const bz = P[ib * 3 + 2];
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      const mz = (az + bz) / 2;
      const dist = Math.hypot(bx - ax, by - ay, bz - az);
      // arch outward from the centre of the cerebrum
      const ol = Math.hypot(mx, my * 1.3, mz) || 1;
      const lift = 0.2 * dist;
      const cx = mx + (mx / ol) * lift;
      const cy = my + ((my * 1.3) / ol) * lift;
      const cz = mz + (mz / ol) * lift;
      const ph = rand();
      for (let s = 0; s < SEG; s++) {
        const t0 = s / SEG;
        const t1 = (s + 1) / SEG;
        for (const tt of [t0, t1]) {
          const omt = 1 - tt;
          pos.push(
            omt * omt * ax + 2 * omt * tt * cx + tt * tt * bx,
            omt * omt * ay + 2 * omt * tt * cy + tt * tt * by,
            omt * omt * az + 2 * omt * tt * cz + tt * tt * bz,
          );
          along.push(tt);
          phase.push(ph);
        }
      }
    }
  }
  return { position: new Float32Array(pos), along: new Float32Array(along), phase: new Float32Array(phase) };
}

/* ------------------------------------------------------------------ FIELD */

/**
 * Silk ribbons: nine twisting bands (one for each emotion) drifting across the stage,
 * with a little free dust between them.
 */
export function sampleField(count: number, rand: Rng): Target {
  const t = alloc(count);
  const R = 9;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.1) {
      setP(t, i, gauss(rand) * 3.4, gauss(rand) * 1.8, gauss(rand) * 1.8);
      t.tone[i] = 0.45;
      setN(t, i, 0, 0, 0);
      continue;
    }
    const r = Math.floor(rand() * R);
    const rr = r / (R - 1) - 0.5; // -0.5..0.5
    const u = rand() * 2 - 1; // along the ribbon
    const x = u * 8.2;
    // centre line: layered slow waves, each ribbon with its own phase
    const cy =
      rr * 3.6 +
      Math.sin(u * 1.7 + r * 0.9) * 0.95 +
      Math.sin(u * 3.9 + r * 2.3) * 0.28 +
      Math.cos(u * 0.8 - r) * 0.5;
    const cz = rr * 3.2 + Math.cos(u * 1.4 + r * 1.3) * 1.5 + Math.sin(u * 3.1 + r) * 0.3;
    // twisting cross-section: width tapers at the ends and pinches along the way
    const width = (0.12 + 0.3 * (0.5 + 0.5 * Math.sin(u * 2.6 + r * 1.7))) * (1 - 0.5 * u * u);
    const twist = u * 2.4 + r * 0.8;
    const v = (rand() * 2 - 1) * Math.sign(rand() - 0.5) * 0.5 + gauss(rand) * 0.5;
    const off = v * width * 1.6;
    setP(t, i, x, cy + Math.cos(twist) * off, cz + Math.sin(twist) * off * 1.4);
    setN(t, i, 0, 0, 0);
    // bright spine, soft edges
    t.tone[i] = 0.5 + 1.9 * Math.exp(-v * v * 2.6);
  }
  return t;
}

/* -------------------------------------------------------------------- ORB */

export function sampleOrb(count: number, rand: Rng): Target {
  const t = alloc(count);
  for (let i = 0; i < count; i++) {
    const roll = rand();
    let x: number, y: number, z: number;
    if (roll < 0.62) {
      const shell = roll < 0.38 ? 1.28 : roll < 0.52 ? 0.92 : 0.55;
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const wob = 1 + 0.005 * Math.sin(u * 14 + a * 3);
      x = s * Math.cos(a) * shell * wob;
      y = u * shell * wob;
      z = s * Math.sin(a) * shell * wob;
      setN(t, i, x, y, z);
      t.tone[i] = shell > 1 ? 1 : 0.7;
    } else {
      // orbital rings, tilted
      const ring = Math.floor(rand() * 3);
      const radius = [1.95, 2.4, 2.9][ring];
      const a = rand() * Math.PI * 2;
      const th = [1.15, -0.45, 0.2][ring];
      const ph = [0.3, 0.9, -0.5][ring];
      let rx = Math.cos(a) * radius + gauss(rand) * 0.012;
      let ry = gauss(rand) * 0.012;
      let rz = Math.sin(a) * radius;
      // tilt X then Z
      const y1 = ry * Math.cos(th) - rz * Math.sin(th);
      const z1 = ry * Math.sin(th) + rz * Math.cos(th);
      ry = y1;
      rz = z1;
      const x2 = rx * Math.cos(ph) - ry * Math.sin(ph);
      const y2 = rx * Math.sin(ph) + ry * Math.cos(ph);
      rx = x2;
      ry = y2;
      x = rx;
      y = ry;
      z = rz;
      setN(t, i, 0, 0, 0);
      t.tone[i] = 0.55 + rand() * 0.3;
    }
    setP(t, i, x, y, z);
  }
  return t;
}

/* ---------------------------------------------------------------- LATTICE */

export function sampleLattice(count: number, rand: Rng): Target {
  const t = alloc(count);
  const half = 1.65;
  const div = 6;
  const step = (half * 2) / div;
  for (let i = 0; i < count; i++) {
    const axis = Math.floor(rand() * 3);
    const g1 = -half + Math.floor(rand() * (div + 1)) * step;
    const g2 = -half + Math.floor(rand() * (div + 1)) * step;
    let along = (rand() * 2 - 1) * half;
    let tone = 0.55 + rand() * 0.3;
    if (rand() < 0.32) {
      // cluster at intersections to read as nodes
      along = -half + Math.round((along + half) / step) * step + gauss(rand) * 0.035;
      tone = 1.3;
    }
    const j = 0.012;
    const a = g1 + gauss(rand) * j;
    const b = g2 + gauss(rand) * j;
    if (axis === 0) setP(t, i, along, a, b);
    else if (axis === 1) setP(t, i, a, along, b);
    else setP(t, i, a, b, along);
    setN(t, i, 0, 0, 0);
    t.tone[i] = tone;
  }
  return t;
}

/* ----------------------------------------------------------------- STRATA */

export function sampleStrata(count: number, rand: Rng): Target {
  const t = alloc(count);
  const L = 9;
  for (let i = 0; i < count; i++) {
    const l = Math.floor(rand() * L);
    const k = (l - (L - 1) / 2) / ((L - 1) / 2); // -1..1
    const R = 2.5 * Math.sqrt(Math.max(0.12, 1 - k * k * 0.85));
    const r = R * Math.pow(rand(), 0.55);
    const a = rand() * Math.PI * 2;
    const y = k * 1.7 + Math.sin(r * 6 + l) * 0.035 + gauss(rand) * 0.012;
    setP(t, i, Math.cos(a) * r * 1.12, y, Math.sin(a) * r);
    setN(t, i, 0, 1, 0);
    t.layer[i] = l / (L - 1);
    t.tone[i] = 0.5 + 0.7 * Math.pow(r / R, 2);
  }
  return t;
}

/* ----------------------------------------------------------------- VORTEX */

export function sampleVortex(count: number, rand: Rng): Target {
  const t = alloc(count);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    const r = 0.14 + Math.pow(rand(), 1.35) * 3.7;
    const arm = Math.floor(rand() * arms);
    const a = (arm * Math.PI * 2) / arms + r * 1.05 + gauss(rand) * (0.18 + 0.05 * r);
    const y = gauss(rand) * (0.05 + 0.55 * Math.exp(-r * 1.5));
    setP(t, i, Math.cos(a) * r, y, Math.sin(a) * r);
    setN(t, i, 0, 0, 0);
    t.tone[i] = 0.5 + 0.8 * Math.exp(-r * 0.9);
  }
  return t;
}
