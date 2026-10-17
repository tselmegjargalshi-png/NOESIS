'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/rng';
import { scene } from '@/lib/scene';
import { live } from './live';
import { bgFragment, bgVertex, dustFragment, dustVertex } from './shaders';

/** Fullscreen volumetric fog + light shafts, drawn behind everything. */
export function Backdrop({ mobile }: { mobile: boolean }) {
  const size = useThree((s) => s.size);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bgVertex,
        fragmentShader: bgFragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uLight: { value: new THREE.Vector2(0.7, 0.6) },
          uGlow: { value: 1 },
          uMobile: { value: mobile ? 1 : 0 },
          uTint: { value: new THREE.Color() },
          uTintB: { value: new THREE.Color() },
          uFade: { value: 1 },
        },
      }),
    [mobile],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const u = material.uniforms;
    u.uTime.value = live.time;
    (u.uRes.value as THREE.Vector2).set(size.width, size.height);
    (u.uLight.value as THREE.Vector2).copy(live.light);
    u.uGlow.value = live.glow;
    (u.uTint.value as THREE.Color).copy(live.tintA);
    (u.uTintB.value as THREE.Color).copy(live.tintB);
    u.uFade.value = live.fade;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** Large out-of-focus motes that parallax against the scroll and give the scene scale. */
export function Dust({ count }: { count: number }) {
  const gl = useThree((s) => s.gl);
  const geometry = useMemo(() => {
    const rand = mulberry32(99);
    const pos = new Float32Array(count * 3);
    const r4 = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 20;
      pos[i * 3 + 1] = (rand() - 0.5) * 14;
      pos[i * 3 + 2] = -8 + rand() * 12;
      for (let k = 0; k < 4; k++) r4[i * 4 + k] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(r4, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPR: { value: 1 },
          uScroll: { value: 0 },
          uParallax: { value: new THREE.Vector2() },
          uSpeed: { value: 1 },
          uCol: { value: new THREE.Color() },
          uOpacity: { value: 1 },
        },
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const u = material.uniforms;
    u.uTime.value = live.time;
    u.uPR.value = gl.getPixelRatio();
    u.uScroll.value = (scene.scroll / Math.max(1, scene.vh)) * 0.9;
    (u.uParallax.value as THREE.Vector2).copy(live.parallax);
    u.uSpeed.value = live.mood.speed;
    (u.uCol.value as THREE.Color).copy(live.colB).lerp(live.colC, 0.35);
    u.uOpacity.value = live.glow * 0.9 * live.fade;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={0} />;
}
