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
import { Flex, SortDropdown } from "../../component-library";
import { Button as ButtonPrimitive } from "../../component-library/primitives/Button";
import RefreshButton from "../../components/RefreshButton/RefreshButton";

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
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";
import { isRole } from "../../helpers/roleUtils";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Cache
import { usePageCache, PAGE_CACHE } from "../../cache";
import PageSkeleton from "../../components/PageSkeleton";

// Import design system styles
import "../../design-system/styles/index.css";

const ShowAlarms = () => {
  const [showModal, setShowModal] = useState(false);
  const [userAlarmData, setUserAlarmData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [dosesData, setDosesData] = useState(null);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc] = useState(0);
  const [loading] = useState(false);

  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  // Wait until permissions are loaded so Add Alarm doesn't flash then vanish for doctors
  const roleReady = Boolean(role?.isLoaded);
  const isDoctor = isRole(role, "Doctor");
  const canManageAlarms = roleReady && !isDoctor;
  const showRowActions = roleReady;
  const { isMobile } = useIsMobile();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.SHOW_ALARMS);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openEditModal = (data) => {
    setEditData(data);
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

  const fetchData = async () => {
    try {
      const result = await getAlarmByPatientId(patientId);
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
      const response = await fetchWithCache(
        `patient_${patientId}`,
        () => getPatientGetPatientByid(patientId),
        { forceRefresh }
      );
      if (response.success) {
        setUserData(response?.data?.data || response?.data || {});
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPatientData();
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

  const alarmColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "type", label: "Type", type: "text", width: "150px" },
    { key: "duration", label: "Duration", type: "text", width: "150px" },
    { key: "monthly", label: "Monthly", type: "text", width: "100px" },
    { key: "status", label: "Status", type: "text", width: "100px" },
    ...(showRowActions
      ? [{ key: "actions", label: "Actions", type: "actions", width: "100px" }]
      : []),
  ];

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
      rightAction={<RefreshButton pageName={PAGE_CACHE.SHOW_ALARMS.name} />}
    >
      <Flex justify="between" align="center" className={isMobile ? "mb-3" : "mb-6"}>
        <SortDropdown
          options={[
            { label: "Date Added (Newest)", value: "date_desc" },
            { label: "Date Added (Oldest)", value: "date_asc" },
            { label: "Type (A-Z)", value: "type_asc" },
            { label: "Type (Z-A)", value: "type_desc" },
          ]}
          onChange={(value) => {
            setUserAlarmData((prev) => {
              const next = [...prev];
              switch (value) {
                case "date_desc":
                  next.sort(
                    (a, b) => new Date(b.dateadded) - new Date(a.dateadded)
                  );
                  break;
                case "date_asc":
                  next.sort(
                    (a, b) => new Date(a.dateadded) - new Date(b.dateadded)
                  );
                  break;
                case "type_asc":
                  next.sort((a, b) =>
                    String(a.type || "").localeCompare(String(b.type || ""))
                  );
                  break;
                case "type_desc":
                  next.sort((a, b) =>
                    String(b.type || "").localeCompare(String(a.type || ""))
                  );
                  break;
                default:
                  break;
              }
              return next;
            });
          }}
          className="mr-4"
        />

        <Flex align="center" gap={2}>
          {canManageAlarms && (
            <ButtonPrimitive
              variant="solid"
              rightIcon={<div className="text-md">+</div>}
              onClick={openModal}
              className={`${
                isMobile
                  ? "h-[38px] px-4 rounded-[8px] text-[13px]"
                  : "h-[50px] px-6 rounded-[10px] text-[16px]"
              } bg-[#4164df] text-white font-semibold hover:bg-[#3451c9] flex items-center gap-8`}
            >
              Add alarm
            </ButtonPrimitive>
          )}
        </Flex>
      </Flex>

      <UnifiedListTable
        columns={alarmColumns}
        data={transformedAlarmData}
        onEdit={(row) => {
          const originalAlarm = userAlarmData.find((a) => a.id === row.id);
          if (!originalAlarm) return;
          if (isDoctor) {
            openDoctorModal(originalAlarm);
          } else {
            openEditModal(originalAlarm);
          }
        }}
        onDelete={
          canManageAlarms ? (row) => handleDeleteAlarm(row.id) : undefined
        }
        displayMode="auto"
        cardTitleKey="type"
        cardSubtitleKey="date"
        cardFieldKeys={["duration", "monthly", "status"]}
        emptyMessage="No Alarms found"
        actionButtons={showRowActions}
      />

      {showModal && canManageAlarms && (
        <AlarmModal
          closeModal={closeModal}
          pid={patientId}
          patient={userData}
          mutate={mutate}
          onSuccess={() => fetchData(true)}
        />
      )}

      {showEditModal && canManageAlarms && (
        <EditAlarmModal
          closeModal={closeEditModal}
          alarmData={editData}
          pid={patientId}
          patient={userData}
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
