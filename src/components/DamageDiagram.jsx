import React from 'react';
import { DAMAGE_ZONES, DAMAGE_ROWS, DAMAGE_COLS, zoneLabel } from '../data/listingOptions';

/**
 * Top-view vehicle diagram used to mark damage areas.
 *  - interactive (seller wizard): click a zone to toggle it as damaged.
 *  - read-only (buyer detail): damaged zones are highlighted, nothing clickable.
 * The grid mirrors a car seen from above with the front at the top.
 */
export const DamageDiagram = ({ zones = [], noDamage = false, interactive = false, onToggle }) => {
  const cells = [];
  for (let r = 0; r < DAMAGE_ROWS; r++) {
    for (let c = 0; c < DAMAGE_COLS; c++) {
      const zone = DAMAGE_ZONES.find((z) => z.row === r && z.col === c);
      cells.push(zone || null);
    }
  }

  const selected = new Set(zones);

  return (
    <div className="damage-diagram-wrap">
      <div
        className="damage-diagram"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${DAMAGE_COLS}, 1fr)`,
          gap: '6px',
        }}
        role={interactive ? 'group' : undefined}
        aria-label="Vehicle damage diagram"
      >
        {cells.map((zone, i) => {
          if (!zone) return <div key={`spacer-${i}`} />;
          const isDamaged = selected.has(zone.id);
          if (!interactive) {
            return (
              <div
                key={zone.id}
                className={`damage-zone readonly ${isDamaged ? 'damaged' : ''}`}
                title={zone.label}
              >
                {zone.label}
              </div>
            );
          }
          return (
            <button
              type="button"
              key={zone.id}
              className={`damage-zone ${isDamaged ? 'damaged' : ''}`}
              onClick={() => onToggle && onToggle(zone.id)}
              aria-pressed={isDamaged}
              title={`Toggle damage: ${zone.label}`}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        {noDamage ? (
          <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
            ✓ Seller declares no damage to any panel.
          </span>
        ) : selected.size > 0 ? (
          <span>
            <strong style={{ color: 'var(--accent-red)' }}>{selected.size} panel(s) marked:</strong>{' '}
            {[...selected].map(zoneLabel).join(', ')}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>
            {interactive
              ? 'Tap any panel the vehicle has damage on, or tick "No damage" below.'
              : 'No damage panels recorded.'}
          </span>
        )}
      </div>
    </div>
  );
};

export default DamageDiagram;
