/**
 * AlertsPanel Component
 * Scrollable alerts list with role filter tabs, date filter,
 * "Send Alert Emails" action, and empty/loading states.
 *
 * @file src/components/dashboard/AlertsPanel.jsx
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

import { Card, CardHeader, CardBody } from '../../component-library/primitives/Card';
import { Heading, Text } from '../../component-library/primitives/Typography';
import { Spinner } from '../../component-library/feedback/Spinner';
import { Skeleton } from '../../component-library/feedback/Skeleton';

import AlertItem from './AlertItem';
import { sendAlertEmails } from '../../hooks/useDashboardData';

// ─── Icons ──────────────────────────────────────────────────

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── AlertsPanel ────────────────────────────────────────────

const AlertsPanel = ({
  title = 'Alerts',
  alerts = [],
  loading = false,
  onAlertClick,
  showSendEmails = false,
  showRoleTabs = false,
  maxHeight = '420px',
  className = '',
}) => {
  // Role filter tabs
  const [activeTab, setActiveTab] = useState('all');
  // Date filter
  const [dateFilter, setDateFilter] = useState('');
  // Send emails loading state
  const [sending, setSending] = useState(false);

  // Filter alerts by role tab
  const tabFilteredAlerts = useMemo(() => {
    if (activeTab === 'all') return alerts;
    return alerts.filter((a) => {
      const type = (a.type || a.message || '').toLowerCase();
      if (activeTab === 'doctor') {
        return type.includes('prescription') || type.includes('comment') || type.includes('doctor') || type.includes('report');
      }
      if (activeTab === 'admin') {
        return type.includes('enrollment') || type.includes('program') || type.includes('admin');
      }
      return true;
    });
  }, [alerts, activeTab]);

  // Filter by date
  const filteredAlerts = useMemo(() => {
    if (!dateFilter) return tabFilteredAlerts;
    return tabFilteredAlerts.filter((a) => {
      const d = a.date || a.createdAt;
      if (!d) return false;
      return d.startsWith(dateFilter);
    });
  }, [tabFilteredAlerts, dateFilter]);

  // Send alert emails handler
  const handleSendEmails = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await sendAlertEmails();
      if (res?.success || res?.message) {
        toast.success('Alert emails sent successfully!');
      } else {
        toast.success('Alert emails sent!');
      }
    } catch (err) {
      console.error('Send alert emails error:', err);
      toast.error('Failed to send alert emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── Loading skeleton ──────────────────────────────────
  if (loading) {
    return (
      <Card variant="outline" className={`alerts-panel alerts-panel--loading ${className}`}>
        <CardHeader className="alerts-panel__header">
          <Skeleton width="140px" height="22px" borderRadius="4px" />
          <Skeleton width="100px" height="32px" borderRadius="6px" />
        </CardHeader>
        <CardBody className="alerts-panel__body">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="alert-item alert-item--skeleton">
              <Skeleton width="40px" height="40px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height="14px" borderRadius="4px" />
                <Skeleton width="50%" height="12px" borderRadius="4px" className="mt-1" />
              </div>
              <Skeleton width="60px" height="12px" borderRadius="4px" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outline" className={`alerts-panel ${className}`}>
      <CardHeader className="alerts-panel__header">
        <div className="alerts-panel__title-row">
          <Heading as="h3" className="alerts-panel__title">{title}</Heading>
          <span className="alerts-panel__count">{filteredAlerts.length}</span>
        </div>

        <div className="alerts-panel__actions">
          {/* Date filter */}
          <div className="alerts-panel__filter">
            <FilterIcon />
            <input
              type="date"
              className="alerts-panel__date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter alerts by date"
            />
          </div>

          {/* Send emails button */}
          {showSendEmails && (
            <button
              className="alerts-panel__send-btn"
              onClick={handleSendEmails}
              disabled={sending}
              title="Send alert notification emails"
            >
              {sending ? (
                <Spinner size="xs" color="white" />
              ) : (
                <MailIcon />
              )}
              <span>{sending ? 'Sending…' : 'Send Alert Emails'}</span>
            </button>
          )}
        </div>
      </CardHeader>

      {/* Role tabs */}
      {showRoleTabs && (
        <div className="alerts-panel__tabs">
          {[
            { key: 'all', label: 'All' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'admin', label: 'Admin' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`alerts-panel__tab ${activeTab === tab.key ? 'alerts-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Alert list */}
      <CardBody className="alerts-panel__body" style={{ maxHeight, overflowY: 'auto' }}>
        {filteredAlerts.length === 0 ? (
          <div className="alerts-panel__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Text color="muted" size="sm">No alerts to show</Text>
          </div>
        ) : (
          <div className="alerts-panel__list">
            {filteredAlerts.map((alert, idx) => (
              <AlertItem
                key={alert.id || idx}
                alert={alert}
                onClick={onAlertClick}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

AlertsPanel.propTypes = {
  title: PropTypes.string,
  alerts: PropTypes.array,
  loading: PropTypes.bool,
  onAlertClick: PropTypes.func,
  showSendEmails: PropTypes.bool,
  showRoleTabs: PropTypes.bool,
  maxHeight: PropTypes.string,
  className: PropTypes.string,
};

export default AlertsPanel;
