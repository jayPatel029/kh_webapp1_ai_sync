import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getContactUsById, getContactUsPatients } from "../../ApiCalls/contactus";
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { UnifiedListTable, SearchBar } from "../../components";
import dummyadmin from "../../assets/dummyadmin.png";

// Component Library
import { Box } from "../../component-library";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
};

export default function ContactUs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const legacyContactUsId = searchParams.get("id");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Old alert links point at a single ContactUs row (/support?id=); open that row's patient.
  useEffect(() => {
    if (!legacyContactUsId) return;
    const openLegacyLink = async () => {
      const response = await getContactUsById(legacyContactUsId);
      const patientId = response.success ? response.data?.contactus?.patientId : null;
      if (patientId) {
        navigate(ROUTES.supportPatient(patientId, legacyContactUsId), { replace: true });
      }
    };
    openLegacyLink();
  }, [legacyContactUsId, navigate]);

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await getContactUsPatients();
      if (response.success) {
        setPatients(response.data?.patients || []);
      } else {
        setError("Could not load messages. Please refresh the page.");
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const columns = useMemo(
    () => [
      { key: "photo", label: "Profile Photo", type: "image", width: "80px" },
      { key: "name", label: "Patient Name", type: "text", width: "160px" },
      { key: "number", label: "Phone No.", type: "text", width: "120px" },
      {
        key: "lastMessage",
        label: "Last Message",
        type: "custom",
        render: (row) => (
          <span
            className="list-table__text-cell"
            style={{
              display: "block",
              maxWidth: "320px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.lastMessage}
          >
            {row.lastSenderType === "admin" ? "Admin: " : ""}
            {row.lastMessage}
          </span>
        ),
      },
      {
        key: "lastAt",
        label: "Last Message Date",
        type: "custom",
        render: (row) => formatDate(row.lastAt),
        width: "160px",
      },
      { key: "messageCount", label: "Messages", type: "text", width: "90px" },
    ],
    []
  );

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return patients
      .map((patient) => ({
        ...patient,
        name: patient.name || `Patient ${patient.patientId}`,
        photo: patient.profile_photo || dummyadmin,
      }))
      .filter(
        (row) =>
          !term ||
          String(row.name).toLowerCase().includes(term) ||
          String(row.number || "").toLowerCase().includes(term)
      );
  }, [patients, searchTerm]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Contact Us"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Contact Us", active: true }
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Box>

        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__left">
                <SearchBar
                  placeholder="Search by name or phone..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
              <div className="admin-toolbar__right">
                <span className="admin-toolbar__count">
                  {rows.length} Patient{rows.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            {error ? (
              <div className="admin-message admin-message--error">{error}</div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={rows}
                isLoading={loading}
                onRowClick={(row) => navigate(ROUTES.supportPatient(row.patientId))}
                emptyMessage="No patient messages yet."
                cardTitleKey="name"
                cardSubtitleKey="number"
                cardFieldKeys={["lastMessage", "lastAt", "messageCount"]}
              />
            )}
          </div>
        </div>
      </Box>

    </ThemeProvider>
  );
}
