/**
 * ShowAlarms Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/ShowAlarms/ShowAlarms.jsx
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Component Library
import { Box, Flex, Button } from "../../component-library";
import { Button as ButtonPrimitive } from "../../component-library/primitives/Button";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";
import PatientDetailTable from "../common/PatientDetailTable";

// Page Components
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

  const { pid, id } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = pid || id || searchParams.get("patientId");
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
        `${server_url}/alarms/byPatientId/${patientId}`
      );
      setUserAlarmData(result.data.data);
      setDosesData(result.data.doses);
    } catch (error) {
      console.error("Error fetching alarm data:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${patientId}`);
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
        const chatResult = await getAllChatsAdmin(patientId);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [patientId]);

  const AlarmRow = ({ alarm }) => {
    const alarmId = localStorage.getItem("alarmId");
    const isHighlighted = alarmId && parseInt(alarmId) === alarm.id;

    return (
      <Box className={`bg-white border-b border-gray-100 px-[50px] py-5 hover:bg-gray-50 transition-colors ${isHighlighted ? "bg-green-50" : ""}`}>
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
    <PatientDetailLayout
      title="Alarm Details"
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {/* Add Alarm Button */}
      <Flex justify="end" align="center" className="mb-6">
        <ButtonPrimitive
          variant="solid"
          rightIcon={<div className="text-md">+</div>}
          onClick={openModal}
          className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9] flex items-center gap-8"
        >
          Add alarm
        </ButtonPrimitive>
      </Flex>

      {/* Table */}
      <PatientDetailTable
        columns={[
          { key: "date", label: "Date", flex: "0 0 150px" },
          { key: "type", label: "Type", flex: "0 0 150px" },
          { key: "duration", label: "Duration", flex: "0 0 150px", textAlign: "center" },
          { key: "monthly", label: "Monthly", flex: "0 0 100px" },
          { key: "status", label: "Status", flex: "0 0 100px" },
          { key: "actions", label: "Actions", flex: "0 0 100px", textAlign: "center", hidden: isDoctor },
        ]}
        data={userAlarmData}
        renderRow={(alarm) => <AlarmRow key={alarm.id} alarm={alarm} />}
        emptyMessage="No Alarms found"
      />

      {/* Modals */}
      {showModal && <AlarmModal closeModal={closeModal} pid={patientId} />}

      {showEditModal && !isDoctor && (
        <EditAlarmModal
          closeModal={closeEditModal}
          alarmData={editData}
          pid={patientId}
          dosesData={dosesData}
        />
      )}

      {showDoctorModal && isDoctor && (
        <DoctorAlarmModal
          closeModal={closeDoctorModal}
          alarmData={editData}
          pid={patientId}
        />
      )}
    </PatientDetailLayout>
  );
};

export default ShowAlarms;
