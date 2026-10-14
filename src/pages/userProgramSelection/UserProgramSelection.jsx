import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getPatients, updateProgram } from "../../ApiCalls/patientAPis";
import { getAlertByCategory } from "../../ApiCalls/alertsApis";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import dummyadmin from "../../assets/dummyadmin.png";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useSelector } from "react-redux";
import { UnifiedListTable, SearchBar } from "../../components";

// Component Library
import { Box } from "../../component-library";
import { usePageCache, PAGE_CACHE } from "../../cache";
import RefreshButton from "../../components/RefreshButton/RefreshButton";

const PROGRAM_OPTIONS = ["Basic", "Standard", "Advanced"];

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const dateObject = new Date(dateString);
  if (Number.isNaN(dateObject.getTime())) return "-";
  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const year = dateObject.getFullYear();
  return `${day}-${month}-${year}`;
};

const normalizeProgramName = (program) => {
  const raw = program == null ? "" : String(program).trim();
  if (!raw) return "Basic";
  const match = PROGRAM_OPTIONS.find(
    (option) => option.toLowerCase() === raw.toLowerCase()
  );
  return match || raw;
};

const normalizeAlertsList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

function UserProgramSelection() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [request, setRequest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingPatientId, setUpdatingPatientId] = useState(null);
  const role = useSelector((state) => state.permission);
  const { fetchWithCache, mutate, refreshKey } = usePageCache(
    PAGE_CACHE.USER_PROGRAM
  );

  const loadProgramAlerts = useCallback(
    async (forceRefresh = false) => {
      try {
        const response = await fetchWithCache(
          "programAlerts",
          () => getAlertByCategory(),
          { forceRefresh }
        );
        const alerts = normalizeAlertsList(
          response?.success ? response.data : response
        );
        setRequest(alerts);
      } catch (error) {
        console.error("Error fetching program alerts:", error);
        setRequest([]);
      }
    },
    [fetchWithCache]
  );

  const getPatientsList = useCallback(
    async (forceRefresh = false) => {
      try {
        const response = await fetchWithCache("patients", () => getPatients(), {
          forceRefresh,
        });
        if (response.success) {
          setRecords(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    },
    [fetchWithCache]
  );

  useEffect(() => {
    getPatientsList();
    loadProgramAlerts();
  }, [refreshKey, getPatientsList, loadProgramAlerts]);

  const handleSubmit = useCallback(
    async (program, patientId) => {
      try {
        if (!role?.canEditUserProgramSelection) {
          alert("You are not authorized to perform this action");
          return;
        }

        const normalizedProgram = normalizeProgramName(program);
        setUpdatingPatientId(patientId);

        const result = await mutate(() =>
          updateProgram({
            id: patientId,
            program_id: normalizedProgram,
          })
        );

        if (!result?.success) {
          alert(
            typeof result?.data === "string"
              ? result.data
              : result?.data?.data || "Failed to update program"
          );
          return;
        }

        setRecords((prev) =>
          prev.map((record) =>
            String(record.id) === String(patientId)
              ? { ...record, program: normalizedProgram }
              : record
          )
        );

        // Refresh open program-change requests after accept/update
        await loadProgramAlerts(true);
      } catch (error) {
        console.error("Error updating patient program:", error);
        alert("Error updating patient program");
      } finally {
        setUpdatingPatientId(null);
      }
    },
    [role, mutate, loadProgramAlerts]
  );

  const columns = useMemo(
    () => [
      { key: "photo", label: "Profile Photo", type: "image", width: "80px" },
      { key: "name", label: "Name", type: "text", width: "150px" },
      { key: "number", label: "Number", type: "text", width: "120px" },
      {
        key: "registered_date",
        label: "Registration Date",
        type: "custom",
        // UnifiedListTable custom columns use `render`, not `renderCell`
        render: (item) => formatDate(item.registered_date),
        width: "130px",
      },
      {
        key: "requestFor",
        label: "Request For",
        type: "custom",
        render: (item) => (
          <div>
            {request
              ?.filter((alert) => String(alert.patientId) === String(item.id))
              .map((alert) => (
                <div key={alert.id} style={{ marginBottom: "0.5rem" }}>
                  <p style={{ fontWeight: 600, color: "#1A9A9A" }}>
                    {normalizeProgramName(alert.programName)}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    Date: {formatDate(alert.date)}
                  </p>
                  <button
                    className="admin-btn admin-btn--teal"
                    style={{
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    }}
                    disabled={String(updatingPatientId) === String(item.id)}
                    onClick={() =>
                      handleSubmit(alert.programName || "Basic", item.id)
                    }
                  >
                    Accept
                  </button>
                </div>
              ))}
          </div>
        ),
        width: "200px",
      },
      {
        key: "program",
        label: "Program",
        type: "custom",
        render: (item) => (
          <select
            value={normalizeProgramName(item.program)}
            disabled={String(updatingPatientId) === String(item.id)}
            onChange={(e) => handleSubmit(e.target.value, item.id)}
            style={{
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #D1D5DB",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#1A9A9A",
              minWidth: "120px",
            }}
          >
            {PROGRAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ),
        width: "150px",
      },
    ],
    [request, handleSubmit, updatingPatientId]
  );

  const formattedData = records.map((record) => ({
    ...record,
    photo: record.profile_photo || dummyadmin,
  }));

  const filteredData = formattedData.filter((record) => {
    const term = searchTerm.toLowerCase();
    return (
      String(record.name || "")
        .toLowerCase()
        .includes(term) ||
      String(record.number || "")
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="User Program Selection"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "User Program Selection", active: true },
            ]}
            onBack={() => navigate(ROUTES.HOME)}
            rightAction={
              <RefreshButton pageName={PAGE_CACHE.USER_PROGRAM.name} />
            }
          />
        </Box>

        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__left">
                <SearchBar
                  placeholder="Search by name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
              <div className="admin-toolbar__right">
                <span className="admin-toolbar__count">
                  {filteredData.length} Records Found
                </span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <UnifiedListTable
              columns={columns}
              data={filteredData}
              enableSearch={true}
              renderSearchUI={false}
              searchKeys={["name", "number"]}
              rowsPerPage={5}
              loadingMessage="Loading patient records..."
              emptyMessage="No patient records found."
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default UserProgramSelection;
