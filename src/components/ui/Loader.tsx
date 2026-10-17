'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { scene } from '@/lib/scene';

/** Opaque curtain shown from first paint until the scene has drawn its first frame. */
export default function Loader({ expectScene }: { expectScene: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let done = false;
    const start = performance.now();
    const minMs = 1500;
    let raf = 0;

    const tick = () => {
      const el = performance.now() - start;
      const p = scene.ready ? 1 : Math.min(0.92, 1 - Math.exp(-el / 1800));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      if (done) return;
      done = true;
      if (bar.current) bar.current.style.transform = 'scaleX(1)';
      const wait = Math.max(0, minMs - (performance.now() - start));
      window.setTimeout(() => {
        const r = root.current;
        if (!r) return;
        gsap.to(r, {
          opacity: 0,
          duration: 1.1,
          ease: 'power2.inOut',
          onStart: () => {
            window.dispatchEvent(new Event('noesis:enter'));
          },
          onComplete: () => setGone(true),
        });
      }, wait);
    };

    if (!expectScene || scene.ready) finish();
    window.addEventListener('noesis:ready', finish);
    // never trap the visitor behind the curtain
    const failsafe = window.setTimeout(finish, 9000);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('noesis:ready', finish);
      window.clearTimeout(failsafe);
    };
  }, [expectScene]);

  if (gone) return null;
  return (
    <div ref={root} className="loader" role="status" aria-live="polite">
      <div className="loader-inner">
        <span className="loader-mark">NOESIS</span>
        <span className="loader-line">
          <span ref={bar} className="loader-bar" />
        </span>
        <span className="loader-sub">Entering the inner world</span>
      </div>
    </div>
  );
}
