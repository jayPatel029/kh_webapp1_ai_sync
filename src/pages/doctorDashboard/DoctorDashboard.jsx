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

function DoctorDashboard() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
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

      // Fetch alerts, stats, logs, comments in parallel
      const [alertsRes, statsRes, logsRes, commentsRes] = await Promise.allSettled([
        getDoctorSortAlerts(doctorId),
        getPatientsByDoctorId(),
        getDoctorReportLogs(),
        getDoctorComments(email, name),
      ]);

      // Alerts
      if (alertsRes.status === 'fulfilled' && alertsRes.value.success) {
        setAlerts(alertsRes.value.data || []);
      }

      // Patient stats (latest day data)
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        const statsData = statsRes.value.data?.data || [];
        if (statsData.length > 0) {
          const latest = statsData[statsData.length - 1];
          setPatientStats({ online: latest.online || 0, inperson: latest.inperson || 0 });
        }
      }

      // Recent report logs
      if (logsRes.status === 'fulfilled' && logsRes.value.success) {
        setRecentLogs((logsRes.value.data?.data || []).slice(0, 5));
      }

      // Unread comments
      if (commentsRes.status === 'fulfilled' && commentsRes.value) {
        setCommentCount(commentsRes.value.count || 0);
      }
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
      <Box className="flex-1 overflow-y-auto p-4 md:p-10">

        {/* Header */}
        <Flex
          align="center"
          justify="between"
          className="border-b-2 border-[#00cccc] pb-4 mb-6"
        >
          <Heading as="h1" size={isMobile ? 'lg' : '2xl'} className="text-[#32617d]">
            Welcome, Dr. {doctorName}
          </Heading>
          <button
            onClick={handleSendEmails}
            className="px-4 py-2 bg-[#32617d] text-white rounded-lg text-sm hover:bg-[#274f65] transition-colors"
          >
            Send Alert Emails
          </button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" className="py-12">
            <Text className="text-gray-500">Loading dashboard...</Text>
          </Flex>
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

            {/* Alerts Section */}
            <Box className="mb-6">
              <Heading as="h2" size="lg" className="mb-4 text-black font-bold">
                Recent Alerts
              </Heading>
              {alerts.length === 0 ? (
                <Box className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                  <Text className="text-green-700">No pending alerts. All clear!</Text>
                </Box>
              ) : (
                <Box className="space-y-3">
                  {alerts.slice(0, 10).map((alert, idx) => (
                    <Box
                      key={alert.id || idx}
                      className={`p-4 rounded-lg border bg-white cursor-pointer hover:shadow-md transition-shadow ${
                        alert.isRead ? 'border-gray-200' : 'border-orange-300 bg-orange-50'
                      }`}
                      onClick={() => alert.patientId && navigate(`/userProfile/${alert.patientId}`)}
                    >
                      <Flex justify="between" align="center">
                        <Box>
                          <Text weight="semibold" className="text-gray-800">
                            {alert.name || 'Unknown Patient'}
                          </Text>
                          <Text size="sm" className="text-gray-500">
                            {alert.type || alert.category || 'Alert'} &mdash;{' '}
                            {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : ''}
                          </Text>
                        </Box>
                        <Box className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.isRead ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {alert.isRead ? 'Read' : 'Unread'}
                        </Box>
                      </Flex>
                    </Box>
                  ))}
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