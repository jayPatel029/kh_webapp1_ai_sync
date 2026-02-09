/**
 * Diet Details Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/UserDietDetails/UserDietDetails.jsx
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import {
  Box,
  Flex,
  Container,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";

// Components
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import SideBarDoctor from "../../components/sidebarDoctor/SideBarDoctor";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import DietModal from "./DietModal";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";

// Icons
import { BsTrash } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";

// Import design system styles
import "../../design-system/styles/index.css";

const UserDietDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [dietData, setDietData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openFileModal = (fileId, fileUrl) => {
    setUploadedFile({ fileId, fileUrl });
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

  const fetchData = async () => {
    try {
      const result = await axiosInstance.get(
        `${server_url}/dietdetails/getPatientDietDetailsAdmin/${id}`
      );
      setDietData(result.data.data || []);
    } catch (error) {
      console.error("Error fetching diet data:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${id}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(id);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchPatientData();
  }, [id]);

  const deleteDietDetails = async (dietId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete these diet details?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(
          `${server_url}/dietdetails/deleteDietDetails/${dietId}`
        );
        await fetchData(); // Refresh the data
      } catch (error) {
        console.error("Error deleting diet details:", error);
        alert("Failed to delete diet details. Please try again.");
      }
    }
  };

  if (loading) {
    return <Box className="p-20 text-center">Loading...</Box>;
  }

  return (
    <ThemeProvider>
      <Box className="flex min-h-screen">
        <Box className="flex-shrink-0">
          {role?.role_name === "Doctor" ? <SideBarDoctor /> : <Sidebar />}
        </Box>

        <Box className="flex-1 flex flex-col min-w-0">
          <Navbar />

          {/* Sticky Header Section */}
          <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
            <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
              {/* Header with Breadcrumbs */}
              <PageHeader
                title="Patient Profile"
                breadcrumbs={[
                  { label: "All Patients", path: "/patient" },
                  { label: "Patient", path: `/userProfile/${id}`, active: false },
                  { label: "Diet Details", active: true }
                ]}
                onBack={() => navigate("/patient")}
              />
            </Container>

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
          <Box className="flex-1 bg-[#fafafa]">
            <Container className="py-8 px-4 md:px-12 max-w-[1440px] mx-auto">
              <Box className="bg-white rounded-[15px] shadow-md p-8">
                {/* Header Section */}
                <Flex justify="between" align="center" className="pb-4 border-b border-gray-200 mb-6">
                  <Box>
                    <h2 className="text-[18px] font-bold text-[#393939]">Diet reports</h2>
                  </Box>
                  <Flex align="center" gap={3}>
                    <Box className="flex items-center gap-2">
                      <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {userData?.name?.charAt(0)?.toUpperCase() || "P"}
                        </span>
                      </Box>
                      <span className="text-[18px] text-[#393939]">{userData?.name || "Patient"}</span>
                    </Box>
                  </Flex>
                </Flex>

                {/* Filter and Upload Section */}
                <Flex justify="between" align="center" className="mb-6">
                  <Flex gap={4} align="center">
                    {/* Placeholder for filters - hidden per Figma design */}
                    <Box className="opacity-0">
                      <select className="h-[50px] px-4 pr-10 rounded-[10px] border border-[#5886a5]">
                        <option>Sort by</option>
                      </select>
                    </Box>
                  </Flex>

                  {/* Upload Button - Only show for non-Doctor roles */}
                  {role?.role_name !== "Doctor" && (
                    <Button
                      variant="solid"
                      onClick={openModal}
                      className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9]"
                    >
                      Upload
                    </Button>
                  )}
                </Flex>

                {/* Table */}
                <Box className="overflow-x-auto">
                  {/* Table Header */}
                  <Box className="bg-[#5886a5] rounded-[5px] px-[70px] py-4 mb-0">
                    <Flex justify="between" align="center" className="text-white text-[16px] font-semibold">
                      <Box style={{ flex: "0 0 150px" }}>Date</Box>
                      <Box style={{ flex: "0 0 200px" }}>Report type</Box>
                      <Box style={{ flex: "0 0 200px" }}>Description</Box>
                      <Box style={{ flex: "0 0 150px", textAlign: "center" }}>Image</Box>
                      <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Actions</Box>
                    </Flex>
                  </Box>

                  {/* Table Body */}
                  <Box>
                    {dietData && dietData.length > 0 ? (
                      dietData.map((data, index) => (
                        <Box
                          key={data.id || index}
                          className="bg-white border-b border-gray-100 px-[70px] py-5 hover:bg-gray-50 transition-colors"
                        >
                          <Flex justify="between" align="center">
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              {formatDate(data.Date)}
                            </Box>
                            <Box style={{ flex: "0 0 200px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.Meal_Type}
                            </Box>
                            <Box style={{ flex: "0 0 200px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.meal_desc}
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="flex justify-center">
                              {data.meal_img && data.meal_img.endsWith(".pdf") ? (
                                <Box
                                  className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => openFileModal(data.id, data.meal_img)}
                                >
                                  <FaFilePdf className="text-white text-2xl" />
                                </Box>
                              ) : (
                                  <Box
                                    className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openFileModal(data.id, data.meal_img)}
                                  >
                                    <img
                                      src={data?.meal_img}
                                      alt="Diet"
                                      className="w-full h-full object-cover"
                                    />
                                  </Box>
                              )}
                            </Box>
                            <Box style={{ flex: "0 0 100px" }} className="flex justify-center">
                              <button
                                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                                onClick={() => deleteDietDetails(data.id)}
                              >
                                <BsTrash size={24} />
                              </button>
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    ) : (
                      <Box className="bg-white px-[70px] py-8 text-center">
                        <p className="text-[#989898] text-[16px] italic">No diet details found</p>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      {showModal && (
        <DietModal
          closeModal={closeModal}
          user_id={id}
          onSuccess={fetchData}
        />
      )}

      {uploadedFile && (
        <FileViewModal
          isOpen={!!uploadedFile}
          onClose={closeFileModal}
          fileUrl={uploadedFile.fileUrl}
          fileId={uploadedFile.fileId}
          patientId={id}
          fileType="Diet Details"
          title="Diet Details View"
        />
      )}
    </ThemeProvider>
  );
};

export default UserDietDetails;
