# NOESIS — Enter the Inner World

An immersive, scroll-driven WebGL experience about psychology, emotion and consciousness.
One persistent GPU particle sculpture morphs between a human head, a silk-ribbon emotion field,
a brain with neural arcs, a stillness orb, a belief lattice, memory strata and a desire vortex —
driven by scroll, cursor, touch and the visitor's choices.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) · React · TypeScript |
| 3D | Three.js via React Three Fiber, custom GLSL shaders |
| Post-processing | `@react-three/postprocessing` (bloom, vignette, grain) — desktop/tablet only |
| Motion | GSAP (ticker, ScrollTrigger parallax, magnetic buttons) · Framer Motion (menu, article reader) · Lenis smooth scroll |
| Styling | Hand-written CSS design system (`src/app/globals.css`) |
| Fonts | Manrope + Space Grotesk, self-hosted via `@fontsource` (no build-time network dependency) |
| Backend | None. The site is fully static; nothing collects user data. |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start
```

Debug flags (query string): `?tier=high|mid|low` forces a performance tier, `?gov=0` disables the
adaptive governor, `?step=0.3` raises the per-frame delta cap (useful on software renderers).

## Architecture

```
src/
  app/                 layout, page, global CSS
  components/
    Experience.tsx     root client component: Lenis↔GSAP, pointer, section measuring, reveals
    canvas/            R3F scene (lazy, ssr:false)
      Director.tsx       per-frame brain: keyframes, moods, pointer, governor
      Sculpture.tsx      the particle system + neural arcs
      Atmosphere.tsx     volumetric backdrop shader + bokeh dust
      shaders.ts         all GLSL
    sections/          Hero, Intro, Emotions, Psychology, Consciousness, InnerWorld, Spirit, Articles, Final, Footer
    ui/                Nav, Cursor, Loader, SideIndex, SplitText, JourneyBar
  lib/
    scene.ts           shared mutable scene state + per-section keyframes
    content.ts         every word of copy: emotions, concepts, topics, articles
    geometry/          procedural head, brain, ribbons, orb, lattice, strata, vortex
    device.ts          capability detection → performance tier
```

### How the 3D works

* **One draw call.** ~72k particles (desktop) carry seven position targets as vertex attributes.
  The vertex shader blends them with per-form weights, so any form can melt into any other on the GPU.
* **Procedural head.** `lib/geometry/head.ts` sweeps a superellipse cross-section along a hand-tuned
  anatomical profile (skull, brow, nose, lips, chin, jaw, ear, neck, shoulders), sampled with area-weighted
  rejection so density is uniform and normals are real. No external assets, no licensing concerns.
* **Index-matched morphs.** Every target is sorted by height so particle *i* maps to a similar place in each
  form; transitions flow instead of scrambling.
* **State, not React.** `scene` (`lib/scene.ts`) is a mutable store written by DOM sections and read in the
  render loop. Scrolling and pointer movement never trigger React renders.
* **Emotion physics.** Each emotion is a *mood* (turbulence, jitter, speed, expansion, fall/rise, swirl,
  pull, heartbeat pulse, size, brightness) plus a palette; the Director damps toward it.

### Performance

* WebGL stack is code-split (`next/dynamic`, `ssr:false`); the page is readable before it loads.
* Tiers by hardware: **high** 72k particles + bloom/grain · **mid** 38k + bloom · **low** 18k, no post-processing.
* A runtime governor measures frame rate and steps down (pixel ratio → particle density → post-processing).
* Geometry, materials and neural arcs are disposed on unmount; `setDrawRange` adapts density without rebuilding.
* `prefers-reduced-motion`: no smooth-scroll hijack, no reveal choreography, slowed and softened scene.
* No WebGL: the full content renders over a CSS atmosphere.

### Accessibility

Semantic landmarks and headings, skip link, keyboard-operable emotion/topic/tab controls (arrow-key tabs),
focus-trapped article reader with Escape and focus return, `aria-live` regions, visible focus rings,
decorative canvas hidden from assistive tech.

## Deploy

The app is a standard Next.js project and deploys to Vercel with zero configuration
(framework preset: Next.js, no environment variables).

## Content note

Articles and copy are original and written to be conservative about the science; contested figures
(e.g. the popular "95% unconscious" claim) are explicitly flagged as simplifications.
The site is educational and not a substitute for professional care.
