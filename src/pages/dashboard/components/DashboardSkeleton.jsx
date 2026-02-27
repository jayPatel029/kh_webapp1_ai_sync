/**
 * DashboardSkeleton Component
 * Loading placeholder while dashboard data is fetching
 * 
 * @file src/pages/dashboard/components/DashboardSkeleton.jsx
 */

import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      {/* Top row - 3 cards */}
      <div className="dashboard-skeleton__row dashboard-grid--3col" style={{ display: 'grid' }}>
        <div className="dashboard-skeleton__card" />
        <div className="dashboard-skeleton__card" />
        <div className="dashboard-skeleton__card" />
      </div>

      {/* Middle row - 2 cards */}
      <div className="dashboard-skeleton__row dashboard-grid--2col" style={{ display: 'grid' }}>
        <div className="dashboard-skeleton__card" style={{ height: 120 }} />
        <div className="dashboard-skeleton__card" style={{ height: 120 }} />
      </div>

      {/* Bottom row - 2 panels */}
      <div className="dashboard-skeleton__row dashboard-grid--2col" style={{ display: 'grid' }}>
        <div className="dashboard-skeleton__card" style={{ height: 300 }} />
        <div className="dashboard-skeleton__card" style={{ height: 300 }} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
