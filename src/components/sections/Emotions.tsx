'use client';

import { useState } from 'react';
import { EMOTIONS } from '@/lib/content';
import { scene, type EmotionId } from '@/lib/scene';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function Emotions() {
  const [selected, setSelected] = useState<EmotionId | null>(null);
  const [hover, setHover] = useState<EmotionId | null>(null);

  const apply = (sel: EmotionId | null, hov: EmotionId | null) => {
    scene.emotion = hov ?? sel;
  };
  const shown = hover ?? selected;
  const emo = EMOTIONS.find((e) => e.id === shown);

  return (
    <section id="emotions" className="emotions" data-scene="emotions" aria-labelledby="emotions-title">
      <div className="wrap">
        <Fade className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          03 — Emotions
        </Fade>
        <h2 id="emotions-title" className="sr-only">
          Emotions
        </h2>
        <p className="emo-instruction">
          <SplitText text="Choose a feeling. Watch the atmosphere change." />
        </p>

        <div
          className="emo-cloud"
          role="group"
          aria-label="Emotions"
          onPointerLeave={() => {
            setHover(null);
            apply(selected, null);
          }}
        >
          {EMOTIONS.map((e) => {
            const on = selected === e.id;
            const dim = shown !== null && shown !== e.id;
            return (
              <button
                key={e.id}
                type="button"
                className={`emo-word ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`}
                aria-pressed={on}
                data-cursor
                style={{ '--tint': e.palette.b } as React.CSSProperties}
                onPointerEnter={(ev) => {
                  if (ev.pointerType === 'touch') return;
                  setHover(e.id);
                  apply(selected, e.id);
                }}
                onFocus={() => {
                  setHover(e.id);
                  apply(selected, e.id);
                }}
                onBlur={() => {
                  setHover(null);
                  apply(selected, null);
                }}
                onClick={() => {
                  const next = on ? null : e.id;
                  setSelected(next);
                  apply(next, hover);
                }}
              >
                {e.label}
              </button>
            );
          })}
        </div>

        <div className="emo-detail" aria-live="polite">
          {emo ? (
            <div className="emo-panel" key={emo.id} style={{ '--tint': emo.palette.b } as React.CSSProperties}>
              <p className="emo-line">{emo.line}</p>
              <dl className="emo-meta">
                <div>
                  <dt>Often felt in</dt>
                  <dd>{emo.felt}</dd>
                </div>
                <div>
                  <dt>It asks</dt>
                  <dd>{emo.asks}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="emo-idle">
              Every emotion has a function. Hover, tap or focus one to see how it moves through the mind.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
