import React, { useEffect, useState } from "react";
import "./userProfile.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Collapsible from "react-collapsible";
import profilePic from "../../assets/pp.png";
import LineChartComponent from "../../components/Linechart/LineChartComponent";
import LineChartDialysis from "../../components/Linechart/Linechart_Dialysis/LineChartDialysis";
import { useLocation } from "react-router-dom";
import NameModal from "./NameModal";
import axiosInstance from "../../helpers/axios/axiosInstance";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import QuestionsContainer from "../../components/questions/QuestionsContainer";
import { server_url } from "../../constants/constants";
import Table from "../../components/table/table";
import DialysisTable from "../../components/table/DialysisTable";
import { useParams } from "react-router-dom";
import AilmentModal from "./AilmentModal";
import LineChartComponentSys from "../../components/linecomponent-sys-dys/LineChartComponentSys";
import LineChartDialysisSys from "../../components/Linechart/Linechart_Dialysis/LineChartDialyisisSys";
import { useSelector } from "react-redux";
import getValidImageUrl from "../../helpers/utils";
import LineChartComponentLab from "../../components/linechartlab/LineChartComponentLab";
import { getUsers, identifyRole } from "../../ApiCalls/authapis";
import {
  getPatientById,
  getPatientMedicalTeam,
} from "../../ApiCalls/patientAPis";
import { getAllChats, getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { dummyadmin } from "../../assets";
import { getDoctorsChat } from "../../ApiCalls/doctorApis";
import Vaccines from "@mui/icons-material/Vaccines";
import { ca } from "date-fns/locale";
import LabRedingUpdateModal from "../../components/modals/LabReadingModal";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";

function UserProfile({ patient }) {
  const [totalUnreadCount, settotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, settotalUnreadCountDoc] = useState(0);
  const { pid } = useParams();
  const role = useSelector((state) => state.permission);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [chats1, setChats1] = useState([]);
  const [patient1, setPatient1] = useState({});
  const [patient2, setPatient2] = useState({});
  const [activeReciever, serActiveReciever] = useState("");
  const [sender, setSender] = useState("");
  const [sender1, setSender2] = useState("");
  const [Users, setUsers] = useState("");
  const [adminTeam, setAdminTeam] = useState([]);
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editalimentsModalOpen, setEditalimentsModalOpen] = useState(false);
  const [labReadingModalOpen, setLabReadingModalOpen] = useState(false);
  const [generalParameters, setGeneralParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialysisParameters, setDialysisParameters] = useState([]);
  const [ailments, setAilments] = useState([]);

  const [labReadings, setLabReadings] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();

  const [selectedaliments, setSelectedaliments] = useState([]);

  const [selectedReading, setSelectedReading] = useState(null);

  const openLabReadingModal = (title, id) => {
    setSelectedReading({ title, id });
  };

  const closeLabReadingModal = () => {
    setSelectedReading(null);
  };

  const openEditalimentsModal = () => {
    setEditalimentsModalOpen(true);
  };

  const closeEditalimentsModal = () => {
    setEditalimentsModalOpen(false);
  };

  // const openLabReadingModal = () => {
  //   setLabReadingModalOpen(true);
  // };

  // const closeLabReadingModal = () => {
  //   setLabReadingModalOpen(false);
  // };

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEdit = () => {
    setEditModalOpen(false);
  };
  // console.log(userData.id);

  const [userData, setUserData] = useState({
    ailments: [],
  });
  // Function to update user data
  const updateUserData = (updatedData) => {
    setUserData((prevData) => ({
      ...prevData,
      ...updatedData,
    }));
  };

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getPatient/${id}`
      );
      setUserData(response.data.data);
      // console.log(userData);
      setAilments(response.data.data.ailments);
      console.log(response.data.data.ailments);
      console.log("fetched this data: ", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  async function deleteLabReading(readingId) {
    if (!window.confirm("Are you sure you want to delete this reading?"))
      return;
    try {
      const token = localStorage.getItem("token");

      const response = await axiosInstance.delete(
        `${server_url}/labreport/deleteLabReading/${readingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
      console.log("deleted", response.data);
    } catch (e) {
      console.error("erroer deleting lab reading:", e);
    }
  }

  const handleEditaliments = (updatedaliments) => {
    setSelectedaliments(updatedaliments);
    closeEditalimentsModal();
  };

  async function fetchQuestionsForAilment(ailment) {
    try {
      const response = await axiosInstance.get(
        `${server_url}/questions/generalParameter/fetchQuestions`,
        {
          params: {
            user: id,
            ailment: ailment,
          },
        }
      );
      // console.log("custom id", id)
      console.log("custom ailments", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  }
  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(id);
        if (chatResult.success) {
          // console.log("chatResult : ", chatResult.data);
          const unreadMsgs = chatResult.data.filter(
            // console.log("unreadMsg : ", unreadMessages),
            (chat) => chat.unreadCount > 0
          );
          const tp = unreadMsgs.reduce(
            (acc, chat) => acc + chat.unreadCount,
            0
          );
          settotalUnreadCount(tp);
          setUnreadMessages(unreadMsgs);
          console.log("Unread messages from admin:", totalUnreadCount);
          // console.log("Unread messages from doc:", totalUnreadCount);
        } else {
          console.error("Failed to fetch chats:", chatResult.data);
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, []);
  async function fetchQuestionsForAilmentDialysis(ailment) {
    // console.log(id);
    try {
      const response = await axiosInstance.get(
        `${server_url}/questions/dialysisParameter/${ailment}?user=${id}`,
        {
          user: id,
        }
      );
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  }

  useEffect(() => {
    fetchPatientData();
    // console.log(userData.id)
  }, []);

  useEffect(() => {
    const uniqueQuestionsSet = [];
    const seenIds = new Set();
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
      const temp = uniqueQuestionsSet;
      // console.log("update general parameter response with count",temp)
      temp.sort((a, b) => {
        // Check if both objects have a responseCount
        if (a.responseCount && b.responseCount) {
          // Nested sorting by priority if both have responseCount
          if (a.priority < b.priority) return -1;
          if (a.priority > b.priority) return 1;
        } else if (a.responseCount) {
          // If only `a` has responseCount, it comes first
          return -1;
        } else if (b.responseCount) {
          // If only `b` has responseCount, it comes first
          return 1;
        }

        // If responseCount is not present in both or they have equal priority, return 0
        return 0;
      });

      setGeneralParameters(temp);

      setLoading(false);
      console.log("my general params", temp);
    });
  }, [ailments]);

  useEffect(() => {
    async function fetchData(ailment) {
      try {
        const response = await fetchQuestionsForAilmentDialysis(ailment);
        const questions = response;
        // console.log(questions)
        setDialysisParameters((prevData) => {
          const filteredData = response.filter(
            (item) => !prevData.some((prevItem) => prevItem.id === item.id)
          );
          console.log(filteredData);
          return [...prevData, ...filteredData];
        });
        console.log(dialysisParameters);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData("Hemo dialysis");
  }, [ailments]);

  useEffect(() => {
    const fetchLabReadings = async () => {
      try {
        const response = await axiosInstance.get(
          `${server_url}/labreport/LabReadings`
        );
        console.log("lab", response.data.data);
        setLabReadings(response.data.data); // Assuming your API response structure
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabReadings();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        console.log(roleResult?.data?.data?.role_name);

        const patientRes = await getPatientById(id);
        // console.log(patientRes);
        const userEmail = localStorage.getItem("email");
        setPatient1(patientRes.data.data);
        setSender(userEmail);
        if (roleResult.data.data.role_name === "Admin") {
          const chatResult = await getAllChatsAdmin(id);
          const emailArray = chatResult?.data.map((a) => a.receiverEmail);
          const result = await getPatientMedicalTeam(id);
          console.log("admins ==> patients medical team!,", result.data);
          if (result.success && chatResult.success) {
            setChats(
              chatResult.data.filter(
                (chat) => chat.role == "Doctor" || chat.role == "Medical Staff"
              )
            );
            setMedicalTeam(
              result.data.data.filter(
                (user) =>
                  user.email !== userEmail && !emailArray.includes(user.email)
              )
            );
            console.log("chatsA", chats);
          } else {
            console.error("Failed to fetch users:", result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      }
    };

    fetchData();
  }, [messages]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        // setRole(roleResult.data.data.role_name);

        if (roleResult.data.data.role_name === "Admin") {
          const getDoctorsResult = await getDoctorsChat(id);
          console.log("this is admins", getDoctorsResult.data);
          if (getDoctorsResult.success) {
            setDoctors(getDoctorsResult.data.data);
          } else {
            console.error("Failed to fetch doctors:", getDoctorsResult.data);
          }
        } else if (
          roleResult.data.data.role_name === "Medical Staff" ||
          roleResult.data.data.role_name === "Doctor"
        ) {
          const chatResult = await getAllChats(id);
          console.log("this is doctors chat res", chatResult);
          let emailArray = [];
          if (chatResult.success) {
            console.log("chat res data", chatResult.data);
            emailArray = chatResult?.data.map((a) => a.receiverEmail);
            setChats1(
              // chatResult.data
              chatResult?.data?.filter((chat) => chat?.role == "Doctor")
            );
          } else {
            console.error("Failed to fetch chats:", chatResult.data);
          }
          console.log("chats set", chats1);
          const patientRes = await getPatientById(pid);
          const result = await getUsers();
          if (result.success && patientRes.success) {
            const userEmail = localStorage.getItem("email");
            setPatient2(patientRes.data.data);
            setSender2(userEmail);
            if (chatResult.success && emailArray.length > 0) {
              setUsers(
                result.data.data.filter(
                  (user) =>
                    user.email !== userEmail &&
                    !emailArray.includes(user.email) &&
                    (user.role == "Doctor" || user.role == "Medical Staff")
                )
              );
            } else {
              setUsers(
                result.data.data.filter(
                  (user) =>
                    user.email !== userEmail &&
                    (user.role == "Doctor" || user.role == "Medical Staff")
                )
              );
            }
          } else {
            console.error("Failed to fetch users:", result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      }
    };
    console.log("updated chats", chats1);
    fetchData();
  }, [messages]);

  // useEffect(() => {
  //   console.log("Updated doc chats:", chats1);
  //   console.log("Unread Messages:", chats1.reduce((total, chat) => total + chat.unreadCount, 0));

  // }, [chats1]); // Logs when `chats1` is updated

  useEffect(() => {
    if (chats1.length > 0) {
      const unread = chats1.reduce(
        (total, chat) => total + (chat.unreadCount || 0),
        0
      );
      console.log("Updated unread count:", unread);
      settotalUnreadCountDoc(unread);
    }
  }, [chats1]);

  const handleUpdateRangeSuccess = () => {
    window.location.reload();
    fetchPatientData();
  };

  const handleUpdatelabRSuccess = () => {};

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="userProfile md:flex block">
        <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
        <div className="md:flex-[5] block w-screen">
          <div className="sticky top-0 z-10">
            <Navbar />
          </div>
          <div className="container justify-center px-20">
            <div className="left"></div>
            <div className="right">
              <a
                href="/patient"
                className="text-primary border-b-2 border-primary"
              >
                go back
              </a>

              <div className="w-3/4 flex justify-center mx-auto">
                <div className="flex justify-center">
                  <div className="w-1/2 md:w-1/4 mb-2 flex  justify-center">
                    {!(
                      role.role_name === "Dialysis Technician" ||
                      role.role_name === "Medical Staff"
                    ) && (
                      <div className="navbuttons gap-2">
                        <Link to={"/adminChat/" + id} className="text-sm">
                          ADMIN CHAT
                        </Link>
                        {role === "Admin" ||
                        (role === "PSadmin" &&
                          chats.length > 0 &&
                          chats.reduce(
                            (total, chat) => total + chat.unreadCount,
                            0
                          ) > 0) ? (
                          <div className="h-full">
                            <div>
                              <span className="rounded-full inline-flex justify-center w-6 h-6 items-center text-xs p-0 text-center bg-red-700 text-white">
                                {chats.reduce(
                                  (total, chat) => total + chat.unreadCount,
                                  0
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          totalUnreadCount > 0 && (
                            <div>
                              <span className="rounded-full inline-flex justify-center w-6 h-6 items-center text-xs p-0 text-center bg-red-700 text-white">
                                {totalUnreadCount}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  {!(
                    role.role_name === "Medical Staff" ||
                    role.role_name === "Dialysis Technician"
                  ) && (
                    <div className="w-1/2 md:w-1/4 mb-2 flex gap-2 justify-center">
                      <div className="navbuttons">
                        <Link to={"/doctorChat/" + id} className="text-sm">
                          DOCTOR CHAT
                        </Link>
                        {(role === "Doctor" && chats1.length > 0) > 0 ? (
                          <div className="h-full">
                            <div>
                              <span className="rounded-full inline-flex justify-center w-6 h-6 mx-2 items-center text-xs p-0 text-center bg-red-700 text-white">
                                {chats1?.reduce(
                                  (total, chat) => total + chat.unreadCount,
                                  0
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          //null
                          totalUnreadCountDoc > 0 && (
                            <div>
                              <span className="rounded-full inline-flex justify-center w-6 h-6 items-center text-xs p-0 text-center bg-red-700 text-white">
                                {totalUnreadCountDoc}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  <div className="w-1/2 md:w-1/4 mb-2 flex justify-center ">
                    <div className="navbuttons">
                      <button
                        onClick={() =>
                          navigate(`/userPrescription/${id}`, {
                            state: userData,
                          })
                        }
                      >
                        PRESCRIPTIONS
                      </button>
                    </div>
                  </div>
                  <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                    <div className="navbuttons">
                      <button
                        onClick={() =>
                          navigate(`/UserLabReports/${id}`, {
                            state: userData,
                          })
                        }
                      >
                        LAB REPORTS
                      </button>
                    </div>
                  </div>

                  {!(role.role_name === "Dialysis Technician") && (
                    <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                      <div className="navbuttons">
                        <button
                          onClick={() =>
                            navigate(`/UserDietDetails/${id}`, {
                              state: userData,
                            })
                          }
                        >
                          DIET DETAILS
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                    <div className="navbuttons">
                      <button
                        onClick={() =>
                          navigate(`/UserRequisition/${id}`, {
                            state: userData,
                          })
                        }
                      >
                        REQUISITION REPORTS
                      </button>
                    </div>
                  </div>
                  {!(role.role_name === "Dialysis Technician") && (
                    <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                      <div className="navbuttons">
                        <Link to={"/ShowAlarms/" + id}>ALARMS</Link>
                      </div>
                    </div>
                  )}
                  {role.role_name === "Admin" && (
                    <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                      <div className="navbuttons">
                        <button
                          onClick={() =>
                            navigate(`/manageparameters/${id}`, {
                              state: userData,
                            })
                          }
                        >
                          MANAGE PARAMETERS
                        </button>
                      </div>
                    </div>
                  )}
                  {role?.patients &&
                  !ailments.includes("Hemo Dialysis") &&
                  !ailments.includes("Peritoneal Dialysis") ? (
                    <div className="w-1/2 md:w-1/4 mb-2 flex justify-center">
                      <div className="navbuttons">
                        <button
                          onClick={() =>
                            navigate(`/kfre/${id}`, {
                              state: userData,
                            })
                          }
                        >
                          KFRE
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rightbottom">
                <Collapsible
                  trigger={
                    <div className="flex justify-between p-2 ">
                      <span className="text-[#19b9d4] font-bold text-xl border-">
                        Basic Details And Ailment
                      </span>
                      <span>
                        <KeyboardArrowDownIcon />
                      </span>
                    </div>
                  }
                  className="collapsable"
                  openedClassName="collapsable-open"
                  open={true}
                >
                  <div className="basicprofile border-t border-gray-400 pt-3">
                    <div className="left">
                      <div className="profilepic">
                        <img
                          src={getValidImageUrl(userData.profile_photo)}
                          className="rounded-full h-48 w-48"
                          alt="profile pic"
                        />
                      </div>
                    </div>
                    <div className="right">
                      <div className="filter">
                        <span className="name">
                          <span className="font-bold">Name: </span>

                          {}
                          <span>{userData.name}</span>
                          {role?.role_name === "Admin" && (
                            <button onClick={openEditModal}>
                              <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                          )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              onSuccess={handleUpdateRangeSuccess}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                            />
                          )}
                        </span>
                        <div className="number">
                          <span className="font-bold">Number: </span>
                          <span>{userData.number}</span>
                          {role?.role_name === "Admin" && (
                            <button onClick={openEditModal}>
                              <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                          )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>
                        <div className="Program">
                          <span className="font-bold">Program: </span>
                          <span>{userData.program}</span>
                        </div>
                        <div className="aliments mb-2">
                          <span className="font-bold">Ailments: </span>
                          <span>{userData.ailments.join(", ")}</span>
                          {role?.role_name != "Dialysis Technician" &&
                            role?.role_name != "Medical Staff" && (
                              <button onClick={openEditalimentsModal}>
                                <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                              </button>
                            )}
                          {editalimentsModalOpen && (
                            <AilmentModal
                              closeEditalimentsModal={closeEditalimentsModal}
                              initialAilments={userData.ailments}
                              updateData={updateUserData}
                              user_id={userData.id}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>
                        <div className="Dob">
                          <span className="font-bold"> DOB: </span>
                          <span>{formatDate(userData.dob)}</span>
                          {role?.role_name != "Dialysis Technician" &&
                            role?.role_name != "Medical Staff" && (
                              <button onClick={openEditModal}>
                                <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                              </button>
                            )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>

                        <div className="Address">
                          <span className="font-bold"> Address: </span>
                          <span>{userData.address}</span>
                          {role?.role_name == "Admin" && (
                            <button onClick={openEditModal}>
                              <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                          )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>

                        <div className="State">
                          <span className="font-bold"> State: </span>
                          <span>{userData.state}</span>
                          {role.role_name == "Admin" && (
                            <button onClick={openEditModal}>
                              <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                          )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>

                        <div className="Pincode">
                          <span className="font-bold"> Pincode: </span>
                          <span>{userData.pincode}</span>
                          {role?.role_name === "Admin" && (
                            <button onClick={openEditModal}>
                              <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                            </button>
                          )}
                          {editModalOpen && (
                            <NameModal
                              closeEditModal={closeEditModal}
                              initialData={userData}
                              updateData={updateUserData}
                              user_id={userData.id}
                              name={userData.name}
                              number={userData.number}
                              dob={userData.dob}
                              address={userData.address}
                              state={userData.state}
                              pincode={userData.pincode}
                              onSuccess={handleUpdateRangeSuccess}
                            />
                          )}
                        </div>

                        {/* Conditionally rendering EGFR and GFR columns */}
                        {userData.ailments.includes("CKD") && (
                          <React.Fragment>
                            <div className="egfr">
                              <span className="font-bold">eGFR: </span>
                              <span>{userData.eGFR}</span>
                              {role?.role_name != "Dialysis Technician" &&
                                role?.role_name != "Medical Staff" && (
                                  <button onClick={openEditalimentsModal}>
                                    <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                                  </button>
                                )}
                              {/* Render eGFR data here */}
                            </div>
                            <div className="gfr">
                              <span className="font-bold">GFR: </span>
                              <span>{userData.GFR}</span>
                              {role?.role_name != "Dialysis Technician" &&
                                role?.role_name != "Medical Staff" && (
                                  <button onClick={openEditalimentsModal}>
                                    <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                                  </button>
                                )}
                            </div>
                          </React.Fragment>
                        )}
                        {/* Conditionally rendering Dry Weight column */}
                        {userData.ailments.includes("Hemo Dialysis") && (
                          <div className="dry-weight">
                            <span className="font-bold">Dry Weight: </span>
                            <span>{userData.dry_weight}</span>
                            {role?.role_name != "Dialysis Technician" &&
                              role?.role_name != "Medical Staff" && (
                                <button onClick={openEditalimentsModal}>
                                  <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                                </button>
                              )}
                          </div>
                        )}
                        {userData.ailments.includes("CKD") &&
                          !userData.ailments.includes("Hemo Dialysis") &&
                          !userData.ailments.includes(
                            "Peritoneal Dialysis"
                          ) && (
                            <div className="kefr">
                              <span className="font-bold">KFRE: </span>
                              <span>
                                {/* {(userData.kefr * 100).toFixed(2)}% */}
                                {(parseFloat(userData.kfre ?? 0) * 100).toFixed(
                                  2
                                )}
                                %
                              </span>
                              {role?.role_name != "Dialysis Technician" &&
                                role?.role_name != "Medical Staff" && (
                                  <button onClick={openEditalimentsModal}>
                                    <BorderColorIcon className="h-3 w-3 text-[#19b9d4]" />
                                  </button>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <p
                    className={`${
                      userData?.condition == "stable"
                        ? "text-green-500 font-bold"
                        : userData?.condition == "unstable"
                        ? "text-yellow-500 font-bold"
                        : userData?.condition == "critical"
                        ? "text-red-500 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    {userData?.condition}
                  </p>
                </Collapsible>

                <Collapsible
                  trigger={
                    <div className="flex justify-between p-2 ">
                      <span className="text-[#19b9d4] font-bold text-xl border-">
                        Generic Profile
                      </span>
                      <span>
                        <KeyboardArrowDownIcon />
                      </span>
                    </div>
                  }
                  className="collapsable"
                  openedClassName="collapsable-open"
                >
                  <QuestionsContainer aliment="Generic Profile" user_id={id} />
                </Collapsible>

                <div>
                  <h1 className="sectionTitle">Ailment Details</h1>
                  {userData.ailments.map((aliment, index) => (
                    <Collapsible
                      key={index}
                      trigger={
                        <div className="flex justify-between p-2 ">
                          <span className="text-[#19b9d4] font-bold text-xl border-">
                            {aliment}
                          </span>
                          <span>
                            <KeyboardArrowDownIcon />
                          </span>
                        </div>
                      }
                      className="collapsable"
                      openedClassName="collapsable-open"
                    >
                      <QuestionsContainer
                        aliment={aliment}
                        user_id={userData.id}
                      />
                    </Collapsible>
                  ))}
                </div>
                {role?.role_name !== "Dialysis Technician" &&
                  userData.program != "Basic" && (
                    <div className="generalParameters">
                      {generalParameters.length > 0 && (
                        <h1 className="sectionTitle">General Parameter</h1>
                      )}
                      {generalParameters
                        .filter(
                          (question) =>
                            !question.title.toLowerCase().includes("diastolic")
                        )
                        .map((question, index) => {
                          let componentToRender;
                          let questionTitle = question.title;

                          if (question.isGraph === 1) {
                            if (
                              question.title.toLowerCase().includes("systolic")
                            ) {
                              const systolicIndex = questionTitle
                                .toLowerCase()
                                .indexOf("systolic");
                              const systolicEndIndex =
                                systolicIndex + "systolic".length;

                              // Insert "+ and Diastolic" after "systolic"
                              questionTitle =
                                questionTitle.slice(0, systolicEndIndex) +
                                " and Diastolic" +
                                questionTitle.slice(systolicEndIndex);

                              componentToRender = (
                                <LineChartComponentSys
                                  aspect={2 / 1}
                                  questionId={question.id}
                                  user_id={userData.id}
                                  title={questionTitle}
                                  unit={question.unit}
                                />
                              );
                            } else {
                              componentToRender = (
                                <LineChartComponent
                                  aspect={2 / 1}
                                  questionId={question.id}
                                  user_id={userData.id}
                                  title={questionTitle}
                                  unit={question.unit}
                                />
                              );
                            }
                          } else {
                            componentToRender = (
                              <Table
                                questionId={question.id}
                                user_id={userData.id}
                                title={questionTitle}
                                question={question}
                              />
                            );
                          }

                          return (
                            <Collapsible
                              key={index}
                              trigger={
                                <div className="flex justify-between items-center p-2">
                                  <span className="text-[#19b9d4] font-bold text-xl ">
                                    {questionTitle}
                                  </span>
                                  {question.responseCount === 0 ? (
                                    <span className="inline-block rounded-lg px-4 py-2 bg-gray-200 text-gray-800 font-semibold text-sm">
                                      no response
                                    </span>
                                  ) : (
                                    <span>
                                      {/* You can add an icon or any indicator for response exist */}
                                    </span>
                                  )}
                                </div>
                              }
                              className="collapsable"
                              openedClassName="collapsable-open"
                            >
                              {componentToRender}
                            </Collapsible>
                          );
                        })}
                    </div>
                  )}

                <div className="dialysisParameters">
                  {dialysisParameters.length > 0 &&
                    userData.program != "Basic" && (
                      <h1 className="sectionTitle">Dialysis Parameters</h1>
                    )}
                  {userData.program != "Basic" &&
                    dialysisParameters
                      .filter(
                        (question) =>
                          !question.title.toLowerCase().includes("diastolic")
                      )
                      .map((question, index) => {
                        let componentToRender;
                        let questionTitle = question.title;

                        if (question.isGraph === 1) {
                          if (
                            question.title.toLowerCase().includes("systolic")
                          ) {
                            const systolicIndex = questionTitle
                              .toLowerCase()
                              .indexOf("systolic");
                            const systolicEndIndex =
                              systolicIndex + "systolic".length;

                            // Insert "+ and Diastolic" after "systolic"
                            questionTitle =
                              questionTitle.slice(0, systolicEndIndex) +
                              " and Diastolic" +
                              questionTitle.slice(systolicEndIndex);

                            componentToRender = (
                              // <LineChartDialysisSys
                              //   aspect={2 / 1}
                              //   questionId={question.id}
                              //   user_id={userData.id}
                              //   title={questionTitle}
                              //   unit={question.unit}
                              // />
                              <></>
                            );
                          } else {
                            componentToRender = (
                              <LineChartDialysis
                                aspect={2 / 1}
                                questionId={question.id}
                                user_id={userData.id}
                                title={questionTitle}
                                unit={question.unit}
                              />
                            );
                          }
                        } else {
                          componentToRender = (
                            <DialysisTable
                              questionId={question.id}
                              user_id={userData.id}
                              title={questionTitle}
                              question={question}
                            />
                          );
                        }

                        return (
                          <Collapsible
                            key={index}
                            trigger={
                              <div className="flex justify-between items-center p-2">
                                <span className="text-[#19b9d4] font-bold text-xl ">
                                  {questionTitle}
                                </span>
                                {questionTitle != "interDialysisGraph" &&
                                question.responseCount === 0 ? (
                                  <span className="inline-block rounded-lg px-4 py-2 bg-gray-200 text-gray-800 font-semibold text-sm">
                                    no response
                                  </span>
                                ) : (
                                  <span>
                                    {/* You can add an icon or any indicator for response exist */}
                                  </span>
                                )}
                              </div>
                            }
                            className="collapsable"
                            openedClassName="collapsable-open"
                          >
                            {componentToRender}
                          </Collapsible>
                        );
                      })}
                </div>

                <div className="generalParameters">
                  {userData.program != "Basic" && (
                    <h1 className="sectionTitle">Lab Reports</h1>
                  )}

                  {userData.program != "Basic" &&
                    labReadings.map((reading) => (
                      <Collapsible
                        key={reading.id}
                        trigger={
                          <div className="flex justify-between items-center p-2">
                            <span className="text-[#19b9d4] font-bold text-xl ">
                              {reading.title}
                            </span>
                            {reading.responseCount === 0 ? (
                              <span className="inline-block rounded-lg px-4 py-2 bg-gray-200 text-gray-800 font-semibold text-sm">
                                no response
                              </span>
                            ) : (
                              <span>
                                {/* You can add an icon or any indicator for response exist */}
                              </span>
                            )}

                            {role?.role_name === "Admin" ? (
                              <div>
                                {" "}
                                {selectedReading && (
                                  <LabRedingUpdateModal
                                    closeEditModal={closeLabReadingModal}
                                    initialData={reading.title}
                                    id={reading.id}
                                    onSuccess={handleUpdatelabRSuccess}
                                  />
                                )}
                                {/* <button
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
                                  onClick={() =>
                                    openLabReadingModal(
                                      reading.title,
                                      reading.id
                                    )
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
                                  onClick={() => deleteLabReading(reading.id)}
                                >
                                  Delete
                                </button> */}
                                <button
                                  className="text-[#87ca9c] inline-block mx-2 text-2xl"
                                  onClick={() =>
                                    openLabReadingModal(
                                      reading.title,
                                      reading.id
                                    )
                                  }
                                >
                                  <BsPencilSquare />
                                </button>
                                <button
                                  className="text-[#ff0000] inline-block mx-2 text-2xl"
                                  onClick={() => deleteLabReading(reading.id)}
                                >
                                  <BsTrash />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        }
                        className="collapsable"
                        openedClassName="collapsable-open"
                      >
                        <LineChartComponentLab
                          key={reading.id}
                          aspect={2 / 1}
                          questionId={reading.id} // Assuming 'id' is suitable for questionId
                          user_id={userData.id} // Assuming userData is available in scope
                          title={reading.title}
                          unit={reading.unit}
                        />
                      </Collapsible>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserProfile;
