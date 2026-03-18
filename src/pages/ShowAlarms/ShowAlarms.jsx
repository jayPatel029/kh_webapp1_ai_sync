/**
 * ShowAlarms Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/ShowAlarms/ShowAlarms.jsx
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Component Library
import { Box, Flex, Button, SortDropdown } from "../../component-library";
import { Button as ButtonPrimitive } from "../../component-library/primitives/Button";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";
import UnifiedListTable from "../../components/table/UnifiedListTable";

// Page Components
import AlarmModal from "./AlarmModal";
import EditAlarmModal from "./EditAlarmModal";
import DoctorAlarmModal from "./DoctorAlarmModal";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { deleteAlarm, getAlarmByPatientId } from "../../ApiCalls/alarmsApis";
import { approveOrDisapprovePrescription } from "../../ApiCalls/alertsApis";
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";
import { isDoctorRole } from "../../ApiCalls/authapis";

// Icons
import { BsTrash, BsPencilSquare } from "react-icons/bs";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Cache
import { usePageCache, PAGE_CACHE } from "../../cache";
import PageSkeleton from "../../components/PageSkeleton";

// Import design system styles
import "../../design-system/styles/index.css";
import { Sort } from "@mui/icons-material";

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

  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.SHOW_ALARMS);

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

  const handleDeleteAlarm = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this alarm?"
    );
    if (isConfirmed) {
      try {
        const result = await mutate(() => deleteAlarm(id));
        if (result.success) {
          setUserAlarmData((prevData) =>
            prevData.filter((alarm) => alarm.id !== id)
          );
          await fetchData(true);
        } else {
          throw new Error("Delete failed");
        }
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
    const result = await mutate(() => approveOrDisapprovePrescription(reqbody), {
      waitForRefetch: true,
      refetchKeys: [`alarms_${patientId}`],
    });
    if (result.success) {
      await fetchData(true);
      alert(status === "Approved" ? "Prescription Approved Successfully" : "Prescription Rejected Successfully");
    } else {
      alert("Failed to update prescription status");
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

  const fetchData = async (forceRefresh = false) => {
    try {
      const result = await fetchWithCache(`alarms_${patientId}`, () => getAlarmByPatientId(patientId), { forceRefresh });
      if (result.success) {
        setUserAlarmData(result.data.data || result.data || []);
        setDosesData(result.data.doses);
      }
    } catch (error) {
      console.error("Error fetching alarm data:", error);
    }
  };

  const fetchPatientData = async (forceRefresh = false) => {
    try {
      const response = await fetchWithCache(`patient_${patientId}`, () => getPatientGetPatientByid(patientId), { forceRefresh });
      if (response.success) {
        setUserData(response?.data?.data || response?.data || {});
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    const isDoctorfunc = async () => {
      const response = await isDoctorRole();
      if (response.success) {
        setIsDoctor(response.data.data);
      }
    };

    fetchData();
    fetchPatientData();
    isDoctorfunc();
  }, [refreshKey]);

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

  // Prepare columns for UnifiedListTable
  const alarmColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "type", label: "Type", type: "text", width: "150px" },
    { key: "duration", label: "Duration", type: "text", width: "150px" },
    { key: "monthly", label: "Monthly", type: "text", width: "100px" },
    { key: "status", label: "Status", type: "text", width: "100px" },
    ...(isDoctor ? [] : [{ key: "actions", label: "Actions", type: "actions", width: "100px" }]),
  ];

  // Transform alarm data for table
  const transformedAlarmData = userAlarmData.map((alarm) => ({
    id: alarm.id,
    date: alarm.dateadded,
    type: alarm.type || "No type available",
    duration: alarm.time,
    monthly: alarm.timesamonth || "Not specified",
    status: alarm.status,
  }));

  if (loading) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  return (
    <PatientDetailLayout
      title={"Alarms"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {/* Add Alarm Button */}
      <Flex justify="between" align="center" className={isMobile ? "mb-3" : "mb-6"}>

        <SortDropdown
          options={[
            { label: "Date Added (Newest)", value: "date_desc" },
            { label: "Date Added (Oldest)", value: "date_asc" },
            { label: "Type (A-Z)", value: "type_asc" },
            { label: "Type (Z-A)", value: "type_desc" },
          ]}
          onChange={(value) => {
            let sortedData = [...transformedAlarmData];
            switch (value) {
              case "date_desc":
                sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
              case "date_asc":
                sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
              case "type_asc":
                sortedData.sort((a, b) => a.type.localeCompare(b.type));
                break;
              case "type_desc":
                sortedData.sort((a, b) => b.type.localeCompare(a.type));
                break;
              default:
                break;
            }
            setUserAlarmData(sortedData);
          }}
          className="mr-4"
        />

        <ButtonPrimitive
          variant="solid"
          rightIcon={<div className="text-md">+</div>}
          onClick={openModal}
          className={`${isMobile ? 'h-[38px] px-4 rounded-[8px] text-[13px]' : 'h-[50px] px-6 rounded-[10px] text-[16px]'} bg-[#4164df] text-white font-semibold hover:bg-[#3451c9] flex items-center gap-8`}
        >
          Add alarm
        </ButtonPrimitive>
      </Flex>

      {/* Unified Table - handles both mobile and desktop */}
      <UnifiedListTable
        columns={alarmColumns}
        data={transformedAlarmData}
        onEdit={(row) => {
          const originalAlarm = userAlarmData.find((a) => a.id === row.id);
          openEditModal(originalAlarm);
        }}
        onDelete={(row) => handleDeleteAlarm(row.id)}
        displayMode="auto"
        cardTitleKey="type"
        cardSubtitleKey="date"
        cardFieldKeys={["duration", "monthly", "status"]}
        emptyMessage="No Alarms found"
        actionButtons={!isDoctor}
      />

      {/* Modals */}
      {showModal && (
        <AlarmModal
          closeModal={closeModal}
          pid={patientId}
          patient={userData}
          mutate={mutate}
          onSuccess={() => fetchData(true)}
        />
      )}

      {showEditModal && !isDoctor && (
        <EditAlarmModal
          closeModal={closeEditModal}
          alarmData={editData}
          pid={patientId}
          dosesData={dosesData}
          mutate={mutate}
          onSuccess={() => fetchData(true)}
        />
      )}

      {showDoctorModal && isDoctor && (
        <DoctorAlarmModal
          closeModal={closeDoctorModal}
          alarmData={editData}
          pid={patientId}
          mutate={mutate}
          onSuccess={() => fetchData(true)}
        />
      )}
    </PatientDetailLayout>
  );
};

export default ShowAlarms;
