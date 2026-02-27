/**
 * BaseDashboard Component
 * Generic dashboard layout that can be derived for any user role.
 * Renders stat cards, overview cards, and alert panels in a consistent grid.
 * 
 * Role-specific dashboards (Admin, Doctor, Frontdesk, etc.) compose this
 * component by passing in their own config objects.
 * 
 * @file src/pages/dashboard/BaseDashboard.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import StatCategoryCard from './components/StatCategoryCard';
import OverviewCard from './components/OverviewCard';
import AlertPanel from './components/AlertPanel';
import DashboardSkeleton from './components/DashboardSkeleton';
import './dashboard.css';

/**
 * @param {Object} props
 * @param {boolean} props.loading - Whether data is still loading
 * @param {Array} props.statCards - Config for top-row stat category cards
 * @param {Array} props.overviewCards - Config for middle-row overview cards
 * @param {Array} props.alertPanels - Config for bottom-row alert panels
 * @param {string} [props.alertsSectionTitle] - Title for the alerts section
 * @param {React.ReactNode} [props.children] - Additional content after alerts
 */
const BaseDashboard = ({
  loading = false,
  statCards = [],
  overviewCards = [],
  alertPanels = [],
  alertsSectionTitle = 'Alerts',
  children,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard__content">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Top Row: Stat Category Cards */}
            {statCards.length > 0 && (
              <div className={`dashboard-grid dashboard-grid--${Math.min(statCards.length, 3)}col`}>
                {statCards.map((card, idx) => (
                  <StatCategoryCard
                    key={idx}
                    title={card.title}
                    filterNode={card.filterNode}
                    stats={card.stats}
                  />
                ))}
              </div>
            )}

            {/* Middle Row: Overview Cards */}
            {overviewCards.length > 0 && (
              <div
                className={`dashboard-grid dashboard-grid--${Math.min(overviewCards.length, 2)}col`}
                style={{ marginTop: 'var(--space-5, 20px)' }}
              >
                {overviewCards.map((card, idx) => (
                  <OverviewCard
                    key={idx}
                    title={card.title}
                    subtitle={card.subtitle}
                    stats={card.stats}
                  />
                ))}
              </div>
            )}

            {/* Bottom Row: Alerts Section */}
            {alertPanels.length > 0 && (
              <div className="alerts-section">
                <h2 className="alerts-section__title">{alertsSectionTitle}</h2>
                <div className={`dashboard-grid dashboard-grid--${Math.min(alertPanels.length, 2)}col`}>
                  {alertPanels.map((panel, idx) => (
                    <AlertPanel
                      key={idx}
                      title={panel.title}
                      filters={panel.filters}
                      items={panel.items}
                      emptyMessage={panel.emptyMessage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Any additional role-specific content */}
            {children}
          </>
        )}
      </div>
    </div>
  );
};

BaseDashboard.propTypes = {
  loading: PropTypes.bool,
  statCards: PropTypes.array,
  overviewCards: PropTypes.array,
  alertPanels: PropTypes.array,
  alertsSectionTitle: PropTypes.string,
  children: PropTypes.node,
};

export default BaseDashboard;
