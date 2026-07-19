'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdSwipeRight } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import LoadingScreen from './LoadingScreen';
import ImageCounter from './ImageCounter';
import ZoomableSlide from './ZoomableSlide';
import SearchMenu from './SearchMenu';

export default function MenuGallery({ images, variant = 'nonveg' }) {
  const [loaded,      setLoaded]      = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint,    setShowHint]    = useState(true);
  const [isFirst,     setIsFirst]     = useState(true);
  const [isLast,      setIsLast]      = useState(false);
  const [isZoomed,    setIsZoomed]    = useState(false);

  // Search & Toast state
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [menuItems,   setMenuItems]   = useState([]);
  const [toastText,   setToastText]   = useState('');
  const [showToast,   setShowToast]   = useState(false);
  const toastTimer                    = useRef(null);

  const swiperRef = useRef(null);
  const router    = useRouter();

  // Load transcription data
  useEffect(() => {
    fetch('/data/menu-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load menu database');
        return res.json();
      })
      .then((data) => {
        // Filter: only show items matching this gallery route variant
        const filtered = data.filter((item) => item.type === variant);
        setMenuItems(filtered);
      })
      .catch((err) => console.error('Menu Database Error:', err));
  }, [variant]);

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.activeIndex);
    setIsFirst(swiper.isBeginning);
    setIsLast(swiper.isEnd);
    setShowHint(false);
  }, []);

  const handleLoadingComplete = useCallback(() => setLoaded(true), []);
  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);

  const handleZoomChange = useCallback((zoomed) => {
    setIsZoomed(zoomed);
  }, []);

  // Handle item selection from search
  const handleSearchSelect = useCallback((item) => {
    if (!swiperRef.current) return;

    // Slide to page (page numbers in JSON database are 1-indexed)
    const targetPage = item.page - 1;
    swiperRef.current.slideTo(targetPage);

    // Show temporary highlight banner toast
    clearTimeout(toastTimer.current);
    setToastText(`Showing: ${item.category} (Page ${item.page})`);
    setShowToast(true);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);

    // Close search overlay
    setSearchOpen(false);
  }, []);

  // Keyboard navigation (disabled while zoomed so arrows don't fight with pan)
  useEffect(() => {
    const onKey = (e) => {
      if (isZoomed || searchOpen) return;
      if (!swiperRef.current) return;
      if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
      else if (e.key === 'Home') swiperRef.current.slideTo(0);
      else if (e.key === 'End')  swiperRef.current.slideTo(images.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, goPrev, goNext, isZoomed, searchOpen]);

  return (
    <>
      {/* Loading splash */}
      {!loaded && <LoadingScreen onComplete={handleLoadingComplete} />}

      <div
        className="gallery-root"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
        role="main"
        aria-label="Menu gallery"
      >
        {/* Dark backdrop — deepens when zoomed for a focused feel */}
        <div
          className={`gallery-zoom-backdrop${isZoomed ? ' gallery-zoom-backdrop--on' : ''}`}
          aria-hidden="true"
        />

        <Swiper
          modules={[Pagination, Keyboard, A11y]}
          speed={400}
          slidesPerView={1}
          keyboard={{ enabled: true, onlyInViewport: false }}
          pagination={{ clickable: true, dynamicBullets: false }}
          a11y={{
            prevSlideMessage: 'Previous menu page',
            nextSlideMessage: 'Next menu page',
          }}
          onSwiper={(s) => {
            swiperRef.current = s;
            setIsFirst(s.isBeginning);
            setIsLast(s.isEnd);
          }}
          onSlideChange={handleSlideChange}
          className="menu-swiper"
          style={{ width: '100%', height: '100%' }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={img.src} aria-label={`Menu page ${i + 1}`}>
              <ZoomableSlide
                img={img}
                priority={i < 2}
                onZoomChange={handleZoomChange}
                swiperRef={swiperRef}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Back to Home ── */}
        <button
          className={`back-btn back-btn--${variant}`}
          onClick={() => router.push('/')}
          aria-label="Back to home"
        >
          <BackArrowIcon />
          <span className="back-btn__label">Menu</span>
        </button>

        {/* ── Search Trigger Button ── */}
        {!isZoomed && (
          <button
            className={`search-btn search-btn--${variant}`}
            onClick={() => setSearchOpen(true)}
            aria-label="Search menu items"
          >
            <SearchMagnifierIcon />
          </button>
        )}


        {/* ← Prev — hidden while zoomed or search is open */}
        <button
          onClick={goPrev}
          className={`nav-btn nav-prev${isFirst || isZoomed || searchOpen ? ' nav-hidden' : ''}`}
          aria-label="Previous menu page"
        >
          <span className="nav-symbol">&lt;</span>
        </button>

        {/* → Next — hidden while zoomed or search is open */}
        <button
          onClick={goNext}
          className={`nav-btn nav-next${isLast || isZoomed || searchOpen ? ' nav-hidden' : ''}`}
          aria-label="Next menu page"
        >
          <span className="nav-symbol">&gt;</span>
        </button>

        {/* Counter */}
        <ImageCounter current={activeIndex + 1} total={images.length} />

        {/* Swipe hint */}
        {showHint && activeIndex === 0 && (
          <div className="swipe-hint" aria-hidden="true">
            <MdSwipeRight size={16} />
            <span>Swipe to browse</span>
          </div>
        )}

        {/* Zoom hint — shown briefly on first load */}
        {loaded && !isZoomed && !searchOpen && (
          <div className="zoom-hint" aria-hidden="true">
            <PinchIcon />
            <span>Pinch or double-tap to zoom</span>
          </div>
        )}

        {/* Desktop hint */}
        <div className="kbd-hint" aria-hidden="true">
          {isZoomed ? 'Tap image to reset zoom' : '← → arrow keys • scroll to zoom'}
        </div>

        {/* Page Toast / Highlight Banner */}
        <div className={`page-toast${showToast ? ' page-toast--show' : ''}`} role="alert" aria-live="polite">
          {toastText}
        </div>
      </div>

      {/* Fullscreen Search Overlay */}
      <SearchMenu
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={menuItems}
        onSelect={handleSearchSelect}
      />
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchMagnifierIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PinchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 9.5C7 8.12 8.12 7 9.5 7S12 8.12 12 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 9.5C17 8.12 15.88 7 14.5 7S12 8.12 12 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 9.5v3a5 5 0 0010 0v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 14v3M14 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

