/**
 * User Lab Reports Page
 * Following Figma design with component library and design system
 * Matches Userprescription.jsx design patterns
 * 
 * @file src/pages/UserLabReports/UserLabReports.jsx
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Component Library
import { Button, Box, Flex } from "../../component-library";
import { Text } from "../../component-library/primitives/Typography";
import { SortDropdown } from "../../component-library/primitives";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";
import UnifiedListTable from "../../components/table/UnifiedListTable";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Page Components
import UploadLabReports from "./UploadLabReports";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import {
  getPatientGetPatientByid,
  getPatientGetMedicalTeamByid,
  getLabreportGetLabReportsByid,
  deleteLabreportDeleteLabReportByid,
  getLabreportGetColumnNames,
} from "../../ApiCalls/remainingApis";

// Icons
import sortIcon from "../../assets/Sort_Amount_Up.svg";
import deleteIcon from "../../assets/Delete.svg";
import expandIcon from "../../assets/Expand.svg";

// CSV Components
import CSVLab2 from "../../components/csvLab2/CSVLab2";

// Cache
import { usePageCache, PAGE_CACHE } from "../../cache";
import PageSkeleton from "../../components/PageSkeleton";

const LAB_REPORT_SORT_OPTIONS = [
  "Lab",
  "Ultrasound",
  "X-Ray",
  "Echo",
  "MRI",
  "Angiography",
  "CT Scan",
].map((type) => ({ value: type, label: type }));

const UserLabReports = () => {
  const [showModal, setShowModal] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [labColumns, setLabColumns] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");
  const { isMobile } = useIsMobile();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.USER_LAB_REPORTS);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openFileModal = (fileId, imageUrl) => {
    setUploadedFile({ id: fileId, imageUrl });
  };

  const closeFileModal = () => setUploadedFile(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPatientData = async () => {
    try {
      const response = await fetchWithCache(`patient_${id}`, () => getPatientGetPatientByid(id));
      if (response.success) {
        setUserData(response?.data?.data || response?.data || null);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchMedicalTeam = async () => {
    try {
      const response = await fetchWithCache(`medicalTeam_${id}`, () => getPatientGetMedicalTeamByid(id));
      if (response.success) {
        setMedicalTeam(response?.data?.data || response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching medical team:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithCache(`labReports_${id}`, () => getLabreportGetLabReportsByid(id));
      if (response.success) {
        const reports = response?.data?.data || response?.data || [];
        setLabReportData(reports);
        setFilteredReportData(reports);
      }
    } catch (error) {
      console.error("Error fetching lab report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUnreadMessages = async () => {
      try {
        const chatResult = await getAllChatsAdmin(id);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };
    getUnreadMessages();
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchPatientData();
    fetchMedicalTeam();
    // Fetch available lab report column names
    const fetchColumns = async () => {
      try {
        const res = await getLabreportGetColumnNames();
        if (res.success) {
          setLabColumns(res.data?.data || res.data || []);
        }
      } catch (e) {
        console.error('Error fetching lab columns:', e);
      }
    };
    fetchColumns();
  }, [id, refreshKey]);

  const deleteLabReport = async (reportId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this lab report?"
    );
    if (isConfirmed) {
      try {
        const result = await mutate(() => deleteLabreportDeleteLabReportByid(reportId, { email }));
        if (!result.success) {
          throw new Error("Delete failed");
        }
        fetchData();
      } catch (error) {
        console.error("Error deleting lab report:", error);
        alert("Failed to delete lab report. Please try again.");
      }
    }
  };

  const handleSelectChange = (e) => {
    const filter = e.target.value;
    setSelectedFilter(filter);

    if (!filter) {
      setFilteredReportData(labReportData);
      return;
    }

    const filtered = labReportData.filter(
      (report) => report.Report_Type === filter
    );
    setFilteredReportData(filtered);
  };

  const handleClearFilters = () => {
    setSelectedFilter("");
    setFilteredReportData(labReportData);
  };

  // Prepare columns for UnifiedListTable
  const labReportColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "type", label: "Report Type", type: "text", width: "150px" },
    { key: "image", label: "Lab Reports", type: "custom", width: "150px", render: (row) => (
      <div className="flex justify-start">
        <div
          className="relative w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openFileModal(row.id, row.Lab_Report)}
        >
          <div className="rotate-90" style={{ width: "80px", height: "56.534px" }}>
            <img
              src={row.Lab_Report}
              alt="Lab Report"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={expandIcon} alt="Expand" className="w-5 h-5" />
          </div>
        </div>
      </div>
    ) },
    { key: "actions", label: "Actions", type: "actions", width: "100px" },
  ];

  // Transform lab report data for table
  const transformedLabReportData = filteredReportData.map((report) => ({
    id: report.id,
    date: report.date || report.Date,
    type: report.Report_Type,
    image: report.Lab_Report,
    Lab_Report: report.Lab_Report,
  }));

  return (
    <PatientDetailLayout
             title={"Lab reports"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {/* Filter and Action Bar */}
      <Flex
        justify="between"
        align={isMobile ? "start" : "center"}
        direction={isMobile ? "column" : "row"}
        gap={isMobile ? 3 : 0}
        className={isMobile ? 'mb-4' : 'mb-8'}
      >
        <Flex align="center" gap={isMobile ? 2 : 4} wrap={isMobile ? 'wrap' : 'nowrap'}>
          <SortDropdown
            value={selectedFilter}
            onChange={handleSelectChange}
            options={LAB_REPORT_SORT_OPTIONS}
            icon={<img src={sortIcon} alt="Sort" />}
            placeholder="Sort by"
          />
          <button
            onClick={handleClearFilters}
            className={`${isMobile ? 'text-[13px]' : 'text-[16px]'} font-semibold text-[#5886a5] underline hover:text-primary transition-colors cursor-pointer`}
          >
            Clear filters
          </button>
        </Flex>

        {role?.role_name !== "Dialysis Technician" && (
          <Button
            variant="solid"
            className={`${isMobile ? 'h-[40px] px-4 text-[13px] rounded-lg w-full' : 'h-[50px] px-8 rounded-[10px] text-[16px]'} bg-[#4164df] text-white font-semibold hover:bg-[#3453c1] transition-colors`}
            onClick={openModal}
          >
            Upload Lab Report
          </Button>
        )}
      </Flex>

      {/* CSV Upload Component */}
      {/* <Box className="mb-6">
        <CSVLab2
          patientId={id}
          setData={setCsvData}
          setSuccess={setSuccess}
          success={success}
        />
      </Box> */}

      {/* Lab Data Columns Summary */}
      {/* {labColumns.length > 0 && !isMobile && (
        <Box className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Text size="sm" weight="semibold" className="text-blue-700 mb-2">Available Lab Parameters:</Text>
          <Flex gap={2} wrap="wrap">
            {labColumns.map((col, i) => (
              <Box key={i} className="text-xs bg-white text-blue-600 px-2 py-1 rounded-full border border-blue-200">
                {typeof col === 'string' ? col : col.column_name || col.name || JSON.stringify(col)}
              </Box>
            ))}
          </Flex>
        </Box>
      )} */}

      {/* Unified Table - handles both mobile and desktop */}
      <UnifiedListTable
        columns={labReportColumns}
        data={transformedLabReportData}
        onDelete={(row) => deleteLabReport(row.id, email)}
        isLoading={loading}
        displayMode="auto"
        cardTitleKey="type"
        cardSubtitleKey="date"
        cardFieldKeys={[]}
        emptyMessage="No lab reports found"
        actionButtons={true}
      />

      {/* Modals */}
      {showModal && (
        <UploadLabReports
          closeModal={closeModal}
          user_id={id}
          onSuccess={fetchData}
        />
      )}

      {uploadedFile && (
        <FileViewModal
          isOpen={!!uploadedFile}
          onClose={closeFileModal}
          fileUrl={uploadedFile.imageUrl}
          fileId={uploadedFile.id}
          patientId={id}
          // fileType="Lab Report"
          title="Lab Report View"
        />
      )}
    </PatientDetailLayout>
  );
};

export default UserLabReports;
