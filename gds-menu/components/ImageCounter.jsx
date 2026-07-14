'use client';

export default function ImageCounter({ current, total }) {
  return (
    <div className="counter-badge" aria-label={`Menu page ${current} of ${total}`} role="status">
      <span style={{ color: '#d4a017' }}>{current}</span>
      <span style={{ color: '#555', margin: '0 0.3em' }}>/</span>
      <span style={{ color: '#888' }}>{total}</span>
    </div>
  );
}
