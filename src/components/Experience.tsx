'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { detectDevice, type DeviceProfile } from '@/lib/device';
import { emitScroll, scrollTo, setLenis } from '@/lib/scroll';
import { measureSections, scene } from '@/lib/scene';
import Cursor from '@/components/ui/Cursor';
import Loader from '@/components/ui/Loader';
import Nav from '@/components/ui/Nav';
import SideIndex from '@/components/ui/SideIndex';
import JourneyBar from '@/components/ui/JourneyBar';
import Hero from '@/components/sections/Hero';
import Intro from '@/components/sections/Intro';
import Emotions from '@/components/sections/Emotions';
import Psychology from '@/components/sections/Psychology';
import Consciousness from '@/components/sections/Consciousness';
import InnerWorld from '@/components/sections/InnerWorld';
import Spirit from '@/components/sections/Spirit';
import Articles from '@/components/sections/Articles';
import Final from '@/components/sections/Final';
import Footer from '@/components/sections/Footer';

// The whole WebGL stack (three, r3f, postprocessing) loads lazily, off the critical path.
const SceneCanvas = dynamic(() => import('@/components/canvas/SceneCanvas'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const [device, setDevice] = useState<DeviceProfile | null>(null);

  useEffect(() => {
    const dev = detectDevice();
    setDevice(dev);
    scene.reduced = dev.reduced;
    const root = document.documentElement;
    if (!dev.reduced) root.dataset.motion = 'on';
    root.classList.toggle('no-webgl', !dev.webgl);

    // ---- smooth scrolling ------------------------------------------------
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    if (!dev.reduced) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      setLenis(lenis);
      lenis.on('scroll', (l: Lenis) => {
        emitScroll(l.scroll);
        ScrollTrigger.update();
      });
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const nativeScroll = () => emitScroll(window.scrollY);
    if (!lenis) window.addEventListener('scroll', nativeScroll, { passive: true });

    // ---- layout measurement ----------------------------------------------
    let t = 0;
    const measure = () => {
      measureSections();
      emitScroll(lenis ? lenis.scroll : window.scrollY);
      ScrollTrigger.refresh();
    };
    const debounced = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 120);
    };
    measureSections();
    emitScroll(window.scrollY);
    const ro = new ResizeObserver(debounced);
    ro.observe(document.body);
    window.addEventListener('resize', debounced);
    document.fonts?.ready.then(measure);
    window.addEventListener('load', measure);

    // ---- pointer ------------------------------------------------------------
    let releaseTimer = 0;
    const move = (e: PointerEvent) => {
      scene.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      scene.pointerActive = true;
      scene.lastMove = performance.now();
      if (e.pointerType === 'touch') {
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(() => (scene.pointerActive = false), 700);
      }
    };
    const leave = () => (scene.pointerActive = false);
    const activity = () => (scene.lastMove = performance.now());
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('wheel', activity, { passive: true });
    window.addEventListener('touchmove', activity, { passive: true });
    scene.lastMove = performance.now();

    // ---- in-page anchors ----------------------------------------------------
    const anchor = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href')!;
      if (href.length < 2) return;
      e.preventDefault();
      scrollTo(href, { duration: 2 });
    };
    document.addEventListener('click', anchor);

    // ---- reveals ------------------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    document.querySelectorAll('[data-split],[data-fade]').forEach((el) => io.observe(el));

    const onEnter = () => document.documentElement.classList.add('entered');
    window.addEventListener('noesis:enter', onEnter);

    // ---- scrubbed parallax on headlines & magnetic buttons ----------------
    const ctx = gsap.context(() => {
      if (dev.reduced) return;
      gsap.utils.toArray<HTMLElement>('.display').forEach((el) => {
        if (el.closest('.hero')) return;
        gsap.fromTo(
          el,
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          },
        );
      });
    });

    const magnets: (() => void)[] = [];
    if (!dev.coarse && !dev.reduced) {
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
        const mv = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.36);
        };
        const lv = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener('pointermove', mv);
        el.addEventListener('pointerleave', lv);
        magnets.push(() => {
          el.removeEventListener('pointermove', mv);
          el.removeEventListener('pointerleave', lv);
        });
      });
    }

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      io.disconnect();
      ctx.revert();
      magnets.forEach((f) => f());
      window.removeEventListener('resize', debounced);
      window.removeEventListener('load', measure);
      window.removeEventListener('scroll', nativeScroll);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('wheel', activity);
      window.removeEventListener('touchmove', activity);
      window.removeEventListener('noesis:enter', onEnter);
      document.removeEventListener('click', anchor);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <>
      <Loader expectScene={device ? device.webgl : true} />
      {device?.webgl && <SceneCanvas device={device} />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      <SideIndex />
      <JourneyBar />
      <main id="main">
        <Hero />
        <Intro />
        <Emotions />
        <Psychology />
        <Consciousness />
        <InnerWorld />
        <Spirit />
        <Articles />
        <Final />
      </main>
      <Footer />
    </>
  );
}
