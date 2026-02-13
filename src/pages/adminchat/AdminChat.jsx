import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MdSend } from "react-icons/md";
import dummyAdmin from "../../assets/dummyadmin.png";
import { getUsers } from "../../ApiCalls/authapis";
import { Button, Input, Badge, Card,Flex } from "../../component-library";
import PageHeader from "../../components/PageHeader";

import {
  getPatientById,
  getPatientMedicalTeam,
} from "../../ApiCalls/patientAPis";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { adminEmail } from "../../constants/constants";
import {
  getAllChatsAdmin,
  getChatId,
  getMessages,
  sendMessage,
} from "../../ApiCalls/chatApis";
import { getPatientAdminTeam } from "../../ApiCalls/patientAPis";
import { identifyRole } from "../../ApiCalls/authapis";
import ReactLoading from "react-loading";
import PatientNavTabs from "../../components/PatientNavTabs";
import { createMessageAlert } from "../../ApiCalls/alertsApis";
import { Container, Box } from "../../component-library";

const ChatApp = () => {
  const { pid } = useParams();
  const location = useLocation();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [patient, setPatient] = useState({});
  const [activeReciever, serActiveReciever] = useState("");
  const [sender, setSender] = useState("");
  const [adminTeam, setAdminTeam] = useState([]);
  const [medicalTeam, setMedicalTeam] = useState([]);

  const socket = useRef();

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    socket.current = io("ws://localhost:8080");
    socket.current.emit("new-user-add", userEmail);
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.current.on("recieve-message", (data) => {
      if (data.receiverId === sender && data.senderId === activeReciever) {
        loadMessages(data.chatId);
      }
    });
  }, []);

  const loadMessages = async (chatId) => {
    try {
      const response = await getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      } else {
        console.error("Failed to fetch messages:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const loadChats = async (receiverEmail) => {
    try {
      const chatIdResp = await getChatId(receiverEmail, pid);
      if (chatIdResp.success) {
        loadMessages(chatIdResp.data.chatId);
      } else {
        console.error("Failed to fetch chatId:", chatIdResp.data);
      }
    } catch (error) {
      console.error("Error fetching chatId:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        setRole(roleResult.data.data.role_name);
        const patientRes = await getPatientById(pid);
        const userEmail = localStorage.getItem("email");
        setPatient(patientRes.data.data[0]);
        setSender(userEmail);
        if (
          roleResult.data.data.role_name === "Doctor" ||
          roleResult.data.data.role_name === "Medical Staff"
        ) {
          const adminTeamRes = await getPatientAdminTeam(pid);
          setAdminTeam(adminTeamRes.data.data);

          serActiveReciever(adminEmail);
          loadChats(adminEmail);
        }
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      }
    };

    fetchData();
  }, []);

  // old one
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        setRole(roleResult.data.data.role_name);
        const patientRes = await getPatientById(pid);
        console.log(patientRes);
        const userEmail = localStorage.getItem("email");
        console.log(userEmail);
        setPatient(patientRes.data.data);
        setSender(userEmail);
        if (
          roleResult.data.data.role_name === "Admin" ||
          roleResult.data.data.role_name === "PSadmin"
        ) {
          const chatResult = await getAllChatsAdmin(pid);
          console.log("CHAT", chatResult.data);
          const emailArray = chatResult?.data.map((a) => a.receiverEmail);
          console.log(emailArray);
          const result = await getPatientMedicalTeam(pid);
          console.log("CHAT1", result.data.data);

          if (result.success && chatResult.success) {
            setChats(
              chatResult.data.filter(
                (chat) => chat.role == "Doctor" || chat.role == "Medical Staff"
              )
            );
            setMedicalTeam(
              result.data.data.filter(
                (user) =>
                  user.email !== userEmail && emailArray.includes(user.email)
              )
            );
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

  //not done yet
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const roleResult = await identifyRole();
  //       setRole(roleResult.data.data.role_name);
  //       const patientRes = await getPatientById(pid);
  //       const userEmail = localStorage.getItem("email");
  //       setPatient(patientRes.data.data[0]);
  //       setSender(userEmail);

  //       const queryParams = new URLSearchParams(location.search);
  //       const receiver = queryParams.get("receiver");

  //       if (receiver) {
  //         serActiveReciever(receiver);
  //         loadChats(receiver);
  //       } else if (
  //         roleResult.data.data.role_name === "Doctor" ||
  //         roleResult.data.data.role_name === "Medical Staff"
  //       ) {
  //         const adminTeamRes = await getPatientAdminTeam(pid);
  //         setAdminTeam(adminTeamRes.data.data);
  //         serActiveReciever(adminEmail);
  //         loadChats(adminEmail);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching users/roles:", error);
  //     }
  //   };

  //   fetchData();
  // }, [location.search]);

  const sendCurrentMessage = async () => {
    const validate = () => {
      if (currentMessage.trim() === "") {
        alert("Please enter a message");
        return false;
      }
      return true;
    };
    
    if (validate()) {
      try {
        const messageData = {
          message: currentMessage.trim(),
          receiver: activeReciever,
          pid: pid,
        };
        const response = await sendMessage(messageData);
        if (response.success) {
          if (role === "Doctor") {
            await createMessageAlert(response.data.chatId, currentMessage, pid);
          }
          socket.current.emit("send-message", {
            currentMessage,
            receiverId: activeReciever,
            senderId: sender,
            chatId: response.data.chatId,
          });
          setCurrentMessage("");
          loadMessages(response.data.chatId);
        } else {
          console.error("Failed to send message:", response.data);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const navigate = useNavigate();

  return (
    <div className="userProfile flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1 block w-full">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Flex justify="start" align="center" className="py-4 px-6">
            {/* Header with Breadcrumbs */}
            <PageHeader
              title="Admin Chat"
              breadcrumbs={[
               // { label: "All Patients", path: "/patient" },
                { label: "Patient", path: `/userProfile/${pid}`, active: false },
                { label: "Admin Chat", active: true }
              ]}
              onBack={() => navigate(`/userProfile/${pid}`)}
            />
          </Flex>

          {/* Navigation Tabs */}
          <PatientNavTabs
            patientId={pid}
            userData={patient}
            unreadAdminCount={chats?.reduce((s, c) => s + (c.unreadCount || 0), 0)}
            unreadDoctorCount={0}
            role={{ role_name: role }}
          />
        </Box>

        <div className="bg-gray-50 min-h-[calc(100vh-320px)] ">
          <Card className="w-full h-[80vh] rounded-2xl shadow-lg border-0">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 h-20 px-8 border-b border-gray-200 rounded-t-2xl">
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Chat
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{patient?.name}</span>
                <img
                  className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                  src={
                    patient?.profile_photo ? patient?.profile_photo : dummyAdmin
                  }
                  alt="Patient"
                />
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex h-[calc(100%-80px)]">
              {/* Chat List Sidebar */}
              {role === "Admin" || role === "PSadmin" ? (
                <div className="w-[35%] bg-white border-r border-gray-200 overflow-y-auto rounded-bl-2xl">
                  {chats.length > 0 ? (
                    chats.map((chat, index) => {
                      const isInMedicalTeam = medicalTeam.some(
                        (member) => member.email === chat.receiverEmail
                      );
                      const isActive = chat.receiverEmail === activeReciever;

                      return (
                        <div
                          key={index}
                          onClick={async () => {
                            serActiveReciever(chat.receiverEmail);
                            setLoading(true);
                            loadMessages(chat.id).then((res) => {
                              setLoading(false);
                            });
                          }}
                          className={`flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all ${
                            isActive
                              ? "bg-blue-50 border-l-4 border-l-blue-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <img
                            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                            src={dummyAdmin}
                            alt={chat.firstname}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {chat.firstname} {chat.lastname}
                            </p>
                            {!isInMedicalTeam && (
                              <span className="text-xs text-red-500 font-medium">
                                Not Assigned
                              </span>
                            )}
                          </div>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white font-bold">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No chats available
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[35%] bg-white border-r border-gray-200 overflow-y-auto rounded-bl-2xl">
                  <div className="sticky top-0 bg-blue-50 p-4 border-b border-gray-200 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Assigned Admins
                    </h3>
                  </div>
                  {adminTeam.length > 0 ? (
                    adminTeam.map((admin, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border-b border-gray-100"
                      >
                        <img
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                          src={dummyAdmin}
                          alt={admin.firstname}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {admin.firstname} {admin.lastname}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No admins assigned
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="w-[65%] flex flex-col bg-gradient-to-br from-gray-50 to-white rounded-br-2xl">
                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                  style={{ transform: "scaleY(-1)" }}
                >
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <ReactLoading
                        type="bubbles"
                        color={"#3b82f6"}
                        height={80}
                        width={80}
                      />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      const sent_at = new Date(message.sent_at);
                      const isOwn = message.sender === sender;

                      return (
                        <div
                          key={index}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          style={{ transform: "scaleY(-1)" }}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
                            <p className="text-xs text-gray-600 px-2 mb-1">
                              {message.firstname} {message.lastname}
                            </p>
                            <div
                              className={`px-4 py-3 rounded-2xl text-gray-800 ${
                                isOwn
                                  ? "bg-blue-500 text-white rounded-br-none"
                                  : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                              }`}
                            >
                              {message.message}
                            </div>
                            <p className="text-xs text-gray-500 px-2 mt-1">
                              {sent_at.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 rounded-br-2xl">
                  {activeReciever !== "" ? (
                    <div className="flex items-center gap-3">
                      <Input
                        type="text"
                        placeholder="Type your message here..."
                        value={currentMessage}
                        onChange={(e) => {
                          setCurrentMessage(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendCurrentMessage();
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        onClick={sendCurrentMessage}
                        variant="primary"
                        size="md"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 flex items-center justify-center"
                      >
                        <MdSend className="text-xl" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Select a chat to start messaging
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
