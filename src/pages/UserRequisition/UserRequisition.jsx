/**
 * Requisition Reports Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/UserRequisition/UserRequisition.jsx
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Component Library
import { Box, Flex, Button as ButtonPrimitive } from "../../component-library";
import { SortDropdown } from "../../component-library/primitives";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";
import UnifiedListTable from "../../components/table/UnifiedListTable";

// Page Components
import RequisitionModal from "./RequisitionModal";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import {
  getPatientGetPatientByid,
  getRequisitionGetRequisitionByid,
  deleteRequisitionById,
} from "../../ApiCalls/remainingApis";

// Icons
import { BsTrash } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
import sortIcon from "../../assets/Sort_Amount_Up.svg";

// Import design system styles
import "../../design-system/styles/index.css";

import { useIsMobile } from "../../components/mobile/useIsMobile";

// Cache
import { usePageCache, PAGE_CACHE } from "../../cache";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import PageSkeleton from "../../components/PageSkeleton";

const REQUISITION_SORT_OPTIONS = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
];

const UserRequisition = () => {
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [userRequisitionData, setUserRequisitionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [selectedSort, setSelectedSort] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.USER_REQUISITION);

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

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const response = await fetchWithCache('requisition_' + id, () => getRequisitionGetRequisitionByid(id), { forceRefresh });
      if (response.success) {
        setUserRequisitionData(response?.data?.data || []);
      } else {
        setUserRequisitionData([]);
      }
    } catch (error) {
      console.error("Error fetching requisition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async (forceRefresh = false) => {
    try {
      const response = await fetchWithCache('patient_' + id, () => getPatientGetPatientByid(id), { forceRefresh });
      if (response.success) {
        setUserData(response?.data?.data || {});
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const sortedRequisitionData = useMemo(() => {
    if (!userRequisitionData || userRequisitionData.length === 0) {
      return [];
    }
    if (!selectedSort) {
      return userRequisitionData;
    }
    const baseData = [...userRequisitionData];
    baseData.sort((a, b) => {
      const aTime = new Date(a.Date).getTime() || 0;
      const bTime = new Date(b.Date).getTime() || 0;
      return selectedSort === "latest" ? bTime - aTime : aTime - bTime;
    });
    return baseData;
  }, [selectedSort, userRequisitionData]);

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
  }, [id, refreshKey]);

  const handleDelete = async (requisitionId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this requisition?"
    );
    if (isConfirmed) {
      try {
        const response = await mutate(() => deleteRequisitionById(requisitionId, {
          data: {
            email: email,
          },
        }));

        if (!response.success) {
          throw new Error(response?.data?.message || "Delete failed");
        }

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
    return <PageSkeleton variant="table" rows={5} />;
  }

  // Prepare columns for UnifiedListTable
  const requisitionColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "requisition", label: "Requisition", type: "custom", width: "150px", render: (row) => (
      <div className="flex justify-start"> {row.Requisition && row.Requisition.endsWith(".pdf") ? (
          <div
            className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.Requisition)}
          >
            <FaFilePdf className="text-white text-2xl" />
          </div>
        ) : (
          <div
            className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.Requisition)}
          >
            <img
              src={row.Requisition}
              alt="Requisition"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    ) },
    { key: "actions", label: "Actions", type: "actions", width: "100px" },
  ];

  // Transform requisition data for table
  const transformedRequisitionData = sortedRequisitionData.map((item) => ({
    id: item.id,
    date: item.Date,
    requisition: item.Requisition,
    Requisition: item.Requisition,
  }));

  return (
    <PatientDetailLayout
      title={"Requisitions"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
      rightAction={<RefreshButton pageName={PAGE_CACHE.USER_REQUISITION.name} />}
    >
      {/* Sort Controls + Upload (single row) */}
      <Flex align="center" justify="between" className="mb-5 gap-4 flex-wrap">
        <Flex align="center" gap={3} className="flex-wrap items-center">
          <Box className="flex items-center rounded-[8px] py-1">

            <SortDropdown
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              options={REQUISITION_SORT_OPTIONS}
              placeholder="Sort by"
              icon={<img src={sortIcon} alt="Sort icon" />}
              style={{ minWidth: 220 }}
            />
          </Box>

          {selectedSort && (
            <button
              onClick={() => setSelectedSort("")}
              className="text-[16px] font-semibold text-[#5886a5] underline hover:text-[#4164df] transition-colors"
            >
              Clear filters
            </button>
          )}
        </Flex>

        {role?.role_name !== "Dialysis Technician" && (
          <ButtonPrimitive
            variant="solid"
            onClick={openModal}
            className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9]"
          >
            Upload
          </ButtonPrimitive>
        )}
      </Flex>

      {/* Table */}
      <UnifiedListTable
        columns={requisitionColumns}
        data={transformedRequisitionData}
        onDelete={(row) => handleDelete(row.id, email)}
        displayMode="auto"
        cardTitleKey="date"
        cardSubtitleKey="requisition"
        cardFieldKeys={[]}
        emptyMessage="No Requisition found"
        actionButtons={role?.role_name !== "Dialysis Technician"}
      />

      {/* Modals */}
      {showModal && (
        <RequisitionModal
          closeModal={closeModal}
          user_id={id}
          mutate={mutate}
          onSuccess={() => fetchData(true)}
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
    </PatientDetailLayout>
  );
};

export default UserRequisition;
