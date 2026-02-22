import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../routes/routeConstants";

// Redesigned components
import NameModal from "./NameModal";
import AilmentModal from "./AilmentModal";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import PatientProfileCard from "../../components/PatientProfileCard";
import ParameterSection from "../../components/ParameterSection";
import ThemeProvider from "../../components/ThemeProvider";

// Component Library
import {
  Box,
  Flex,
  Container,
} from "../../component-library";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Original Layout Components (containing actual logic/content)

// APIs and Helpers
import {
  getPatientGetPatientByid,
  deleteLabreportDeleteLabReadingByid,
  getLabreportLabReadings,
} from "../../ApiCalls/remainingApis";
import getValidImageUrl from "../../helpers/utils";
import { getUsers, identifyRole } from "../../ApiCalls/authapis";
import {
  getPatientById,
  getPatientMedicalTeam,
  getPatientAdminTeam,
  getPatientAilments,
  removeAdminFromPatient,
  updateMedical,
} from "../../ApiCalls/patientAPis";
import { addDoctorToPatient, deleteAssignedDoctor } from "../../ApiCalls/doctorPatientApis";
import { addAdminToPatient, deleteAssignedAdmin } from "../../ApiCalls/adminPatientApis";
import { getDoctors } from "../../ApiCalls/doctorApis";
import { getAdmins } from "../../ApiCalls/authapis";
import { getAllChats, getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { getDoctorsChat } from "../../ApiCalls/doctorApis";
import { getGeneralParameterQuestions, getDialysisParameterQuestions } from "../../ApiCalls/questionApis";

// Legacy components (to be replaced or kept if still needed)
import LineChartComponent from "../../components/Linechart/LineChartComponent";
import LineChartDialysis from "../../components/Linechart/Linechart_Dialysis/LineChartDialysis";
import QuestionsContainer from "../../components/questions/QuestionsContainer";
import Table from "../../components/table/table";
import DialysisTable from "../../components/table/DialysisTable";
import LineChartComponentSys from "../../components/linecomponent-sys-dys/LineChartComponentSys";
import LineChartComponentLab from "../../components/linechartlab/LineChartComponentLab";
import LabRedingUpdateModal from "../../components/modals/LabReadingModal";
import { PatientProfileShellContext } from "../common/PatientProfileShellContext";

function UserProfile() {
  const [totalUnreadCount, settotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, settotalUnreadCountDoc] = useState(0);
  const { id } = useParams();
  const role = useSelector((state) => state.permission);
  const [chats, setChats] = useState([]);
  const [chats1, setChats1] = useState([]);
  const [patient1, setPatient1] = useState({});
  const [patient2, setPatient2] = useState({});
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [adminTeam, setAdminTeam] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showAdminPicker, setShowAdminPicker] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editalimentsModalOpen, setEditalimentsModalOpen] = useState(false);
  const [generalParameters, setGeneralParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialysisParameters, setDialysisParameters] = useState([]);
  const [ailments, setAilments] = useState([]);
  const [labReadings, setLabReadings] = useState([]);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ ailments: [] });
  const [selectedReading, setSelectedReading] = useState(null);

  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const shellContext = useContext(PatientProfileShellContext);
  const isInPatientProfileShell = Boolean(shellContext);
  const WrapperComponent = isInPatientProfileShell ? React.Fragment : ThemeProvider;

  // Keep isSmall synced with isMobile for backward compat (charts aspect ratio etc.)
  const isSmall = isMobile;

  const openLabReadingModal = (title, id) => setSelectedReading({ title, id });
  const closeLabReadingModal = () => setSelectedReading(null);
  const openEditalimentsModal = () => setEditalimentsModalOpen(true);
  const closeEditalimentsModal = () => setEditalimentsModalOpen(false);
  const openEditModal = () => setEditModalOpen(true);
  const closeEditModal = () => setEditModalOpen(false);

  const updateUserData = (updatedData) => {
    setUserData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await getPatientGetPatientByid(id);
      if (response.success) {
        setUserData(response?.data?.data || { ailments: [] });
        setAilments(response?.data?.data?.ailments || []);
      }
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching patient data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteLabReading = async (readingId) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;
    try {
      await deleteLabreportDeleteLabReadingByid(readingId);
      window.location.reload();
    } catch (e) {
      console.error("Error deleting lab reading:", e);
    }
  };

  async function fetchQuestionsForAilment(ailment) {
    try {
      const response = await getGeneralParameterQuestions();
      if (response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  }

  async function fetchQuestionsForAilmentDialysis(ailment) {
    try {
      const response = await getDialysisParameterQuestions(ailment);
      if (response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching dialysis questions:", error);
      return [];
    }
  }

  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(id);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          settotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [id]);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  useEffect(() => {
    const uniqueQuestionsSet = [];
    const seenIds = new Set();
    if (userData.ailments?.length > 0) {
      Promise.all(
        userData.ailments.map(async (ailment) => {
          const questions = await fetchQuestionsForAilment(ailment);
          questions.forEach((question) => {
            if (!seenIds.has(question.id)) {
              uniqueQuestionsSet.push(question);
              seenIds.add(question.id);
            }
          });
        })
      ).then(() => {
        uniqueQuestionsSet.sort((a, b) => {
          if (a.responseCount && b.responseCount) {
            return a.priority - b.priority;
          }
          return (b.responseCount || 0) - (a.responseCount || 0);
        });
        setGeneralParameters(uniqueQuestionsSet);
      });
    }
  }, [userData.ailments]);

  useEffect(() => {
    const fetchDialysis = async () => {
      if (userData.ailments?.includes("Hemo dialysis") || userData.ailments?.includes("Hemo Dialysis")) {
        const questions = await fetchQuestionsForAilmentDialysis("Hemo dialysis");
        setDialysisParameters(questions);
      }
    };
    fetchDialysis();
  }, [userData.ailments]);

  useEffect(() => {
    const fetchLabReadings = async () => {
      try {
        const response = await getLabreportLabReadings();
        if (response.success) {
          setLabReadings(response?.data?.data || []);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchLabReadings();
  }, []);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const roleResult = await identifyRole();
        const patientRes = await getPatientById(id);
        setPatient1(patientRes.data.data);

        if (roleResult.data.data.role_name === "Admin") {
          const chatResult = await getAllChatsAdmin(id);
          const medicalResult = await getPatientMedicalTeam(id);
          const adminResult = await getPatientAdminTeam(id);
          if (chatResult.success && medicalResult.success) {
            setChats(chatResult.data.filter(c => c.role === "Doctor" || c.role === "Medical Staff"));
            setMedicalTeam(medicalResult.data.data);
          }
          if (adminResult.success) {
            setAdminTeam(adminResult.data?.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };
    fetchChatData();
  }, [id, chats1]);

  useEffect(() => {
    if (chats1.length > 0) {
      settotalUnreadCountDoc(chats1.reduce((total, chat) => total + (chat.unreadCount || 0), 0));
    }
  }, [chats1]);

  const handleUpdateSuccess = () => fetchPatientData();

  // Team Management
  const fetchTeams = async () => {
    try {
      const [medRes, admRes] = await Promise.all([
        getPatientMedicalTeam(id),
        getPatientAdminTeam(id),
      ]);
      if (medRes.success) setMedicalTeam(medRes.data?.data || []);
      if (admRes.success) setAdminTeam(admRes.data?.data || []);
    } catch (e) {
      console.error('Error refreshing teams:', e);
    }
  };

  const handleAssignDoctor = async (doctorId) => {
    try {
      await addDoctorToPatient(id, { doctorId });
      setShowDoctorPicker(false);
      fetchTeams();
    } catch (e) {
      console.error('Error assigning doctor:', e);
    }
  };

  const handleRemoveDoctor = async (assignmentId) => {
    if (!window.confirm('Remove this doctor from the patient?')) return;
    try {
      await deleteAssignedDoctor(assignmentId);
      fetchTeams();
    } catch (e) {
      console.error('Error removing doctor:', e);
    }
  };

  const handleAssignAdmin = async (adminId) => {
    try {
      await addAdminToPatient(id, { adminId });
      setShowAdminPicker(false);
      fetchTeams();
    } catch (e) {
      console.error('Error assigning admin:', e);
    }
  };

  const handleRemoveAdmin = async (assignmentId) => {
    if (!window.confirm('Remove this admin from the patient?')) return;
    try {
      await deleteAssignedAdmin(assignmentId);
      fetchTeams();
    } catch (e) {
      console.error('Error removing admin:', e);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      const res = await getDoctors();
      if (res.success) setAvailableDoctors(res.data?.data || []);
    } catch (e) { console.error(e); }
    setShowDoctorPicker(true);
  };

  const loadAvailableAdmins = async () => {
    try {
      const res = await getAdmins();
      if (res.success) setAvailableAdmins(res.data?.data || res.data || []);
    } catch (e) { console.error(e); }
    setShowAdminPicker(true);
  };

  if (loading) return <Box className="p-20 text-center">Loading...</Box>;

  return (
    <WrapperComponent>
      <Box className="flex-1 flex flex-col w-full z-20 min-w-0">

        {/* Sticky Header Section */}
        {/* <Box className={`sticky ${isMobile ? 'top-0' : 'top-[56px]'} z-20 bg-white`}> */}

          {/* <Flex justify="start" align="center" className={isMobile ? "py-2 px-4" : "py-4 px-6"}> */}

            {/* Header with Breadcrumbs */}
            {!isInPatientProfileShell && (
              <PageHeader
                title={userData?.name || "Patient"}
                breadcrumbs={[
                // { label: "All Patients", path: "/patients" },
                  { label: "Patient", path: ROUTES.patientDetail(id), active: false },
                  { label: userData?.name || "Patient", active: true }
                ]}
                onBack={() => navigate(ROUTES.PATIENTS)}
              />
            )}
          {/* </Flex> */}

          {/* Navigation Tabs */}
          {!isInPatientProfileShell && (
            <PatientNavTabs
              patientId={id}
              userData={userData}
              unreadAdminCount={totalUnreadCount}
              unreadDoctorCount={totalUnreadCountDoc}
              role={role}
            />
          )}

        {/* <Flex className={`py-4 flex-col gap-6 ${isSmall ? "px-4 pb-20" : "px-6"}`}> */}
          {/* Profile Card */}
          <PatientProfileCard
            userData={userData}
            role={role}
            onEditName={openEditModal}
            onEditAilments={openEditalimentsModal}
          />

          {/* Medical & Admin Team */}
          {/* Team Management Section */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medical Team */}
            <Box className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Flex justify="space-between" align="center" className="mb-3">
                <Box as="h3" className="text-lg font-bold text-[#32617d]">Medical Team</Box>
                <button
                  onClick={loadAvailableDoctors}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors font-medium"
                >
                  + Add Doctor
                </button>
              </Flex>

              {showDoctorPicker && (
                <Box className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <select
                    onChange={(e) => e.target.value && handleAssignDoctor(e.target.value)}
                    className="w-full p-2 rounded border border-blue-300 text-sm mb-2"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a doctor...</option>
                    {availableDoctors
                      .filter(d => !medicalTeam.some(m => m.id === d.id || m.doctor_id === d.id))
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.name || d.email} {d.specialization ? `(${d.specialization})` : ''}</option>
                      ))}
                  </select>
                  <button onClick={() => setShowDoctorPicker(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                </Box>
              )}

              <Box className="space-y-2">
                {medicalTeam.length === 0 && <Box className="text-sm text-gray-400 italic">No doctors assigned yet</Box>}
                {medicalTeam.map((member, idx) => (
                  <Flex key={idx} align="center" gap={3} className="p-2 rounded-lg hover:bg-gray-50 group">
                    <Box className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                      {(member.name || member.email || '?')[0].toUpperCase()}
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Box className="text-sm font-medium text-gray-800 truncate">{member.name || member.email}</Box>
                      {member.role && <Box className="text-xs text-gray-500">{member.role}</Box>}
                    </Box>
                    <button
                      onClick={() => handleRemoveDoctor(member.assignment_id || member.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-lg transition-opacity shrink-0"
                      title="Remove doctor"
                    >
                      ×
                    </button>
                  </Flex>
                ))}
              </Box>
            </Box>

            {/* Admin Team */}
            <Box className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Flex justify="space-between" align="center" className="mb-3">
                <Box as="h3" className="text-lg font-bold text-[#32617d]">Admin Team</Box>
                <button
                  onClick={loadAvailableAdmins}
                  className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100 transition-colors font-medium"
                >
                  + Add Admin
                </button>
              </Flex>

              {showAdminPicker && (
                <Box className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <select
                    onChange={(e) => e.target.value && handleAssignAdmin(e.target.value)}
                    className="w-full p-2 rounded border border-green-300 text-sm mb-2"
                    defaultValue=""
                  >
                    <option value="" disabled>Select an admin...</option>
                    {availableAdmins
                      .filter(a => !adminTeam.some(m => m.id === a.id || m.admin_id === a.id))
                      .map(a => (
                        <option key={a.id} value={a.id}>{a.name || a.email}</option>
                      ))}
                  </select>
                  <button onClick={() => setShowAdminPicker(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                </Box>
              )}

              <Box className="space-y-2">
                {adminTeam.length === 0 && <Box className="text-sm text-gray-400 italic">No admins assigned yet</Box>}
                {adminTeam.map((member, idx) => (
                  <Flex key={idx} align="center" gap={3} className="p-2 rounded-lg hover:bg-gray-50 group">
                    <Box className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold shrink-0">
                      {(member.name || member.email || '?')[0].toUpperCase()}
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Box className="text-sm font-medium text-gray-800 truncate">{member.name || member.email}</Box>
                      {member.role && <Box className="text-xs text-gray-500">{member.role}</Box>}
                    </Box>
                    <button
                      onClick={() => handleRemoveAdmin(member.assignment_id || member.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-lg transition-opacity shrink-0"
                      title="Remove admin"
                    >
                      ×
                    </button>
                  </Flex>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Modals */}
          {editModalOpen && (
            <NameModal
              closeEditModal={closeEditModal}
              onSuccess={handleUpdateSuccess}
              initialData={userData}
              updateData={updateUserData}
              user_id={userData.id}
            />
          )}
          {editalimentsModalOpen && (
            // <AilmentModal
            //   closeEditalimentsModal={closeEditalimentsModal}
            //   initialAilments={userData.ailments}
            //   updateData={updateUserData}
            //   user_id={userData.id}
            //   onSuccess={handleUpdateSuccess}
            // />
            <>hi</>
          )}



          {/* Ailment details are now shown inside the PatientProfileCard component */}

          {/* General Parameters */}
          {role?.role_name !== "Dialysis Technician" && userData.program !== "Basic" && (
            <Box className="space-y-6">
              <Box className="flex items-center gap-4">
                {/* <Box className="h-8 w-1 bg-[#4164df] rounded-full" /> */}
              <Box as="h2" className={`${isSmall ? "text-xl" : "text-2xl"} font-bold m-4`}>General Parameters</Box>
              </Box>

              {/* Generic Profile Section */}
              <ParameterSection title="Generic Profile">
                <QuestionsContainer aliment="Generic Profile" user_id={id} />
              </ParameterSection>

              {generalParameters
                .filter(q => !q.title.toLowerCase().includes("diastolic"))
                .map((question, index) => {
                  let questionTitle = question.title;
                  if (question.title.toLowerCase().includes("systolic")) {
                    questionTitle = questionTitle.replace(/systolic/i, "Systolic and Diastolic");
                  }

                  return (
                    <ParameterSection
                      key={index}
                      title={questionTitle}
                      noResponse={question.responseCount === 0}
                    >
                      {question.isGraph === 1 ? (
                        question.title.toLowerCase().includes("systolic") ? (
                          <LineChartComponentSys
                            aspect={isSmall ? 2 / 1 : 3 / 1}
                            questionId={question.id}
                            user_id={userData.id}
                            title={questionTitle}
                            unit={question.unit}
                          />
                        ) : (
                          <LineChartComponent
                            aspect={isSmall ? 2 / 1 : 3 / 1}
                            questionId={question.id}
                            user_id={userData.id}
                            title={questionTitle}
                            unit={question.unit}
                          />
                        )
                      ) : (
                        <Table
                          questionId={question.id}
                          user_id={userData.id}
                          title={questionTitle}
                          question={question}
                        />
                      )}
                    </ParameterSection>
                  );
                })}
            </Box>
          )}

          {/* Dialysis Parameters */}
          {userData.program !== "Basic" && dialysisParameters.length > 0 && (
            <Box className="space-y-6">
              <Box className="flex items-center gap-4">
                {/* <Box className="h-8 w-1 bg-[#4164df] rounded-full" /> */}
              <Box as="h2" className={`${isSmall ? "text-xl" : "text-2xl"} font-bold m-4`}>Dialysis Parameters</Box>
              </Box>

              {dialysisParameters
                .filter(q => !q.title.toLowerCase().includes("diastolic"))
                .map((question, index) => (
                  <ParameterSection
                    key={index}
                    title={question.title}
                    noResponse={question.responseCount === 0}
                  >
                    {question.isGraph === 1 ? (
                      <LineChartDialysis
                        aspect={isSmall ? 2 / 1 : 3 / 1}
                        questionId={question.id}
                        user_id={userData.id}
                        title={question.title}
                        unit={question.unit}
                      />
                    ) : (
                      <DialysisTable
                        questionId={question.id}
                        user_id={userData.id}
                        title={question.title}
                        question={question}
                      />
                    )}
                  </ParameterSection>
                ))}
            </Box>
          )}

          {/* Lab Reports */}
          {userData.program !== "Basic" && (
            <Box className="space-y-6">
              <Box className="flex items-center gap-4">
                {/* <Box className="h-8 w-1 bg-[#4164df] rounded-full" /> */}
              <Box as="h2" className={`${isSmall ? "text-xl" : "text-2xl"} font-bold m-4`}>Lab Reports</Box>
              </Box>

              {labReadings.map((reading) => (
                <ParameterSection
                  key={reading.id}
                  title={reading.title}
                  noResponse={reading.responseCount === 0}
                >
                  <Box className="relative">
                    {role?.role_name === "Admin" && (
                      <Flex gap={2} className={`absolute ${isMobile ? 'top-1 right-1' : 'top-2 left-1/2 transform -translate-x-1/2'} z-10 bg-white/70 backdrop-blur-sm rounded-md p-1`}>
                        <button
                          className="text-[#4164df] text-xl"
                          onClick={() => openLabReadingModal(reading.title, reading.id)}
                        >
                          ✎
                        </button>
                        <button
                          className="text-[#de425b] text-xl"
                          onClick={() => deleteLabReading(reading.id)}
                        >
                          🗑
                        </button>
                      </Flex>
                    )}
                    <LineChartComponentLab
                      aspect={isSmall ? 2 / 1 : 3 / 1}
                      questionId={reading.id}
                      user_id={userData.id}
                      title={reading.title}
                      unit={reading.unit}
                    />
                  </Box>
                </ParameterSection>
              ))}

              {selectedReading && (
                <LabRedingUpdateModal
                  closeEditModal={closeLabReadingModal}
                  initialData={selectedReading.title}
                  id={selectedReading.id}
                  onSuccess={handleUpdateSuccess}
                />
              )}
            </Box>
          )}
        {/* </Flex> */}
      {/* </Box> */}
      </Box>
    </WrapperComponent>
  );
}

export default UserProfile;

