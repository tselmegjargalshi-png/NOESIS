/* GLSL for the NOESIS scene. Kept in one file so uniforms and varyings stay in sync. */

export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ------------------------------------------------------------ PARTICLES */

export const particleVertex = /* glsl */ `
${NOISE_GLSL}

attribute vec3 aField;
attribute vec3 aBrain;
attribute vec3 aOrb;
attribute vec3 aLattice;
attribute vec3 aStrata;
attribute vec3 aVortex;
attribute vec3 aNormH;
attribute vec3 aNormB;
attribute vec4 aRand;
attribute vec4 aToneA;
attribute vec4 aToneB;

uniform float uTime;
uniform float uPR;
uniform float uSize;
uniform float uW[7];
uniform float uDissolve;
uniform float uOpacity;
uniform float uFlux;
uniform float uTurb;
uniform float uJitter;
uniform float uSpeed;
uniform float uExpand;
uniform float uFall;
uniform float uSwirl;
uniform float uPull;
uniform float uPulse;
uniform float uBright;
uniform float uCut;        // consciousness light-sweep (0 = only the crown lit, <0 = everything lit)
uniform float uCutOn;      // 0..1 how much the sweep affects the brain
uniform float uCalm;       // 0..1 stillness
uniform float uVel;        // scroll velocity (signed, normalised)
uniform vec3  uPointer;    // world xy, z = active strength
uniform float uPointerR;
uniform float uFocus;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;

varying vec3 vColor;
varying float vAlpha;
varying float vSoft;

mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float hash(float n){return fract(sin(n)*43758.5453123);}

void main(){
  float t = uTime;
  float sp = uSpeed;

  // ---- morph targets (some animate before blending) -------------------
  vec3 vtx = aVortex;
  if (uW[6] > 0.001) {
    float r = length(vtx.xz);
    vtx.xz = rot(t * 0.38 * sp / (r * 0.75 + 0.5)) * vtx.xz;
    vtx.yz = rot(0.95) * vtx.yz;
  }
  vec3 str = aStrata;
  if (uW[5] > 0.001) {
    float dir = aToneB.w < 0.5 ? 1.0 : -1.0;
    str.xz = rot(t * 0.07 * sp * dir * (0.4 + abs(aToneB.w - 0.5) * 2.2)) * str.xz;
  }
  vec3 orb = aOrb;
  if (uW[3] > 0.001) {
    float rr = length(orb);
    // orbital rings turn, the shells breathe
    float spin = rr > 1.5 ? t * 0.06 * (0.6 + 0.2 * rr) : t * 0.03;
    orb.xz = rot(spin) * orb.xz;
    float breathe = 1.0 + (0.035 + 0.02 * uCalm) * sin(t * 0.7 + rr * 1.5);
    orb *= rr < 1.5 ? breathe : 1.0;
  }
  vec3 lat = aLattice;

  vec3 p = position * uW[0] + aField * uW[1] + aBrain * uW[2] + orb * uW[3] + lat * uW[4] + str * uW[5] + vtx * uW[6];

  // brightness/ tone per target
  float tone = aToneA.x * uW[0] + aToneA.y * uW[2] + aToneA.z * uW[1] + aToneA.w * uW[3]
             + aToneB.x * uW[4] + aToneB.y * uW[5] + aToneB.z * uW[6];

  vec3 nrm = aNormH * uW[0] + aNormB * uW[2];
  float hasN = clamp(uW[0] + uW[2], 0.0, 1.0);

  // ---- transition swirl while morphing ---------------------------------
  float flux = uFlux;
  if (flux > 0.002) {
    float a = flux * (1.4 + aRand.x * 2.4) * (aRand.y > 0.5 ? 1.0 : -1.0);
    p.xz = rot(a * 0.55) * p.xz;
    p += vec3(snoise(p * 0.8 + 3.1), snoise(p * 0.8 + 11.7), snoise(p * 0.8 + 27.3)) * flux * (0.8 + aRand.z * 1.4);
  }

  // ---- ambient living motion --------------------------------------------
  float calmK = 1.0 - uCalm * 0.85;
  vec3 q = p * 0.62 + vec3(0.0, t * 0.1 * sp, t * 0.04 * sp);
  vec3 flow = vec3(snoise(q), snoise(q + vec3(31.4, 17.1, 5.2)), snoise(q + vec3(7.7, 53.3, 19.9)));
  p += flow * (0.032 + uTurb * 0.5) * calmK;
  // per-particle shimmer
  float ph = aRand.x * 6.2831 + t * (0.3 + aRand.y) * sp;
  p += vec3(sin(ph), cos(ph * 1.3), sin(ph * 0.7)) * 0.01 * calmK;

  // jitter (fear / anxiety) — quantised in time for a nervous flicker
  if (uJitter > 0.001) {
    float tq = floor(t * 22.0);
    vec3 jv = vec3(hash(aRand.x * 91.7 + tq), hash(aRand.y * 53.1 + tq * 1.3), hash(aRand.z * 17.3 + tq * 0.7)) - 0.5;
    p += jv * uJitter * 0.2;
  }

  // swirl around the vertical axis
  if (uSwirl > 0.001) {
    float r = length(p.xz);
    p.xz = rot(uSwirl * t * 0.16 * sp / (r * 0.5 + 0.7)) * p.xz;
  }

  // pull toward the centre, with an optional heartbeat
  float beat = pow(0.5 + 0.5 * sin(t * 2.2), 6.0) + 0.5 * pow(0.5 + 0.5 * sin(t * 2.2 - 0.9), 10.0);
  p -= normalize(p + 1e-4) * uPull * (0.25 + 0.75 * aRand.z) * (0.6 + 0.4 * beat);
  p *= 1.0 + uPulse * 0.07 * beat;

  // expand / contract
  p.xy *= 1.0 + uExpand * (0.35 + 0.65 * aRand.w);
  p.z *= 1.0 + uExpand * 0.2;

  // fall (positive) or rise (negative) cycles
  float fallFade = 1.0;
  if (abs(uFall) > 0.01) {
    float fl = fract(t * 0.07 * sp * (0.5 + aRand.z) + aRand.w);
    p.y -= fl * uFall * 3.6;
    p.x += sin(fl * 6.2831 + aRand.x * 6.0) * 0.1 * abs(uFall);
    fallFade = smoothstep(0.0, 0.12, fl) * (1.0 - smoothstep(0.55, 1.0, fl) * clamp(abs(uFall) * 1.4, 0.0, 1.0));
  }

  // ---- dissolve: the back of the head disperses on the wind -----------
  float back = clamp((0.15 - position.x) / 1.3, 0.0, 1.0) * uW[0];
  float key = mix(aRand.y, aRand.y * 0.45 + back * 0.55 + (1.0 - uW[0]) * 0.0, uW[0]);
  float diss = smoothstep(key * 0.82, key * 0.82 + 0.3, uDissolve * 1.3);
  if (diss > 0.0) {
    vec3 wind = normalize(vec3(-1.0, 0.32, 0.22));
    vec3 qd = p * 0.7 + t * 0.12;
    vec3 curl = vec3(snoise(qd), snoise(qd + 9.2), snoise(qd + 21.1));
    p += wind * diss * (0.9 + 3.6 * aRand.z) + curl * diss * 0.9;
  }

  // ---- scroll velocity stretches the cloud ----------------------------
  p.y += uVel * (aRand.z - 0.5) * 1.6;
  p.x += uVel * (aRand.x - 0.5) * 0.5;

  // ---- model → world, pointer interaction ------------------------------
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vec2 dp = wp.xy - uPointer.xy;
  float dist = length(dp);
  float push = exp(-(dist * dist) / (uPointerR * uPointerR)) * uPointer.z;
  vec2 dir = dp / (dist + 0.0001);
  wp.xy += dir * push * (0.55 + 0.9 * aRand.z);
  wp.xy += vec2(-dir.y, dir.x) * push * 0.3;
  wp.z += push * (aRand.y - 0.3) * 0.9;

  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;

  // ---- shading ----------------------------------------------------------
  float depth = -mv.z;
  float shade = 0.9;
  float rimBoost = 0.0;
  if (hasN > 0.01 && length(nrm) > 0.001) {
    vec3 nv = normalize(normalMatrix * normalize(nrm));
    float keyL = max(dot(nv, normalize(vec3(-0.55, 0.55, 0.62))), 0.0);
    float fill = max(dot(nv, normalize(vec3(0.7, -0.2, 0.5))), 0.0);
    float rim = pow(1.0 - max(nv.z, 0.0), 2.4);
    shade = 0.12 + 1.05 * keyL + 0.3 * fill + 1.5 * rim;
    rimBoost = rim;
  } else if (hasN > 0.01) {
    shade = 0.4; // interior volume
  }
  shade = mix(0.9, shade, hasN);

  // consciousness sweep on the brain
  float lit = 1.0;
  if (uCutOn > 0.001) {
    float yn = (aBrain.y + 1.45) / 2.45;
    lit = mix(1.0, smoothstep(uCut, uCut + 0.12, yn), uCutOn * uW[2]);
  }

  float tw = 0.78 + 0.22 * sin(t * (1.5 + aRand.y * 3.0) + aRand.z * 40.0);
  float lightK = clamp(shade * 0.7, 0.0, 1.0);

  vec3 col = mix(uColA, uColB, clamp(aRand.x * 0.55 + lightK * 0.65, 0.0, 1.0));
  col = mix(col, uColC, clamp(pow(lightK, 1.8) * 0.9 + rimBoost * 0.35, 0.0, 1.0));
  // unlit (unconscious) layers fall back to deep indigo
  vec3 deep = mix(uColA, uColB, 0.35) * 0.75;
  col = mix(deep, col, lit);

  float a = 0.82 * tone * shade * tw * mix(0.42, 1.0, lit);
  a *= uBright * uOpacity * fallFade;
  a *= mix(1.0, 0.0, smoothstep(0.7, 1.0, diss));
  a *= mix(1.0, 0.7 - 0.3 * aRand.w, diss * 0.6);
  a *= 1.0 - smoothstep(16.0, 26.0, depth) * 0.5;

  // ---- size & depth of field ------------------------------------------
  float coc = abs(depth - uFocus) * 0.1;
  float sz = (0.5 + 2.4 * pow(aRand.w, 3.5)) * (1.0 + coc * 1.8);
  sz *= mix(1.0, 0.45, smoothstep(0.35, 1.0, diss));
  sz *= 1.0 + 0.5 * lit * uCutOn * 0.0;
  gl_PointSize = clamp(sz * uSize * uPR * (7.0 / depth), 0.9, 26.0 * uPR);
  vSoft = clamp(coc * 1.3, 0.0, 1.0);

  vColor = col;
  vAlpha = a / (1.0 + coc * 1.1);
}
`;

export const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vSoft;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = 1.0 - d;
  float a = pow(core, mix(2.4, 1.05, vSoft));
  gl_FragColor = vec4(vColor, a * vAlpha);
  #include <colorspace_fragment>
}
`;

/* ----------------------------------------------------------- NEURAL ARCS */

export const neuralVertex = /* glsl */ `
attribute float aAlong;
attribute float aPhase;
uniform float uTime;
uniform float uSpeed;
varying float vAlong;
varying float vPhase;
varying float vY;
void main(){
  vAlong = aAlong;
  vPhase = aPhase;
  vY = position.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const neuralFragment = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uAlpha;
uniform float uCut;
uniform float uCutOn;
uniform vec3 uColB;
uniform vec3 uColC;
varying float vAlong;
varying float vPhase;
varying float vY;
void main(){
  float ph = fract(uTime * 0.16 * uSpeed + vPhase);
  float d = abs(vAlong - ph);
  d = min(d, 1.0 - d);
  float pulse = exp(-d * d * 220.0);
  float yn = (vY + 1.45) / 2.45;
  float lit = mix(1.0, smoothstep(uCut, uCut + 0.12, yn), uCutOn);
  float base = mix(0.05, 0.14, lit);
  float a = (base + pulse * mix(0.35, 1.0, lit)) * uAlpha;
  vec3 col = mix(uColB, uColC, pulse);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------ BACKGROUND */

export const bgVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

export const bgFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uGlow;
uniform float uMobile;
uniform vec3 uTint;
uniform vec3 uTintB;
uniform float uFade;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<4;i++){
    v += a*vnoise(p);
    p = p*2.03 + 7.3;
    a *= 0.5;
    if (uMobile > 0.5 && i == 1) break;
  }
  return v;
}

void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  vec2 lp = (uLight - 0.5) * vec2(asp, 1.0);
  float t = uTime * 0.03;

  // deep midnight base
  vec3 col = mix(vec3(0.0012, 0.0015, 0.007), vec3(0.004, 0.005, 0.022), smoothstep(-0.6, 0.7, p.y + 0.1));

  // drifting fog
  float f1 = fbm(p * 1.6 + vec2(t, -t * 0.6));
  float f2 = fbm(p * 3.1 - vec2(t * 0.8, t) + 4.0);
  float fog = smoothstep(0.35, 0.95, f1 * 0.7 + f2 * 0.5);
  col += uTint * fog * 0.05 * uGlow;
  col += uTintB * smoothstep(0.5, 1.0, f2) * 0.018 * uGlow;

  // volumetric key light + shafts
  vec2 d = p - lp;
  float dist = length(d);
  float halo = exp(-dist * dist * 2.2);
  float core = exp(-dist * dist * 14.0);
  float ang = atan(d.y, d.x);
  float rays = fbm(vec2(ang * 3.2 + t * 4.0, dist * 0.6 - t));
  rays = smoothstep(0.35, 0.95, rays) * exp(-dist * 1.35);
  col += uTint * halo * 0.07 * uGlow;
  col += uTintB * core * 0.05 * uGlow;
  col += uTint * rays * 0.045 * uGlow;

  // vignette
  // low-tier devices skip the post-processing vignette, so the backdrop darkens its own edges harder
  float vig = smoothstep(1.25, 0.2, length(p * vec2(0.9, 1.15)));
  col *= mix(mix(0.4, 0.12, uMobile), 1.0, vig) * mix(1.0, 0.62, uMobile);

  col *= uFade;
  // dither against banding
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0 * 0.8;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------ DUST */

export const dustVertex = /* glsl */ `
attribute vec4 aRand;
uniform float uTime;
uniform float uPR;
uniform float uScroll;
uniform vec2 uParallax;
uniform float uSpeed;
varying float vA;
varying float vSoft;
void main(){
  vec3 p = position;
  float t = uTime * uSpeed;
  p.x += sin(t * 0.07 + aRand.x * 40.0) * 0.8;
  p.y += mod(t * (0.03 + aRand.y * 0.06) + aRand.z * 30.0, 14.0) - 7.0;
  p.y -= uScroll * (0.4 + aRand.w * 0.9);
  p.y = mod(p.y + 7.0, 14.0) - 7.0;
  p.xy += uParallax * (0.5 + aRand.w);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float focus = 8.0;
  float coc = abs(depth - focus) * 0.12;
  gl_PointSize = clamp((2.0 + 7.0 * pow(aRand.w, 2.0)) * (1.0 + coc * 2.2) * uPR * (7.0 / depth), 1.0, 40.0 * uPR);
  vSoft = clamp(coc, 0.0, 1.0);
  vA = (0.1 + 0.25 * aRand.y) * (0.55 + 0.45 * sin(uTime * (0.4 + aRand.x) + aRand.z * 20.0)) / (1.0 + coc * 1.8);
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uCol;
uniform float uOpacity;
varying float vA;
varying float vSoft;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = pow(1.0 - d, mix(2.0, 0.7, vSoft));
  gl_FragColor = vec4(uCol, a * vA * uOpacity);
  #include <colorspace_fragment>
}
`;
