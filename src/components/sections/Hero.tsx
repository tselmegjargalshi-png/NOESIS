'use client';

import { startJourney } from '@/lib/journey';
import { scrollTo } from '@/lib/scroll';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function Hero() {
  return (
    <section id="top" className="hero" data-scene="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <Fade hero className="eyebrow" delay={0.2}>
          <span className="eyebrow-dot" aria-hidden="true" />
          Psychology · Emotion · Consciousness
        </Fade>
        <h1 id="hero-title" className="display hero-title">
          <SplitText hero text="Understand What *Moves* Within." />
        </h1>
        <Fade hero as="p" className="lede" delay={0.5}>
          Explore the psychology of emotions, consciousness, behavior, and the invisible forces shaping the human
          experience.
        </Fade>
        <Fade hero className="cta-row" delay={0.7}>
          <button className="btn btn-primary" data-magnetic data-cursor onClick={() => scrollTo('#intro', { duration: 2.2 })}>
            <span>Explore the Mind</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14m0 0l-6-6m6 6l6-6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button className="btn btn-ghost" data-magnetic data-cursor onClick={startJourney}>
            <span>Begin Your Journey</span>
          </button>
        </Fade>
      </div>

      <div className="hero-foot">
        <Fade hero className="scroll-cue" delay={1}>
          <span className="scroll-line" aria-hidden="true" />
          <span>Scroll to descend</span>
        </Fade>
        <Fade hero className="hero-hint" delay={1.1}>
          <span className="hint-fine">Move your cursor — the mind responds.</span>
          <span className="hint-touch">Touch and drag — the mind responds.</span>
        </Fade>
      </div>
    </section>
  );
}
