/**
 * StatCard Component
 * Displays a single metric with animated count-up, skeleton loading, and icon.
 * Uses the design-system Card + Typography primitives.
 *
 * @file src/components/dashboard/StatCard.jsx
 *
 * @example
 * <StatCard
 *   icon={<UsersIcon />}
 *   label="Total Patients"
 *   value={248}
 *   loading={false}
 *   color="primary"
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../component-library/primitives/Card';
import { Skeleton } from '../../component-library/feedback/Skeleton';

// ─── Count-Up Hook ──────────────────────────────────────────

function useCountUp(target, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof target !== 'number' || target === 0) {
      setValue(target || 0);
      return;
    }

    const startVal = 0;
    const diff = target - startVal;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    startRef.current = null;
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  return value;
}

// ─── Color map ──────────────────────────────────────────────

const colorMap = {
  primary: {
    bg: 'var(--color-primary-50, #EEF2FF)',
    icon: 'var(--color-primary, #4164DF)',
    border: 'var(--color-primary-100, #C7D2FE)',
  },
  success: {
    bg: 'var(--color-success-light, #ECFDF5)',
    icon: 'var(--color-success, #00C008)',
    border: 'var(--color-success, #00C008)',
  },
  warning: {
    bg: 'var(--color-warning-light, #FFFBEB)',
    icon: 'var(--color-warning, #F59E0B)',
    border: 'var(--color-warning, #F59E0B)',
  },
  danger: {
    bg: 'var(--color-danger-light, #FEF2F2)',
    icon: 'var(--color-danger, #DE425B)',
    border: 'var(--color-danger, #DE425B)',
  },
  info: {
    bg: 'var(--color-info-light, #EFF6FF)',
    icon: 'var(--color-info, #3B82F6)',
    border: 'var(--color-info, #3B82F6)',
  },
  navy: {
    bg: 'var(--color-navy-50, #F0F4FF)',
    icon: 'var(--color-navy-600, #1E3A5F)',
    border: 'var(--color-navy-200, #B0C4DE)',
  },
};

// ─── StatCard ───────────────────────────────────────────────

const StatCard = ({
  icon,
  label,
  value = 0,
  subtitle,
  loading = false,
  color = 'primary',
  animationDuration = 1200,
  className = '',
}) => {
  const scheme = colorMap[color] || colorMap.primary;
  const displayValue = useCountUp(value, animationDuration, !loading);

  if (loading) {
    return (
      <Card variant="outline" size="sm" className={`stat-card stat-card--loading ${className}`}>
        <div className="stat-card__inner">
          <Skeleton width="44px" height="44px" borderRadius="12px" />
          <div className="stat-card__text">
            <Skeleton width="60%" height="14px" borderRadius="4px" />
            <Skeleton width="40%" height="28px" borderRadius="4px" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="outline"
      size="sm"
      className={`stat-card ${className}`}
      style={{ borderColor: scheme.border, borderWidth: '1.5px' }}
    >
      <div className="stat-card__inner">
        <div
          className="stat-card__icon"
          style={{
            backgroundColor: scheme.bg,
            color: scheme.icon,
            border: `1px solid ${scheme.border}`,
          }}
        >
          {icon}
        </div>
        <div className="stat-card__text">
          <span className="stat-card__label">{label}</span>
          <span className="stat-card__value">{displayValue.toLocaleString()}</span>
          {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'navy']),
  animationDuration: PropTypes.number,
  className: PropTypes.string,
};

export default StatCard;
