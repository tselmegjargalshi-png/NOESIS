/**
 * Procedural human head & bust.
 *
 * Model space: +X is the direction the face looks, +Y up, Z is lateral.
 * The surface is a superellipse cross-section swept over height, driven by a
 * hand-tuned anatomical profile table (skull, brow, nose, lips, chin, jaw, neck,
 * shoulders) with local feature displacements (eye sockets, nose, lips, ear).
 * Points are drawn with area-weighted rejection sampling so density is uniform
 * on the surface, and normals come from the surface tangents.
 */
import { gauss, smoothstep, type Rng } from '../rng';

interface Knot {
  y: number;
  f: number; // front extent (+x)
  b: number; // back extent (-x), positive
  w: number; // half width (z)
}

// Ascending in y. Above y = CAP_Y the cranium is closed with an ellipsoid cap.
const KNOTS: Knot[] = [
  { y: -2.7, f: 0.58, b: 0.72, w: 2.05 },
  { y: -2.35, f: 0.54, b: 0.7, w: 1.85 },
  { y: -2.05, f: 0.47, b: 0.64, w: 1.3 },
  { y: -1.85, f: 0.39, b: 0.59, w: 0.62 },
  { y: -1.65, f: 0.34, b: 0.56, w: 0.45 },
  { y: -1.4, f: 0.31, b: 0.55, w: 0.41 },
  { y: -1.2, f: 0.33, b: 0.59, w: 0.41 },
  { y: -1.08, f: 0.5, b: 0.67, w: 0.42 },
  { y: -0.98, f: 0.64, b: 0.75, w: 0.46 },
  { y: -0.88, f: 0.7, b: 0.8, w: 0.52 },
  { y: -0.72, f: 0.68, b: 0.84, w: 0.58 },
  { y: -0.56, f: 0.72, b: 0.89, w: 0.63 },
  { y: -0.38, f: 0.77, b: 0.93, w: 0.67 },
  { y: -0.18, f: 0.81, b: 0.96, w: 0.71 },
  { y: 0.02, f: 0.82, b: 0.97, w: 0.73 },
  { y: 0.16, f: 0.85, b: 0.98, w: 0.75 },
  { y: 0.3, f: 0.9, b: 0.99, w: 0.77 },
];

const CAP_Y = 0.3;
const CAP_RY = 1.04;
export const HEAD_TOP = CAP_Y + CAP_RY;
export const HEAD_BOTTOM = -2.7;

const E = 0.9; // superellipse exponent, <1 squares the section slightly

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Catmull–Rom-ish smooth interpolation of the table at height y. */
function profile(y: number): [number, number, number] {
  if (y >= CAP_Y) {
    const t = Math.min(1, (y - CAP_Y) / CAP_RY);
    const s = Math.pow(Math.max(0, 1 - t * t), 0.42);
    const last = KNOTS[KNOTS.length - 1];
    return [last.f * s, last.b * s, last.w * s];
  }
  if (y <= KNOTS[0].y) {
    const k = KNOTS[0];
    return [k.f, k.b, k.w];
  }
  let i = 0;
  while (i < KNOTS.length - 2 && y > KNOTS[i + 1].y) i++;
  const a = KNOTS[i];
  const b = KNOTS[i + 1];
  const t = (y - a.y) / (b.y - a.y);
  const s = t * t * (3 - 2 * t);
  return [lerp(a.f, b.f, s), lerp(a.b, b.b, s), lerp(a.w, b.w, s)];
}

const g = (x: number, s: number) => Math.exp(-((x / s) * (x / s)));

/** Extra forward displacement of the face as a function of (y, |z|). */
function faceRelief(y: number, az: number): number {
  let d = 0;

  // Nose: bridge → tip → under-nose, narrow gaussian in z, wider at the base.
  const bridge = smoothstep(0.26, -0.2, y);
  const tipDrop = smoothstep(-0.2, -0.31, y);
  const noseLen = 0.34 * Math.pow(bridge, 1.35) * (1 - 0.86 * tipDrop);
  const sigma = 0.05 + 0.09 * smoothstep(0.12, -0.22, y);
  d += noseLen * g(az, sigma);
  // Nostril wings
  d += 0.07 * g(y + 0.22, 0.06) * g(az - 0.17, 0.06);

  // Eye sockets & brow ridge
  d -= 0.075 * g(y - 0.16, 0.085) * g(az - 0.3, 0.13);
  d += 0.055 * g(y - 0.31, 0.065) * smoothstep(0.02, 0.2, az) * (1 - smoothstep(0.46, 0.68, az));
  // Cheekbones
  d += 0.035 * g(y + 0.08, 0.14) * g(az - 0.5, 0.14);

  // Lips (upper, lower), mouth line, chin
  d += 0.06 * g(y + 0.43, 0.05) * g(az, 0.25);
  d += 0.072 * g(y + 0.56, 0.055) * g(az, 0.23);
  d -= 0.035 * g(y + 0.495, 0.016) * g(az, 0.28);
  d += 0.05 * g(y + 0.82, 0.09) * g(az, 0.2);
  d -= 0.03 * g(y + 0.69, 0.04) * g(az, 0.2); // mentolabial fold
  return d;
}

/** Returns [x, y, z]. */
export function headSurface(y: number, phi: number, out: [number, number, number]): void {
  const [f, b, w] = profile(y);
  const u = Math.cos(phi);
  const v = Math.sin(phi);
  const au = Math.pow(Math.abs(u), E);
  const av = Math.pow(Math.abs(v), E);
  let x = u >= 0 ? f * au : -b * au;
  let z = (v >= 0 ? 1 : -1) * w * av;
  if (u > 0) x += faceRelief(y, Math.abs(z)) * Math.pow(u, 0.8);
  // Ears: a soft lateral lump just behind the centre line
  const ear = 0.085 * g(y + 0.04, 0.21) * g(u + 0.12, 0.3) * smoothstep(-0.3, 0.1, y + 0.3);
  z += (v >= 0 ? 1 : -1) * ear;
  out[0] = x;
  out[1] = y;
  out[2] = z;
}

export interface HeadSample {
  pos: Float32Array;
  nrm: Float32Array;
  tone: Float32Array;
}

const tmpA: [number, number, number] = [0, 0, 0];
const tmpB: [number, number, number] = [0, 0, 0];
const tmpC: [number, number, number] = [0, 0, 0];

function densityAtY(y: number) {
  // thin out the shoulders so the bust dissolves gracefully
  return y > -1.7 ? 1 : Math.max(0.1, 1 - (-1.7 - y) / 1.15);
}

export function sampleHead(count: number, rand: Rng): HeadSample {
  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const tone = new Float32Array(count);

  const dy = 0.004;
  const dphi = 0.004;
  const yMin = HEAD_BOTTOM + 0.2;
  const yMax = HEAD_TOP - 0.002;

  const area = (y: number, phi: number) => {
    headSurface(y, phi, tmpA);
    headSurface(y + dy, phi, tmpB);
    headSurface(y, phi + dphi, tmpC);
    const ay = [(tmpB[0] - tmpA[0]) / dy, (tmpB[1] - tmpA[1]) / dy, (tmpB[2] - tmpA[2]) / dy];
    const ap = [(tmpC[0] - tmpA[0]) / dphi, (tmpC[1] - tmpA[1]) / dphi, (tmpC[2] - tmpA[2]) / dphi];
    const cx = ay[1] * ap[2] - ay[2] * ap[1];
    const cy = ay[2] * ap[0] - ay[0] * ap[2];
    const cz = ay[0] * ap[1] - ay[1] * ap[0];
    const len = Math.hypot(cx, cy, cz);
    return { len, nx: cx / (len || 1), ny: cy / (len || 1), nz: cz / (len || 1) };
  };

  // Estimate the maximum area element for rejection sampling.
  let maxLen = 0;
  for (let i = 0; i < 4000; i++) {
    const y = yMin + rand() * (yMax - yMin);
    const l = area(y, rand() * Math.PI * 2).len * densityAtY(y);
    if (l > maxLen) maxLen = l;
  }
  maxLen *= 1.12;

  let n = 0;
  let guard = 0;
  const interior = Math.floor(count * 0.1);
  const surface = count - interior;

  while (n < surface && guard++ < count * 60) {
    // bias toward the head so the face reads clearly
    const y = yMin + rand() * (yMax - yMin);
    const phi = rand() * Math.PI * 2;
    const a = area(y, phi);
    if (rand() * maxLen > a.len * densityAtY(y)) continue;

    headSurface(y, phi, tmpA);
    let nx = a.nx;
    let ny = a.ny;
    let nz = a.nz;
    const ry = Math.min(0.35, Math.max(-1.5, y));
    if (nx * tmpA[0] + ny * (tmpA[1] - ry) + nz * tmpA[2] < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    // scatter slightly off the surface so edges breathe
    const jitter = 0.006 * gauss(rand);
    pos[n * 3] = tmpA[0] + nx * jitter;
    pos[n * 3 + 1] = tmpA[1] + ny * jitter;
    pos[n * 3 + 2] = tmpA[2] + nz * jitter;
    nrm[n * 3] = nx;
    nrm[n * 3 + 1] = ny;
    nrm[n * 3 + 2] = nz;

    // tone: glint in the eyes, a touch more on the lips
    const az = Math.abs(tmpA[2]);
    let t = 0.82 + rand() * 0.3;
    if (tmpA[0] > 0.5 && y > 0.1 && y < 0.24 && az > 0.2 && az < 0.4) t = 1.9 + rand() * 0.6;
    else if (tmpA[0] > 0.6 && y < -0.38 && y > -0.62 && az < 0.2) t *= 1.25;
    tone[n] = t;
    n++;
  }

  // Interior volume: gives the head depth and an inner glow
  for (let i = 0; i < interior && n < count; i++, n++) {
    const y = -0.9 + rand() * (HEAD_TOP - 0.15 + 0.9);
    const phi = rand() * Math.PI * 2;
    headSurface(y, phi, tmpA);
    const k = 0.25 + 0.7 * Math.pow(rand(), 0.7);
    const cy = Math.min(0.4, Math.max(-0.6, y));
    pos[n * 3] = tmpA[0] * k;
    pos[n * 3 + 1] = cy + (tmpA[1] - cy) * k;
    pos[n * 3 + 2] = tmpA[2] * k;
    nrm[n * 3] = 0;
    nrm[n * 3 + 1] = 0;
    nrm[n * 3 + 2] = 0;
    tone[n] = 0.4 + rand() * 0.25;
  }
  return { pos, nrm, tone };
}
