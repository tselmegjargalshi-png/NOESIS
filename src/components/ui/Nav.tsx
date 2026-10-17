'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/content';
import { getLenis, onScroll, scrollTo } from '@/lib/scroll';
import { scene } from '@/lib/scene';

const SPY: Record<string, string> = {
  intro: '#intro',
  emotions: '#emotions',
  psychology: '#psychology',
  consciousness: '#consciousness',
  inner: '#consciousness',
  spirit: '#consciousness',
  articles: '#articles',
};

export default function Nav() {
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');
  const last = useRef(0);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return onScroll((y) => {
      setCompact(y > 90);
      const dy = y - last.current;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 700);
        last.current = y;
      }
      // scroll-spy from measured sections
      const line = y + scene.vh * 0.45;
      let cur = '';
      for (const s of scene.sections) if (line >= s.top) cur = s.id;
      const aboutEl = document.getElementById('about');
      if (aboutEl && line >= aboutEl.offsetTop) cur = 'about';
      setActive(cur === 'about' ? '#about' : (SPY[cur] ?? ''));
    });
  }, []);

  useEffect(() => {
    const l = getLenis();
    if (open) {
      l?.stop();
      document.documentElement.style.overflow = 'hidden';
    } else {
      l?.start();
      document.documentElement.style.overflow = '';
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollTo(href, { duration: 2 }), open ? 250 : 0);
  };

  return (
    <>
      <header className={`nav ${compact ? 'is-compact' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
        <nav className="nav-bar" aria-label="Primary">
          <a href="#top" className="nav-logo" onClick={go('#top')} aria-label="NOESIS — back to top">
            <span className="nav-glyph" aria-hidden="true" />
            <span>NOESIS</span>
          </a>
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={go(item.href)}
                  className={active === item.href ? 'is-active' : ''}
                  aria-current={active === item.href ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            ref={menuBtn}
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ul>
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={item.href} onClick={go(item.href)}>
                    <span className="menu-n">0{i + 1}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="menu-foot">Understand what moves within.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
