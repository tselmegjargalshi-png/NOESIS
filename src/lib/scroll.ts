import type Lenis from 'lenis';
import { scene } from './scene';

let lenis: Lenis | null = null;
const listeners = new Set<(y: number) => void>();

export function setLenis(l: Lenis | null) {
  lenis = l;
}
export function getLenis() {
  return lenis;
}

/** Subscribe to scroll (Lenis or native). Returns an unsubscribe function. */
export function onScroll(cb: (y: number) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function emitScroll(y: number) {
  scene.scroll = y;
  listeners.forEach((cb) => cb(y));
}

export interface ScrollOpts {
  duration?: number;
  offset?: number;
  immediate?: boolean;
}

export function scrollTo(target: string | number | HTMLElement, opts: ScrollOpts = {}) {
  const { duration = 1.6, offset = 0, immediate = false } = opts;
  if (lenis && !immediate) {
    lenis.scrollTo(target as never, {
      offset,
      duration,
      easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
    return;
  }
  let y = 0;
  if (typeof target === 'number') y = target;
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (el) y = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: y + offset, behavior: immediate ? 'auto' : 'smooth' });
}
