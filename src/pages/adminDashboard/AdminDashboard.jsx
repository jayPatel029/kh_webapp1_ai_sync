/**
 * Admin Dashboard - Redesigned
 * Renders as content within DashboardLayout (no internal Sidebar/Navbar)
 * Uses component-library for layout and styling
 * 
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

// cspell:disable

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  SortDropdown,
  Text,
  
} from "../../component-library";
import { getIdByEmail, isDoctorRole } from "../../ApiCalls/authapis";
import { getDoctorIdByEmail } from "../../ApiCalls/doctorApis";
import { getDoctorSortAlerts } from "../../ApiCalls/doctorAlert";
import {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getUsersThisWeekSub,
  getSuperAdminAlerts,
} from "../../ApiCalls/adminDashApis";
import { getAlertByType } from "../../ApiCalls/alertsApis";
import { getDoctorComments } from "../../ApiCalls/GetComments";
import { useIsMobile } from "../../components/mobile/useIsMobile";
// Import CSS for modals (legacy styles)
import "./adminDashboard.css"; 

// Components
import PatientAlertCard from "./components/PatientAlertCard";
import PrescriptionModal from "./components/ApprovePrescriptionModal";
import CommentContainer from "./components/CommentContainer";
import AlertModal from "./components/AlertModal";
import DiaAlertModal from "./components/DialysisTechModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [loading, setLoading] = useState(true);

  // Data State
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
  });
  
  const [alertTypeFilter, setAlertTypeFilter] = useState("");
  const [allPatients, setAllPatients] = useState([]);

  // Modal State
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Initial Auth and Role Checks
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const role = localStorage.getItem("role");
      if (role === "Dialysis Technician") {
        navigate("/patients");
        return;
      }

      const email = localStorage.getItem("email");

      // Get Admin ID
      try {
        const idRes = await getIdByEmail({ email });
        if (idRes.success) {
          localStorage.setItem("id", idRes.data?.id);
        }
      } catch (err) {
        console.error("Error getting admin id:", err);
      }

      // Check if Doctor
      try {
        const docRes = await isDoctorRole();
        if (docRes.success) {
          // store doctor role in localStorage for data fetching
          localStorage.setItem("isDoctor", docRes.data?.data);
        }
      } catch (err) {
        console.error("Error checking isDoctor:", err);
      }

      fetchDashboardData();
    };

    init();
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const adminId = localStorage.getItem("id");
      const isDoc = localStorage.getItem("isDoctor") === "true";

      // Fetch Stats
      const [total, newU, newUSub] = await Promise.all([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub()
      ]);
      setStats({
        totalUsers: total || 0,
        newUsers: adminId === "1" ? (newU || 0) : (newUSub || 0)
      });

      // Fetch Alerts
      let alerts = [];
      if (isDoc) {
        const doctorIdRes = await getDoctorIdByEmail({ email });
        const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;
        if (doctorId) {
          const alertsRes = await getDoctorSortAlerts(doctorId);
          alerts = alertsRes.success ? (alertsRes.data || []) : [];
        }
      } else if (adminId === "1") {
        // Super admin: fetch consolidated super admin alerts
        try {
          const superRes = await getSuperAdminAlerts(adminId);
          alerts = superRes?.data || [];
        } catch {
          // fallback to regular alerts
          const alertsRes = await getAlerts();
          alerts = (alertsRes.data || []).reverse();
        }
      } else {
        const alertsRes = await getAlerts();
        alerts = (alertsRes.data || []).reverse();
      }

      // Group alerts by Patient
      const patientMap = new Map();

      for (const alert of alerts) {
        const pId = alert.patientId;
        if (!pId) continue;

        if (!patientMap.has(pId)) {
          patientMap.set(pId, {
            id: pId,
            name: alert.name || "Unknown Patient",
            avatar: alert.patientProfilePhoto,
            prescriptionAlerts: [],
            commentAlerts: [],
            alertAlerts: [],
            dialysisAlerts: [],
            prescriptionCount: 0,
            commentCount: 0,
            alertCount: 0,
            dialysisCount: 0,
          });
        }

        const pData = patientMap.get(pId);
        const type = (alert.type || "").toLowerCase();
        const category = (alert.category || "").toLowerCase();

        if (type.includes("prescription") || category.includes("prescription")) {
          pData.prescriptionAlerts.push(alert);
          pData.prescriptionCount++;
        } else if (type.includes("dialysis tech") || category.includes("dialysis tech")) {
          pData.dialysisAlerts.push(alert);
          pData.dialysisCount++;
        } else {
          pData.alertAlerts.push(alert);
          if (alert.isRead === 0 || alert.isRead === false) {
            pData.alertCount++;
          }
        }
      }

      // Fetch Comments separately if Doctor
      if (isDoc) {
        const patientPromises = Array.from(patientMap.values()).map(async (p) => {
          try {
            const commentRes = await getDoctorComments(email, p.name);
            const comments = commentRes.comments || [];
            p.commentAlerts = comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            p.commentCount = comments.filter(c => !c.isRead).length;
          } catch (e) {
            console.error(`Error fetching comments for ${p.name}:`, e);
          }
        });
        await Promise.all(patientPromises);
      }

      setPatients(Array.from(patientMap.values()));
      setAllPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = (patient, type) => {
    setSelectedPatient(patient);
    if (type === 'prescription') {
      localStorage.setItem("prescriptionAlerts", JSON.stringify(patient.prescriptionAlerts));
    } else if (type === 'alert') {
      localStorage.setItem("alertAlerts", JSON.stringify(patient.alertAlerts));
    } else if (type === 'dialysis') {
      localStorage.setItem("Dialysis_updates", JSON.stringify(patient.dialysisAlerts));
    }
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if (type === 'alert' || type === 'comment') {
      fetchDashboardData();
    }
  };

  

  const handleAlertTypeFilter = async (type) => {
    setAlertTypeFilter(type);
    if (!type) {
      setPatients(allPatients);
      return;
    }
    try {
      const res = await getAlertByType(type);
      const filtered = res?.data || [];
      // Rebuild patient map from filtered alerts
      const patientMap = new Map();
      for (const alert of filtered) {
        const pId = alert.patientId;
        if (!pId) continue;
        if (!patientMap.has(pId)) {
          patientMap.set(pId, {
            id: pId,
            name: alert.name || 'Unknown Patient',
            avatar: alert.patientProfilePhoto,
            prescriptionAlerts: [], commentAlerts: [],
            alertAlerts: [], dialysisAlerts: [],
            prescriptionCount: 0, commentCount: 0,
            alertCount: 0, dialysisCount: 0,
          });
        }
        const pData = patientMap.get(pId);
        const t = (alert.type || '').toLowerCase();
        if (t.includes('prescription')) { pData.prescriptionAlerts.push(alert); pData.prescriptionCount++; }
        else if (t.includes('dialysis')) { pData.dialysisAlerts.push(alert); pData.dialysisCount++; }
        else { pData.alertAlerts.push(alert); if (!alert.isRead) pData.alertCount++; }
      }
      setPatients(Array.from(patientMap.values()));
    } catch (e) {
      console.error('Error filtering by type:', e);
    }
  };   

  return (
    <Box className={`flex-1 flex flex-col min-h-0 bg-white ${isMobile ? 'px-3 pt-2' : ''}`}>
      {/* Main Content Scrollable Area */}
      <Box className="flex-1 overflow-y-auto">
  
          {/* Header */}
          <Flex
            align="center"
            justify="between"
            className={`border-b-2 border-[#00cccc] ${isMobile ? 'pb-3 mb-4' : 'pb-6 mb-8'}`}
          >
            <Heading as="h1" size={isMobile ? 'lg' : '2xl'} className="text-[#3F6B85] mt-3">
              My Dashboard
            </Heading>
            <Flex align="center" gap={3}>
              {/* {!isMobile && (
                <button
                  onClick={handleSendAlertEmails}
                  disabled={sendingEmails}
                  className="px-4 py-2 bg-[#32617d] text-white rounded-lg text-sm hover:bg-[#274f65] transition-colors disabled:opacity-50"
                >
                  {sendingEmails ? 'Sending...' : 'Send Alert Emails'}
                </button>
              )} */}
              {/* Mobile stat pills */}
              {isMobile && (
                <Flex gap={2} align="center">
                  <Box
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ background: 'var(--color-primary-light, #dbeafe)' }}
                  >
                    <Text size="xs" weight="bold" className="text-primary">{stats.totalUsers}</Text>
                    <Text size="xs" className="text-primary">Total</Text>
                  </Box>
                  <Box
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ background: 'var(--color-success-light, #d1fae5)' }}
                  >
                    <Text size="xs" weight="bold" className="text-success">{stats.newUsers}</Text>
                    <Text size="xs" className="text-success">New</Text>
                  </Box>
                </Flex>
              )}
            </Flex>
          </Flex>

          {/* Desktop stats summary */}
          {!isMobile && (
            <Flex gap={4} className="mb-6">
              <Box className="flex-1 p-4 rounded-xl  ">
                <Text size="sm" className="text-muted">Total Patients</Text>
                <Text size="2xl" weight="bold" className="text-accent">{stats.totalUsers}</Text>
              </Box>
              <Box className="flex-1 p-4 rounded-xl ">
                <Text size="sm" className="text-muted">New This Week</Text>
                <Text size="2xl" weight="bold" className="text-success">{stats.newUsers}</Text>
              </Box>
            </Flex>
          )}

          {/* Alerts Section */}
          <Box className={isMobile ? 'pb-20' : 'pb-8'}>
            <Flex justify="between" align="center" className={isMobile ? 'mb-3' : 'mb-6'}>
              <Heading as="h2" size={isMobile ? 'md' : 'xl'} className="text-black font-bold">
                Important Alerts
              </Heading>
              <Flex gap={2} align="center">
                {/* <select
                  value={alertTypeFilter}
                  onChange={(e) => handleAlertTypeFilter(e.target.value)}
                  className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}  rounded-lg bg-white text-gray-700`}
                >
                  <option value="">All Types</option>
                  <option value="prescription">Prescription</option>
                  <option value="daily">Daily Readings</option>
                  <option value="dialysis">Dialysis</option>
                  <option value="lab">Lab Reports</option>
                  <option value="enrollment">Enrollment</option>
                  <option value="contact">Contact</option>
                </select> */}
              <SortDropdown
                  value={alertTypeFilter}
                  onChange={(e) => handleAlertTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'prescription', label: 'Prescription' },
                  { value: 'daily', label: 'Daily Readings' },
                  { value: 'dialysis', label: 'Dialysis' },
                  { value: 'lab', label: 'Lab Reports' },
                  { value: 'enrollment', label: 'Enrollment' },
                  { value: 'contact', label: 'Contact' },
                ]}
                className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}  rounded-lg bg-white text-gray-700`}
              />
                {alertTypeFilter && (
                  <button
                    onClick={() => handleAlertTypeFilter('')}
                    className="text-lg text-[#5886a5] underline hover:text-[#4164df]"
                  >
                    Clear
                  </button>
                )}
              </Flex>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md">Loading alerts...</Text>
              </Flex>
            ) : (patients.length === 0) ? (
              <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md">No alerts at this time</Text>
              </Flex>
            ) : (
              // Split into two columns: Admin (general alerts) and Doctor (prescription/comment alerts)
              <Flex direction={isMobile ? 'column' : 'row'} gap={6}>
                {/* Admin Column */}
                <Box className="flex-1">
                  <Heading as="h3" size={isMobile ? 'sm' : 'lg'} className="mb-3">Admin Alerts</Heading>
                  <Flex direction="column" gap={0}>
                    {patients
                      .filter(p => (p.prescriptionCount === 0 && p.commentCount === 0))
                      .map((patient) => (
                        <React.Fragment key={`admin-${patient.id}`}>
                          <PatientAlertCard patient={patient} onAction={handleAction} />
                          <Box className={`h-[2px] bg-gray-200 ${isMobile ? 'my-3' : 'my-6'}`} />
                        </React.Fragment>
                      ))}
                  </Flex>
                </Box>

                {/* Doctor Column */}
                <Box className="flex-1">
                  <Heading as="h3" size={isMobile ? 'sm' : 'lg'} className="mb-3">Doctor Alerts</Heading>
                  <Flex direction="column" gap={0}>
                    {patients
                      .filter(p => (p.prescriptionCount > 0 || p.commentCount > 0))
                      .map((patient) => (
                        <React.Fragment key={`doctor-${patient.id}`}>
                          <PatientAlertCard patient={patient} onAction={handleAction} />
                          <Box className={`h-[2px] bg-gray-200 ${isMobile ? 'my-3' : 'my-6'}`} />
                        </React.Fragment>
                      ))}
                  </Flex>
                </Box>
              </Flex>
            )}
          </Box>
         
      </Box>

      {/* Modals */}
      {modals.prescription && (
        <PrescriptionModal closeModal={() => closeModal('prescription')} />
      )}
      {modals.comment && (
        <CommentContainer
          comments={selectedPatient?.commentAlerts || []}
          closeModal={() => closeModal('comment')}
        />
      )}
      {modals.alert && (
        <AlertModal closeModal={() => closeModal('alert')} />
      )}
      {modals.dialysis && (
        <DiaAlertModal closeModal={() => closeModal('dialysis')} />
      )}
    </Box>
  );
};

export default AdminDashboard;

