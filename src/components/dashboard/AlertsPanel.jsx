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
import ApprovePrescriptionModal from '../modals/ApprovePrescriptionModal';

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
  showGridView = false,
  maxHeight = '420px',
  className = '',
}) => {
  // Role filter tabs
  const [activeTab, setActiveTab] = useState('all');
  // Date filter
  const [dateFilter, setDateFilter] = useState('');
  // Send emails loading state
  const [sending, setSending] = useState(false);
  // Prescription modal state
  const [prescriptionModal, setPrescriptionModal] = useState({ isOpen: false, patient: null });

  const classifyAlertType = (alert) => {
    const text = `${alert?.category || ''} ${alert?.type || ''} ${alert?.message || ''}`.toLowerCase();

    if (text.includes('prescription')) return 'prescription';
    if (text.includes('comment') || text.includes('message')) return 'comment';
    if (
      text.includes('technician') ||
      text.includes('dialysis technician')
    ) return 'technician';

    return 'alert';
  };

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

  const patientAlertCounts = useMemo(() => {
    const map = new Map();

    filteredAlerts.forEach((alert) => {
      const patientId = alert.patientId ?? alert.pid ?? alert?.patient?.id ?? 'unknown';
      const patientName =
        alert.name ||
        alert.patientName ||
        alert?.patient?.name ||
        (patientId === 'unknown' ? 'Unknown Patient' : `Patient ${patientId}`);
      const avatar = alert.patientProfilePhoto || alert.avatar || null;

      if (!map.has(patientId)) {
        map.set(patientId, {
          patientId,
          name: patientName,
          avatar,
          prescription: 0,
          comment: 0,
          alert: 0,
          technician: 0,
          total: 0,
        });
      }

      const bucket = classifyAlertType(alert);
      const entry = map.get(patientId);
      entry[bucket] += 1;
      entry.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredAlerts]);

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
    <>
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
        {showGridView ? (
          // Counts-only per patient view
          <div>
            {patientAlertCounts.length === 0 ? (
              <div className="alerts-panel__empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Text color="muted" size="sm">No alerts to show</Text>
              </div>
            ) : (
              <div className="space-y-0">
                {patientAlertCounts.map((row, index) => {
                  const initials = (row.name || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((x) => x[0]?.toUpperCase())
                    .join('');

                  return (
                    <div
                      key={`${row.patientId}-${index}`}
                      className={`py-4 ${index !== patientAlertCounts.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        {row.avatar ? (
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#3f6b85] text-white flex items-center justify-center font-semibold text-sm">
                            {initials || 'U'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <Text size="md" weight="bold" className="text-gray-900 truncate">
                            {row.name}
                          </Text>
                        </div>

                        <div className="ml-auto flex items-center gap-3 flex-wrap justify-end">
                          {row.prescription > 0 && (
                            <button
                              className="px-3 py-2 rounded text-white text-sm font-semibold bg-cyan-500 hover:bg-cyan-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Opening prescription modal for', row);
                                setPrescriptionModal({ isOpen: true, patient: row });
                              }}
                            >
                              {row.prescription} Approve Prescription
                            </button>
                          )}

                          {row.comment > 0 && (
                            <button
                              className="px-3 py-2 rounded text-white text-sm font-semibold bg-green-500 hover:bg-green-600"
                              onClick={() => onAlertClick && onAlertClick({ patientId: row.patientId, alertType: 'comment' })}
                            >
                              {row.comment} Comments
                            </button>
                          )}

                          {row.alert > 0 && (
                            <button
                              className="px-3 py-2 rounded text-white text-sm font-semibold bg-red-500 hover:bg-red-600"
                              onClick={() => onAlertClick && onAlertClick({ patientId: row.patientId, alertType: 'alert' })}
                            >
                              {row.alert} Alerts
                            </button>
                          )} 

                          {row.technician > 0 && (
                            <button
                              className="px-3 py-2 rounded text-white text-sm font-semibold bg-purple-500 hover:bg-purple-600"
                              onClick={() => onAlertClick && onAlertClick({ patientId: row.patientId, alertType: 'technician' })}
                            >
                              {row.technician} Technician
                            </button>
                          )}

                          {row.total === 0 && (
                            <span className="px-3 py-2 rounded text-white text-sm font-semibold bg-gray-400">
                              0 alerts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // List View
          filteredAlerts.length === 0 ? (
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
                  onClick={(alertData) => {
                    const text = `${alertData?.category || ''} ${alertData?.type || ''} ${alertData?.message || ''}`.toLowerCase();
                    if (text.includes('prescription')) {
                      setPrescriptionModal({ 
                        isOpen: true, 
                        patient: { name: alertData.name || alertData.patientName || 'Unknown Patient' } 
                      });
                    } else if (onAlertClick) {
                      onAlertClick(alertData);
                    }
                  }}
                />
              ))}
            </div>
          )
        )}
      </CardBody>
    </Card>

    <ApprovePrescriptionModal 
      isOpen={prescriptionModal.isOpen} 
      onClose={() => setPrescriptionModal({ isOpen: false, patient: null })} 
      patientName={prescriptionModal.patient?.name}
      patientId={prescriptionModal.patient?.patientId}
    />
    </>
  );
};

AlertsPanel.propTypes = {
  title: PropTypes.string,
  alerts: PropTypes.array,
  loading: PropTypes.bool,
  onAlertClick: PropTypes.func,
  showSendEmails: PropTypes.bool,
  showRoleTabs: PropTypes.bool,
  showGridView: PropTypes.bool,
  maxHeight: PropTypes.string,
  className: PropTypes.string,
};

export default AlertsPanel;
