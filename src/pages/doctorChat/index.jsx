import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { MdKeyboardBackspace } from "react-icons/md";
import { MdSend } from "react-icons/md";
import dummyAdmin from "../../assets/dummyadmin.png";
import { getUsers } from "../../ApiCalls/authapis";
import { getPatientById } from "../../ApiCalls/patientAPis";
import { useParams, Link } from "react-router-dom";
import { identifyRole } from "../../ApiCalls/authapis";
import { getDoctors, getDoctorsChat } from "../../ApiCalls/doctorApis";
import { Box, Button, Input, Badge, Card,Flex } from "../../component-library";
import PageHeader from "../../components/PageHeader";

import {
  getChatId,
  getMessages,
  sendMessage,
  getAllChats,
  getAllSWChats,
  getSWMessages,
} from "../../ApiCalls/chatApis";
import ReactLoading from "react-loading";
import PatientNavTabs from "../../components/PatientNavTabs";


const ChatApp = () => {
  const { pid } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [users, setUsers] = useState([]);
  const [patient, setPatient] = useState({});
  const [activeReciever, serActiveReciever] = useState("");
  const [sender, setSender] = useState("");
  const [role, setRole] = useState("");
  const [doctors, setDoctors] = useState([]);

  const socket = useRef();

  useEffect(() => {
    if (role === "Doctor" || role === "Medical Staff") {
      const userEmail = localStorage.getItem("email");
      socket.current = io("ws://localhost:8080");
      socket.current.emit("new-user-add", userEmail);
      return () => {
        socket.current.disconnect();
      };
    }
  }, [role]);

  useEffect(() => {
    if (role === "Doctor" || role === "Medical Staff") {
      socket.current.on("recieve-message", (data) => {
        if (data.receiverId === sender) {
          if (data.senderId === activeReciever) {
            console.log("Recieved message:", data["currentMessage"]);
            loadMessages(data.chatId);
          }
        }
      });
    }
  }, [role]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        setRole(roleResult.data.data.role_name);
        if (roleResult.data.data.role_name === "Admin" || roleResult.data.data.role_name === "PSadmin") {
          const getDoctorsResult = await getDoctorsChat(pid);
          console.log("doctorRes", getDoctorsResult)
          if (getDoctorsResult.success) {
            setDoctors(getDoctorsResult.data.data);
          } else {
            console.error("Failed to fetch doctors:", getDoctorsResult.data);
          }
        } else if (
          roleResult.data.data.role_name === "Medical Staff" ||
          roleResult.data.data.role_name === "Doctor"
        ) {
          const chatResult = await getAllChats(pid);
          let emailArray = [];
          if (chatResult.success) {
            emailArray = chatResult?.data.map((a) => a.receiverEmail);
            setChats(
              chatResult.data.filter(
                (chat) => chat.role == "Doctor" || chat.role == "Medical Staff"
              )
            );
          } else {
            console.error("Failed to fetch chats:", chatResult.data);
          }

          const patientRes = await getPatientById(pid);
          const result = await getUsers();
          if (result.success && patientRes.success) {
            const userEmail = localStorage.getItem("email");
            setPatient(patientRes.data.data);
            setSender(userEmail);
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
    fetchData();
  }, [messages]);

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
        setChatId(chatIdResp.data.chatId);
        loadMessages(chatIdResp.data.chatId);
      } else {
        console.error("Failed to fetch chatId:", chatIdResp.data);
      }
    } catch (error) {
      console.error("Error fetching chatId:", error);
    }
  };

  const loadSWChats = async (senderEmail) => {
    try {
      const SWResponse = await getAllSWChats(pid, senderEmail);
      if (SWResponse.success) {
        setChats(SWResponse.data);
        console.log(chats)
      }
    } catch (error) {
      console.error("Error fetching chatId:", error);
    }
  };

  const loadSWMessages = async (chatId) => {
    try {
      const response = await getSWMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      } else {
        console.error("Failed to fetch messages:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendCurrentMessage = async () => {
    try {
      const messageData = {
        message: currentMessage,
        receiver: activeReciever,
        pid: pid,
      };
      const response = await sendMessage(messageData);
      if (response.success) {
        socket.current?.emit("send-message", {
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
  };
  console.log(patient);
  const navigate = useNavigate();

  return (
    <div className="userProfile flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1 block w-full">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Flex justify="start" align="center" className="py-4 px-6">
            {/* Header with Breadcrumbs */}
            <PageHeader
              title="Doctor Chat"
              breadcrumbs={[
               // { label: "All Patients", path: "/patient" },
                { label: patient?.name || "Patient", path: `/userProfile/${pid}`, active: false },
                { label: "Doctor Chat", active: true }
              ]}
              onBack={() => navigate(`/userProfile/${pid}`)}
            />
          </Flex>

          {/* Navigation Tabs */}
          <PatientNavTabs
            patientId={pid}
            userData={patient}
            unreadAdminCount={0}
            unreadDoctorCount={chats?.reduce((s, c) => s + (c.unreadCount || 0), 0)}
            role={{ role_name: role }}
          />
        </Box>

        <div className="bg-gray-50 min-h-[calc(100vh-320px)] ">
          <Card className="w-full h-[80vh] rounded-2xl shadow-lg border-0">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 h-20 px-8 border-b border-gray-200 rounded-t-2xl">
              <h1 className="text-2xl font-bold text-gray-800">
                Doctor Chat
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
              {role !== "Admin" && role !== "PSadmin" ? (
                <div className="w-[35%] bg-white border-r border-gray-200 overflow-y-auto rounded-bl-2xl">
                  {chats.length > 0 || users.length > 0 ? (
                    <>
                      {chats.map((chat, index) => {
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
                            className={`flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all ${isActive
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
                            </div>
                            {chat.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white font-bold">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                      {users.map((user, index) => (
                        <div
                          key={index}
                          onClick={async () => {
                            serActiveReciever(user.email);
                            setLoading(true);
                            setChatId(null);
                            loadChats(user.email).then((res) => {
                              setLoading(false);
                            });
                          }}
                          className={`flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all ${user.email === activeReciever
                              ? "bg-blue-50 border-l-4 border-l-blue-600"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          <img
                            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                            src={dummyAdmin}
                            alt={user.firstname}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {user.firstname} {user.lastname}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No chats available
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[35%] bg-white border-r border-gray-200 overflow-y-auto rounded-bl-2xl">
                  {doctors.length > 0 ? (
                    doctors.map((doc, index) => (
                      <div
                        key={index}
                        onClick={async () => {
                          setSender(doc.email);
                          serActiveReciever("");
                          setLoading(true);
                          loadSWChats(doc.email).then((res) => {
                            setLoading(false);
                          });
                        }}
                        className="flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all"
                      >
                        <img
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                          src={dummyAdmin}
                          alt={doc.name}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {doc.name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No doctors available
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="w-[65%] flex flex-col bg-gradient-to-br from-gray-50 to-white rounded-br-2xl">
                {role === "Admin" || role === "PSadmin" ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chats.length > 0 ? (
                        chats.map((chat, index) => (
                          <Card key={index} className="p-4 border border-gray-200">
                            <details className="group">
                              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-800 hover:text-blue-600">
                                <svg
                                  className="h-5 w-5 rotate-0 transform group-open:rotate-180 transition-transform"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                                <img
                                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                  src={dummyAdmin}
                                  alt={chat.firstname}
                                />
                                {chat.firstname} {chat.lastname}
                              </summary>
                              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                                {loading ? (
                                  <div className="flex justify-center py-8">
                                    <ReactLoading
                                      type="bubbles"
                                      color={"#3b82f6"}
                                      height={40}
                                      width={40}
                                    />
                                  </div>
                                ) : chat.messages && chat.messages.length > 0 ? (
                                  chat.messages.map((message, msgIndex) => {
                                    const sent_at = new Date(message.sent_at);
                                    const isOwn = message.sender === sender;
                                    return (
                                      <div
                                        key={msgIndex}
                                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                      >
                                        <div className={`max-w-xs ${isOwn ? "items-end" : "items-start"}`}>
                                          <p className="text-xs text-gray-600 px-2 mb-1">
                                            {message.firstname} {message.lastname}
                                          </p>
                                          <div
                                            className={`px-4 py-2 rounded-lg text-sm ${isOwn
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-gray-200 text-gray-800 rounded-bl-none"
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
                                  <p className="text-center text-gray-400 text-sm">No messages</p>
                                )}
                              </div>
                            </details>
                          </Card>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>No conversations available</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                    style={{ transform: "scaleY(-1)" }}
                  >
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
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
                                className={`px-4 py-3 rounded-2xl text-gray-800 ${isOwn
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
                )}

                {/* Message Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 rounded-br-2xl">
                  {activeReciever !== "" && role !== "Admin" && role !== "PSadmin" ? (
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
                      {role === "Admin" || role === "PSadmin"
                        ? "Select a doctor to view conversations"
                        : "Select a chat to start messaging"}
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
