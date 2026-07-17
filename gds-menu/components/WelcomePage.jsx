'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function WelcomePage() {
  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
  };

  return (
    <main className="welcome-root" aria-label="GD's Fast Food Menu Selection">
      {/* ── HEADER SECTION ── */}
      <section className="welcome-header">
        {/* Gold decorative line */}
        <div className="welcome-divider-line" aria-hidden="true" />

        {/* Logo */}
        <div className="welcome-logo-ring" aria-hidden="true">
          <Image
            src="/logo/logo.png"
            alt="GD's Fast Food Logo"
            width={110}
            height={110}
            priority
            style={{ objectFit: 'cover', borderRadius: '50%', width: '100%', height: '100%' }}
          />
        </div>

        {/* Restaurant name */}
        <div className="welcome-name-block">
          <div className="welcome-restaurant-name">GD&apos;s Fast Food</div>
          <div className="welcome-since">Since 1986</div>
        </div>

        {/* Gold divider */}
        <div className="welcome-divider" aria-hidden="true">
          <span className="welcome-divider-gem">✦</span>
        </div>
      </section>

      {/* ── WELCOME TEXT ── */}
      <section className="welcome-text-block" aria-labelledby="welcome-heading">
        <h1 className="welcome-heading" id="welcome-heading">Welcome</h1>
        <p className="welcome-subheading">Select your preferred menu</p>
      </section>

      {/* ── MENU BUTTONS ── */}
      <section className="welcome-buttons" aria-label="Menu category selection">
        {/* VEG MENU */}
        <MenuButton
          id="btn-veg-menu"
          variant="veg"
          label="VEG MENU"
          subtitle="Pure Vegetarian"
          icon={<LeafIcon />}
          onClick={() => navigate('/veg')}
          animDelay="0.55s"
        />

        {/* NON VEG MENU */}
        <MenuButton
          id="btn-nonveg-menu"
          variant="nonveg"
          label="NON VEG MENU"
          subtitle="Chicken • Seafood • Egg"
          icon={<FlameIcon />}
          onClick={() => navigate('/menu')}
          animDelay="0.73s"
        />
      </section>

      {/* ── FOOTER ── */}
      <footer className="welcome-footer">
        <span aria-label="Location">📍</span>
        <span>Tilak Nagar, Chembur, Mumbai</span>
        <span className="welcome-footer-dot" aria-hidden="true">·</span>
        <span>Est. 1986</span>
      </footer>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function MenuButton({ id, variant, label, subtitle, icon, onClick, animDelay }) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    const btn = btnRef.current;
    if (!btn) { onClick(); return; }

    // Ripple effect
    const rect = btn.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'menu-btn-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    setTimeout(onClick, 220);
  };

  return (
    <button
      id={id}
      ref={btnRef}
      className={`menu-btn menu-btn--${variant}`}
      style={{ animationDelay: animDelay }}
      onClick={handleClick}
      aria-label={`Open ${label}`}
    >
      <span className="menu-btn-icon" aria-hidden="true">{icon}</span>
      <span className="menu-btn-content">
        <span className="menu-btn-label">{label}</span>
        <span className="menu-btn-subtitle">{subtitle}</span>
      </span>
      <span className="menu-btn-arrow" aria-hidden="true">›</span>
    </button>
  );
}

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 19.34C3.29 20.18 4.43 21 5.14 20.27C6 19.4 6.9 18.7 8 18C10.5 16.5 12 14 12 14C12 14 10 17 12 20"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M17 8C17 8 20 6 21 3C21 3 18 3 15 5C12.5 6.5 11 9 10 11"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C12 2 8 6 8 10C8 12.21 9.34 14.12 11.24 15C10.46 13.78 10.5 12.22 11.5 11C11.5 11 11 13 13 14C14.5 14.8 16 13.5 16 12C16 10.5 14.5 9 12 8C14 7 17 8.5 17 12C17 15.31 14.31 18 11 18C8.24 18 6 15.76 6 13C6 8.5 10 4 12 2Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
