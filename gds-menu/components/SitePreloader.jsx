'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * SitePreloader — shown once when the website first loads.
 * All ring/particle/shimmer elements are grouped inside `.site-preloader__logo-group`
 * (position:relative, fixed size) so absolute children centre on the logo correctly.
 *
 * Props:
 *  onDone — callback fired after the exit animation completes
 */
export default function SitePreloader({ onDone }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'exit'
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    // Hold for 2.4 s then trigger exit
    const exitTimer = setTimeout(() => {
      setPhase('exit');
      // Let exit animation run (0.9 s) then call onDone
      setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }, 900);
    }, 2400);

    return () => clearTimeout(exitTimer);
  }, [onDone]);

  return (
    <div
      className={`site-preloader ${phase === 'exit' ? 'site-preloader--exit' : ''}`}
      role="status"
      aria-label="Loading GD's Fast Food"
    >
      {/*
        ── LOGO GROUP ──────────────────────────────────────────────
        Single position:relative box that is the stacking context
        for all the rings, particles, and shimmer.
        The box is sized to the outermost orbit ring (196 × 196 px)
        so every absolute child centres itself inside it via
        inset: 0 / margin: auto  or  top/left 50% + translate.
        ─────────────────────────────────────────────────────────── */}
      <div className="site-preloader__logo-group" aria-hidden="true">

        {/* Ambient radial glow */}
        <div className="site-preloader__glow" />

        {/* Particle orbit ring */}
        <div className="site-preloader__orbit">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="site-preloader__particle"
              style={{ '--i': i }}
            />
          ))}
        </div>

        {/* Spinning dashed outer arc */}
        <div className="site-preloader__ring-outer" />

        {/* Breathing gold border ring */}
        <div className="site-preloader__ring-static" />

        {/* Logo image (position:relative so Next/Image fill works) */}
        <div className="site-preloader__logo-wrap">
          <Image
            src="/logo/logo.png"
            alt="GD's Fast Food Logo"
            fill
            sizes="132px"
            priority
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
          {/* Shimmer lives INSIDE logo-wrap so it clips to the circle */}
          <div className="site-preloader__shimmer" />
        </div>

      </div>{/* /logo-group */}

      {/* ── Restaurant name ── */}
      <div className="site-preloader__name-block">
        <div className="site-preloader__name">GD&apos;s Fast Food</div>
        <div className="site-preloader__since">Est. 1986</div>
      </div>

      {/* ── Gold ornament line ── */}
      <div className="site-preloader__ornament">
        <span className="site-preloader__ornament-line" />
        <span className="site-preloader__ornament-gem">✦</span>
        <span className="site-preloader__ornament-line" />
      </div>

      {/* ── Animated bar loader ── */}
      <div className="site-preloader__bar-wrap">
        <div className="site-preloader__bar" />
      </div>
    </div>
  );
}
