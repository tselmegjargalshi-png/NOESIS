'use client';

import { useEffect, useRef, useState } from 'react';
import { AWARENESS_STAGES } from '@/lib/content';
import { onScroll } from '@/lib/scroll';
import { scene, sectionProgress } from '@/lib/scene';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function Consciousness() {
  const [stage, setStage] = useState(0);
  const meter = useRef<HTMLDivElement>(null);
  const stageRef = useRef(0);

  useEffect(() => {
    return onScroll(() => {
      const p = sectionProgress('consciousness');
      scene.consciousness = p;
      meter.current?.style.setProperty('--p', p.toFixed(4));
      let s = 0;
      AWARENESS_STAGES.forEach((st, i) => {
        if (p >= st.at) s = i;
      });
      if (s !== stageRef.current) {
        stageRef.current = s;
        setStage(s);
      }
    });
  }, []);

  const st = AWARENESS_STAGES[stage];

  return (
    <section id="consciousness" className="conscious" data-scene="consciousness" aria-labelledby="con-title">
      <div className="con-sticky">
        <div className="wrap con-wrap">
          <Fade className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            05 — Consciousness
          </Fade>
          <h2 id="con-title" className="display con-title">
            <SplitText text="How much of you is *conscious?*" />
          </h2>

          <div className="con-stage" aria-live="polite">
            <div key={stage} className="stage">
              <span className="stage-k">{st.kicker}</span>
              <p className="stage-t">{st.title}</p>
              <p className="stage-b">{st.body}</p>
            </div>
          </div>

          <div ref={meter} className="con-meter" aria-hidden="true">
            <span className="meter-top">Aware</span>
            <span className="meter-track">
              <span className="meter-fill" />
            </span>
            <span className="meter-bot">Beneath awareness</span>
          </div>

          <p className="con-hint" aria-hidden="true">
            Keep scrolling — the light descends.
          </p>
        </div>
      </div>
    </section>
  );
}
