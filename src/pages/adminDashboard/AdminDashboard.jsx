/**
 * Admin Dashboard
 * Patient-first alert dashboard with category tabs and per-category modal actions.
 * - Uses sorted alert feeds
 * - Excludes chat alerts from dashboard
 * - Doctor mode shows patient alerts as a single "Alerts" bucket
 *
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

// cspell:disable

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text } from "../../component-library";
import { getIdByEmail, isDoctorRole } from "../../ApiCalls/authapis";
import { getDoctorIdByEmail } from "../../ApiCalls/doctorApis";
import { getDoctorSortAlerts } from "../../ApiCalls/doctorAlert";
import {
  getAlerts,
  getTotalUsers,
  getUsersThisWeek,
  getUsersThisWeekSub,
} from "../../ApiCalls/adminDashApis";
import { getDoctorComments } from "../../ApiCalls/GetComments";
import { getPatients } from "../../ApiCalls/patientAPis";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import {
  getDashboardAlertSide,
  groupAlertsByPatient,
  isChatAlert,
  partitionDashboardAlerts,
} from "../../helpers/alertGrouping";

import "./adminDashboard.css";

import PatientAlertCard from "./components/PatientAlertCard";
import PrescriptionModal from "./components/ApprovePrescriptionModal";
import CommentContainer from "./components/CommentContainer";
import AlertModal from "./components/AlertModal";
import PatientDialysisAlertModal from "./components/PatientDialysisAlertModal";

const CATEGORY_TABS_ADMIN = [
  { key: "all", label: "All" },
  { key: "prescription", label: "Approve Prescription" },
  { key: "comment", label: "Comments" },
  { key: "alert", label: "Alerts" },
  { key: "dialysis", label: "Dialysis" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [isDoctorView, setIsDoctorView] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const [stats, setStats] = useState({ totalUsers: 0, newUsers: 0 });
  const [patients, setPatients] = useState([]);

  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  const extractAlerts = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.alerts)) return response.data.alerts;
    if (Array.isArray(response?.alerts)) return response.alerts;
    return [];
  };

  const getPatientTotalAlerts = (patient) => (
    (patient.prescriptionCount || 0) +
    (patient.commentCount || 0) +
    (patient.alertCount || 0) +
    (patient.dialysisCount || 0)
  );

  const asDoctorAlertOnlyPatient = (patient) => {
    const allAlerts = [
      ...(patient.prescriptionAlerts || []),
      ...(patient.commentAlerts || []),
      ...(patient.alertAlerts || []),
      ...(patient.dialysisAlerts || []),
    ];

    const unreadTotal = getPatientTotalAlerts(patient);

    return {
      ...patient,
      alertAlerts: allAlerts,
      prescriptionAlerts: [],
      commentAlerts: [],
      dialysisAlerts: [],
      alertCount: unreadTotal || allAlerts.length,
      prescriptionCount: 0,
      commentCount: 0,
      dialysisCount: 0,
      categoryCounts: [{ key: "alert", label: "Alerts", count: unreadTotal || allAlerts.length }],
    };
  };

  const enrichPatientComments = useCallback(async (list, email) => {
    const tasks = list.map(async (patient) => {
      try {
        const commentRes = await getDoctorComments(email, patient.name);
        const comments = Array.isArray(commentRes?.comments) ? commentRes.comments : [];
        if (!comments.length) return patient;

        const ordered = [...comments].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const unreadCount = ordered.filter((c) => !c.isRead).length;

        return {
          ...patient,
          commentAlerts: ordered,
          commentCount: unreadCount || ordered.length,
        };
      } catch (err) {
        return patient;
      }
    });

    return Promise.all(tasks);
  }, []);

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

      try {
        const idRes = await getIdByEmail({ email });
        if (idRes.success) localStorage.setItem("id", idRes.data?.id);
      } catch (err) {
        console.error("Error getting admin id:", err);
      }

      try {
        const docRes = await isDoctorRole();
        if (docRes.success) localStorage.setItem("isDoctor", docRes.data?.data);
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

      setIsDoctorView(isDoc);
      setActiveCategory(isDoc ? "alert" : "all");

      const [total, newU, newUSub] = await Promise.all([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub(),
      ]);

      setStats({
        totalUsers: total || 0,
        newUsers: adminId === "1" ? (newU || 0) : (newUSub || 0),
      });

      let patientLookup = new Map();
      try {
        const pRes = await getPatients();
        const pList = pRes?.data?.data || pRes?.data || [];
        pList.forEach((p) => {
          const id = String(p.id || p.patient_id || p.patientid || "");
          const name = `${p.firstname || ""} ${p.lastname || ""}`.trim() || null;
          if (id && name) patientLookup.set(id, name);
        });
      } catch (err) {
        console.warn("Could not load patient names:", err);
      }

      const enrichName = (group) => {
        const looked = patientLookup.get(String(group.id));
        return looked ? { ...group, name: looked } : group;
      };

      if (isDoc) {
        const doctorIdRes = await getDoctorIdByEmail({ email });
        const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;

        let rawAlerts = [];
        if (doctorId) {
          const alertsRes = await getDoctorSortAlerts(doctorId);
          rawAlerts = alertsRes.success ? extractAlerts(alertsRes.data) : [];
        }

        const patientOnlyAlerts = rawAlerts.filter((alert) => {
          if (isChatAlert(alert)) return false;
          return getDashboardAlertSide(alert) !== "doctor";
        });

        const grouped = groupAlertsByPatient(patientOnlyAlerts, { includeChats: false });
        const doctorPatients = grouped.patients.map(enrichName).map(asDoctorAlertOnlyPatient);

        setPatients(doctorPatients);
        return;
      }

      const alertsRes = await getAlerts();

      const rawAlerts = extractAlerts(alertsRes);
      const nonChatAlerts = rawAlerts.filter((alert) => !isChatAlert(alert));

      const grouped = groupAlertsByPatient(nonChatAlerts, { includeChats: false });
      const namedPatients = grouped.patients.map(enrichName);
      const withComments = await enrichPatientComments(namedPatients, email);

      setPatients(withComments);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [enrichPatientComments]);

  const handleAction = (patient, type) => {
    if (type === "view") return;

    setSelectedPatient(patient);

    if (type === "prescription") {
      localStorage.setItem("prescriptionAlerts", JSON.stringify(patient.prescriptionAlerts || []));
    }

    if (type === "alert") {
      localStorage.setItem("alertAlerts", JSON.stringify(patient.alertAlerts || []));
    }

    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    fetchDashboardData();
  };

  const categoryTabs = isDoctorView
    ? [{ key: "alert", label: "Alerts" }]
    : CATEGORY_TABS_ADMIN;

  const visiblePatients = patients.filter((patient) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "prescription") return (patient.prescriptionCount || 0) > 0;
    if (activeCategory === "comment") return (patient.commentCount || 0) > 0;
    if (activeCategory === "alert") return (patient.alertCount || 0) > 0;
    if (activeCategory === "dialysis") return (patient.dialysisCount || 0) > 0;
    return true;
  });

  const activeTabCount = visiblePatients.length;

  return (
    <Box className={`flex-1 flex flex-col min-h-0 bg-white ${isMobile ? "px-3 pt-2" : ""}`}>
      <Box className="flex-1 overflow-y-auto">
        <Flex
          align="center"
          justify="between"
          className={`border-b-2 border-[#00cccc] ${isMobile ? "pb-3 mb-4" : "pb-6 mb-6"}`}
        >
          <Heading as="h1" size={isMobile ? "lg" : "2xl"} className="text-[#3F6B85] mt-3">
            My Dashboard
          </Heading>

          {isMobile && (
            <Flex gap={2} align="center">
              <Box className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: "var(--color-primary-light, #dbeafe)" }}>
                <Text size="xs" weight="bold" className="text-primary">{stats.totalUsers}</Text>
                <Text size="xs" className="text-primary">Total</Text>
              </Box>
              <Box className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: "var(--color-success-light, #d1fae5)" }}>
                <Text size="xs" weight="bold" className="text-success">{stats.newUsers}</Text>
                <Text size="xs" className="text-success">New</Text>
              </Box>
            </Flex>
          )}
        </Flex>

        {!isMobile && (
          <Flex gap={4} className="mb-6">
            <Box className="flex-1 p-4 rounded-xl">
              <Text size="sm" className="text-muted">Total Patients</Text>
              <Text size="2xl" weight="bold" className="text-accent">{stats.totalUsers}</Text>
            </Box>
            <Box className="flex-1 p-4 rounded-xl">
              <Text size="sm" className="text-muted">New This Week</Text>
              <Text size="2xl" weight="bold" className="text-success">{stats.newUsers}</Text>
            </Box>
          </Flex>
        )}

        <Box className={isMobile ? "pb-20" : "pb-8"}>
          <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
            <Heading as="h2" size={isMobile ? "md" : "xl"} className="text-black font-bold">
              Important Alerts
            </Heading>
            <Text size="sm" className="text-gray-500">
              {activeTabCount} patient{activeTabCount === 1 ? "" : "s"}
            </Text>
          </Flex>

          <Flex gap={2} wrap="wrap" className="mb-5">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    isActive
                      ? "bg-[#3F6B85] text-white border-[#3F6B85]"
                      : "bg-white text-[#3F6B85] border-[#cfe4ee] hover:border-[#3F6B85]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </Flex>

          {loading ? (
            <Flex justify="center" align="center" className="py-12 text-gray-500">
              <Text size="md">Loading alerts...</Text>
            </Flex>
          ) : visiblePatients.length === 0 ? (
            <Flex justify="center" align="center" className="py-12 text-gray-500">
              <Text size="md">No alerts in this category</Text>
            </Flex>
          ) : (
            <Flex direction={isMobile ? "column" : "row"} gap={isMobile ? 0 : 8}>
              {/* Left Column: Admin Alerts (Regular Alerts, Dialysis) */}
              <Box className="flex-1">
                {!isMobile && (activeCategory === "all" || activeCategory === "alert" || activeCategory === "dialysis") && (
                  <Heading as="h3" size="lg" className="mb-4 text-[#3F6B85] font-bold border-b pb-2">
                    Patient Alerts
                  </Heading>
                )}
                <Flex direction="column" gap={0}>
                  {visiblePatients
                    .filter((p) => {
                      if (activeCategory !== "all") return true; // Tab filtering already handled
                      // In "All" view, split by type
                      return (p.prescriptionCount === 0 && p.commentCount === 0);
                    })
                    .map((patient) => (
                      <React.Fragment key={`admin-${patient.id}`}>
                        <PatientAlertCard patient={patient} onAction={handleAction} />
                        <Box className={`h-[2px] bg-gray-200 ${isMobile ? "my-3" : "my-6"}`} />
                      </React.Fragment>
                    ))}
                </Flex>
              </Box>

              {/* Right Column: Doctor Alerts (Prescriptions, Comments) */}
              {!isMobile && (activeCategory === "all" || activeCategory === "prescription" || activeCategory === "comment") && (
                <Box className="flex-1 border-l pl-8 border-gray-100">
                  <Heading as="h3" size="lg" className="mb-4 text-[#3F6B85] font-bold border-b pb-2">
                    Doctor Alerts
                  </Heading>
                  <Flex direction="column" gap={0}>
                    {visiblePatients
                      .filter((p) => {
                        if (activeCategory !== "all") return true;
                        return (p.prescriptionCount > 0 || p.commentCount > 0);
                      })
                      .map((patient) => (
                        <React.Fragment key={`doctor-${patient.id}`}>
                          <PatientAlertCard patient={patient} onAction={handleAction} />
                          <Box className={`h-[2px] bg-gray-200 ${isMobile ? "my-3" : "my-6"}`} />
                        </React.Fragment>
                      ))}
                  </Flex>
                </Box>
              )}
            </Flex>
          )}
        </Box>
      </Box>

      {modals.prescription && (
        <PrescriptionModal closeModal={() => closeModal("prescription")} />
      )}

      {modals.comment && (
        <CommentContainer
          comments={selectedPatient?.commentAlerts || []}
          closeModal={() => closeModal("comment")}
        />
      )}

      {modals.alert && (
        <AlertModal closeModal={() => closeModal("alert")} />
      )}

      {modals.dialysis && (
        <PatientDialysisAlertModal
          alerts={selectedPatient?.dialysisAlerts || []}
          patientName={selectedPatient?.name}
          patientId={selectedPatient?.id}
          onClose={() => closeModal("dialysis")}
        />
      )}
    </Box>
  );
};

export default AdminDashboard;
