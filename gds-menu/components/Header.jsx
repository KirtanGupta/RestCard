'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const [visible, setVisible] = useState(true);
  const lastTouchY = useRef(null);
  const hideTimer = useRef(null);

  // Auto-hide after 3.5s of no interaction, show on touch start / mouse move up
  const showHeader = () => {
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3500);
  };

  useEffect(() => {
    // Initial auto-hide
    hideTimer.current = setTimeout(() => setVisible(false), 3500);

    const handleTouchStart = (e) => {
      lastTouchY.current = e.touches[0].clientY;
      showHeader();
    };

    const handleTouchMove = (e) => {
      const delta = e.touches[0].clientY - (lastTouchY.current ?? e.touches[0].clientY);
      lastTouchY.current = e.touches[0].clientY;
      if (delta > 0) {
        // Scrolling down — hide header
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 800);
      } else {
        showHeader();
      }
    };

    const handleMouseMove = () => showHeader();

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      clearTimeout(hideTimer.current);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header
      className={`site-header ${visible ? 'visible' : 'hidden-header'}`}
      aria-label="Restaurant header"
    >
      {/* Logo */}
      <div className="header-logo-ring" aria-hidden="true">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src="/logo/logo.png"
            alt="GD's Fast Food Logo"
            fill
            sizes="44px"
            priority
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </div>

      {/* Name + tagline */}
      <div>
        <div className="header-restaurant-name">GD&apos;s Fast Food</div>
        <div className="header-tagline">Chembur, Mumbai · Est. 1986</div>
      </div>
    </header>
  );
}
