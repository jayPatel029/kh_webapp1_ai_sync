/**
 * StatCategoryCard Component
 * Reusable card displaying a category with multiple stat rows 
 * (e.g. Clinics: Total / New / Active)
 * 
 * Matches the top-row cards in the dashboard design image.
 * 
 * @file src/pages/dashboard/components/StatCategoryCard.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {Object} props
 * @param {string} props.title - Card heading (e.g. "Clinics", "Doctors")
 * @param {React.ReactNode} [props.filterNode] - Optional filter dropdown (renders in header)
 * @param {Array<{icon: React.ReactNode, label: string, value: number|string}>} props.stats
 */
const StatCategoryCard = ({ title, filterNode, stats = [] }) => {
  return (
    <div className="stat-category-card">
      {/* Header */}
      <div className="stat-category-card__header">
        <h3 className="stat-category-card__title">{title}</h3>
        {filterNode && (
          <div className="stat-category-card__filter">
            {filterNode}
          </div>
        )}
      </div>

      {/* Stat rows */}
      <div className="stat-category-card__body">
        {stats.map((stat, idx) => (
          <div className="stat-row" key={idx}>
            <div className="stat-row__icon">
              {stat.icon}
            </div>
            <div className="stat-row__content">
              <p className="stat-row__label">{stat.label}</p>
              <p className="stat-row__value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

StatCategoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  filterNode: PropTypes.node,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
};

export default StatCategoryCard;
