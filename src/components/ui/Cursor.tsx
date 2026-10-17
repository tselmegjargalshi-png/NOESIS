'use client';

import { useEffect, useRef } from 'react';

/** Premium cursor: a precise dot plus a lagging ring that reacts to interactive targets. Fine pointers only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let visible = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        dot.current?.classList.add('on');
        ring.current?.classList.add('on');
      }
      hover(e.target as HTMLElement | null);
    };
    const hover = (el: HTMLElement | null) => {
      const t = el?.closest<HTMLElement>('a,button,[data-cursor],input,summary');
      const r = ring.current;
      if (!r) return;
      if (t) {
        r.classList.add('hot');
        const txt = t.dataset.cursor;
        if (label.current) label.current.textContent = txt && txt !== 'true' ? txt : '';
        r.classList.toggle('has-label', !!txt && txt !== 'true');
      } else {
        r.classList.remove('hot', 'has-label');
      }
    };
    const leave = () => {
      visible = false;
      dot.current?.classList.remove('on');
      ring.current?.classList.remove('on');
    };
    const down = () => ring.current?.classList.add('down');
    const up = () => ring.current?.classList.remove('down');

    let n = 0;
    const tick = () => {
      // content can move under a resting pointer (scroll, dialogs) — re-check a few times a second
      if (visible && ++n % 10 === 0) hover(document.elementFromPoint(x, y) as HTMLElement | null);
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
