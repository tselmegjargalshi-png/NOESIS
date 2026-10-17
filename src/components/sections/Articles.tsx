'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ARTICLES, type Article, type ArticleCategory } from '@/lib/content';
import { getLenis } from '@/lib/scroll';
import SplitText, { Fade } from '@/components/ui/SplitText';

const CATEGORIES: ('All' | ArticleCategory)[] = [
  'All',
  'Psychology',
  'Emotions',
  'Relationships',
  'Self-awareness',
  'Consciousness',
  'Human behavior',
];

export default function Articles() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('All');
  const [open, setOpen] = useState<Article | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const list = filter === 'All' ? ARTICLES : ARTICLES.filter((a) => a.category === filter);

  const close = useCallback(() => {
    setOpen(null);
    window.setTimeout(() => opener.current?.focus(), 50);
  }, []);

  return (
    <section id="articles" className="articles" data-scene="articles" aria-labelledby="articles-title">
      <div className="wrap">
        <div className="art-head">
          <div>
            <Fade className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              08 — Knowledge
            </Fade>
            <h2 id="articles-title" className="display art-title">
              <SplitText text="Read the *mind.*" />
            </h2>
          </div>
          <Fade as="p" className="art-sub">
            Careful, readable essays on psychology and consciousness. Each one separates what research supports from
            what is still debated.
          </Fade>
        </div>

        <div className="chips" role="group" aria-label="Filter articles by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${filter === c ? 'is-on' : ''}`}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              data-cursor
            >
              {c}
            </button>
          ))}
        </div>

        <ul className="art-list">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((a) => (
              <motion.li
                key={a.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ '--tint': a.tint } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="art-row"
                  data-cursor="Read"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setOpen(a);
                  }}
                  onPointerMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                  }}
                >
                  <span className="art-n">{String(ARTICLES.indexOf(a) + 1).padStart(2, '0')}</span>
                  <span className="art-cat">{a.category}</span>
                  <span className="art-main">
                    <span className="art-t">{a.title}</span>
                    <span className="art-d">{a.dek}</span>
                  </span>
                  <span className="art-meta">
                    {a.minutes} min
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H8M17 7v9" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <Reader article={open} onClose={close} />
    </section>
  );
}

function Reader({ article, onClose }: { article: Article | null; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!article) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button,a,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      lenis?.start();
      document.documentElement.style.overflow = '';
    };
  }, [article, onClose]);

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="reader"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reader-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{ '--tint': article.tint } as React.CSSProperties}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            ref={panel}
            className="reader-panel"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeBtn} className="reader-close" onClick={onClose} aria-label="Close article" data-cursor>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <article>
              <p className="reader-cat">
                {article.category} <span>·</span> {article.minutes} min read
              </p>
              <h3 id="reader-title" className="reader-title">
                {article.title}
              </h3>
              <p className="reader-dek">{article.dek}</p>
              <div className="reader-body">
                {article.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="reader-foot">
                NOESIS publishes educational writing, not clinical advice. If something here resonates with a
                difficulty you are facing, a qualified professional can help.
              </p>
            </article>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
