'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdSwipeRight } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard, A11y } from 'swiper/modules';

// Only import the base CSS — no fade/effect CSS needed
import 'swiper/css';
import 'swiper/css/pagination';

import LoadingScreen from './LoadingScreen';
import ImageCounter from './ImageCounter';

export default function MenuGallery({ images, variant = 'nonveg' }) {
  const [loaded,      setLoaded]      = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint,    setShowHint]    = useState(true);
  const [isFirst,     setIsFirst]     = useState(true);
  const [isLast,      setIsLast]      = useState(false);
  const swiperRef = useRef(null);
  const router = useRouter();

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.activeIndex);
    setIsFirst(swiper.isBeginning);
    setIsLast(swiper.isEnd);
    setShowHint(false);
  }, []);

  const handleLoadingComplete = useCallback(() => setLoaded(true), []);

  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (!swiperRef.current) return;
      if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
      else if (e.key === 'Home') swiperRef.current.slideTo(0);
      else if (e.key === 'End')  swiperRef.current.slideTo(images.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, goPrev, goNext]);

  return (
    <>
      {/* Loading splash */}
      {!loaded && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Gallery — rendered immediately so images preload */}
      <div
        className="gallery-root"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
        role="main"
        aria-label="Menu gallery"
      >
        <Swiper
          modules={[Pagination, Keyboard, A11y]}
          // Default slide effect — no EffectFade (it breaks lazy loading)
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
              <div className="slide-centrer">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1600}
                  height={1150}
                  quality={90}
                  // Eagerly load first 2; rest also eager since Swiper
                  // renders all slides in DOM — lazy would never trigger
                  priority={i < 2}
                  loading="eager"
                  className="menu-img"
                  draggable={false}
                />
              </div>
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

        {/* ← Prev */}
        <button
          onClick={goPrev}
          className={`nav-btn nav-prev${isFirst ? ' nav-hidden' : ''}`}
          aria-label="Previous menu page"
        >
          <span className="nav-symbol">&lt;</span>
        </button>

        {/* → Next */}
        <button
          onClick={goNext}
          className={`nav-btn nav-next${isLast ? ' nav-hidden' : ''}`}
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
            <span>Swipe or use &gt; to browse</span>
          </div>
        )}

        {/* Desktop hint */}
        <div className="kbd-hint" aria-hidden="true">← → arrow keys</div>
      </div>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────── */

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
