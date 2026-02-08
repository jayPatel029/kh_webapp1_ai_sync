/**
 * User Lab Reports Redesign
 * Redesigned lab reports page following Figma design specifications
 * Uses component library and design system
 * 
 * @file src/pages/UserLabReports/UserLabReportsRedesign.jsx
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

// Component Library
import { Button } from "../../component-library/primitives/Button";
import { Text, Heading } from "../../component-library/primitives/Typography";
import { Flex, Box, Container } from "../../component-library/layout/Layout";
import { Card } from "../../component-library/primitives/Card";

// Components
import Navbar from "../../components/navbar/Navbar";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";

// Modals
import MyModal from "./ShowModal";
import UploadedFileModal from "./UploadedFileModal";

// Icons/Assets
import sortIcon from "../../assets/Sort_Amount_Up.svg";
import deleteIcon from "../../assets/Delete.svg";
import expandIcon from "../../assets/Expand.svg";
import closeIcon from "../../assets/Close.svg";

// CSV Components
import CSVLab2 from "../../components/csvLab2/CSVLab2";

import Sidebar from "../../components/sidebar/Sidebar";

const UserLabReportsRedesign = () => {
  const [showModal, setShowModal] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");

  // Fetch patient data
  useEffect(() => {
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
    fetchPatientData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openFileModal = (id, imageUrl, comment) => {
    setUploadedFile({ id, imageUrl, comment });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };

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
        await fetchData();
      } catch (error) {
        console.error("Error deleting lab report:", error);
        alert("Failed to delete lab report. Please try again.");
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/labreport/getLabReports/${id}`
      );
      setLabReportData(response.data.data);
    } catch (error) {
      console.error("Error fetching lab report data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showModal, id]);

  return (
    <Flex className="min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <Box className="hidden md:block flex-none sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box className="flex-1 w-full flex flex-col min-w-0">
        {/* Navbar */}
        <Box className="sticky top-0 z-30">
          <Navbar />
        </Box>

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-full lg:max-w-[1440px] mx-auto">
            {/* Header with Breadcrumbs */}
            <PageHeader
              title={userData?.name || "Patient"}
              breadcrumbs={[
                { label: "My patients", path: "/patient" },
                { label: userData?.name || "Patient" }
              ]}
              onBack={() => navigate("/patient")}
            />
          </Container>

          {/* Navigation Tabs */}
          <PatientNavTabs
            patientId={id}
            userData={userData}
            unreadAdminCount={0}
            unreadDoctorCount={0}
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
              {/* Top Panel */}
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
                  <Box className="w-8 h-8 rounded-full bg-gray-200" />
                  <Text
                    size="md"
                    weight="normal"
                    style={{ color: '#393939', fontSize: '18px' }}
                  >
                    {userData?.name || "Mukesh"}
                  </Text>
                  <button
                    className="ml-8 w-9 h-9 flex items-center justify-center"
                    onClick={() => navigate(`/userProfile/${id}`)}
                  >
                    <img src={closeIcon} alt="Close" className="w-full h-full" />
                  </button>
                </Flex>
              </Flex>

              {/* Details Section */}
              <Box className="space-y-6">
                {/* Controls */}
                <Flex justify="between" align="center">
                  <Flex gap={4} align="center">
                    {/* Sort By Dropdown */}
                    <Box
                      className="border-2 border-[#5886a5] rounded-[10px] px-4 py-2 flex items-center gap-3 h-[50px] w-[158px]"
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={sortIcon} alt="Sort" className="w-6 h-6" />
                      <Text
                        size="md"
                        weight="normal"
                        style={{ color: '#5886a5', fontSize: '16px' }}
                      >
                        Sort by
                      </Text>
                      <span style={{ color: '#5886a5', fontSize: '12px' }}>▾</span>
                    </Box>

                    {/* Clear Filters */}
                    <Text
                      size="md"
                      weight="semibold"
                      className="underline cursor-pointer"
                      style={{ color: '#5886a5', fontSize: '16px' }}
                    >
                      Clear filters
                    </Text>
                  </Flex>

                  {/* Upload Button */}
                  {role.role_name !== "Dialysis Technician" && (
                    <Button
                      variant="solid"
                      onClick={openModal}
                      className="h-[50px] px-4 rounded-[10px]"
                      style={{
                        backgroundColor: '#4164df',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 600,
                        minWidth: '152px'
                      }}
                    >
                      Upload
                    </Button>
                  )}
                </Flex>

                {/* CSV Upload Component */}
                <CSVLab2
                  patientId={id}
                  setData={setCsvData}
                  setSuccess={setSuccess}
                  success={success}
                />

                {/* Table */}
                <Box className="w-full">
                  {/* Table Header */}
                  <Flex
                    justify="between"
                    align="center"
                    className="bg-[#5886a5] rounded-[5px] px-16 py-4 mb-0"
                    style={{ height: '50px' }}
                  >
                    <Text
                      size="md"
                      weight="semibold"
                      style={{ color: 'white', fontSize: '16px', minWidth: '120px' }}
                    >
                      Date
                    </Text>
                    <Text
                      size="md"
                      weight="semibold"
                      style={{ color: 'white', fontSize: '16px', minWidth: '120px', textAlign: 'center' }}
                    >
                      Report type
                    </Text>
                    <Text
                      size="md"
                      weight="semibold"
                      style={{ color: 'white', fontSize: '16px', minWidth: '120px', textAlign: 'center' }}
                    >
                      Lab reports
                    </Text>
                    <Text
                      size="md"
                      weight="semibold"
                      style={{ color: 'white', fontSize: '16px', minWidth: '120px', textAlign: 'center' }}
                    >
                      Actions
                    </Text>
                  </Flex>

                  {/* Table Rows */}
                  {Array.isArray(labReportData) && labReportData.length > 0 ? (
                    labReportData.map((labReportsItem, index) => (
                      <Flex
                        key={index}
                        justify="between"
                        align="center"
                        className="bg-white px-16 py-4 border-b border-gray-100"
                        style={{
                          height: '80px',
                          backgroundColor: localStorage.getItem("labReportId") === String(labReportsItem.id)
                            ? '#f0fdf4'
                            : 'white'
                        }}
                      >
                        <Text
                          size="md"
                          weight="semibold"
                          style={{ color: '#989898', fontSize: '16px', minWidth: '120px' }}
                        >
                          {formatDate(labReportsItem?.Date)}
                        </Text>

                        <Text
                          size="md"
                          weight="semibold"
                          style={{ color: '#989898', fontSize: '16px', minWidth: '120px', textAlign: 'center' }}
                        >
                          {labReportsItem.Report_Type}
                        </Text>

                        <Box
                          className="flex items-center justify-center"
                          style={{ minWidth: '120px' }}
                        >
                          {labReportsItem.Lab_Report && (
                            <Box
                              className="relative cursor-pointer"
                              onClick={() =>
                                openFileModal(
                                  labReportsItem.id,
                                  labReportsItem.Lab_Report
                                )
                              }
                              style={{ width: '56.534px', height: '80px' }}
                            >
                              <Box className="absolute inset-0 flex items-center justify-center">
                                <Box
                                  className="rotate-90"
                                  style={{ width: '80px', height: '56.534px' }}
                                >
                                  <img
                                    src={labReportsItem.Lab_Report}
                                    alt="Lab Report"
                                    className="w-full h-full object-cover opacity-70"
                                  />
                                </Box>
                              </Box>
                              <Box
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ width: '20px', height: '20px' }}
                              >
                                <img src={expandIcon} alt="Expand" className="w-full h-full" />
                              </Box>
                            </Box>
                          )}
                        </Box>

                        <Box
                          className="flex items-center justify-center"
                          style={{ minWidth: '120px' }}
                        >
                          <button
                            onClick={() => deleteLabReport(labReportsItem.id, email)}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer"
                          >
                            <img src={deleteIcon} alt="Delete" className="w-full h-full" />
                          </button>
                        </Box>
                      </Flex>
                    ))
                  ) : (
                    <Box className="bg-white px-16 py-8 text-center">
                      <Text
                        size="md"
                        weight="normal"
                        className="italic"
                        style={{ color: '#989898' }}
                      >
                        No data present
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          </Container>

          {/* Modals */}
          {showModal && (
            <MyModal
              closeModal={closeModal}
              user_id={id}
              onSuccess={fetchData}
            />
          )}

          {uploadedFile && (
            <UploadedFileModal
              closeModal={closeFileModal}
              user_id={id}
              file_id={uploadedFile.id}
              file={uploadedFile}
              patient_id={id}
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default UserLabReportsRedesign;
