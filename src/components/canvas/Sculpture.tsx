'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParticleData } from '@/lib/geometry/build';
import { scene } from '@/lib/scene';
import { live } from './live';
import { neuralFragment, neuralVertex, particleFragment, particleVertex } from './shaders';

function buildGeometry(d: ParticleData) {
  const g = new THREE.BufferGeometry();
  const add = (name: string, arr: Float32Array, size: number) =>
    g.setAttribute(name, new THREE.BufferAttribute(arr, size));
  add('position', d.head, 3);
  add('aField', d.field, 3);
  add('aBrain', d.brain, 3);
  add('aOrb', d.orb, 3);
  add('aLattice', d.lattice, 3);
  add('aStrata', d.strata, 3);
  add('aVortex', d.vortex, 3);
  add('aNormH', d.headN, 3);
  add('aNormB', d.brainN, 3);
  add('aRand', d.rand, 4);
  add('aToneA', d.toneA, 4);
  add('aToneB', d.toneB, 4);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  return g;
}

function buildNeuralGeometry(d: ParticleData) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(d.neural.position, 3));
  g.setAttribute('aAlong', new THREE.BufferAttribute(d.neural.along, 1));
  g.setAttribute('aPhase', new THREE.BufferAttribute(d.neural.phase, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  return g;
}

export function Sculpture({ data }: { data: ParticleData }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const firstFrame = useRef(true);

  const geometry = useMemo(() => buildGeometry(data), [data]);
  const neuralGeo = useMemo(() => buildNeuralGeometry(data), [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPR: { value: 1 },
          uSize: { value: 1 },
          uW: { value: [1, 0, 0, 0, 0, 0, 0] },
          uDissolve: { value: 0 },
          uOpacity: { value: 1 },
          uFlux: { value: 0 },
          uTurb: { value: 0.06 },
          uJitter: { value: 0 },
          uSpeed: { value: 1 },
          uExpand: { value: 0 },
          uFall: { value: 0 },
          uSwirl: { value: 0 },
          uPull: { value: 0 },
          uPulse: { value: 0 },
          uBright: { value: 1 },
          uCut: { value: 1 },
          uCutOn: { value: 0 },
          uCalm: { value: 0 },
          uVel: { value: 0 },
          uPointer: { value: new THREE.Vector3() },
          uPointerR: { value: 1.1 },
          uFocus: { value: 7.6 },
          uColA: { value: new THREE.Color() },
          uColB: { value: new THREE.Color() },
          uColC: { value: new THREE.Color() },
        },
      }),
    [],
  );

  const neuralMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: neuralVertex,
        fragmentShader: neuralFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: 1 },
          uAlpha: { value: 0 },
          uCut: { value: 1 },
          uCutOn: { value: 0 },
          uColB: { value: new THREE.Color() },
          uColC: { value: new THREE.Color() },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      neuralGeo.dispose();
      material.dispose();
      neuralMat.dispose();
    },
    [geometry, neuralGeo, material, neuralMat],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const u = material.uniforms;
    const m = live.mood;

    g.position.copy(live.pos);
    g.scale.setScalar(live.scale);
    const lookX = scene.pointerX * 0.16;
    const lookY = scene.pointerY * 0.08;
    g.rotation.set(live.rotX - lookY, live.rotY + live.spinAcc + lookX, 0);
    g.updateMatrixWorld();

    u.uTime.value = live.time;
    u.uPR.value = gl.getPixelRatio();
    u.uSize.value = live.sizeScale * 1.55 * Math.min(1.5, Math.max(0.75, size.height / 900)) * (scene.portrait ? 1.1 : 1);
    for (let i = 0; i < 7; i++) (u.uW.value as number[])[i] = live.w[i];
    u.uDissolve.value = live.dissolve;
    u.uOpacity.value = live.opacity;
    u.uFlux.value = live.flux;
    u.uTurb.value = m.turb;
    u.uJitter.value = m.jitter;
    u.uSpeed.value = m.speed;
    u.uExpand.value = m.expand;
    u.uFall.value = m.fall;
    u.uSwirl.value = m.swirl;
    u.uPull.value = m.pull;
    u.uPulse.value = m.pulse;
    u.uBright.value = m.bright * live.glow * 0.9 * (0.85 + 0.15 * m.size);
    u.uCut.value = live.cut;
    u.uCutOn.value = live.cutOn;
    u.uCalm.value = live.calm;
    u.uVel.value = live.vel;
    (u.uPointer.value as THREE.Vector3).copy(live.pointer);
    u.uPointerR.value = live.pointerR;
    (u.uColA.value as THREE.Color).copy(live.colA);
    (u.uColB.value as THREE.Color).copy(live.colB);
    (u.uColC.value as THREE.Color).copy(live.colC);

    const drawn = Math.max(1000, Math.floor(data.count * live.density));
    geometry.setDrawRange(0, drawn);

    // neural arcs ride the brain form
    const nu = neuralMat.uniforms;
    const alpha = live.neural * live.w[2] * live.w[2] * live.opacity;
    if (lines.current) lines.current.visible = alpha > 0.01;
    nu.uTime.value = live.time;
    nu.uSpeed.value = live.neuralSpeed * m.speed;
    nu.uAlpha.value = alpha;
    nu.uCut.value = live.cut;
    nu.uCutOn.value = live.cutOn;
    (nu.uColB.value as THREE.Color).copy(live.colB);
    (nu.uColC.value as THREE.Color).copy(live.colC);

    if (firstFrame.current) {
      firstFrame.current = false;
      scene.ready = true;
      window.dispatchEvent(new Event('noesis:ready'));
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />
      <lineSegments ref={lines} geometry={neuralGeo} material={neuralMat} frustumCulled={false} renderOrder={1} />
    </group>
  );
}
