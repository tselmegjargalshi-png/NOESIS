import SplitText, { Fade } from '@/components/ui/SplitText';

const MOVEMENTS = [
  { n: '01', t: 'Observe', d: 'Notice thoughts, feelings and reactions as they happen — without rushing to fix them.' },
  { n: '02', t: 'Understand', d: 'Learn what psychology and neuroscience actually say about why the mind behaves as it does.' },
  { n: '03', t: 'Integrate', d: 'Carry that understanding into relationships, decisions and the stories you tell about yourself.' },
];

export default function Intro() {
  return (
    <section id="intro" className="intro" data-scene="intro" aria-labelledby="intro-title">
      <div className="wrap">
        <Fade className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          02 — Introduction
        </Fade>
        <h2 id="intro-title" className="display intro-title">
          <SplitText text="Your inner world is *more complex* than it looks." />
        </h2>
        <div className="intro-grid">
          <Fade as="p" className="intro-copy">
            NOESIS is an independent, plain-language guide to the science of the mind. Beneath every ordinary moment —
            a reaction, a memory, a decision — sits a layered system of emotion, habit and meaning. We map it
            carefully, and we try not to flatten it.
          </Fade>
          <ol className="movements" aria-label="How to use NOESIS">
            {MOVEMENTS.map((m, i) => (
              <Fade as="li" key={m.n} delay={i * 0.1}>
                <span className="mv-n">{m.n}</span>
                <span className="mv-t">{m.t}</span>
                <span className="mv-d">{m.d}</span>
              </Fade>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
