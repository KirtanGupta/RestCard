'use client';

import { useEffect, useState } from 'react';
import { restaurantConfig } from '../config/restaurant';

export default function RestaurantInfoCard() {
  const [statusInfo, setStatusInfo] = useState({
    isOpen: false,
    statusText: '',
    timeDetails: '',
    subtext: ''
  });

  useEffect(() => {
    const calculateStatus = () => {
      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return { hours: h, minutes: m };
      };

      const format12Hour = (hours, minutes) => {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
      };

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const openTime = parseTime(restaurantConfig.openingTime);
      const closeTime = parseTime(restaurantConfig.closingTime);

      const openMinutes = openTime.hours * 60 + openTime.minutes;
      const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

      // Check if open
      let isOpen = false;
      if (closeMinutes < openMinutes) {
        // Business hours cross midnight
        isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      } else {
        // Standard same-day business hours
        isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      }

      // Format operating hours for display: "Today: 11:00 AM – 11:30 PM"
      const timeDetails = `Today: ${format12Hour(openTime.hours, openTime.minutes)} – ${format12Hour(closeTime.hours, closeTime.minutes)}`;

      let subtext = '';
      if (isOpen) {
        let minsLeft = 0;
        if (closeMinutes < openMinutes) {
          if (currentMinutes >= openMinutes) {
            minsLeft = (24 * 60 - currentMinutes) + closeMinutes;
          } else {
            minsLeft = closeMinutes - currentMinutes;
          }
        } else {
          minsLeft = closeMinutes - currentMinutes;
        }

        const hrs = Math.floor(minsLeft / 60);
        const mins = minsLeft % 60;

        let parts = [];
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0) parts.push(`${mins}m`);
        
        subtext = `Closes in ${parts.length > 0 ? parts.join(' ') : '0m'}`;
      } else {
        const opensToday = currentMinutes < openMinutes;
        subtext = `${opensToday ? 'Opens today' : 'Opens tomorrow'} at ${format12Hour(openTime.hours, openTime.minutes)}`;
      }

      setStatusInfo({
        isOpen,
        statusText: isOpen ? 'Open Now' : 'Closed',
        timeDetails,
        subtext
      });
    };

    // Calculate immediately and refresh every minute
    calculateStatus();
    const interval = setInterval(calculateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <article className="info-card" aria-label="Restaurant Information">
      {/* Top section: Restaurant Name, Established & Address */}
      <div className="info-card__header">
        <div className="info-card__header-main">
          <h2 className="info-card__title">
            <UtensilsIcon />
            {restaurantConfig.restaurantName}
          </h2>
          <span className="info-card__established">
            Serving Since {restaurantConfig.establishedYear}
          </span>
        </div>
        <div className="info-card__address">
          <span className="info-card__pin-symbol">📍</span>
          <span>Tilak Nagar, Chembur</span>
        </div>
      </div>

      {/* Rating & Status Section */}
      <div className="info-card__middle-row">
        {/* Google Rating (Authentic stars representation) */}
        <div className="info-card__rating-block" title={`Google Rating: ${restaurantConfig.googleRating} stars`}>
          <div className="info-card__stars">
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
          <div className="info-card__rating-label">
            <strong>{restaurantConfig.googleRating}</strong>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="info-card__status-block">
          <span className={`info-card__status-badge info-card__status-badge--${statusInfo.isOpen ? 'open' : 'closed'}`}>
            <span className="info-card__status-dot"></span>
            {statusInfo.statusText}
          </span>
        </div>
      </div>

      {/* Business Hours Details & Live Countdown */}
      <div className="info-card__timing-details">
        <div className="info-card__hours-row">
          <ClockIcon />
          <span>{statusInfo.timeDetails}</span>
        </div>
        <div className="info-card__countdown-row">
          <span className="info-card__countdown-clock">🕒</span>
          <span>{statusInfo.subtext}</span>
        </div>
      </div>

      {/* Services Row */}
      <div className="info-card__services" aria-label="Available services">
        {restaurantConfig.services.includes('Home Delivery') && (
          <div className="info-card__service-badge" title="Home Delivery Available">
            <DeliveryIcon />
            <span>Home Delivery</span>
          </div>
        )}
        {restaurantConfig.services.includes('Dine In') && (
          <div className="info-card__service-badge" title="Dine In Available">
            <DineInIcon />
            <span>Dine In</span>
          </div>
        )}
        {restaurantConfig.services.includes('Take Away') && (
          <div className="info-card__service-badge" title="Take Away Available">
            <TakeAwayIcon />
            <span>Take Away</span>
          </div>
        )}
      </div>

      {/* Action Row: Call & Directions Grid */}
      <div className="info-card__actions-grid">
        <a
          href={`tel:${restaurantConfig.phone}`}
          className="info-card__action-btn info-card__action-btn--call"
          aria-label={`Call restaurant at ${restaurantConfig.phone}`}
        >
          <PhoneIcon />
          <span>Call Restaurant</span>
        </a>
        <a
          href={restaurantConfig.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="info-card__action-btn info-card__action-btn--maps"
          aria-label="View restaurant on Google Maps"
        >
          <MapPinIcon />
          <span>Directions</span>
        </a>
      </div>
    </article>
  );
}

/* ── SVG Icons ───────────────────────────────────────────────────────────── */

function UtensilsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--gold-bright)' }}>
      <path d="M12 2v20" opacity="0.15" />
      <path d="M4 3v7a6 6 0 0 0 6 6v3a1 1 0 0 0 2 0v-3a6 6 0 0 0 6-6V3" />
      <path d="M9 3v4M15 3v4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#d4a017" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function DineInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M9 12h6" />
    </svg>
  );
}

function TakeAwayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
