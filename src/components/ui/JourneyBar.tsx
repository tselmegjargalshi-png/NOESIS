'use client';

import { useEffect, useState } from 'react';
import { onJourney, stopJourney } from '@/lib/journey';

export default function JourneyBar() {
  const [active, setActive] = useState(false);
  useEffect(() => onJourney(setActive), []);
  if (!active) return null;
  return (
    <div className="journey-bar" role="status">
      <span className="jb-pulse" aria-hidden="true" />
      <span>Journey in progress</span>
      <button data-journey-stop data-cursor onClick={stopJourney}>
        Take control
      </button>
    </div>
  );
}
