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
import {
  formatDate,
  normalizeProgramName,
  ProgramButtons,
  ProgramRequestList,
} from "./programSelectionShared";

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
        setRequest(response.success && Array.isArray(response.data) ? response.data : []);
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
          <ProgramRequestList
            requests={request.filter((alert) => String(alert.patientId) === String(item.id))}
            isDisabled={String(updatingPatientId) === String(item.id)}
            onAccept={(programName) => handleSubmit(programName, item.id)}
          />
        ),
        width: "200px",
      },
      {
        key: "program",
        label: "Program",
        type: "custom",
        render: (item) => (
          <ProgramButtons
            currentProgram={item.program}
            isDisabled={String(updatingPatientId) === String(item.id)}
            onSelect={(program) => handleSubmit(program, item.id)}
          />
        ),
        width: "300px",
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
