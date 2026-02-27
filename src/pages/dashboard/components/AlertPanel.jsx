/**
 * AlertPanel Component
 * Reusable panel showing filtered alert items with avatar, name, message, date
 * 
 * Matches the bottom-row alert panels in the dashboard design image.
 * 
 * @file src/pages/dashboard/components/AlertPanel.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Get initials from a name (first letter of first and last name)
 */
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || '??').toUpperCase();
};

/**
 * Color palette for avatars based on name hash
 */
const AVATAR_COLORS = ['blue', 'green', 'orange', 'purple'];
const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/**
 * @param {Object} props
 * @param {string} props.title - Panel heading (e.g. "Doctor Alerts")
 * @param {Array<{label: string, options: Array<{value: string, label: string}>, value: string, onChange: Function}>} [props.filters]
 * @param {Array<{id: any, name: string, message: string, date: string, unreadCount: number, onClick: Function}>} props.items
 * @param {string} [props.emptyMessage] - Message when no items
 */
const AlertPanel = ({ title, filters = [], items = [], emptyMessage = 'No alerts' }) => {
  return (
    <div className="alert-panel">
      {/* Header */}
      <div className="alert-panel__header">
        <h3 className="alert-panel__title">{title}</h3>
        
        {filters.length > 0 && (
          <div className="alert-panel__filters">
            {filters.map((filter, idx) => (
              <div className="alert-panel__filter-group" key={idx}>
                <p className="alert-panel__filter-label">{filter.label}</p>
                {filter.type === 'date' ? (
                  <input
                    type="date"
                    className="dashboard-date-input"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value)}
                  />
                ) : (
                  <select
                    className="dashboard-filter-select"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value)}
                  >
                    {(filter.options || []).map((opt, optIdx) => (
                      <option key={optIdx} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="alert-panel__list">
        {items.length === 0 ? (
          <div className="dashboard-empty">
            <p className="dashboard-empty__text">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              className="alert-item"
              key={item.id || idx}
              onClick={item.onClick}
              role={item.onClick ? 'button' : undefined}
              tabIndex={item.onClick ? 0 : undefined}
            >
              {/* Avatar */}
              <div className={`alert-item__avatar alert-item__avatar--${getAvatarColor(item.name)}`}>
                {getInitials(item.name)}
                {item.unreadCount > 0 && (
                  <span className="alert-item__badge">{item.unreadCount}</span>
                )}
              </div>

              {/* Content */}
              <div className="alert-item__content">
                <p className="alert-item__name">{item.name}</p>
                {item.message && (
                  <p className="alert-item__message">{item.message}</p>
                )}
              </div>

              {/* Date */}
              {item.date && (
                <p className="alert-item__date">{item.date}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

AlertPanel.propTypes = {
  title: PropTypes.string.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'date']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      value: PropTypes.string,
      onChange: PropTypes.func.isRequired,
    })
  ),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any,
      name: PropTypes.string.isRequired,
      message: PropTypes.string,
      date: PropTypes.string,
      unreadCount: PropTypes.number,
      onClick: PropTypes.func,
    })
  ),
  emptyMessage: PropTypes.string,
};

export default AlertPanel;
