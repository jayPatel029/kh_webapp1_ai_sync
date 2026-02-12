/**
 * Prescription Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/Userprescription/Userprescription.jsx
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
import { Badge } from "../../component-library/primitives/Badge";

// Components
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import PrescriptionModal from "./PrescriptionModal";
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

const Userprescription = () => {
  const [showModal, setShowModal] = useState(false);
  const [userPrescriptionData, setUserPrescriptionData] = useState([]);
  const [filteredPrescriptionData, setFilteredPrescriptionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState("");

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
        `${server_url}/prescription/getPrescription/${id}`
      );
      setUserPrescriptionData(response.data.data);
      setFilteredPrescriptionData(response.data.data);
    } catch (error) {
      console.error("Error fetching prescription data:", error);
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

  const fetchMedicalTeam = async (user_id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getMedicalTeam/${user_id}`
      );
      setDoctorOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching medical team:", error);
    } finally {
      setLoading(false);
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
    fetchMedicalTeam(id);
    fetchData();
    fetchPatientData();
  }, [id]);

  const handleDelete = async (prescriptionId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(
          `${server_url}/prescription/deletePrescription/${prescriptionId}`,
          {
            data: {
              email: email,
            },
          }
        );

        setUserPrescriptionData((prevData) =>
          prevData.filter((prescription) => prescription.id !== prescriptionId)
        );
        setFilteredPrescriptionData((prevData) =>
          prevData.filter((prescription) => prescription.id !== prescriptionId)
        );
      } catch (error) {
        console.error("Error deleting prescription:", error);
        alert("Failed to delete prescription. Please try again.");
      }
    }
  };

  const handleSelectChange = (e) => {
    const selectedDoctorId = parseFloat(e.target.value);
    setSelectedDoctor(e.target.value);

    if (!selectedDoctorId || isNaN(selectedDoctorId)) {
      setFilteredPrescriptionData(userPrescriptionData);
      return;
    }

    const filteredData = userPrescriptionData.filter(
      (prescription) =>
        parseFloat(prescription.prescriptionGivenBy) === selectedDoctorId
    );
    setFilteredPrescriptionData(filteredData);
  };

  const handleClearFilters = () => {
    setSelectedDoctor("");
    setFilteredPrescriptionData(userPrescriptionData);
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
              title="Prescriptions"
                breadcrumbs={[
                  { label: "All Patients", path: "/patient" },
                  { label: "Patient", path: `/userProfile/${id}`, active: false },
                  { label: "Prescriptions", active: true }
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
                    <h2 className="text-[18px] font-bold text-[#393939]">Prescription</h2>
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
                    {/* Sort Dropdown */}
                    <Box className="relative">
                      <select
                        value={selectedDoctor}
                        onChange={handleSelectChange}
                        className="h-[50px] px-4 pr-10 rounded-[10px] border border-[#5886a5] text-[#5886a5] text-[16px] font-normal bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#4164df]"
                        style={{ minWidth: "158px" }}
                      >
                        <option value="">Sort by</option>
                        {Array.isArray(doctorOptions) &&
                          doctorOptions.map((doctor, index) => (
                            <option key={index} value={doctor.id}>
                              {doctor.name}
                            </option>
                          ))}
                      </select>
                      <Box className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path d="M7.5 11.25L2.5 3.75H12.5L7.5 11.25Z" fill="#5886a5" />
                        </svg>
                      </Box>
                    </Box>

                    {/* Clear Filters */}
                    <button
                      onClick={handleClearFilters}
                      className="text-[16px] font-semibold text-[#5886a5] underline hover:text-[#4164df] transition-colors"
                    >
                      Clear filters
                    </button>
                  </Flex>

                  {/* Upload Button */}
                  <Button
                    variant="solid"
                    onClick={openModal}
                    className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9]"
                  >
                    Upload
                  </Button>
                </Flex>

                {/* Table */}
                <Box className="overflow-x-auto">
                  {/* Table Header */}
                  <Box className="bg-[#5886a5] rounded-[5px] px-[70px] py-4 mb-0">
                    <Flex justify="between" align="center" className="text-white text-[16px] font-semibold">
                      <Box style={{ flex: "0 0 150px" }}>Date</Box>
                      <Box style={{ flex: "0 0 200px" }}>Prescribing doctor</Box>
                      <Box style={{ flex: "0 0 150px", textAlign: "center" }}>Prescription</Box>
                      <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Actions</Box>
                    </Flex>
                  </Box>

                  {/* Table Body */}
                  <Box>
                    {filteredPrescriptionData.length > 0 ? (
                      filteredPrescriptionData.map((prescriptionItem, index) => (
                        <Box
                          key={index}
                          className="bg-white border-b border-gray-100 px-[70px] py-5 hover:bg-gray-50 transition-colors"
                        >
                          <Flex justify="between" align="center">
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              {formatDate(prescriptionItem.Date)}
                            </Box>
                            <Box style={{ flex: "0 0 200px" }} className="text-[16px] font-semibold text-[#989898]">
                              {prescriptionItem.prescriptionGivenByName}
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="flex justify-center">
                              {prescriptionItem.Prescription &&
                              prescriptionItem.Prescription.endsWith(".pdf") ? (
                                  <Box
                                    className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openFileModal(prescriptionItem.id, prescriptionItem.Prescription)}
                                  >
                                    <FaFilePdf className="text-white text-2xl" />
                                  </Box>
                              ) : (
                                  <Box
                                    className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openFileModal(prescriptionItem.id, prescriptionItem.Prescription)}
                                  >
                                    <img
                                      src={prescriptionItem?.Prescription}
                                      alt="Prescription"
                                      className="w-full h-full object-cover"
                                    />
                                  </Box>
                              )}
                            </Box>
                            <Box style={{ flex: "0 0 100px" }} className="flex justify-center">
                              <button
                                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                                onClick={() => handleDelete(prescriptionItem.id, email)}
                              >
                                <BsTrash size={24} />
                              </button>
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    ) : (
                      <Box className="bg-white px-[70px] py-8 text-center">
                        <p className="text-[#989898] text-[16px] italic">No Prescription found</p>
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
        <PrescriptionModal
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
          fileType="Prescription"
          title="Prescription View"
        />
      )}
    </ThemeProvider>
  );
};

export default Userprescription;
