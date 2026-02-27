/**
 * Doctor Dashboard - Redesigned
 * Renders doctor-specific alerts, patient stats, and recent activity.
 * 
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text
} from '../../component-library';

// Design System
import '../../design-system/styles/index.css';

// APIs
import { getDoctorIdByEmail, getDoctorReportLogs } from '../../ApiCalls/doctorApis';
import { getDoctorSortAlerts } from '../../ApiCalls/doctorAlert';
import { getDoctorComments } from '../../ApiCalls/GetComments';
import { getPatientsByDoctorId } from '../../ApiCalls/analyticsApis';
import { sendAlertEmails } from '../../ApiCalls/adminDashApis';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { usePageCache, PAGE_CACHE } from '../../cache';
import PageSkeleton from '../../components/PageSkeleton';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { fetchWithCache } = usePageCache(PAGE_CACHE.DOCTOR_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [patientStats, setPatientStats] = useState({ online: 0, inperson: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [doctorName, setDoctorName] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('name') || 'Doctor';
      setDoctorName(name);

      // Get doctor ID
      const idRes = await getDoctorIdByEmail({ email });
      const doctorId = idRes.success ? idRes.data?.data : null;

      if (!doctorId) {
        console.error('Could not resolve doctor id');
        setLoading(false);
        return;
      }

      // Fetch all in parallel, cached
      const [alertsResult, statsResult, logsResult, commentsResult] = await Promise.all([
        fetchWithCache('doctorAlerts', () => getDoctorSortAlerts(doctorId)),
        fetchWithCache('patientStats', () => getPatientsByDoctorId()),
        fetchWithCache('reportLogs', () => getDoctorReportLogs()),
        fetchWithCache('comments', () => getDoctorComments(email, name).then(r => ({ success: true, data: r }))),
      ]);

      if (alertsResult.success) setAlerts(alertsResult.data?.data || alertsResult.data || []);
      if (statsResult.success) {
        const statsData = statsResult.data?.data || [];
        if (statsData.length > 0) {
          const latest = statsData[statsData.length - 1];
          setPatientStats({ online: latest.online || 0, inperson: latest.inperson || 0 });
        }
      }
      if (logsResult.success) setRecentLogs((logsResult.data?.data || []).slice(0, 5));
      if (commentsResult.success) setCommentCount(commentsResult.data?.count || 0);
    } catch (error) {
      console.error('Error loading doctor dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const handleSendEmails = async () => {
    try {
      await sendAlertEmails();
      alert('Alert emails sent successfully!');
    } catch (e) {
      console.error('Error sending emails:', e);
      alert('Failed to send alert emails.');
    }
  };

  // Group alerts by type
  const prescriptionAlerts = alerts.filter(a => (a.type || '').toLowerCase().includes('prescription'));
  const readingAlerts = alerts.filter(a => !(a.type || '').toLowerCase().includes('prescription'));

  return (
    <Box className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <Box className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          
          {/* Header with Cyan Underline - Figma Design */}
          <Box className="pb-6 mb-6 border-b-2 border-[#00cccc]">
            <Heading as="h1" size="2xl" className="text-[#32617d] font-bold">
              My Dashboard,
            </Heading>
          </Box>

        {loading ? (
          <PageSkeleton variant="dashboard" />
        ) : (
          <>
            {/* Stats Cards */}
            <Flex gap={4} className="mb-6" wrap="wrap">
              <Box className="flex-1 min-w-[140px] p-4 rounded-xl border border-gray-200 bg-white">
                <Text size="sm" className="text-gray-500">Alerts</Text>
                <Text size="2xl" weight="bold" className="text-[#32617d]">{alerts.length}</Text>
              </Box>
              <Box className="flex-1 min-w-[140px] p-4 rounded-xl border border-gray-200 bg-white">
                <Text size="sm" className="text-gray-500">Prescriptions Pending</Text>
                <Text size="2xl" weight="bold" className="text-orange-600">{prescriptionAlerts.length}</Text>
              </Box>
              <Box className="flex-1 min-w-[140px] p-4 rounded-xl border border-gray-200 bg-white">
                <Text size="sm" className="text-gray-500">Unread Comments</Text>
                <Text size="2xl" weight="bold" className="text-blue-600">{commentCount}</Text>
              </Box>
              <Box className="flex-1 min-w-[140px] p-4 rounded-xl border border-gray-200 bg-white">
                <Text size="sm" className="text-gray-500">Online / In-person</Text>
                <Text size="2xl" weight="bold" className="text-green-600">
                  {patientStats.online} / {patientStats.inperson}
                </Text>
              </Box>
            </Flex>

            {/* Important Alerts Section - Figma Design */}
            <Box className="mb-6">
              <Heading as="h2" size="lg" className="mb-6 text-black font-bold">
                Important Alerts
              </Heading>
              {alerts.length === 0 ? (
                <Box className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                  <Text className="text-green-700">No pending alerts. All clear!</Text>
                </Box>
              ) : (
                <Box className="space-y-6">
                  {alerts.slice(0, 10).map((alert, idx) => {
                    // Count alert types for this patient
                    const patientAlerts = alerts.filter(
                      a => a.patientId === alert.patientId || a.name === alert.name
                    );
                    const prescriptionCount = patientAlerts.filter(
                      a => (a.type || '').toLowerCase().includes('prescription')
                    ).length;
                    const commentCount = patientAlerts.filter(
                      a => (a.type || '').toLowerCase().includes('comment')
                    ).length;
                    const dialysisTechnicianCount = patientAlerts.filter(
                      a => (a.type || '').toLowerCase().includes('dialysis') || 
                           (a.type || '').toLowerCase().includes('technician')
                    ).length;
                    const otherAlertCount = patientAlerts.filter(
                      a => !(a.type || '').toLowerCase().includes('prescription') &&
                            !(a.type || '').toLowerCase().includes('comment') &&
                            !(a.type || '').toLowerCase().includes('dialysis') &&
                            !(a.type || '').toLowerCase().includes('technician')
                    ).length;

                    return (
                      <Box key={alert.id || idx} className="pb-6  last:border-b-0">
                        <Flex gap={6} align="start">
                          {/* Patient Avatar */}
                          <Box className="flex-shrink-0">
                            <Box className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center border-2 border-gray-300">
                              <Text className="text-center text-white font-bold text-2xl">
                                {(alert.name || 'P').charAt(0).toUpperCase()}
                              </Text>
                            </Box>
                          </Box>

                          {/* Patient Info and Actions */}
                          <Box className="flex-1">
                            <Heading as="h3" size="md" className="mb-4 text-black font-semibold">
                              {alert.name || 'Unknown Patient'}
                            </Heading>

                            {/* Action Buttons */}
                            <Flex gap={4} wrap="wrap" align="center">
                              {prescriptionCount > 0 && (
                                <button
                                  onClick={() => alert.patientId && navigate(`/userProfile/${alert.patientId}`)}
                                  className="px-6 py-3 bg-[#00cccc] text-white font-bold text-sm rounded hover:bg-[#00b8b8] transition-colors"
                                >
                                  {prescriptionCount} Approve Prescription{prescriptionCount !== 1 ? 's' : ''}
                                </button>
                              )}
                              {commentCount > 0 && (
                                <button
                                  onClick={() => alert.patientId && navigate(`/userProfile/${alert.patientId}`)}
                                  className="px-6 py-3 bg-[#00c008] text-white font-bold text-sm rounded hover:bg-[#00a906] transition-colors"
                                >
                                  {commentCount} Comments
                                </button>
                              )}
                              {dialysisTechnicianCount > 0 && (
                                <button
                                  onClick={() => alert.patientId && navigate(`/userProfile/${alert.patientId}`)}
                                  className="px-6 py-3 bg-[#9c27b0] text-white font-bold text-sm rounded hover:bg-[#7b1fa2] transition-colors"
                                >
                                  {dialysisTechnicianCount} Dialysis technician alert{dialysisTechnicianCount !== 1 ? 's' : ''}
                                </button>
                              )}
                              {otherAlertCount > 0 && (
                                <button
                                  onClick={() => alert.patientId && navigate(`/userProfile/${alert.patientId}`)}
                                  className="px-6 py-3 bg-[#ff5252] text-white font-bold text-sm rounded hover:bg-[#ff1744] transition-colors"
                                >
                                  {otherAlertCount} Alerts
                                </button>
                              )}
                              {prescriptionCount === 0 && commentCount === 0 && otherAlertCount === 0 && dialysisTechnicianCount === 0 && (
                                <button
                                  className="px-6 py-3 bg-[#989898] text-white font-bold text-sm rounded cursor-default"
                                >
                                  0 alerts
                                </button>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Recent Activity Logs */}
            {recentLogs.length > 0 && (
              <Box className="mb-6">
                <Heading as="h2" size="lg" className="mb-4 text-black font-bold">
                  Recent Activity
                </Heading>
                <Box className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {recentLogs.map((log, idx) => (
                    <Box
                      key={idx}
                      className={`p-3 flex justify-between items-center ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <Text size="sm" className="text-gray-700">
                        {log.action || log.message || 'Activity logged'}
                      </Text>
                      <Text size="xs" className="text-gray-400">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default DoctorDashboard;