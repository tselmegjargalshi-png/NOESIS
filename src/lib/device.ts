export type Tier = 'high' | 'mid' | 'low';

export interface DeviceProfile {
  tier: Tier;
  /** Particles in the main sculpture. */
  particles: number;
  /** Ambient bokeh dust. */
  dust: number;
  dpr: [number, number];
  post: boolean;
  coarse: boolean;
  reduced: boolean;
  webgl: boolean;
  software: boolean;
}

const TIERS: Record<Tier, Pick<DeviceProfile, 'particles' | 'dust' | 'dpr' | 'post'>> = {
  high: { particles: 72000, dust: 1400, dpr: [1, 1.75], post: true },
  mid: { particles: 38000, dust: 700, dpr: [1, 1.5], post: true },
  low: { particles: 18000, dust: 260, dpr: [1, 1.25], post: false },
};

function probeWebGL(): { ok: boolean; software: boolean } {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') as WebGL2RenderingContext | null) ?? null;
    if (!gl) return { ok: false, software: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    const software = /swiftshader|llvmpipe|software/i.test(renderer);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { ok: true, software };
  } catch {
    return { ok: false, software: false };
  }
}

/** Decide a performance tier from the hardware. `?tier=high|mid|low` overrides it for QA. */
export function detectDevice(): DeviceProfile {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { ok, software } = probeWebGL();

  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const w = Math.min(window.innerWidth, window.innerHeight * 2);

  let tier: Tier = 'high';
  if (software || cores <= 2 || mem <= 2) tier = 'low';
  else if (coarse || w < 900 || cores <= 4 || mem <= 4) tier = window.innerWidth < 640 ? 'low' : 'mid';
  if (coarse && window.innerWidth >= 900 && !software) tier = 'mid';
  if (reduced && tier === 'high') tier = 'mid';

  const forced = new URLSearchParams(window.location.search).get('tier');
  if (forced === 'high' || forced === 'mid' || forced === 'low') tier = forced;

  return { tier, ...TIERS[tier], coarse, reduced, webgl: ok, software };
}
