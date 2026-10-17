import { getLenis, scrollTo } from './scroll';
import { scene } from './scene';

type Listener = (active: boolean) => void;

let active = false;
let timer = 0;
let step = 0;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(active));

export function onJourney(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function targets(): (string | number)[] {
  const out: (string | number)[] = ['#intro', '#emotions', '#psychology'];
  const c = scene.sections.find((s) => s.id === 'consciousness');
  if (c) {
    const span = c.height - scene.vh;
    out.push(c.top, c.top + span * 0.42, c.top + span * 0.9);
  }
  out.push('#inner', '#spirit', '#articles');
  const f = scene.sections.find((s) => s.id === 'final');
  if (f) out.push(f.top + (f.height - scene.vh) * 0.9);
  return out;
}

const onInput = (e: Event) => {
  const t = e.target as HTMLElement | null;
  if (t?.closest?.('[data-journey-stop]')) return;
  stopJourney();
};

export function stopJourney() {
  if (!active) return;
  active = false;
  window.clearTimeout(timer);
  window.removeEventListener('wheel', onInput);
  window.removeEventListener('touchstart', onInput);
  window.removeEventListener('keydown', onInput);
  window.removeEventListener('pointerdown', onInput);
  const l = getLenis();
  if (l) l.scrollTo(l.scroll, { immediate: true });
  emit();
}

export function startJourney() {
  if (active) return;
  active = true;
  step = 0;
  emit();
  const list = targets();
  const run = () => {
    if (!active) return;
    if (step >= list.length) {
      stopJourney();
      return;
    }
    scrollTo(list[step++], { duration: 3.4 });
    timer = window.setTimeout(run, 3400 + 3300);
  };
  scrollTo(0, { duration: 1.2 });
  timer = window.setTimeout(() => {
    // listeners attach after the first leg starts so our own scroll doesn't cancel it
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    window.addEventListener('pointerdown', onInput);
    run();
  }, 900);
}
