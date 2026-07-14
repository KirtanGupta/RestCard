'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out after 1.8s so first image has time to preload
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Call onComplete after fade animation finishes (0.8s)
      setTimeout(onComplete, 800);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`} role="status" aria-label="Loading menu">
      {/* Gold decorative line top */}
      <div
        style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4a017, transparent)',
          marginBottom: '0.5rem',
        }}
      />

      {/* Logo */}
      <div className="loading-logo">
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            border: '2px solid #d4a017',
            padding: '4px',
            background: '#111',
            boxShadow: '0 0 30px rgba(212,160,23,0.3), 0 0 60px rgba(212,160,23,0.1)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            src="/logo/logo.png"
            alt="GD's Fast Food Logo"
            fill
            sizes="110px"
            priority
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </div>

      {/* Restaurant name */}
      <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.2rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #d4a017 0%, #f5c518 50%, #b8860b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.06em',
          }}
        >
          GD&apos;s Fast Food
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            color: '#888',
            marginTop: '0.2rem',
            textTransform: 'uppercase',
          }}
        >
          Since 1986
        </div>
      </div>

      {/* Gold decorative line */}
      <div
        style={{
          width: '40px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4a017, transparent)',
        }}
      />

      {/* Loading text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
        <span className="loading-text">Loading Menu</span>
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>

      {/* Gold decorative line bottom */}
      <div
        style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4a017, transparent)',
          marginTop: '0.5rem',
        }}
      />
    </div>
  );
}
