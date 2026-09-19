/**
 * Admin Dashboard
 * Flat two-column alerts inbox (Doctor | Patient) — main presentation,
 * current new-layout theme.
 *
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

// cspell:disable

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { getPatients } from "../../ApiCalls/patientAPis";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import {
  isChatAlert,
  partitionDashboardAlerts,
} from "../../helpers/alertGrouping";
import { openAlertDestination } from "../../helpers/alertNavigation";
import FlatAlertsInbox from "../../components/dashboard/FlatAlertsInbox";

import "./adminDashboard.css";

const shouldExcludeFromPatientColumn = (alert) => {
  const category = String(alert?.category || "").trim();
  return (
    category === "Prescription Approved" ||
    category === "New Prescription Alarm"
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, newUsers: 0 });
  const [doctorAlerts, setDoctorAlerts] = useState([]);
  const [patientAlerts, setPatientAlerts] = useState([]);
  const [nameLookup, setNameLookup] = useState({});

  const extractAlerts = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.alerts)) return response.data.alerts;
    if (Array.isArray(response?.alerts)) return response.alerts;
    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const email = localStorage.getItem("email");
      const adminId = localStorage.getItem("id");
      const isDoc = localStorage.getItem("isDoctor") === "true";

      const [total, newU, newUSub] = await Promise.all([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub(),
      ]);

      setStats({
        totalUsers: total || 0,
        newUsers: adminId === "1" ? newU || 0 : newUSub || 0,
      });

      const lookup = {};
      try {
        const pRes = await getPatients();
        const pList = pRes?.data?.data || pRes?.data || [];
        pList.forEach((p) => {
          const id = String(p.id || p.patient_id || p.patientid || "");
          const name = `${p.firstname || ""} ${p.lastname || ""}`.trim() || null;
          if (id && name) lookup[id] = name;
        });
      } catch (err) {
        console.warn("Could not load patient names:", err);
      }
      setNameLookup(lookup);

      let rawAlerts = [];
      if (isDoc) {
        const doctorIdRes = await getDoctorIdByEmail({ email });
        const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;
        if (doctorId) {
          const alertsRes = await getDoctorSortAlerts(doctorId);
          rawAlerts = alertsRes.success ? extractAlerts(alertsRes.data) : [];
        }
      } else {
        const alertsRes = await getAlerts();
        rawAlerts = extractAlerts(alertsRes);
      }

      const nonChatAlerts = rawAlerts.filter((alert) => !isChatAlert(alert));
      const partitions = partitionDashboardAlerts(nonChatAlerts);

      const doctorList = [...(partitions.doctor || [])];
      const patientList = [...(partitions.patient || []), ...(partitions.other || [])].filter(
        (alert) => !shouldExcludeFromPatientColumn(alert)
      );

      setDoctorAlerts(doctorList);
      setPatientAlerts(patientList);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setDoctorAlerts([]);
      setPatientAlerts([]);
    } finally {
      setLoading(false);
    }
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
  }, [navigate, fetchDashboardData]);

  const handleAlertClick = useCallback(
    async (alert) => {
      await openAlertDestination(alert, navigate);
      fetchDashboardData();
    },
    [navigate, fetchDashboardData]
  );

  const alertCount = useMemo(
    () => doctorAlerts.length + patientAlerts.length,
    [doctorAlerts.length, patientAlerts.length]
  );

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
              <Box
                className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: "var(--color-primary-light, #dbeafe)" }}
              >
                <Text size="xs" weight="bold" className="text-primary">
                  {stats.totalUsers}
                </Text>
                <Text size="xs" className="text-primary">
                  Total
                </Text>
              </Box>
              <Box
                className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: "var(--color-success-light, #d1fae5)" }}
              >
                <Text size="xs" weight="bold" className="text-success">
                  {stats.newUsers}
                </Text>
                <Text size="xs" className="text-success">
                  New
                </Text>
              </Box>
            </Flex>
          )}
        </Flex>

        {!isMobile && (
          <Flex gap={4} className="mb-6">
            <Box className="flex-1 p-4 rounded-xl">
              <Text size="sm" className="text-muted">
                Total Patients
              </Text>
              <Text size="2xl" weight="bold" className="text-accent">
                {stats.totalUsers}
              </Text>
            </Box>
            <Box className="flex-1 p-4 rounded-xl">
              <Text size="sm" className="text-muted">
                New This Week
              </Text>
              <Text size="2xl" weight="bold" className="text-success">
                {stats.newUsers}
              </Text>
            </Box>
            <Box className="flex-1 p-4 rounded-xl">
              <Text size="sm" className="text-muted">
                Open Alerts
              </Text>
              <Text size="2xl" weight="bold" className="text-[#3F6B85]">
                {alertCount}
              </Text>
            </Box>
          </Flex>
        )}

        <Box className={isMobile ? "pb-20" : "pb-8"}>
          <FlatAlertsInbox
            doctorAlerts={doctorAlerts}
            patientAlerts={patientAlerts}
            loading={loading}
            onAlertClick={handleAlertClick}
            nameLookup={nameLookup}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
