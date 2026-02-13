/**
 * Requisition Reports Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/UserRequisition/UserRequisition.jsx
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
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import RequisitionModal from "./RequisitionModal";
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

const UserRequisition = () => {
  const [showModal, setShowModal] = useState(false);
  const [userRequisitionData, setUserRequisitionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");

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
      const response = await axiosInstance.get(
        `${server_url}/requisition/getRequisition/${id}`
      );
      setUserRequisitionData(response.data.data);
    } catch (error) {
      console.error("Error fetching requisition data:", error);
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

  const handleDelete = async (requisitionId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this requisition?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(
          `${server_url}/requisition/${requisitionId}`,
          {
            data: {
              email: email,
            },
          }
        );

        setUserRequisitionData((prevData) =>
          prevData.filter((requisition) => requisition.id !== requisitionId)
        );
      } catch (error) {
        console.error("Error deleting requisition:", error);
        alert("Failed to delete requisition. Please try again.");
      }
    }
  };

  if (loading) {
    return <Box className="p-20 text-center">Loading...</Box>;
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

          {/* Sticky Header Section */}
          <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Flex justify="start" align="center" className="py-4 px-6"> 
          {/* Header with Breadcrumbs */}
              <PageHeader
                title="Requisition Details"
                breadcrumbs={[
                 // { label: "All Patients", path: "/patient" },
                  { label: "Patient", path: `/userProfile/${id}`, active: false },
                  { label: "Requisition", active: true }
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
          <Box className="flex-1 bg-[#fafafa]">
            <Container className="py-8 px-4 md:px-12 max-w-[1440px] mx-auto">
              <Box className="bg-white rounded-[15px] shadow-md p-8">
                {/* Header Section */}
                <Flex justify="between" align="center" className="pb-4 border-b border-gray-200 mb-6">
                  <Box>
                    <h2 className="text-[18px] font-bold text-[#393939]">Requisition Reports</h2>
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

                {/* Upload Button Section */}
                <Flex justify="end" align="center" className="mb-6">
                  {role?.role_name !== "Dialysis Technician" && (
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
                      <Box style={{ flex: "0 0 150px", textAlign: "center" }}>Requisition</Box>
                      <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Actions</Box>
                    </Flex>
                  </Box>

                  {/* Table Body */}
                  <Box>
                    {userRequisitionData.length > 0 ? (
                      userRequisitionData.map((requisitionItem, index) => (
                        <Box
                          key={index}
                          className="bg-white border-b border-gray-100 px-[70px] py-5 hover:bg-gray-50 transition-colors"
                        >
                          <Flex justify="between" align="center">
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              {formatDate(requisitionItem.Date)}
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="flex justify-center">
                              {requisitionItem.Requisition &&
                                requisitionItem.Requisition.endsWith(".pdf") ? (
                                <Box
                                  className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => openFileModal(requisitionItem.id, requisitionItem.Requisition)}
                                >
                                  <FaFilePdf className="text-white text-2xl" />
                                </Box>
                              ) : (
                                  <Box
                                    className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openFileModal(requisitionItem.id, requisitionItem.Requisition)}
                                  >
                                    <img
                                      src={requisitionItem?.Requisition}
                                      alt="Requisition"
                                      className="w-full h-full object-cover"
                                    />
                                  </Box>
                              )}
                            </Box>
                            <Box style={{ flex: "0 0 100px" }} className="flex justify-center">
                              <button
                                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                                onClick={() => handleDelete(requisitionItem.id, email)}
                              >
                                <BsTrash size={24} />
                              </button>
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    ) : (
                      <Box className="bg-white px-[70px] py-8 text-center">
                        <p className="text-[#989898] text-[16px] italic">No Requisition found</p>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Container>
        </Box>
      </Box>

      {/* Modals */}
      {showModal && (
        <RequisitionModal
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
          fileType="Requisition"
          title="Requisition View"
        />
      )}
    </ThemeProvider>
  );
};

export default UserRequisition;
