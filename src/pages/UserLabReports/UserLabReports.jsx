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
      const response = await getPatientGetPatientByid(id);
      if (response.success) {
        setUserData(response?.data?.data || null);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchMedicalTeam = async () => {
    try {
      const response = await getPatientGetMedicalTeamByid(id);
      if (response.success) {
        setMedicalTeam(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching medical team:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getLabreportGetLabReportsByid(id);
      if (response.success) {
        setLabReportData(response?.data?.data || []);
        setFilteredReportData(response?.data?.data || []);
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
  }, [id, showModal]);

  const deleteLabReport = async (reportId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this lab report?"
    );
    if (isConfirmed) {
      try {
        const result = await deleteLabreportDeleteLabReportByid(reportId, { email });
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

  return (
    <PatientDetailLayout
      title={userData?.name ? userData.name : "Patient's Alarms"}
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
      {labColumns.length > 0 && !isMobile && (
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
      )}

      {/* Mobile Card View */}
      {isMobile ? (
        <Box className="flex flex-col gap-3 pb-20">
          {loading ? (
            <Box className="py-8 text-center"><Text className="text-gray-500">Loading...</Text></Box>
          ) : filteredReportData.length > 0 ? (
            filteredReportData.map((report, index) => (
              <Box key={index} className="bg-white rounded-xl border border-gray-200 p-3">
                <Flex justify="between" align="start" className="mb-2">
                  <Box>
                    <p className="text-[13px] font-semibold text-[#1e293b]">{report.Report_Type || 'Lab Report'}</p>
                    <p className="text-[11px] text-[#6b7280] mt-0.5">{formatDate(report.date || report.Date)}</p>
                  </Box>
                  <button
                    onClick={() => deleteLabReport(report.id, email)}
                    className="p-1 cursor-pointer"
                  >
                    <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
                  </button>
                </Flex>
                <Box
                  className="w-full h-[120px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => openFileModal(report.id, report.Lab_Report)}
                >
                  <img src={report.Lab_Report} alt="Lab Report" className="w-full h-full object-cover" />
                </Box>
              </Box>
            ))
          ) : (
            <Box className="py-8 text-center">
              <Text size="sm" className="italic text-gray-400">No lab reports found</Text>
            </Box>
          )}
        </Box>
      ) : (
      /* Desktop Table Layout */
      <Box className="rounded-[5px] overflow-hidden">
        {/* Table Header */}
        <Flex
          className="bg-[#5886a5] text-white py-4 px-6 md:px-12"
          justify="between"
        >
          <Box style={{ flex: '1', minWidth: '120px' }}>
            <Text size="md" weight="semibold">Date</Text>
          </Box>
          <Box style={{ flex: '1', minWidth: '150px' }}>
            <Text size="md" weight="semibold">Report Type</Text>
          </Box>
          <Box style={{ flex: '1', minWidth: '150px' }} className="text-center">
            <Text size="md" weight="semibold">Lab Reports</Text>
          </Box>
          <Box style={{ flex: '0 0 100px' }} className="text-center">
            <Text size="md" weight="semibold">Actions</Text>
          </Box>
        </Flex>

        {/* Table Body */}
        <Box className="bg-white">
          {loading ? (
            <Box className="py-20 text-center">
              <Text className="text-gray-500">Loading lab reports...</Text>
            </Box>
          ) : filteredReportData.length > 0 ? (
            filteredReportData.map((report, index) => (
              <Flex
                key={index}
                className="border-b border-gray-100 py-6 px-6 md:px-12 hover:bg-gray-50 transition-colors"
                justify="between"
                align="center"
              >
                <Box style={{ flex: '1', minWidth: '120px' }}>
                  <Text
                    size="md"
                    weight="semibold"
                    style={{ color: '#989898' }}
                  >
                    {formatDate(report.date || report.Date)}
                  </Text>
                </Box>
                <Box style={{ flex: '1', minWidth: '150px' }}>
                  <Text
                    size="md"
                    weight="semibold"
                    style={{ color: '#989898' }}
                  >
                    {report.Report_Type}
                  </Text>
                </Box>
                <Box
                  style={{ flex: '1', minWidth: '150px' }}
                  className="flex justify-center"
                >
                  <Box
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openFileModal(report.id, report.Lab_Report)}
                  >
                    <Box className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden">
                      <Box
                        className="rotate-90"
                        style={{ width: '80px', height: '56.534px' }}
                      >
                        <img
                          src={report.Lab_Report}
                          alt="Lab Report"
                          className="w-full h-full object-cover opacity-70"
                        />
                      </Box>
                    </Box>
                    <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <img src={expandIcon} alt="Expand" className="w-5 h-5" />
                    </Box>
                  </Box>
                </Box>
                <Box
                  style={{ flex: '0 0 100px' }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => deleteLabReport(report.id, email)}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <img src={deleteIcon} alt="Delete" className="w-full h-full" />
                  </button>
                </Box>
              </Flex>
            ))
          ) : (
            <Box className="py-20 text-center">
              <Text size="md" weight="normal" className="italic text-gray-400">
                No lab reports found
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      )}

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
          fileType="Lab Report"
          title="Lab Report View"
        />
      )}
    </PatientDetailLayout>
  );
};

export default UserLabReports;
