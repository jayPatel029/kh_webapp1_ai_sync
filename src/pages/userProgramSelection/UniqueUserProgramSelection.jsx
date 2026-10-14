import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { updateProgram } from "../../ApiCalls/patientAPis";
import { getAlertByCategory } from "../../ApiCalls/alertsApis";
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import { useAdminToast } from "../../components/AdminToast";
import dummyadmin from "../../assets/dummyadmin.png";
import { ROUTES } from "../../routes/routeConstants";
import { Box } from "../../component-library";
import { usePageCache, PAGE_CACHE } from "../../cache";
import {
  formatDate,
  normalizeProgramName,
  ProgramButtons,
  ProgramRequestList,
} from "./programSelectionShared";

function UniqueUserProgramSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate } = usePageCache(PAGE_CACHE.USER_PROGRAM);

  const [patient, setPatient] = useState(null);
  // "loading" | "ready" | "notFound" | "error"
  const [patientStatus, setPatientStatus] = useState("loading");
  const [requests, setRequests] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const loadRequestIdRef = useRef(0);

  const loadRequests = useCallback(
    async (forceRefresh = false) => {
      const response = await fetchWithCache("programAlerts", () => getAlertByCategory(), {
        forceRefresh,
      });
      const allRequests = response.success && Array.isArray(response.data) ? response.data : [];
      return allRequests.filter((request) => String(request.patientId) === String(id));
    },
    [fetchWithCache, id]
  );

  const loadPage = useCallback(async () => {
    const loadRequestId = ++loadRequestIdRef.current;
    const isCurrent = () => loadRequestIdRef.current === loadRequestId;

    setPatient(null);
    setRequests([]);
    setPatientStatus("loading");

    const [patientResponse, patientRequests] = await Promise.all([
      getPatientGetPatientByid(id),
      loadRequests(),
    ]);
    if (!isCurrent()) return;

    if (!patientResponse.success) {
      setPatientStatus("error");
      return;
    }
    const loadedPatient = patientResponse.data?.data;
    if (!loadedPatient?.id) {
      setPatientStatus("notFound");
      return;
    }
    setPatient(loadedPatient);
    setRequests(patientRequests);
    setPatientStatus("ready");
  }, [id, loadRequests]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleProgramChange = async (program) => {
    if (!role?.canEditUserProgramSelection) {
      showToast("You are not authorized to perform this action", "error");
      return;
    }
    const normalizedProgram = normalizeProgramName(program);
    setIsUpdating(true);
    try {
      const result = await mutate(() =>
        updateProgram({ id: patient.id, program_id: normalizedProgram })
      );
      if (!result?.success) {
        const message =
          typeof result?.data === "string"
            ? result.data
            : result?.data?.data || "Failed to update program";
        showToast(message, "error");
        return;
      }
      setPatient((prev) => ({ ...prev, program: result.data?.program || normalizedProgram }));
      setRequests(await loadRequests(true));
      showToast(`Program updated to ${normalizedProgram}`, "success");
    } catch (error) {
      console.error("Error updating patient program:", error);
      showToast("Error updating patient program", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderBody = () => {
    if (patientStatus === "loading") {
      return <p className="text-sm text-gray-500">Loading patient details...</p>;
    }
    if (patientStatus === "notFound") {
      return <p className="text-sm text-gray-500">Patient not found.</p>;
    }
    if (patientStatus === "error") {
      return (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-600">Could not load patient details.</p>
          <button
            type="button"
            onClick={loadPage}
            className="text-sm font-semibold text-primary underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <img
            src={patient.profile_photo || dummyadmin}
            alt={patient.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900">{patient.name || "-"}</p>
            <p className="text-sm text-gray-600">{patient.number || "-"}</p>
            <p className="text-xs text-gray-500">
              Registered on {formatDate(patient.registered_date)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold text-gray-900">Program change request</h3>
          <ProgramRequestList
            requests={requests}
            isDisabled={isUpdating}
            onAccept={handleProgramChange}
            emptyText="No pending program change request."
          />
        </div>

        <div>
          <h3 className="mb-1 text-base font-bold text-gray-900">Program</h3>
          <p className="mb-3 text-sm text-gray-500">
            Current program: {normalizeProgramName(patient.program) || "Not set"}
          </p>
          <ProgramButtons
            currentProgram={patient.program}
            isDisabled={isUpdating}
            onSelect={handleProgramChange}
          />
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title={patient?.name || "User Program Selection"}
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "User Program Selection", path: ROUTES.PROGRAMS },
              { label: patient?.name || "Patient", active: true },
            ]}
            onBack={() => navigate(ROUTES.PROGRAMS)}
          />
        </Box>

        <div className="admin-card">
          <div className="admin-card__body">{renderBody()}</div>
        </div>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default UniqueUserProgramSelection;
