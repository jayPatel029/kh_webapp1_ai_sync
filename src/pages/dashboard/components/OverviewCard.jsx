/**
 * OverviewCard Component
 * Reusable card showing a summary overview with multiple inline stats
 * (e.g. Appointments Overview: Total / New / Completed / Incomplete)
 * 
 * Matches the middle-row cards in the dashboard design image.
 * 
 * @file src/pages/dashboard/components/OverviewCard.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {string} props.title - Card heading (e.g. "Appointments Overview")
 * @param {string} [props.subtitle] - Optional subtitle text (e.g. "Live data updates every five minutes")
 * @param {Array<{icon: React.ReactNode, label: string, value: number|string}>} props.stats
 */
const OverviewCard = ({ title, subtitle, stats = [] }) => {
  return (
    <div className="overview-card">
      {/* Header */}
      <div className="overview-card__header">
        <h3 className="overview-card__title">{title}</h3>
        {subtitle && <p className="overview-card__subtitle">{subtitle}</p>}
      </div>

      {/* Stats row */}
      <div className="overview-card__stats">
        {stats.map((stat, idx) => (
          <div className="overview-stat" key={idx}>
            <div className="overview-stat__icon">
              {stat.icon}
            </div>
            <div className="overview-stat__content">
              <p className="overview-stat__label">{stat.label}</p>
              <p className="overview-stat__value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

OverviewCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
};

export default OverviewCard;
