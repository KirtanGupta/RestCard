'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const SCALE_MIN  = 1;
const SCALE_MAX  = 5;
const DBL_TAP_MS = 300;
const DBL_TAP_PX = 40;

/**
 * ZoomableSlide — in-place zoom directly on a Swiper slide image.
 * No modal. Pinch / double-tap / wheel / drag all work on the image itself.
 *
 * Props:
 *  img          — { src, alt }
 *  priority     — passed to next/image
 *  onZoomChange — (isZoomed: bool) => void
 *  swiperRef    — ref to Swiper instance (to lock/unlock slide swiping)
 */
export default function ZoomableSlide({ img, priority, onZoomChange, swiperRef }) {
  // The div that receives the CSS transform (transform-origin 0 0)
  const wrapRef = useRef(null);
  // The underlying <img> for dimension measurement
  const imgRef  = useRef(null);

  // ── Transform state (refs → no re-render on every pointer event) ─────────
  const scale = useRef(1);
  const tx    = useRef(0);   // translateX in px
  const ty    = useRef(0);   // translateY in px

  // ── Pointer tracking ──────────────────────────────────────────────────────
  const pointers   = useRef(new Map());  // pointerId → {x, y}
  const lastDist   = useRef(null);
  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const moved      = useRef(false);

  // ── Double-tap detection ──────────────────────────────────────────────────
  const lastTapTime = useRef(0);
  const lastTapPos  = useRef({ x: 0, y: 0 });

  // ── isZoomed state (drives cursor CSS) ───────────────────────────────────
  const [isZoomed, setIsZoomed] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const applyTransform = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = `translate(${tx.current}px, ${ty.current}px) scale(${scale.current})`;
  }, []);

  /**
   * Correct clamp using actual rendered image dimensions.
   *
   * With transform-origin 0 0 and transform translate(tx,ty) scale(s):
   *   viewport_x = s * element_x + tx
   *
   * The wrapper (zoom-slide-wrap) is vw × vh.
   * The image is centred inside it at element coords:
   *   image left  = (vw − imgW) / 2
   *   image right = (vw + imgW) / 2
   *
   * Clamp so no black background is exposed within the viewport.
   */
  const clampTranslate = useCallback(() => {
    if (scale.current <= 1) { tx.current = 0; ty.current = 0; return; }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s  = scale.current;

    // Actual rendered image size (layout size before any CSS transform)
    const imgEl = imgRef.current;
    const imgW  = imgEl?.offsetWidth  || vw;
    const imgH  = imgEl?.offsetHeight || vh;

    // Image edges in element (wrapper) coordinates
    const imgL = (vw - imgW) / 2;
    const imgR = imgL + imgW;
    const imgT = (vh - imgH) / 2;
    const imgB = imgT + imgH;

    // Image edges in viewport after transform
    let leftVP   = s * imgL + tx.current;
    let rightVP  = s * imgR + tx.current;
    let topVP    = s * imgT + ty.current;
    let bottomVP = s * imgB + ty.current;

    // ── Horizontal clamp ──
    if (s * imgW >= vw) {
      // Zoomed image wider than viewport: prevent showing background
      if (leftVP  > 0)  { tx.current -= leftVP; }
      // Recompute rightVP after potential tx change
      rightVP = s * imgR + tx.current;
      if (rightVP < vw) { tx.current += vw - rightVP; }
    } else {
      // Zoomed image still fits in viewport width: keep it centred
      tx.current = vw / 2 - s * (imgL + imgW / 2);
    }

    // ── Vertical clamp ──
    if (s * imgH >= vh) {
      if (topVP    > 0)  { ty.current -= topVP; }
      bottomVP = s * imgB + ty.current;
      if (bottomVP < vh) { ty.current += vh - bottomVP; }
    } else {
      ty.current = vh / 2 - s * (imgT + imgH / 2);
    }
  }, []);

  /** Notify parent + lock/unlock Swiper. */
  const notifyZoom = useCallback((s) => {
    const zoomed = s > 1.05;
    setIsZoomed(zoomed);
    onZoomChange?.(zoomed);
    if (swiperRef?.current) swiperRef.current.allowTouchMove = !zoomed;
  }, [onZoomChange, swiperRef]);

  /** Scale to targetScale centred on viewport point (cx, cy). */
  const zoomTo = useCallback((targetScale, cx, cy, animated = false) => {
    const prev = scale.current;
    const next = Math.max(SCALE_MIN, Math.min(SCALE_MAX, targetScale));

    // Shift tx/ty so (cx, cy) stays fixed on screen
    tx.current = cx - (cx - tx.current) * (next / prev);
    ty.current = cy - (cy - ty.current) * (next / prev);
    scale.current = next;

    clampTranslate();

    if (animated && wrapRef.current) {
      wrapRef.current.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)';
    }
    applyTransform();
    if (animated) {
      setTimeout(() => { if (wrapRef.current) wrapRef.current.style.transition = ''; }, 340);
    }

    notifyZoom(next);
  }, [applyTransform, clampTranslate, notifyZoom]);

  /** Animate back to scale 1 at origin. */
  const resetZoom = useCallback(() => {
    scale.current = 1;
    tx.current    = 0;
    ty.current    = 0;
    if (wrapRef.current) {
      wrapRef.current.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)';
    }
    applyTransform();
    setTimeout(() => { if (wrapRef.current) wrapRef.current.style.transition = ''; }, 340);
    notifyZoom(1);
  }, [applyTransform, notifyZoom]);

  // ─────────────────────────────────────────────────────────────────────────
  // MOUSE WHEEL (desktop)
  // ─────────────────────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.18 : -0.18;
    zoomTo(scale.current + delta, e.clientX, e.clientY);
  }, [zoomTo]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // passive:false so we can call preventDefault
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ─────────────────────────────────────────────────────────────────────────
  // POINTER EVENTS (touch + mouse unified)
  // ─────────────────────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current    = false;
    lastDist.current = null;
    isDragging.current = true;
    dragStart.current  = { x: e.clientX, y: e.clientY, tx: tx.current, ty: ty.current };

    // Capture pointer if already zoomed OR if this is the 2nd finger (pinch start)
    if (scale.current > 1 || pointers.current.size >= 2) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pts = [...pointers.current.values()];

    if (pts.length >= 2) {
      // ── Pinch to zoom ──
      // Capture both pointers as soon as we detect a pinch
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      isDragging.current = false;
      moved.current      = true;

      const [a, b] = pts;
      const dist   = Math.hypot(b.x - a.x, b.y - a.y);
      const midX   = (a.x + b.x) / 2;
      const midY   = (a.y + b.y) / 2;

      if (lastDist.current !== null && dist > 0) {
        zoomTo(scale.current * (dist / lastDist.current), midX, midY);
      }
      lastDist.current = dist;

    } else if (isDragging.current && scale.current > 1) {
      // ── Drag to pan (only when zoomed) ──
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;

      tx.current = dragStart.current.tx + dx;
      ty.current = dragStart.current.ty + dy;
      clampTranslate();
      applyTransform();
    }
  }, [zoomTo, clampTranslate, applyTransform]);

  const onPointerUp = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    lastDist.current = null;

    if (pointers.current.size > 0) return; // still fingers on screen

    isDragging.current = false;

    if (!moved.current) {
      // ── Tap logic ──
      const now  = Date.now();
      const tapX = e.clientX;
      const tapY = e.clientY;
      const dt   = now - lastTapTime.current;
      const dist = Math.hypot(tapX - lastTapPos.current.x, tapY - lastTapPos.current.y);

      if (dt < DBL_TAP_MS && dist < DBL_TAP_PX) {
        // ── Double tap ──
        lastTapTime.current = 0;
        if (scale.current > 1.05) {
          resetZoom();
        } else {
          zoomTo(2.5, tapX, tapY, true);
        }
      } else if (scale.current > 1.05) {
        // ── Single tap while zoomed → reset ──
        resetZoom();
      }

      lastTapTime.current = now;
      lastTapPos.current  = { x: tapX, y: tapY };
    }

    moved.current = false;
  }, [resetZoom, zoomTo]);

  const onPointerCancel = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    isDragging.current = false;
    lastDist.current   = null;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className={`zoom-slide-wrap${isZoomed ? ' zoom-slide-wrap--zoomed' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      /* transform-origin must be 0 0 for the zoom-at-point math to work */
      style={{ transformOrigin: '0 0', touchAction: 'none' }}
      aria-label={`${img.alt}. Pinch or double-tap to zoom`}
    >
      <Image
        ref={imgRef}
        src={img.src}
        alt={img.alt}
        width={1600}
        height={1150}
        unoptimized={true}
        priority={priority}
        className="menu-img"
        draggable={false}
      />
    </div>
  );
}
