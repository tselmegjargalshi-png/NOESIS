'use client';

import { useEffect, useRef } from 'react';
import { onScroll, scrollTo } from '@/lib/scroll';
import { sectionProgress } from '@/lib/scene';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function Final() {
  const root = useRef<HTMLElement>(null);

  // the closing statement dissolves with the scene: opacity follows scroll, then it leaves the tab order
  useEffect(() => {
    return onScroll(() => {
      const el = root.current;
      if (!el) return;
      const p = sectionProgress('final');
      const fp = Math.min(1, Math.max(0, (p - 0.5) / 0.4));
      el.style.setProperty('--fp', fp.toFixed(3));
      el.classList.toggle('is-fading', fp > 0);
      el.classList.toggle('is-gone', fp >= 0.98);
    });
  }, []);

  return (
    <section ref={root} id="final" className="final" data-scene="final" aria-labelledby="final-title">
      <div className="final-sticky">
        <div className="wrap final-wrap">
          <Fade className="eyebrow center">
            <span className="eyebrow-dot" aria-hidden="true" />
            09 — Begin
          </Fade>
          <h2 id="final-title" className="display final-title">
            <SplitText text="Know Yourself. *Beyond* the Surface." />
          </h2>
          <Fade className="cta-row center" delay={0.2}>
            <button className="btn btn-primary btn-lg" data-magnetic data-cursor onClick={() => scrollTo(0, { duration: 3 })}>
              <span>Enter the Inner World</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 19V5m0 0l-6 6m6-6l6 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </Fade>
        </div>
      </div>
    </section>
  );
}
