'use client';

import { useState, useEffect } from 'react';
import { restaurantConfig } from '../config/restaurant';

export default function WelcomeSpecials() {
  const [isOpen, setIsOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    // Strip characters to get clean number for wa.me API
    const num = restaurantConfig.phone.replace(/[^0-9]/g, '');
    setWaNumber(num);
  }, []);

  const handleWhatsAppOrder = (itemName) => {
    const message = `Hello, I viewed your specials and would like to order: *${itemName}*`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating specials button - positioned at bottom left */}
      <button
        onClick={() => setIsOpen(true)}
        className="specials-float-btn"
        aria-label="View Today's Chef Specials"
      >
        <span className="specials-float-btn__fire">🔥</span>
        <span className="specials-float-btn__text">Today's Special</span>
      </button>

      {/* Specials modal overlay */}
      {isOpen && (
        <div className="specials-overlay" role="dialog" aria-modal="true">
          {/* Dismiss backdrop */}
          <div className="specials-overlay__backdrop" onClick={() => setIsOpen(false)} />
          
          <div className="specials-modal">
            {/* Modal Header */}
            <div className="specials-modal__header">
              <h3 className="specials-modal__title">
                <span className="specials-modal__fire">🔥</span>
                Today's Specials
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="specials-modal__close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: specials list */}
            <div className="specials-modal__body">
              {restaurantConfig.todaysSpecials.map((item, idx) => (
                <div key={idx} className="special-item-card">
                  {/* Name, price and diet badge */}
                  <div className="special-item-card__header">
                    <h4 className="special-item-card__title">
                      <span className={`special-item-card__diet-dot special-item-card__diet-dot--${item.type}`}></span>
                      {item.name}
                    </h4>
                    <span className="special-item-card__price">₹{item.price}</span>
                  </div>

                  {/* Description */}
                  <p className="special-item-card__description">{item.description}</p>

                  {/* Order Button */}
                  <button
                    onClick={() => handleWhatsAppOrder(item.name)}
                    className="special-item-card__order-btn"
                  >
                    <WhatsAppIcon />
                    <span>Order on WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── SVG Icons ───────────────────────────────────────────────────────────── */

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.578 1.98 14.115.95 11.512.95c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.317 4.88l-.994 3.63 3.734-.968c1.468.791 2.923 1.21 4.358 1.211zm11.332-6.52c-.3-.15-1.77-.875-2.04-.972-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.127-.565-1.977-1.008-2.766-2.358-.2-.35-.02-.54.15-.71.15-.15.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.21 5.09 4.51.71.31 1.27.49 1.7.63.72.23 1.38.19 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
