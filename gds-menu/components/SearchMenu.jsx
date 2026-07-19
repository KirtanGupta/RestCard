'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

/**
 * SearchMenu — Fullscreen search overlay matching the black & gold aesthetic.
 * Filters menu items and handles selection to slide swiper to the correct page.
 */
export default function SearchMenu({ isOpen, onClose, items, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [, startTransition] = useTransition();
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle live filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    startTransition(() => {
      const q = query.toLowerCase().trim();
      const filtered = items.filter(item => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      });
      setResults(filtered);
    });
  }, [query, items]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search menu items">
      <div className="search-container">
        
        {/* ── HEADER INPUT REGION ── */}
        <div className="search-header">
          <div className="search-input-wrapper">
            <SearchIcon className="search-bar-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search dishes, starters, desserts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search items"
            />
            {query && (
              <button 
                className="search-clear-btn" 
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button className="search-close-text-btn" onClick={onClose}>
            Cancel
          </button>
        </div>

        {/* ── RESULTS AREA ── */}
        <div className="search-results">
          {query.trim() === '' ? (
            <div className="search-placeholder">
              <span className="search-placeholder-icon">✦</span>
              <p>Type to search dishes or categories</p>
              <div className="search-quick-tags">
                <span className="search-tag-label">Try:</span>
                {['Biryani', 'Tandoori', 'Pizza', 'Soup', 'Paneer', 'Starter'].map(tag => (
                  <button
                    key={tag}
                    className="search-quick-tag"
                    onClick={() => setQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((item, idx) => (
                <li key={`${item.name}-${idx}`} className="search-result-item-wrap">
                  <button
                    className="search-result-item"
                    onClick={() => onSelect(item)}
                  >
                    <div className="search-item-info">
                      <div className="search-item-name-row">
                        {item.type === 'veg' ? <VegDot /> : <NonVegDot />}
                        <span className="search-item-name">{item.name}</span>
                      </div>
                      <span className="search-item-category">{item.category}</span>
                    </div>

                    <div className="search-item-meta">
                      <div className="search-item-prices">
                        {item.price.regular && (
                          <div className="search-item-price">
                            <span className="price-label">Reg</span>
                            <span className="price-val">₹{item.price.regular}</span>
                          </div>
                        )}
                        {item.price.acDining && (
                          <div className="search-item-price">
                            <span className="price-label">AC</span>
                            <span className="price-val">₹{item.price.acDining}</span>
                          </div>
                        )}
                      </div>
                      <span className="search-item-page-badge">Pg {item.page}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-no-results">
              <p>No dishes matching &ldquo;{query}&rdquo;</p>
              <span>Try checking spelling or searching another item</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── UI Helpers ─────────────────────────────────────────────────────────── */

function SearchIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function VegDot() {
  return (
    <span className="diet-dot diet-dot--veg" title="Vegetarian">
      <span className="diet-dot-inner" />
    </span>
  );
}

function NonVegDot() {
  return (
    <span className="diet-dot diet-dot--nonveg" title="Non-vegetarian">
      <span className="diet-dot-inner" />
    </span>
  );
}
