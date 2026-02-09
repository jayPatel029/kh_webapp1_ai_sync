/**
 * ShowAlarms Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/ShowAlarms/ShowAlarms.jsx
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
import SideBarDoctor from "../../components/sidebar/Sidebar";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import AlarmModal from "./AlarmModal";
import EditAlarmModal from "./EditAlarmModal";
import DoctorAlarmModal from "./DoctorAlarmModal";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";

// Icons
import { BsTrash, BsPencilSquare } from "react-icons/bs";

// Import design system styles
import "../../design-system/styles/index.css";

const ShowAlarms = () => {
  const [showModal, setShowModal] = useState(false);
  const [userAlarmData, setUserAlarmData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openAlarmId, setOpenAlarmId] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [dosesData, setDosesData] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [loading, setLoading] = useState(false);

  const { pid } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openEditModal = (data) => {
    setEditData(data);
    setOpenAlarmId(data.id);
    setShowEditModal(true);
  };

  const closeEditModal = () => setShowEditModal(false);

  const openDoctorModal = (data) => {
    setEditData(data);
    setShowDoctorModal(true);
  };

  const closeDoctorModal = () => setShowDoctorModal(false);

  const deleteAlarm = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this alarm?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(`${server_url}/alarms/${id}`);
        setUserAlarmData((prevData) =>
          prevData.filter((alarm) => alarm.id !== id)
        );
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to delete alarm. Please try again.");
      }
    }
  };

  const approveAlarm = async (id, status) => {
    const reqbody = {
      alarmId: id,
      status: status,
    };
    const result = await axiosInstance.put(
      `${server_url}/alerts/approveOrDisapprovePrescription`,
      reqbody
    );
    if (status === "Approved") {
      alert("Prescription Approved Successfully");
      window.location.reload();
    } else {
      alert("Prescription Rejected Successfully");
      window.location.reload();
    }
  };

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
        `${server_url}/alarms/byPatientId/${pid}`
      );
      setUserAlarmData(result.data.data);
      setDosesData(result.data.doses);
    } catch (error) {
      console.error("Error fetching alarm data:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${pid}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    const isDoctorfunc = async () => {
      const response = await axiosInstance.get(`${server_url}/roles/isDoctor`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIsDoctor(response.data.data);
    };

    fetchData();
    fetchPatientData();
    isDoctorfunc();
  }, [showModal, showEditModal, showDoctorModal]);

  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(pid);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [pid]);

  const AlarmRow = ({ alarm }) => {
    const alarmId = localStorage.getItem("alarmId");
    const isHighlighted = alarmId && parseInt(alarmId) === alarm.id;

    return (
      <Box
        className={`bg-white border-b border-gray-100 px-[50px] py-5 hover:bg-gray-50 transition-colors ${isHighlighted ? "bg-green-50" : ""
          }`}
      >
        <Flex justify="between" align="center">
          <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
            {formatDate(alarm.dateadded)}
          </Box>
          <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
            {alarm.type || "No type available"}
          </Box>
          <Box style={{ flex: "0 0 150px", textAlign: "center" }} className="text-[16px] font-semibold text-[#989898]">
            {alarm.time}
          </Box>
          <Box style={{ flex: "0 0 100px" }} className="text-[16px] font-semibold text-[#989898]">
            {alarm.timesamonth || "Not specified"}
          </Box>
          <Box style={{ flex: "0 0 100px" }} className="text-[16px] font-semibold text-[#989898]">
            {alarm.status}
          </Box>
          {!isDoctor && (
            <Box style={{ flex: "0 0 100px" }} className="flex justify-center gap-2">
              <button
                className="text-[#87ca9c] hover:text-[#6bb382] transition-colors"
                onClick={() => openEditModal(alarm)}
              >
                <BsPencilSquare size={20} />
              </button>
              <button
                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                onClick={() => deleteAlarm(alarm.id)}
              >
                <BsTrash size={20} />
              </button>
            </Box>
          )}
        </Flex>
      </Box>
    );
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
                  { label: "Patient", path: `/userProfile/${pid}`, active: false },
                  { label: "Alarms", active: true }
                ]}
                onBack={() => navigate("/patient")}
              />
            </Container>

            {/* Navigation Tabs */}
            <PatientNavTabs
              patientId={pid}
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
                    <h2 className="text-[18px] font-bold text-[#393939]">Alarms</h2>
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

                {/* Add Alarm Button */}
                <Flex justify="end" align="center" className="mb-6">
                  <Button
                    variant="solid"
                    onClick={openModal}
                    className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9] flex items-center gap-2"
                  >
                    Add alarm
                    <span className="text-xl">+</span>
                  </Button>
                </Flex>

                {/* Table */}
                <Box className="overflow-x-auto">
                  {/* Table Header */}
                  <Box className="bg-[#5886a5] rounded-[5px] px-[50px] py-4 mb-0">
                    <Flex justify="between" align="center" className="text-white text-[16px] font-semibold">
                      <Box style={{ flex: "0 0 150px" }}>Date</Box>
                      <Box style={{ flex: "0 0 150px" }}>Type</Box>
                      <Box style={{ flex: "0 0 150px", textAlign: "center" }}>Duration</Box>
                      <Box style={{ flex: "0 0 100px" }}>Monthly</Box>
                      <Box style={{ flex: "0 0 100px" }}>Status</Box>
                      {!isDoctor && <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Actions</Box>}
                    </Flex>
                  </Box>

                  {/* Table Body */}
                  <Box>
                    {userAlarmData.length > 0 ? (
                      userAlarmData.map((alarm) => (
                        <AlarmRow
                          key={alarm.id}
                          alarm={alarm}
                        />
                      ))
                    ) : (
                      <Box className="bg-white px-[50px] py-8 text-center">
                        <p className="text-[#989898] text-[16px] italic">No Alarms found</p>
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
        <AlarmModal closeModal={closeModal} pid={pid} />
      )}

      {showEditModal && !isDoctor && (
        <EditAlarmModal
          closeModal={closeEditModal}
          alarmData={editData}
          pid={pid}
          dosesData={dosesData}
        />
      )}

      {showDoctorModal && isDoctor && (
        <DoctorAlarmModal
          closeModal={closeDoctorModal}
          alarmData={editData}
          pid={pid}
        />
      )}
    </ThemeProvider>
  );
};

export default ShowAlarms;
