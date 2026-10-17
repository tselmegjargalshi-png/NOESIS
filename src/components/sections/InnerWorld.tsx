'use client';

import { useState } from 'react';
import { CONCEPTS } from '@/lib/content';
import { scene, type ConceptId } from '@/lib/scene';
import SplitText, { Fade } from '@/components/ui/SplitText';

export default function InnerWorld() {
  const [id, setId] = useState<ConceptId>('thoughts');
  const concept = CONCEPTS.find((c) => c.id === id)!;

  const pick = (c: ConceptId) => {
    setId(c);
    scene.concept = c;
  };

  return (
    <section id="inner" className="inner" data-scene="inner" aria-labelledby="inner-title">
      <div className="wrap inner-wrap">
        <div className="inner-left">
          <Fade className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            06 — The Inner World
          </Fade>
          <h2 id="inner-title" className="display inner-title">
            <SplitText text="Six layers. *One* mind." />
          </h2>

          <div className="layers" role="tablist" aria-label="Layers of the inner world" aria-orientation="vertical">
            {CONCEPTS.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={id === c.id}
                aria-controls="layer-panel"
                tabIndex={id === c.id ? 0 : -1}
                className={`layer ${id === c.id ? 'is-on' : ''}`}
                data-cursor
                onClick={() => pick(c.id)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && pick(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const d = e.key === 'ArrowDown' ? 1 : -1;
                    const next = CONCEPTS[(i + d + CONCEPTS.length) % CONCEPTS.length];
                    pick(next.id);
                    document.getElementById(`tab-${next.id}`)?.focus();
                  }
                }}
              >
                <span className="layer-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="layer-t">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="inner-right" id="layer-panel" role="tabpanel" aria-labelledby={`tab-${id}`}>
          <div key={id} className="layer-panel">
            <p className="layer-line">{concept.line}</p>
            <p className="layer-prompt">
              <span>Reflect</span>
              {concept.prompt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
