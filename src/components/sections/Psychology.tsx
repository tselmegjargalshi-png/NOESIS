'use client';

import { useState } from 'react';
import { TOPICS } from '@/lib/content';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function Psychology() {
  const [active, setActive] = useState(0);
  const topic = TOPICS[active];

  return (
    <section id="psychology" className="psych" data-scene="psychology" aria-labelledby="psych-title">
      <div className="wrap">
        <Fade className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          04 — Psychology
        </Fade>
        <h2 id="psych-title" className="display psych-title">
          <SplitText text="Eight ideas for reading *yourself*." />
        </h2>

        <div className="psych-layout">
          <ul className="topics" aria-label="Psychological concepts">
            {TOPICS.map((t, i) => {
              const on = i === active;
              return (
                <li key={t.id} className={`topic ${on ? 'is-on' : ''}`} onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={`topic-${t.id}`}
                      onClick={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      data-cursor
                    >
                      <span className="topic-n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="topic-t">{t.title}</span>
                      <span className="topic-k">{t.kicker}</span>
                    </button>
                  </h3>
                  <div id={`topic-${t.id}`} className="topic-body" role="region" aria-label={t.title}>
                    <div className="topic-inner">
                      <p className="topic-sum">{t.summary}</p>
                      <p className="topic-det">{t.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="psych-term" aria-hidden="true">
            <span key={topic.id} className="term">
              {topic.term}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
