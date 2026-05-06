/**
 * DialysisBedSeat Component
 * @file src/components/DialysisBedSeat/DialysisBedSeat.jsx
 *
 * Compact, theater-seat-like visual representation of a dialysis bed.
 * Designed for dense grid layouts (50-100 beds) with instant scanability.
 *
 * Props:
 *   - bedId (string): Unique bed identifier (e.g., "B101")
 *   - status (string): One of AVAILABLE, OCCUPIED, DIALYSIS_RUNNING, PAUSED, ALERT, MAINTENANCE
 *   - hasAlert (boolean): Whether an alert is active for this bed
 *   - isRunning (boolean): Whether active dialysis is running
 *   - onClick (function): Optional click handler
 */

import React, { useMemo, useEffect, useState } from 'react';
import './DialysisBedSeat.css';

// Status color mapping
const STATUS_COLORS = {
  AVAILABLE: '#3B82F6',      // Emerald 500 (Green)
  OCCUPIED: '#10B981',       // Blue 500
  DIALYSIS_RUNNING: '#10B981', // Emerald 500
  PAUSED: '#F59E0B',         // Amber 500
  ALERT: '#EF4444',          // Red 500
  QUARANTINE: '#FACC15',     // Yellow 400 (ISO)
  MAINTENANCE: '#94A3B8',    // Slate 400
  CLEANING: '#F97316',       // Orange 500
};

// Determine if text should be light (white) based on background luminance
const isColorDark = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Bed icon SVG
const BedIcon = ({ color }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bed shape - simplified dialysis bed */}
    <rect x="3" y="7" width="18" height="10" rx="1" fill={color} stroke={color} strokeWidth="1" />
    {/* Head section */}
    <rect x="3" y="5" width="6" height="2" rx="1" fill={color} />
    {/* Support lines */}
    <line x1="6" y1="17" x2="6" y2="19" stroke={color} strokeWidth="1" />
    <line x1="18" y1="17" x2="18" y2="19" stroke={color} strokeWidth="1" />
  </svg>
);

// Countdown timer component (backwards running) - displays HH:MM:SS
function TimerDisplay({ start, durationMin }) {
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    let timer;
    if (!start || !durationMin) {
      setRemainingMs(null);
      return () => {};
    }

    const startTs = new Date(start).getTime();
    const endTs = startTs + durationMin * 60 * 1000;

    const update = () => setRemainingMs(endTs - Date.now());

    update();
    timer = setInterval(update, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [start, durationMin]);

  if (remainingMs == null) return null;
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="dialysis-bed-seat__timer" aria-live="polite">
      Time left: {pad(hrs)}:{pad(mins)}:{pad(secs)}
    </div>
  );
}

/**
 * DialysisBedSeat Component
 */
const DialysisBedSeat = ({
  bedId,
  status = 'AVAILABLE',
  hasAlert = false,
  isRunning = false,
  patientName = '',
  patientAilment = '',
  onClick = null,
  dialysisStart = null, // ISO string or timestamp
  dialysisDurationMinutes = null,
}) => {
  // Determine effective status (ALERT overrides everything)
  const effectiveStatus = hasAlert ? 'ALERT' : status;
  const backgroundColor = STATUS_COLORS[effectiveStatus] || STATUS_COLORS.AVAILABLE;
  const isDark = isColorDark(backgroundColor);
  const textColor = isDark ? '#FFFFFF' : '#1F2937';

  // Memoize icon color
  const iconColor = useMemo(() => textColor, [textColor]);

  return (
    <div
      className="dialysis-bed-seat"
      style={{
        '--status-color': backgroundColor,
        '--text-color': textColor,
        '--icon-color': textColor,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Dialysis Bed ${bedId} - ${effectiveStatus}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          onClick();
        }
      }}
    >
      {/* Top Indicator Row (12px height) */}
      <div className="dialysis-bed-seat__top-row">
        {/* Status dot positioned top-right */}
        <div className="dialysis-bed-seat__status-dot" />
      </div>

      {/* Center Icon (24px) */}
      <div className="dialysis-bed-seat__icon-container">
        <BedIcon color={iconColor} />
      </div>

      {/* Bottom Label (Bed ID) */}
      <div className="dialysis-bed-seat__label">{bedId}</div>

      {/* Countdown timer if dialysisStart and duration provided */}
      {dialysisStart && dialysisDurationMinutes > 0 && (
        <TimerDisplay start={dialysisStart} durationMin={dialysisDurationMinutes} />
      )}

      {/* Patient Initials Badge (center) */}
      {patientName && (
        <div className="dialysis-bed-seat__initials-badge" aria-hidden>
          {patientName
            .split(' ')
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')}
        </div>
      )}

      {/* Status label (small pill) */}
      <div className="dialysis-bed-seat__status-label">{effectiveStatus.replace('_', ' ')}</div>

      {/* Ailment label (small muted text) */}
      {patientAilment && (
        <div className="dialysis-bed-seat__ailment" title={patientAilment}>
          {patientAilment}
        </div>
      )}

      {/* Badge Indicators */}

      {/* Top-Left: Alert Badge ("!") */}
      {hasAlert && <div className="dialysis-bed-seat__alert-badge">!</div>}

      {/* Bottom-Right: Running Indicator (pulsing dot) */}
      {isRunning && <div className="dialysis-bed-seat__running-badge" />}
    </div>
  );
};

DialysisBedSeat.displayName = 'DialysisBedSeat';

export default DialysisBedSeat;
// TimerDisplay was moved above to ensure it's defined before use.
