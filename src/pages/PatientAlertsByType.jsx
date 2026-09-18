/**
 * Patient Alerts List
 * Patients with avatar, name, and category action buttons wired to
 * the same admin dashboard modals / navigation helper.
 *
 * @file src/pages/PatientAlertsByType.jsx
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAlertsSortedByType } from "../ApiCalls/adminDashApis";
import { Text } from "../component-library/primitives/Typography";
import { Box, Flex } from "../component-library";
import { groupAlertsByPatient } from "../helpers/alertGrouping";
import {
  isNavigableSystemAlert,
  openAlertDestination,
} from "../helpers/alertNavigation";
import PatientCommentsModal from "../components/dashboard/PatientCommentsModal";
import PrescriptionModal from "./adminDashboard/components/ApprovePrescriptionModal";
import AlertModal from "./adminDashboard/components/AlertModal";
import PatientDialysisAlertModal from "./adminDashboard/components/PatientDialysisAlertModal";

const PatientAlertsByType = () => {
  const navigate = useNavigate();
  const [rawAlerts, setRawAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
  });

  const fetchAlertsData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAlertsSortedByType();

      if (result.success) {
        const flattened = (result.summary || []).flatMap(
          ({ alerts }) => alerts || []
        );
        setRawAlerts(flattened);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch alerts");
        setRawAlerts([]);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError(err?.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertsData();
  }, [fetchAlertsData]);

  const patients = useMemo(() => {
    const grouped = groupAlertsByPatient(rawAlerts, { includeChats: false });
    return [...grouped.patients].sort((a, b) => {
      const totalA =
        (a.prescriptionCount || 0) +
        (a.commentCount || 0) +
        (a.alertCount || 0) +
        (a.dialysisCount || 0);
      const totalB =
        (b.prescriptionCount || 0) +
        (b.commentCount || 0) +
        (b.alertCount || 0) +
        (b.dialysisCount || 0);
      if (totalB !== totalA) return totalB - totalA;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [rawAlerts]);

  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setSelectedPatient(null);
    fetchAlertsData();
  };

  const openPrescription = (patient) => {
    setSelectedPatient(patient);
    localStorage.setItem(
      "prescriptionAlerts",
      JSON.stringify(patient.prescriptionAlerts || [])
    );
    setModals((prev) => ({ ...prev, prescription: true }));
  };

  const openComments = (patient) => {
    setSelectedPatient(patient);
    setModals((prev) => ({ ...prev, comment: true }));
  };

  const openAlerts = async (patient) => {
    setSelectedPatient(patient);
    const alerts = patient.alertAlerts || [];
    const navigable = alerts.filter(isNavigableSystemAlert);
    const modalOnly = alerts.filter((a) => !isNavigableSystemAlert(a));

    if (navigable.length === 1 && modalOnly.length === 0) {
      await openAlertDestination(navigable[0], navigate);
      return;
    }

    localStorage.setItem("alertAlerts", JSON.stringify(alerts));
    setModals((prev) => ({ ...prev, alert: true }));
  };

  const openDialysis = (patient) => {
    setSelectedPatient(patient);
    setModals((prev) => ({ ...prev, dialysis: true }));
  };

  if (loading) {
    return (
      <Box className="p-6">
        <Text>Loading alerts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Text color="error">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <>
      <Box className="bg-white min-h-screen py-6 px-8">
        {patients.length === 0 ? (
          <Text className="text-gray-600 text-center py-8">
            No alerts at this time.
          </Text>
        ) : (
          <div className="space-y-0">
            {patients.map((patient, index) => {
              const total =
                (patient.prescriptionCount || 0) +
                (patient.commentCount || 0) +
                (patient.alertCount || 0) +
                (patient.dialysisCount || 0);

              return (
                <Flex
                  key={patient.id}
                  align="center"
                  justify="between"
                  className={`py-4 px-4 ${
                    index < patients.length - 1 ? "border-b border-gray-300" : ""
                  }`}
                >
                  <Flex align="center" gap={4} className="flex-1">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-center">
                      {patient.avatar ? (
                        <img
                          src={patient.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-700">
                          {String(patient.name || "P")
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Text className="text-lg font-semibold text-gray-900">
                      {patient.name}
                    </Text>
                  </Flex>

                  <Flex wrap="wrap" gap={2} className="flex-shrink-0">
                    {patient.prescriptionCount > 0 && (
                      <button
                        type="button"
                        onClick={() => openPrescription(patient)}
                        className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#00cccc] hover:bg-[#00b3b3] transition-all"
                      >
                        {patient.prescriptionCount} Prescriptions
                      </button>
                    )}
                    {patient.commentCount > 0 && (
                      <button
                        type="button"
                        onClick={() => openComments(patient)}
                        className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#00c008] hover:bg-[#00a807] transition-all"
                      >
                        {patient.commentCount} Comments
                      </button>
                    )}
                    {patient.alertCount > 0 && (
                      <button
                        type="button"
                        onClick={() => openAlerts(patient)}
                        className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#fd0000] hover:bg-[#e00000] transition-all"
                      >
                        {patient.alertCount} Alerts
                      </button>
                    )}
                    {patient.dialysisCount > 0 && (
                      <button
                        type="button"
                        onClick={() => openDialysis(patient)}
                        className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#6b21a8] hover:bg-[#581c87] transition-all"
                      >
                        {patient.dialysisCount} Dialysis
                      </button>
                    )}
                    {total === 0 && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md text-xs font-bold text-white bg-[#989898] cursor-default"
                      >
                        0 alerts
                      </button>
                    )}
                  </Flex>
                </Flex>
              );
            })}
          </div>
        )}
      </Box>

      {modals.prescription && (
        <PrescriptionModal closeModal={() => closeModal("prescription")} />
      )}

      {modals.comment && (
        <PatientCommentsModal
          isOpen={modals.comment}
          onClose={() => closeModal("comment")}
          patient={selectedPatient}
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
    </>
  );
};

export default PatientAlertsByType;
