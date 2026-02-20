import React, { useEffect, useState } from "react";
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

// Original Layout Components (containing actual logic/content)

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import getValidImageUrl from "../../helpers/utils";
import { getUsers, identifyRole } from "../../ApiCalls/authapis";
import {
  getPatientById,
  getPatientMedicalTeam,
} from "../../ApiCalls/patientAPis";
import { getAllChats, getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { getDoctorsChat } from "../../ApiCalls/doctorApis";

// Legacy components (to be replaced or kept if still needed)
import LineChartComponent from "../../components/Linechart/LineChartComponent";
import LineChartDialysis from "../../components/Linechart/Linechart_Dialysis/LineChartDialysis";
import QuestionsContainer from "../../components/questions/QuestionsContainer";
import Table from "../../components/table/table";
import DialysisTable from "../../components/table/DialysisTable";
import LineChartComponentSys from "../../components/linecomponent-sys-dys/LineChartComponentSys";
import LineChartComponentLab from "../../components/linechartlab/LineChartComponentLab";
import LabRedingUpdateModal from "../../components/modals/LabReadingModal";

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
  const [doctors, setDoctors] = useState([]);

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

  // Responsive handling based on window width
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = windowWidth < 768;
  const isMedium = windowWidth >= 768 && windowWidth < 1024;

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
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${id}`);
      setUserData(response.data.data);
      setAilments(response.data.data.ailments);
      return response.data;
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
      await axiosInstance.delete(`${server_url}/labreport/deleteLabReading/${readingId}`);
      window.location.reload();
    } catch (e) {
      console.error("Error deleting lab reading:", e);
    }
  };

  async function fetchQuestionsForAilment(ailment) {
    try {
      const response = await axiosInstance.get(`${server_url}/questions/generalParameter/fetchQuestions`, {
        params: { user: id, ailment: ailment }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  }

  async function fetchQuestionsForAilmentDialysis(ailment) {
    try {
      const response = await axiosInstance.get(`${server_url}/questions/dialysisParameter/${ailment}?user=${id}`);
      return response.data;
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
        const response = await axiosInstance.get(`${server_url}/labreport/LabReadings`);
        setLabReadings(response.data.data);
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
          if (chatResult.success && medicalResult.success) {
            setChats(chatResult.data.filter(c => c.role === "Doctor" || c.role === "Medical Staff"));
            setMedicalTeam(medicalResult.data.data);
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

  if (loading) return <Box className="p-20 text-center">Loading...</Box>;

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col w-full z-20 min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white ">

          <Flex justify="start" align="center" className="py-4 px-6">

            {/* Header with Breadcrumbs */}
            <PageHeader
              title={userData?.name || "Patient"}
              breadcrumbs={[
               // { label: "All Patients", path: "/patients" },
                { label: "Patient", path: ROUTES.patientDetail(id), active: false },
                { label: userData?.name || "Patient", active: true }
              ]}
              onBack={() => navigate(ROUTES.PATIENTS)}
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

        <Flex className={`py-4 flex-col gap-6 ${isSmall ? "px-4" : "px-6"}`}>
          {/* Profile Card */}
          <PatientProfileCard
            userData={userData}
            role={role}
            onEditName={openEditModal}
            onEditAilments={openEditalimentsModal}
          />

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
                      <Flex gap={2} className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-md p-1">
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
        </Flex>
      </Box>
    </ThemeProvider>
  );
}

export default UserProfile;

