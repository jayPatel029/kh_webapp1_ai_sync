/**
 * Admin Dashboard - Redesigned
 * Renders as content within DashboardLayout (no internal Sidebar/Navbar)
 * Uses component-library for layout and styling
 * 
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Container
} from "../../component-library";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getUsersThisWeekSub,
} from "../../ApiCalls/adminDashApis";
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
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);

  // Data State
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
  });

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
      setUserName(localStorage.getItem("name") || "User");

      // Get Admin ID
      try {
        const idRes = await axiosInstance.post(`${server_url}/users/byEmail/id`, { email });
        localStorage.setItem("id", idRes.data.id);
      } catch (err) {
        console.error("Error getting admin id:", err);
      }

      // Check if Doctor
      try {
        const docRes = await axiosInstance.get(`${server_url}/roles/isDoctor`);
        setIsDoctor(docRes.data.data);
        localStorage.setItem("isDoctor", docRes.data.data);
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
        const doctorIdRes = await axiosInstance.post(`${server_url}/doctor/byEmail/id`, { email });
        const doctorId = doctorIdRes.data.data;
        const alertsRes = await axiosInstance.get(`${server_url}/sortAlerts/doctor/${doctorId}`);
        alerts = alertsRes.data || [];
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

          {/* Desktop stats summary */}
          {!isMobile && (
            <Flex gap={4} className="mb-6">
              <Box className="flex-1 p-4 rounded-xl border border-gray-200">
                <Text size="sm" className="text-muted">Total Patients</Text>
                <Text size="2xl" weight="bold" className="text-accent">{stats.totalUsers}</Text>
              </Box>
              <Box className="flex-1 p-4 rounded-xl border border-gray-200">
                <Text size="sm" className="text-muted">New This Week</Text>
                <Text size="2xl" weight="bold" className="text-success">{stats.newUsers}</Text>
              </Box>
            </Flex>
          )}

          {/* Alerts Section */}
          <Box className={isMobile ? 'pb-20' : 'pb-8'}>
            <Heading as="h2" size={isMobile ? 'md' : 'xl'} className={`${isMobile ? 'mb-3' : 'mb-6'} text-black font-bold`}>
              Important Alerts
            </Heading>

            {loading ? (
              <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md">Loading alerts...</Text>
              </Flex>
            ) : patients.length === 0 ? (
                <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md">No alerts at this time</Text>
                </Flex>
            ) : (
                  <Flex direction="column" gap={0}>
                    {patients.map((patient) => (
                      <React.Fragment key={patient.id}>
                        <PatientAlertCard
                          patient={patient}
                          onAction={handleAction}
                        />
                    {/* Divider */}
                    <Box className={`h-[2px] bg-gray-200 ${isMobile ? 'my-3' : 'my-6'}`} />
                  </React.Fragment>
                ))}
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
          comments={selectedPatient.commentAlerts}
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

