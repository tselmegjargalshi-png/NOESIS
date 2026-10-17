'use client';

import { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { buildParticleData, type ParticleData } from '@/lib/geometry/build';
import type { DeviceProfile } from '@/lib/device';
import { Director } from './Director';
import { Backdrop, Dust } from './Atmosphere';
import { Sculpture } from './Sculpture';
import { live } from './live';

const cache = new Map<number, Promise<ParticleData>>();
function getData(count: number) {
  let p = cache.get(count);
  if (!p) {
    p = buildParticleData(count);
    cache.set(count, p);
  }
  return p;
}

export default function SceneCanvas({ device }: { device: DeviceProfile }) {
  const [data, setData] = useState<ParticleData | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let alive = true;
    getData(device.particles).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [device.particles]);

  const govern = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('gov') !== '0';

  const onDegrade = useCallback((s: number) => {
    // 1: lower pixel ratio · 2: thin the cloud · 3: drop post-processing
    if (s >= 2) live.density = 0.6;
    if (s >= 3) live.density = 0.45;
    setStage(s);
  }, []);

  const dpr: [number, number] = stage >= 1 ? [1, 1] : device.dpr;
  const post = device.post && stage < 3;
  const mobile = device.tier === 'low';
  const effects = [
    <Bloom
      key="bloom"
      intensity={device.tier === 'high' ? 0.95 : 0.7}
      luminanceThreshold={0.12}
      luminanceSmoothing={0.45}
      mipmapBlur
      radius={0.72}
    />,
    <Vignette key="vig" offset={0.28} darkness={0.72} eskil={false} />,
    ...(device.tier === 'high'
      ? [<Noise key="noise" premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />]
      : []),
  ];

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        dpr={dpr}
        flat
        camera={{ fov: 36, position: [0, 0, 7.6], near: 0.1, far: 80 }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#010108');
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
        }}
      >
        <Director reduced={device.reduced} govern={govern} onDegrade={onDegrade} />
        <Backdrop mobile={mobile} />
        <Dust count={device.dust} />
        {data && <Sculpture data={data} />}
        {post && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            {effects}
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
