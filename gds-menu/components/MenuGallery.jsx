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
import { restaurantConfig } from '../config/restaurant';

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
  const [shareSuccess, setShareSuccess] = useState(false);
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

  // Handle sharing of digital menu page
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.origin + (variant === 'veg' ? '/veg' : '/menu');
    const shareData = {
      title: "GD's Fast Food — Digital Menu",
      text: "Check out GD's Fast Food Digital Menu.",
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2200);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        clearTimeout(toastTimer.current);
        setToastText("Menu link copied successfully.");
        setShowToast(true);
        toastTimer.current = setTimeout(() => setShowToast(false), 3000);
        
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2200);
      } catch (clipErr) {
        console.error('Failed to copy link:', clipErr);
      }
    }
  }, [variant]);

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
            <span>Double-tap to zoom • Rotate screen for full view</span>
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

        {/* Floating Contact Stack (Call, WhatsApp & Share) */}
        {!isZoomed && !searchOpen && (
          <div className="float-contact-group">
            {/* Call Button */}
            <a
              href={`tel:${restaurantConfig.phone}`}
              className="float-contact-btn float-contact-btn--call"
              title="Call Restaurant"
              aria-label="Call Restaurant"
            >
              <CallIcon />
              <span className="float-tooltip">Call Restaurant</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={restaurantConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="float-contact-btn float-contact-btn--whatsapp"
              title="Order on WhatsApp"
              aria-label="Order on WhatsApp"
            >
              <WhatsAppIcon />
              <span className="float-tooltip">Order on WhatsApp</span>
            </a>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`float-contact-btn float-contact-btn--share${shareSuccess ? ' float-contact-btn--success' : ''}`}
              title="Share Menu"
              aria-label="Share Menu"
            >
              {shareSuccess ? <CheckIcon /> : <ShareIcon />}
              <span className="float-tooltip">{shareSuccess ? 'Link Copied!' : 'Share Menu'}</span>
            </button>
          </div>
        )}
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

function CallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.578 1.98 14.115.95 11.512.95c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.317 4.88l-.994 3.63 3.734-.968c1.468.791 2.923 1.21 4.358 1.211zm11.332-6.52c-.3-.15-1.77-.875-2.04-.972-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.127-.565-1.977-1.008-2.766-2.358-.2-.35-.02-.54.15-.71.15-.15.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.21 5.09 4.51.71.31 1.27.49 1.7.63.72.23 1.38.19 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
