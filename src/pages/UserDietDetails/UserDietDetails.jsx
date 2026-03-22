/**
 * Diet Details Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/UserDietDetails/UserDietDetails.jsx
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Component Library
import { Box, Flex, Button as ButtonPrimitive } from "../../component-library";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";
import UnifiedListTable from "../../components/table/UnifiedListTable";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Page Components
import DietModal from "./DietModal";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import {
  getDietdetailsGetPatientDietDetailsAdminByid,
  deleteDietdetailsDeleteDietDetailsByid,
  getPatientGetPatientByid,
} from "../../ApiCalls/remainingApis";

// Icons
import { BsTrash } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";

// Cache
import { usePageCache, PAGE_CACHE } from "../../cache";
import PageSkeleton from "../../components/PageSkeleton";

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
  const { isMobile } = useIsMobile();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.USER_DIET);

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
    try {
      const result = await fetchWithCache('diet_' + id, () => getDietdetailsGetPatientDietDetailsAdminByid(id), { forceRefresh });
      if (result.success) {
        setDietData(result?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching diet data:", error);
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

  const deleteDietDetails = async (dietId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete these diet details?"
    );
    if (isConfirmed) {
      try {
        const result = await mutate(() => deleteDietdetailsDeleteDietDetailsByid(dietId));
        if (!result.success) {
          throw new Error("Delete failed");
        }
        await fetchData(true); // Refresh data + cache with latest server state
      } catch (error) {
        console.error("Error deleting diet details:", error);
        alert("Failed to delete diet details. Please try again.");
      }
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" rows={5} />;
  }

  // Prepare columns for UnifiedListTable
  const dietColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "type", label: "Report type", type: "text", width: "200px" },
    { key: "desc", label: "Description", type: "text", width: "200px" },
    { key: "image", label: "Report", type: "custom", width: "150px", render: (row) => (
      <div className="flex justify-start"> {row.meal_img && row.meal_img.endsWith(".pdf") ? (
          <div
            className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.meal_img)}
          >
            <FaFilePdf className="text-white text-2xl" />
          </div>
        ) : (
          <div
            className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.meal_img)}
          >
            <img
              src={row.meal_img}
              alt="Diet"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    ) },
    { key: "actions", label: "Actions", type: "actions", width: "100px" },
  ];

  // Transform diet data for table
  const transformedDietData = dietData.map((item) => ({
    id: item.id,
    date: item.Date,
    type: item.Meal_Type,
    desc: item.meal_desc,
    image: item.meal_img,
    meal_img: item.meal_img,
  }));

  return (
    <PatientDetailLayout
             title={"Diet reports"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {/* Upload Section */}
      <Flex justify="end" className={isMobile ? 'mb-3' : 'mb-6'}>
        {role?.role_name !== "Doctor" && (
          <ButtonPrimitive
            variant="solid"
            onClick={openModal}
            className={`${isMobile ? 'h-[40px] px-4 text-[13px] rounded-lg w-full' : 'h-[50px] px-6 rounded-[10px] text-[16px]'} bg-[#4164df] text-white font-semibold hover:bg-[#3451c9]`}
          >
            Upload
          </ButtonPrimitive>
        )}
      </Flex>

      {/* Table */}
      <UnifiedListTable
        columns={dietColumns}
        data={transformedDietData}
        onDelete={(row) => deleteDietDetails(row.id)}
        displayMode="auto"
        cardTitleKey="type"
        cardSubtitleKey="date"
        cardFieldKeys={["desc"]}
        emptyMessage="No diet details found"
        actionButtons={true}
      />

      {/* Modals */}
      {showModal && (
        <DietModal
          closeModal={closeModal}
          user_id={id}
          userData={userData}
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
          fileType="Diet Details"
          title="Diet Details View"
        />
      )}
    </PatientDetailLayout>
  );
};

export default UserDietDetails;
