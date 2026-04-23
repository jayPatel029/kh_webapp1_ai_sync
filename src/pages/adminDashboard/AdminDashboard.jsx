
/**
 * Admin Dashboard - Two-Column Alert View
 * Left  column: Doctor alerts  (/alerts/byType/doctor)  grouped by patientId
 * Right column: Patient alerts (/alerts/byType/patient) grouped by patientId
 * Both columns use the same compact row style.
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
  Text,
} from "../../component-library";
import { getIdByEmail, isDoctorRole } from "../../ApiCalls/authapis";
import { getDoctorIdByEmail } from "../../ApiCalls/doctorApis";
import { getDoctorSortAlerts } from "../../ApiCalls/doctorAlert";
import {
  getTotalUsers,
  getUsersThisWeek,
  getUsersThisWeekSub,
} from "../../ApiCalls/adminDashApis";
import { getDoctorComments } from "../../ApiCalls/GetComments";
import { getPatients } from "../../ApiCalls/patientAPis";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import axiosInstance from "../../helpers/axios/axiosInstance";
import {
  groupAlertsByPatient,
  groupDoctorAlertsByPatient,
} from "../../helpers/alertGrouping";
import { server_url } from "../../constants/constants";
import { ROUTES } from "../../routes/routeConstants";

// Import CSS for modals (legacy styles)
import "./adminDashboard.css";

// Components
import PrescriptionModal from "./components/ApprovePrescriptionModal";
import CommentContainer from "./components/CommentContainer";
import AlertModal from "./components/AlertModal";
import PatientDialysisAlertModal from "./components/PatientDialysisAlertModal";

// ── Tiny helpers ─────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
};

const PALETTE = ["#1a73e8", "#0f9d58", "#f4511e", "#7b1fa2", "#e65100", "#00838f", "#37474f", "#558b2f"];
const pickColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const Avatar = ({ name = "" }) => (
  <div
    className="h-8 w-8 text-xs rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
    style={{ background: pickColor(String(name)) }}
  >
    {getInitials(name)}
  </div>
);

// ── Shared compact row (used in BOTH columns) ─────────────────────────────────

const AlertPatientRow = ({ patient, subtitle, unreadCount, date, badgeColor = "#ef4444", onClick }) => (
  <button
    onClick={() => onClick(patient)}
    className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors group"
  >
    <Avatar name={patient.name} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#4164df]">
        {patient.name}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5 italic">
          {subtitle}
        </p>
      )}
    </div>
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      {unreadCount > 0 && (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: badgeColor }}
        >
          {unreadCount}
        </span>
      )}
      <span className="text-[10px] text-gray-400">{formatDate(date)}</span>
    </div>
  </button>
);

// ── Column wrapper ────────────────────────────────────────────────────────────

const AlertColumn = ({ title, badge, badgeColor = "#ef4444", children, loading, empty }) => (
  <div
    className="flex flex-col flex-1 min-w-0 rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden"
    style={{ minHeight: 0 }}
  >
    <div
      className="px-5 py-3 flex items-center gap-3 border-b border-gray-100 flex-shrink-0"
      style={{ background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)" }}
    >
      <Heading as="h2" size="md" className="text-[#3F6B85] font-bold flex-1">
        {title}
      </Heading>
      {badge != null && (
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      )}
    </div>

    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <Flex justify="center" align="center" className="py-12 text-gray-400">
          <Text size="sm">Loading…</Text>
        </Flex>
      ) : empty ? (
        <Flex justify="center" align="center" className="py-12 text-gray-400 flex-col gap-2">
          <span className="text-3xl opacity-30">🔔</span>
          <Text size="sm">No alerts</Text>
        </Flex>
      ) : (
        children
      )}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, newUsers: 0 });

  // Doctor alerts column — grouped by patientId (groupDoctorAlertsByPatient shape)
  const [doctorPatients, setDoctorPatients] = useState([]);

  // Patient alerts column — grouped by patientId (groupAlertsByPatient shape)
  const [patientGroups, setPatientGroups] = useState([]);

  // Modal state
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Auth / Role init ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const role = localStorage.getItem("role");
      if (role === "Dialysis Technician") { navigate("/patients"); return; }

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

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const adminId = localStorage.getItem("id");
      const isDoc = localStorage.getItem("isDoctor") === "true";

      // Stats
      const [total, newU, newUSub] = await Promise.all([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub(),
      ]);
      setStats({
        totalUsers: total || 0,
        newUsers: adminId === "1" ? (newU || 0) : (newUSub || 0),
      });

      // Build patient name lookup from /patient/getPatients
      let patientLookup = new Map();
      try {
        const pRes = await getPatients();
        const pList = pRes?.data?.data || pRes?.data || [];
        pList.forEach((p) => {
          const id = String(p.id || p.patient_id || p.patientid || "");
          const name = `${p.firstname || ""} ${p.lastname || ""}`.trim() || null;
          if (id && name) patientLookup.set(id, name);
        });
      } catch (e) {
        console.warn("Could not load patient names:", e);
      }

      const enrichName = (group) => {
        const looked = patientLookup.get(String(group.id));
        return looked ? { ...group, name: looked } : group;
      };

      if (isDoc) {
        const doctorIdRes = await getDoctorIdByEmail({ email });
        const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;
        let alerts = [];
        if (doctorId) {
          const alertsRes = await getDoctorSortAlerts(doctorId);
          alerts = alertsRes.success ? (alertsRes.data || []) : [];
        }
        const grouped = groupAlertsByPatient(alerts, { includeChats: false });
        const list = grouped.patients.map(enrichName);

        const commentPromises = list.map(async (p) => {
          try {
            const commentRes = await getDoctorComments(email, p.name);
            const comments = commentRes.comments || [];
            p.commentAlerts = comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            p.commentCount = comments.filter((c) => !c.isRead).length;
          } catch (e) {
            console.error(`Error fetching comments for ${p.name}:`, e);
          }
        });
        await Promise.all(commentPromises);

        setPatientGroups(list);
        setDoctorPatients([]);
      } else {
        // Fetch both alert types in parallel
        const [docRes, patRes] = await Promise.allSettled([
          axiosInstance.get(`${server_url}/alerts/byType/doctor`),
          axiosInstance.get(`${server_url}/alerts/byType/patient`),
        ]);

        const rawDoctor = docRes.status === "fulfilled" ? (docRes.value.data || []) : [];
        const rawPatient = patRes.status === "fulfilled" ? (patRes.value.data || []) : [];

        // Doctor column — enrich names
        const docGrouped = groupDoctorAlertsByPatient(rawDoctor).map(enrichName);
        setDoctorPatients(docGrouped);

        // Patient column — enrich names
        const patGrouped = groupAlertsByPatient(rawPatient, { includeChats: false });
        setPatientGroups(patGrouped.patients.map(enrichName));
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Doctor column: navigate to doctor chat
  const handleDoctorPatientClick = (patient) => {
    navigate(ROUTES.patientDoctorChat(patient.id));
  };

  // Patient column: open dialysis modal with all alerts for this patient
  const handlePatientAlertClick = (patient) => {
    setSelectedPatient(patient);
    setModals((prev) => ({ ...prev, dialysis: true }));
  };

  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    if (type === "alert" || type === "comment" || type === "dialysis") fetchDashboardData();
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  // For patient column subtitle: first alert category, total unread count
  const getPatientSubtitle = (patient) => {
    const allAlerts = [
      ...(patient.dialysisAlerts || []),
      ...(patient.alertAlerts || []),
      ...(patient.prescriptionAlerts || []),
    ];
    const first = allAlerts[0];
    return first?.category || "Patient alert";
  };

  const getPatientUnread = (patient) =>
    (patient.dialysisCount || 0) +
    (patient.alertCount || 0) +
    (patient.prescriptionCount || 0);

  const getPatientLatest = (patient) =>
    patient.latestAlertAt ||
    (patient.dialysisAlerts?.[0] || patient.alertAlerts?.[0] || {})?.date ||
    "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box className={`flex-1 flex flex-col min-h-0 bg-white ${isMobile ? "px-3 pt-2" : ""}`}>
      <Box className="flex-1 overflow-y-auto">

        {/* Header */}
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
              <Box
                className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: "var(--color-primary-light, #dbeafe)" }}
              >
                <Text size="xs" weight="bold" className="text-primary">{stats.totalUsers}</Text>
                <Text size="xs" className="text-primary">Total</Text>
              </Box>
              <Box
                className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: "var(--color-success-light, #d1fae5)" }}
              >
                <Text size="xs" weight="bold" className="text-success">{stats.newUsers}</Text>
                <Text size="xs" className="text-success">New</Text>
              </Box>
            </Flex>
          )}
        </Flex>

        {/* Desktop stats */}
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

        {/* Two-column alert section */}
        <Box className={isMobile ? "pb-20" : "pb-8"}>
          <Heading as="h2" size={isMobile ? "md" : "xl"} className="text-black font-bold mb-4">
            Important Alerts
          </Heading>

          {isMobile ? (
            /* ── Mobile: stacked ─────────────────────────────────────────── */
            <Flex direction="column" gap={6}>
              {/* Doctor alerts */}
              <AlertColumn
                title="Doctor Alerts"
                badge={doctorPatients.reduce((s, p) => s + (p.unreadCount || 0), 0) || doctorPatients.length || null}
                badgeColor="#4164df"
                loading={loading}
                empty={!loading && doctorPatients.length === 0}
              >
                {doctorPatients.map((p) => (
                  <AlertPatientRow
                    key={p.id}
                    patient={p}
                    subtitle={p.lastMessage ? `"${p.lastMessage}"` : "Doctor alert"}
                    unreadCount={p.unreadCount}
                    date={p.lastAt}
                    badgeColor="#4164df"
                    onClick={handleDoctorPatientClick}
                  />
                ))}
              </AlertColumn>

              {/* Patient alerts */}
              <AlertColumn
                title="Patient Alerts"
                badge={patientGroups.reduce((s, p) => s + getPatientUnread(p), 0) || patientGroups.length || null}
                badgeColor="#00cccc"
                loading={loading}
                empty={!loading && patientGroups.length === 0}
              >
                {patientGroups.map((patient) => (
                  <AlertPatientRow
                    key={patient.id}
                    patient={patient}
                    subtitle={getPatientSubtitle(patient)}
                    unreadCount={getPatientUnread(patient)}
                    date={getPatientLatest(patient)}
                    badgeColor="#ef4444"
                    onClick={handlePatientAlertClick}
                  />
                ))}
              </AlertColumn>
            </Flex>
          ) : (
            /* ── Desktop: side-by-side ───────────────────────────────────── */
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "1fr 1fr", minHeight: "420px", maxHeight: "calc(100vh - 320px)" }}
            >
              {/* Left: Doctor Alerts */}
              <AlertColumn
                title="Doctor Alerts"
                badge={doctorPatients.reduce((s, p) => s + (p.unreadCount || 0), 0) || doctorPatients.length || null}
                badgeColor="#4164df"
                loading={loading}
                empty={!loading && doctorPatients.length === 0}
              >
                {doctorPatients.map((p) => (
                  <AlertPatientRow
                    key={p.id}
                    patient={p}
                    subtitle={p.lastMessage ? `"${p.lastMessage}"` : "Doctor alert"}
                    unreadCount={p.unreadCount}
                    date={p.lastAt}
                    badgeColor="#4164df"
                    onClick={handleDoctorPatientClick}
                  />
                ))}
              </AlertColumn>

              {/* Right: Patient Alerts */}
              <AlertColumn
                title="Patient Alerts"
                badge={patientGroups.reduce((s, p) => s + getPatientUnread(p), 0) || patientGroups.length || null}
                badgeColor="#00cccc"
                loading={loading}
                empty={!loading && patientGroups.length === 0}
              >
                {patientGroups.map((patient) => (
                  <AlertPatientRow
                    key={patient.id}
                    patient={patient}
                    subtitle={getPatientSubtitle(patient)}
                    unreadCount={getPatientUnread(patient)}
                    date={getPatientLatest(patient)}
                    badgeColor="#ef4444"
                    onClick={handlePatientAlertClick}
                  />
                ))}
              </AlertColumn>
            </div>
          )}
        </Box>

      </Box>

      {/* Modals */}
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
          alerts={[
            ...(selectedPatient?.dialysisAlerts || []),
            ...(selectedPatient?.alertAlerts || []),
            ...(selectedPatient?.prescriptionAlerts || []),
          ]}
          patientName={selectedPatient?.name}
          patientId={selectedPatient?.id}
          onClose={() => closeModal("dialysis")}
        />
      )}
    </Box>
  );
};

export default AdminDashboard;
