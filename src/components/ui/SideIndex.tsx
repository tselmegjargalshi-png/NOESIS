'use client';

import { useEffect, useRef, useState } from 'react';
import { onScroll } from '@/lib/scroll';
import { SCENE_ORDER, scene } from '@/lib/scene';

const LABELS: Record<string, string> = {
  hero: 'Entrance',
  intro: 'Introduction',
  emotions: 'Emotions',
  psychology: 'Psychology',
  consciousness: 'Consciousness',
  inner: 'Inner World',
  spirit: 'Presence',
  articles: 'Knowledge',
  final: 'Beyond',
};

/** Quiet position indicator: current chapter + page progress hairline. */
export default function SideIndex() {
  const [i, setI] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);
  const cur = useRef(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    return onScroll((y) => {
      const line = y + scene.vh * 0.5;
      let n = 0;
      scene.sections.forEach((s, k) => {
        if (line >= s.top) n = k;
      });
      if (n !== cur.current) {
        cur.current = n;
        setI(n);
      }
      const about = document.getElementById('about');
      if (root.current && about) root.current.style.opacity = about.getBoundingClientRect().top < scene.vh * 0.9 ? '0' : '1';
      const max = document.documentElement.scrollHeight - scene.vh;
      bar.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
    });
  }, []);

  const id = SCENE_ORDER[i] ?? 'hero';
  return (
    <aside ref={root} className="side-index" aria-hidden="true">
      <span className="si-num">
        {String(i + 1).padStart(2, '0')}
        <i>/</i>
        {String(SCENE_ORDER.length).padStart(2, '0')}
      </span>
      <span className="si-label" key={id}>
        {LABELS[id]}
      </span>
      <span ref={bar} className="si-bar" />
    </aside>
  );
}
