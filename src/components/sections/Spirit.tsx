'use client';

import { useEffect, useRef, useState } from 'react';
import { PRESENCE_WORDS } from '@/lib/content';
import { scene } from '@/lib/scene';
import SplitText, { Fade } from '@/components/ui/SplitText';

const STATES = ['Move freely', 'Settling…', 'Quiet', 'Present'];

export default function Spirit() {
  const root = useRef<HTMLElement>(null);
  const [secs, setSecs] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const bump = () => {
      scene.lastMove = performance.now();
    };
    const id = window.setInterval(() => {
      setSecs(Math.floor((performance.now() - scene.lastMove) / 1000));
    }, 250);
    window.addEventListener('keydown', bump);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('keydown', bump);
    };
  }, [visible]);

  const level = secs < 2 ? 0 : secs < 5 ? 1 : secs < 9 ? 2 : 3;
  const pct = Math.min(1, secs / 9);

  return (
    <section ref={root} id="spirit" className="spirit" data-scene="spirit" aria-labelledby="spirit-title">
      <div className="wrap spirit-wrap">
        <Fade className="eyebrow center">
          <span className="eyebrow-dot" aria-hidden="true" />
          07 — Presence
        </Fade>
        <h2 id="spirit-title" className="display spirit-title">
          <SplitText text="Be still enough to *notice.*" />
        </h2>
        <Fade as="p" className="lede center">
          Meaning is rarely found by searching harder. It tends to surface when attention settles.
        </Fade>

        <Fade className="still" delay={0.1}>
          <div className="still-ring" style={{ '--pct': pct } as React.CSSProperties} aria-hidden="true">
            <svg viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" className="r-bg" />
              <circle cx="22" cy="22" r="20" className="r-fg" pathLength="1" />
            </svg>
            <span>{String(Math.min(secs, 99)).padStart(2, '0')}s</span>
          </div>
          <div className="still-text" role="status" aria-live="polite">
            <span className="still-label">Stillness</span>
            <span className="still-state">{STATES[level]}</span>
            <span className="still-hint">Hold still. Rest the cursor, or your hands. Let the light settle.</span>
          </div>
        </Fade>

        <ul className="presence">
          {PRESENCE_WORDS.map((p, i) => (
            <Fade as="li" key={p.word} delay={i * 0.06}>
              <span className="p-w">{p.word}</span>
              <span className="p-l">{p.line}</span>
            </Fade>
          ))}
        </ul>
      </div>
    </section>
  );
}
