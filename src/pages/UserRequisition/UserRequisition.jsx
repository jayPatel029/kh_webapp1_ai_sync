/**
 * Requisition Reports Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/UserRequisition/UserRequisition.jsx
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import { Box, Flex, Button as ButtonPrimitive } from "../../component-library";
import { SortDropdown } from "../../component-library/primitives";

// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";

// Page Components
import RequisitionModal from "./RequisitionModal";
import FileViewModal from "../../components/modals/FileViewModal";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";

// Icons
import { BsTrash } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
import sortIcon from "../../assets/Sort_Amount_Up.svg";

// Import design system styles
import "../../design-system/styles/index.css";

const REQUISITION_SORT_OPTIONS = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
];

const UserRequisition = () => {
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
    <PatientDetailLayout
      title="Requisition Details"
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate("/patient")}
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
          {sortedRequisitionData.length > 0 ? (
            sortedRequisitionData.map((requisitionItem, index) => (
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
    </PatientDetailLayout>
  );
};

export default UserRequisition;
