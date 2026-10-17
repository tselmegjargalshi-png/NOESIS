import { Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Renders text as masked words so GSAP can lift them into view.
 * Children may include <em> for the accent; strings are split on spaces.
 */
export default function SplitText({
  as: Tag = 'span',
  text,
  className,
  hero = false,
  id,
}: {
  as?: ElementType;
  text: string;
  className?: string;
  hero?: boolean;
  id?: string;
}) {
  // *two words* marks an accent span (the asterisks may wrap several words)
  let inAccent = false;
  const words = text.split(' ').map((raw) => {
    const stars = (raw.match(/\*/g) ?? []).length;
    const starts = raw.startsWith('*');
    let accent = inAccent;
    if (starts && stars >= 2) accent = true; // a single word wrapped in asterisks
    else if (starts) inAccent = accent = true; // opens a multi-word accent
    else if (stars >= 1 && inAccent) {
      accent = true; // closes it
      inAccent = false;
    }
    return { text: raw.replace(/\*/g, ''), accent };
  });
  return (
    <Tag className={className} data-split={hero ? undefined : ''} data-hero-split={hero ? '' : undefined} id={id}>
      <span className="sr-only">{text.replace(/\*/g, '')}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="w">
              <span className={`wi ${w.accent ? 'accent' : ''}`} style={{ '--i': i } as CSSProperties}>
                {w.text}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

export function Fade({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  hero = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  hero?: boolean;
}) {
  return (
    <Tag
      className={className}
      data-fade={hero ? undefined : ''}
      data-hero-fade={hero ? '' : undefined}
      style={delay ? ({ '--d': delay } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
