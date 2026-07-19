'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ImageViewer — Google-Photos-style fullscreen zoom modal.
 *
 * Props:
 *  src          — image URL to display
 *  alt          — alt text
 *  isOpen       — controls visibility
 *  onClose      — called when user dismisses the viewer
 *  swiperRef    — ref to the Swiper instance (to lock/unlock touch-move)
 */
export default function ImageViewer({ src, alt, isOpen, onClose, swiperRef }) {
  const backdropRef  = useRef(null);
  const imgWrapRef   = useRef(null);   // receives the JS zoom transform
  const imgInnerRef  = useRef(null);   // centering wrapper (for dimension measurement)

  // ── Transform state (refs for 60 fps — no re-render during gesture) ──────
  const scale      = useRef(1);
  const tx         = useRef(0);   // translateX
  const ty         = useRef(0);   // translateY
  const originX    = useRef(0);   // transform-origin point (viewport px)
  const originY    = useRef(0);

  // ── Pointer tracking ──────────────────────────────────────────────────────
  const pointers   = useRef(new Map());   // pointerId → {x, y}
  const lastDist   = useRef(null);        // last pinch distance
  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const moved      = useRef(false);       // track if pointer actually moved (for tap vs drag)

  // ── Double-tap detection ──────────────────────────────────────────────────
  const lastTapTime = useRef(0);
  const lastTapPos  = useRef({ x: 0, y: 0 });

  // ── Zoom badge display ────────────────────────────────────────────────────
  const [zoomLabel, setZoomLabel] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const [isZoomed,  setIsZoomed]  = useState(false); // tracks scale>1 for JSX rendering
  const badgeTimer  = useRef(null);

  // ── Closing animation ─────────────────────────────────────────────────────
  const [closing, setClosing] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Apply current scale + translate to the img wrapper. */
  const applyTransform = useCallback(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    el.style.transform = `translate(${tx.current}px, ${ty.current}px) scale(${scale.current})`;
  }, []);

  /** Clamp translate so the image never leaves the viewport while zoomed. */
  const clampTranslate = useCallback(() => {
    if (scale.current <= 1) { tx.current = 0; ty.current = 0; return; }
    const inner = imgInnerRef.current;
    if (!inner) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Natural (unscaled) dimensions of the rendered image container
    const natW = inner.offsetWidth;
    const natH = inner.offsetHeight;

    // Scaled dimensions
    const scaledW = natW * scale.current;
    const scaledH = natH * scale.current;

    // Maximum pan allowed (half the overflow on each axis)
    const maxTx = Math.max(0, (scaledW - vw)  / 2);
    const maxTy = Math.max(0, (scaledH - vh)  / 2);

    tx.current = Math.max(-maxTx, Math.min(maxTx, tx.current));
    ty.current = Math.max(-maxTy, Math.min(maxTy, ty.current));
  }, []);

  /** Flash the zoom badge for 1.6 s. */
  const showZoomBadge = useCallback((s) => {
    clearTimeout(badgeTimer.current);
    setZoomLabel(`${s.toFixed(1)}\u00d7`);
    setShowBadge(true);
    setIsZoomed(s > 1.05);
    badgeTimer.current = setTimeout(() => setShowBadge(false), 1600);
  }, []);

  /** Reset zoom to 1 with a smooth animation. */
  const resetZoom = useCallback(() => {
    scale.current = 1;
    tx.current    = 0;
    ty.current    = 0;
    applyTransform();
    setIsZoomed(false);
    setShowBadge(false);
    // Unlock Swiper
    if (swiperRef?.current) swiperRef.current.allowTouchMove = true;
  }, [applyTransform, swiperRef]);

  /** Zoom to a target scale centred on (cx, cy) in viewport coordinates. */
  const zoomTo = useCallback((targetScale, cx, cy) => {
    const el = imgWrapRef.current;
    if (!el) return;

    const CLAMP_MIN = 1;
    const CLAMP_MAX = 5;
    const prevScale = scale.current;
    const newScale  = Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, targetScale));

    // Adjust translate so zoom appears centred on (cx, cy)
    // Formula: newTx = cx - (cx - oldTx) * (newScale / prevScale)
    tx.current = cx - (cx - tx.current) * (newScale / prevScale);
    ty.current = cy - (cy - ty.current) * (newScale / prevScale);
    scale.current = newScale;

    clampTranslate();
    applyTransform();

    // Lock or unlock Swiper
    if (swiperRef?.current) {
      swiperRef.current.allowTouchMove = (newScale <= 1);
    }

    showZoomBadge(newScale);
  }, [applyTransform, clampTranslate, showZoomBadge, swiperRef]);

  // ── Reset state when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      scale.current = 1;
      tx.current    = 0;
      ty.current    = 0;
      pointers.current.clear();
      lastDist.current = null;
      isDragging.current = false;
      moved.current = false;
      lastTapTime.current = 0;
      applyTransform();
    }
  }, [isOpen, applyTransform]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Prevent body scroll while open ───────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Close with animation ──────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    resetZoom();
    setClosing(true);
    // Unlock swiper on close
    if (swiperRef?.current) swiperRef.current.allowTouchMove = true;
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 300);
  }, [resetZoom, onClose, swiperRef]);

  // ── Mouse Wheel ───────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    // Zoom centred on the viewport midpoint
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    zoomTo(scale.current + delta, cx, cy);
  }, [zoomTo]);

  // Attach wheel listener (passive:false needed to call preventDefault)
  useEffect(() => {
    const el = backdropRef.current;
    if (!el || !isOpen) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen, onWheel]);

  // ── Pointer Events ────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;

    if (pointers.current.size === 1) {
      // Single pointer — prepare for drag or tap
      isDragging.current = true;
      dragStart.current  = { x: e.clientX, y: e.clientY, tx: tx.current, ty: ty.current };
      lastDist.current   = null;
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pts = [...pointers.current.values()];

    if (pts.length === 2) {
      // ── Pinch to zoom ──
      isDragging.current = false;
      moved.current = true;

      const [a, b]   = pts;
      const dist     = Math.hypot(b.x - a.x, b.y - a.y);
      const midX     = (a.x + b.x) / 2;
      const midY     = (a.y + b.y) / 2;

      if (lastDist.current !== null) {
        const ratio = dist / lastDist.current;
        zoomTo(scale.current * ratio, midX, midY);
      }
      lastDist.current = dist;

    } else if (pts.length === 1 && isDragging.current) {
      // ── Drag to pan (only when zoomed in) ──
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;

      if (scale.current > 1) {
        tx.current = dragStart.current.tx + dx;
        ty.current = dragStart.current.ty + dy;
        clampTranslate();
        applyTransform();
      }
    }
  }, [zoomTo, clampTranslate, applyTransform]);

  const onPointerUp = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    lastDist.current = null;

    if (pointers.current.size === 0) {
      isDragging.current = false;

      if (!moved.current) {
        // ── Tap logic ──
        const now = Date.now();
        const tapX = e.clientX;
        const tapY = e.clientY;
        const dt   = now - lastTapTime.current;
        const dist = Math.hypot(tapX - lastTapPos.current.x, tapY - lastTapPos.current.y);

        if (dt < 300 && dist < 40) {
          // ── Double tap ──
          lastTapTime.current = 0; // reset so triple tap doesn't trigger again
          if (scale.current > 1.05) {
            // Already zoomed → reset
            const wrap = imgWrapRef.current;
            if (wrap) {
              wrap.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
              resetZoom();
              setTimeout(() => { if (wrap) wrap.style.transition = ''; }, 360);
            }
          } else {
            // Zoom in 2.5× at tap point
            const wrap = imgWrapRef.current;
            if (wrap) {
              wrap.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
              zoomTo(2.5, tapX, tapY);
              setTimeout(() => { if (wrap) wrap.style.transition = ''; }, 360);
            }
          }
        } else {
          // ── Single tap ──
          if (scale.current > 1.05) {
            // Tap while zoomed → reset
            const wrap = imgWrapRef.current;
            if (wrap) {
              wrap.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
              resetZoom();
              setTimeout(() => { if (wrap) wrap.style.transition = ''; }, 360);
            }
          }
          // If scale === 1 and single tap, do nothing (let backdrop click handle close)
        }

        lastTapTime.current = now;
        lastTapPos.current  = { x: tapX, y: tapY };
      }

      moved.current = false;
    }
  }, [resetZoom, zoomTo]);

  const onPointerCancel = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    isDragging.current = false;
    lastDist.current = null;
  }, []);

  // ── Backdrop tap → close (only when not zoomed and no drag) ──────────────
  const onBackdropClick = useCallback((e) => {
    if (e.target === backdropRef.current && scale.current <= 1 && !moved.current) {
      handleClose();
    }
  }, [handleClose]);

  // ── Don't render anything when not open ──────────────────────────────────
  if (!isOpen && !closing) return null;

  return (
    <div
      ref={backdropRef}
      className={`iv-backdrop ${closing ? 'iv-backdrop--close' : 'iv-backdrop--open'}`}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* ── Close button ── */}
      <button
        className="iv-close-btn"
        onClick={handleClose}
        aria-label="Close image viewer"
      >
        <CloseIcon />
      </button>

      {/* ── Zoom badge ── */}
      {showBadge && isZoomed && (
        <div className="iv-zoom-badge" aria-live="polite" aria-atomic="true">
          {zoomLabel}
        </div>
      )}

      {/* ── Reset hint (shown when zoomed) ── */}
      {showBadge && isZoomed && (
        <div className="iv-reset-hint" aria-hidden="true">Tap image to reset</div>
      )}

      {/* ── Image wrapper (receives all gesture events, JS zoom applied here) ── */}
      <div
        className="iv-img-wrap"
        ref={imgWrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{ touchAction: 'none' }}
      >
        {/* Inner div handles the pop-in animation — separate from the zoom transform */}
        <div className="iv-img-inner" ref={imgInnerRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="iv-img"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-component ─────────────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
