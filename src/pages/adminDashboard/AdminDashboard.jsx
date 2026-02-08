/**
 * Admin Dashboard - Redesigned
 * Following Figma design with integrated legacy logic
 * 
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heading, Text } from "../../component-library/primitives/Typography";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getUsersThisWeekSub,
} from "../../ApiCalls/adminDashApis";
import { getDoctorComments } from "../../ApiCalls/GetComments";

// Components
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import PatientAlertCard from "./components/PatientAlertCard";
import PrescriptionModal from "./components/ApprovePrescriptionModal";
import CommentContainer from "./components/CommentContainer";
import AlertModal from "./components/AlertModal";
import DiaAlertModal from "./components/DialysisTechModal";

// Styles
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
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
        navigate("/patient");
        return;
      }

      const email = localStorage.getItem("email");
      setUserName(localStorage.getItem("name") || "User");

      // Get Admin ID and set to localStorage
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
        // Doctor specific alerts
        const doctorIdRes = await axiosInstance.post(`${server_url}/doctor/byEmail/id`, { email });
        const doctorId = doctorIdRes.data.data;
        const alertsRes = await axiosInstance.get(`${server_url}/sortAlerts/doctor/${doctorId}`);
        alerts = alertsRes.data || [];
      } else {
        // Admin alerts
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

        // Categorize based on type or category
        const type = (alert.type || "").toLowerCase();
        const category = (alert.category || "").toLowerCase();

        if (type.includes("prescription") || category.includes("prescription")) {
          pData.prescriptionAlerts.push(alert);
          pData.prescriptionCount++;
        } else if (type.includes("dialysis tech") || category.includes("dialysis tech")) {
          pData.dialysisAlerts.push(alert);
          pData.dialysisCount++;
        } else {
          // General alerts (might be read or unread)
          pData.alertAlerts.push(alert);
          if (alert.isRead === 0 || alert.isRead === false) {
            pData.alertCount++;
          }
        }
      }

      // Fetch Comments separately (as per legacy logic in DoctorContainer)
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

    // Store data in localStorage as required by legacy modals
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
    // Refresh data if something was read/updated
    if (type === 'alert' || type === 'comment') {
      fetchDashboardData();
    }
  };

  return (
    <div className="dashboard-page overflow-hidden h-screen w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar />

        <div className="dashboard-content">
          <div className="dashboard-header">
            <Heading as="h1" size="2xl" className="dashboard-title">
              My Dashboard
            </Heading>
          </div>

          <div className="alerts-section">
            <Heading as="h2" size="xl" className="section-title">
              Important Alerts
            </Heading>

            {loading ? (
              <div className="loading-state">
                <Text size="md">Loading alerts...</Text>
              </div>
            ) : patients.length === 0 ? (
              <div className="empty-state">
                <Text size="md">No alerts at this time</Text>
              </div>
            ) : (
                  <div className="patient-alerts-list">
                    {patients.map((patient) => (
                      <React.Fragment key={patient.id}>
                        <PatientAlertCard
                          patient={patient}
                          onAction={handleAction}
                        />
                      <div className="alert-divider" />
                    </React.Fragment>
                  ))}
                  </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default AdminDashboard;
