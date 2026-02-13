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

// Component Library
import {
  Button,
  Box,
  Flex,
  Container,
} from "../../component-library";
import { Text, Heading } from "../../component-library/primitives/Typography";
import { Card } from "../../component-library/primitives/Card";

// Components
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";

// Modals
import MyModal from "./ShowModal";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";

// Icons
import sortIcon from "../../assets/Sort_Amount_Up.svg";
import deleteIcon from "../../assets/Delete.svg";
import expandIcon from "../../assets/Expand.svg";
import closeIcon from "../../assets/Close.svg";

const UserLabReports = () => {
  const [showModal, setShowModal] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");

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
      const response = await axiosInstance.get(
        `${server_url}/patient/getPatient/${id}`
      );
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchMedicalTeam = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getMedicalTeam/${id}`
      );
      setMedicalTeam(response.data.data);
    } catch (error) {
      console.error("Error fetching medical team:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/labreport/getLabReports/${id}`
      );
      setLabReportData(response.data.data);
      setFilteredReportData(response.data.data);
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
  }, [id, showModal]);

  const deleteLabReport = async (reportId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this lab report?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(
          `${server_url}/labreport/deleteLabReport/${reportId}`,
          { data: { email } }
        );
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

    if (!filter || filter === "Select") {
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
    <ThemeProvider>
      <Box className="flex-1 w-full flex flex-col min-w-0 bg-[#fafafa]">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Flex justify="start" align="center" className="py-4 px-6">

            {/* Header with Breadcrumbs */}
            <PageHeader
              title="Lab Reports"
              breadcrumbs={[
               // { label: "All Patients", path: "/patient" },
                { label: "Patient", path: `/userProfile/${id}`, active: false },
                { label: "Lab Reports", active: true }
              ]}
              onBack={() => navigate("/patient")}
            />
          </Flex>
          {/* Navigation Tabs */}
          <PatientNavTabs
            patientId={id}
            userData={userData}
            unreadAdminCount={totalUnreadCount}
            unreadDoctorCount={totalUnreadCountDoc}
            role={role}
          />
        </Box>

        {/* Main Content */}
        <Box className="flex-1 overflow-y-auto">
          <Container className="py-8 px-4 md:px-8 lg:px-12 max-w-full lg:max-w-[1440px] mx-auto">
            <Card
              className="bg-white rounded-[15px] p-8"
              style={{
                boxShadow: '-2px -2px 8px 0px rgba(0,0,0,0.1), 2px 2px 8px 0px rgba(0,0,0,0.15)'
              }}
            >
              {/* Top Panel - Avatar and Name */}
              <Flex
                justify="between"
                align="center"
                className="pb-4 border-b border-gray-200 mb-6"
              >
                <Heading
                  size="lg"
                  weight="bold"
                  style={{ color: '#393939', fontSize: '18px' }}
                >
                  Lab reports
                </Heading>

                <Flex align="center" gap={3}>
                  <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700 uppercase">
                      {userData?.name?.charAt(0) || "P"}
                    </span>
                  </Box>
                  <Text
                    size="md"
                    weight="normal"
                    style={{ color: '#393939', fontSize: '18px' }}
                  >
                    {userData?.name || "Patient"}
                  </Text>
                  <button
                    className="ml-8 w-9 h-9 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => navigate(`/userProfile/${id}`)}
                  >
                    <img src={closeIcon} alt="Close" className="w-full h-full" />
                  </button>
                </Flex>
              </Flex>

              {/* Filter and Action Bar */}
              <Flex justify="between" align="center" className="mb-8">
                <Flex align="center" gap={4}>
                  <Box className="relative">
                    <select
                      value={selectedFilter}
                      onChange={handleSelectChange}
                      className="h-[50px] pl-4 pr-10 rounded-[10px] border border-[#5886a5] bg-white text-[#5886a5] text-[16px] font-normal appearance-none cursor-pointer focus:outline-none"
                      style={{ minWidth: '158px' }}
                    >
                      <option value="">Sort by</option>
                      {["Lab", "Ultrasound", "X-Ray", "Echo", "MRI", "Angiography", "CT Scan"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <Box className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <img src={sortIcon} alt="Sort" className="w-[15px] h-[15px]" />
                    </Box>
                  </Box>

                  <button
                    onClick={handleClearFilters}
                    className="text-[16px] font-semibold text-[#5886a5] underline hover:text-primary transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                </Flex>

                {role?.role_name !== "Dialysis Technician" && (
                  <Button
                    variant="solid"
                    className="h-[50px] px-8 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3453c1] transition-colors"
                    onClick={openModal}
                  >
                    Upload Lab Report
                  </Button>
                )}
              </Flex>

              {/* Table Layout */}
              <Box className="border border-gray-100 rounded-[5px] overflow-hidden">
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
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Modals */}
      {showModal && (
        <MyModal
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
    </ThemeProvider>
  );
};

export default UserLabReports;
