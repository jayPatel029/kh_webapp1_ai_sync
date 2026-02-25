/**
 * Prescription Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/Userprescription/Userprescription.jsx
 */

import React, { useState, useEffect } from "react";
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
import PrescriptionModal from "./PrescriptionModal";
import FileViewModal from "../../components/modals/FileViewModal";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// APIs and Helpers
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { getPrescriptionsById, deletePrescriptionByRoute, addPrescriptionComment } from "../../ApiCalls/prescriptionApis";
import { getPatientGetPatientByid, getPatientGetMedicalTeamByid } from "../../ApiCalls/remainingApis";

// Icons
import { BsTrash } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
import sortIcon from "../../assets/Sort_Amount_Up.svg";

// Import design system styles
import "../../design-system/styles/index.css";

const Userprescription = () => {
  const [showModal, setShowModal] = useState(false);
  const [userPrescriptionData, setUserPrescriptionData] = useState([]);
  const [filteredPrescriptionData, setFilteredPrescriptionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const doctorDropdownOptions = doctorOptions.map((doctor) => ({
    value: String(doctor.id),
    label: doctor.name,
  }));

  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const email = localStorage.getItem("email");
  const { isMobile } = useIsMobile();

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
      const response = await getPrescriptionsById(id);
      if (response.success) {
        setUserPrescriptionData(response?.data?.data || []);
        setFilteredPrescriptionData(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await getPatientGetPatientByid(id);
      if (response.success) {
        setUserData(response?.data?.data || {});
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchMedicalTeam = async (user_id) => {
    setLoading(true);
    try {
      const response = await getPatientGetMedicalTeamByid(user_id);
      if (response.success) {
        setDoctorOptions(response?.data?.data || []);
      }
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
        const result = await deletePrescriptionByRoute(prescriptionId);
        if (!result.success) {
          throw new Error("Delete failed");
        }

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

  const handleAddComment = async (prescriptionId) => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await addPrescriptionComment(prescriptionId, {
        comment: commentText,
        email: email,
      });
      if (res.success) {
        setCommentText("");
        setCommentingId(null);
        fetchData();
      } else {
        alert("Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <Box className="p-20 text-center">Loading...</Box>;
  }

  // Prepare columns for UnifiedListTable
  const prescriptionColumns = [
    { key: "date", label: "Date", type: "date", width: "150px" },
    { key: "doctor", label: "Prescribing doctor", type: "text", width: "200px" },
    { key: "prescription", label: "Prescription", type: "custom", width: "150px", render: (row) => (
      <div className="flex justify-start"> {row.Prescription && row.Prescription.endsWith(".pdf") ? (
          <div
            className="w-[56px] h-[80px] bg-black rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.Prescription)}
          >
            <FaFilePdf className="text-white text-2xl" />
          </div>
        ) : (
          <div
            className="w-[56px] h-[80px] bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openFileModal(row.id, row.Prescription)}
          >
            <img
              src={row.Prescription}
              alt="Prescription"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    ) },
    { key: "actions", label: "Actions", type: "actions", width: "100px" },
  ];

  // Transform prescription data for table
  const transformedPrescriptionData = filteredPrescriptionData.map((item) => ({
    id: item.id,
    date: item.Date,
    doctor: item.prescriptionGivenByName,
    prescription: item.Prescription,
    Prescription: item.Prescription,
  }));

  return (
    <PatientDetailLayout
             title={"Prescriptions"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      loading={loading}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {/* Filter and Upload Section */}
      <Flex
        justify="between"
        align={isMobile ? "start" : "center"}
        direction={isMobile ? "column" : "row"}
        gap={isMobile ? 3 : 0}
        className="mb-4"
      >
        <Flex gap={isMobile ? 2 : 4} align="center" wrap={isMobile ? "wrap" : "nowrap"}>
          <SortDropdown
            value={selectedDoctor}
            onChange={handleSelectChange}
            options={doctorDropdownOptions}
            icon={<img src={sortIcon} alt="Sort" />}
            placeholder="Sort by"
          />
          <button
            onClick={handleClearFilters}
            className={`${isMobile ? 'text-[13px]' : 'text-[16px]'} font-semibold text-[#5886a5] underline hover:text-[#4164df] transition-colors`}
          >
            Clear filters
          </button>
        </Flex>
        <ButtonPrimitive
          variant="solid"
          onClick={openModal}
          className={`${isMobile ? 'h-[40px] px-4 text-[13px] rounded-lg w-full' : 'h-[50px] px-6 rounded-[10px] text-[16px]'} bg-[#4164df] text-white font-semibold hover:bg-[#3451c9]`}
        >
          Upload
        </ButtonPrimitive>
      </Flex>

      {/* Mobile Card View */}
      <UnifiedListTable
        columns={prescriptionColumns}
        data={transformedPrescriptionData}
        onDelete={(row) => handleDelete(row.id, email)}
        isLoading={loading}
        displayMode="auto"
        cardTitleKey="doctor"
        cardSubtitleKey="date"
        cardFieldKeys={[]}
        emptyMessage="No Prescription found"
        actionButtons={true}
      />

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
          // fileType="Prescription"
          title="Prescription View"
        />
      )}
    </PatientDetailLayout>
  );
};

export default Userprescription;
