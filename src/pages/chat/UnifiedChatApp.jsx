import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MdSend } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import dummyAdmin from "../../assets/dummyadmin.png";
import { Button, Input, Badge, Card } from "../../component-library";
import PatientDetailLayout from "../common/PatientDetailLayout";
import { getPatientById, getPatientMedicalTeam, getPatientAdminTeam } from "../../ApiCalls/patientAPis";
import { getDoctorsChat, getDoctors } from "../../ApiCalls/doctorApis";
import { identifyRole } from "../../ApiCalls/authapis";
import { getAllChatsAdmin, getChatId, getMessages, sendMessage, getAllChats, getAllSWChats, getSWMessages } from "../../ApiCalls/chatApis";
import { createMessageAlert } from "../../ApiCalls/alertsApis";
import { getUsers } from "../../ApiCalls/authapis";
import { ROUTES } from "../../routes/routeConstants";
import ReactLoading from "react-loading";

/**
 * Unified Chat Component for both Admin and Doctor chats
 * Consolidates duplicate logic and implements simplified Figma design
 */
const UnifiedChatApp = ({ chatType = "doctor" }) => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  // State management
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [patient, setPatient] = useState({});
  const [activeReciever, setActiveReciever] = useState("");
  const [sender, setSender] = useState("");
  const [adminTeam, setAdminTeam] = useState([]);
  const [medicalTeam, setMedicalTeam] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const socket = useRef();

  // Socket connection setup
  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    socket.current = io("ws://localhost:8080");
    socket.current.emit("new-user-add", userEmail);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    if (socket.current) {
      socket.current.on("recieve-message", (data) => {
        if (data.receiverId === sender && data.senderId === activeReciever) {
          loadMessages(data.chatId);
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("recieve-message");
      }
    };
  }, [sender, activeReciever]);

  // Load messages for a specific chat
  const loadMessages = async (chatId) => {
    try {
      const isSocialWorker = role === "Admin" || role === "PSadmin";
      const response = isSocialWorker ? await getSWMessages(chatId) : await getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      } else {
        console.error("Failed to fetch messages:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Get chat ID and load messages
  const loadChats = async (receiverEmail) => {
    try {
      const chatIdResp = await getChatId(receiverEmail, patientId);
      if (chatIdResp.success) {
        loadMessages(chatIdResp.data.chatId);
      } else {
        console.error("Failed to fetch chatId:", chatIdResp.data);
      }
    } catch (error) {
      console.error("Error fetching chatId:", error);
    }
  };

  // Load social worker chats (for Admin viewing doctor chats)
  const loadSWChats = async (senderEmail) => {
    try {
      const response = await getAllSWChats(patientId, senderEmail);
      if (response.success) {
        setChats(response.data);
      } else {
        console.error("Error fetching SW chats:", response.data);
      }
    } catch (error) {
      console.error("Error fetching SW chats:", error);
    }
  };

  // Initialize data based on user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleResult = await identifyRole();
        const userRole = roleResult.data.data.role_name;
        const userEmail = localStorage.getItem("email");

        setRole(userRole);
        setSender(userEmail);

        // Fetch patient data
        const patientRes = await getPatientById(patientId);
        setPatient(patientRes.data.data[0] || patientRes.data.data);

        if (userRole === "Admin" || userRole === "PSadmin") {
          // Admin/PSAdmin flow - viewing doctor chats
          if (chatType === "doctor") {
            const doctorsResult = await getDoctorsChat(patientId);
            if (doctorsResult.success) {
              setDoctors(doctorsResult.data.data || []);
            }
          } else {
            // Viewing admin chats
            const allChats = await getAllChatsAdmin(patientId);
            if (allChats.success) {
              setChats(
                allChats.data.filter(
                  (chat) => chat.role === "Doctor" || chat.role === "Medical Staff"
                )
              );

              const medicalTeamRes = await getPatientMedicalTeam(patientId);
              if (medicalTeamRes.success) {
                const emailArray = allChats.data.map((a) => a.receiverEmail);
                setMedicalTeam(
                  medicalTeamRes.data.data.filter(
                    (user) =>
                      user.email !== userEmail && emailArray.includes(user.email)
                  )
                );
              }
            }
          }
        } else if (
          userRole === "Doctor" ||
          userRole === "Medical Staff"
        ) {
          // Doctor/Medical Staff flow
          if (chatType === "admin") {
            // Talking to admin
            const adminTeamRes = await getPatientAdminTeam(patientId);
            if (adminTeamRes.success) {
              setAdminTeam(adminTeamRes.data.data || []);
              setActiveReciever(adminTeamRes.data.data[0]?.email || "");
            }
          } else {
            // Talking to other doctors
            const chatResult = await getAllChats(patientId);
            if (chatResult.success) {
              const emailArray = chatResult.data.map((a) => a.receiverEmail);
              setChats(
                chatResult.data.filter(
                  (chat) => chat.role === "Doctor" || chat.role === "Medical Staff"
                )
              );

              const allUsers = await getUsers();
              if (allUsers.success) {
                setUsers(
                  allUsers.data.data.filter(
                    (user) =>
                      user.email !== userEmail &&
                      !emailArray.includes(user.email) &&
                      (user.role === "Doctor" || user.role === "Medical Staff")
                  )
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    fetchData();
  }, [chatType, patientId]);

  // Send message
  const sendCurrentMessage = async () => {
    if (!currentMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      const messageData = {
        message: currentMessage.trim(),
        receiver: activeReciever,
        pid: patientId,
      };

      const response = await sendMessage(messageData);
      if (response.success) {
        if (role === "Doctor") {
          await createMessageAlert(response.data.chatId, currentMessage, patientId);
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
  };

  // Render contact list based on role
  const renderContactList = () => {
    const isAdminOrPSAdmin = role === "Admin" || role === "PSadmin";
    const isAdminChat = chatType === "admin";

    if (isAdminOrPSAdmin) {
      if (isAdminChat) {
        // Admin viewing medical team
        return (
          <>
            <div className="sticky top-0 noscrollbar  p-4">
              <p className="text-sm text-gray-600">
                {chats.length > 0 ? "Medical Team" : "Select the chat from below"}
              </p>
            </div>
            {chats.length > 0 ? (
              chats.map((chat, index) => {
                const isActive = chat.receiverEmail === activeReciever;
                const isInTeam = medicalTeam.some(
                  (member) => member.email === chat.receiverEmail
                );

                return (
                  <div
                    key={index}
                    onClick={async () => {
                      setActiveReciever(chat.receiverEmail);
                      setLoading(true);
                      await loadMessages(chat.id);
                      setLoading(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      src={dummyAdmin}
                      alt={chat.firstname}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {chat.firstname} {chat.lastname}
                      </p>
                      {!isInTeam && (
                        <p className="text-xs text-red-500">Not Assigned</p>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs">
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
          </>
        );
      } else {
        // Admin viewing doctor chats
        return (
          <>
            <div className="sticky top-0 bg-blue-50 p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">Doctors</p>
            </div>
            {doctors.length > 0 ? (
              doctors.map((doc, index) => (
                <div
                  key={index}
                  onClick={async () => {
                    setSender(doc.email);
                    setActiveReciever("");
                    setLoading(true);
                    await loadSWChats(doc.email);
                    setLoading(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <img
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    src={dummyAdmin}
                    alt={doc.name}
                  />
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {doc.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No doctors available
              </div>
            )}
          </>
        );
      }
    } else {
      // Doctor/Medical Staff
      const isEmpty = chats.length === 0 && users.length === 0;

      return (
        <>
          {isEmpty && (
            <div className="sticky top-0 bg-blue-50 p-4 border-b border-gray-200 text-center">
              <p className="text-sm text-gray-600">Select the chat from below</p>
            </div>
          )}
          {chats.length > 0 && (
            <>
              {chats.map((chat, index) => {
                const isActive = chat.receiverEmail === activeReciever;

                return (
                  <div
                    key={index}
                    onClick={async () => {
                      setActiveReciever(chat.receiverEmail);
                      setLoading(true);
                      await loadMessages(chat.id);
                      setLoading(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      src={dummyAdmin}
                      alt={chat.firstname}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {chat.firstname} {chat.lastname}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {users.length > 0 && (
            <>
              {users.map((user, index) => (
                <div
                  key={index}
                  onClick={async () => {
                    setActiveReciever(user.email);
                    setLoading(true);
                    await loadChats(user.email);
                    setLoading(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                    user.email === activeReciever
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    src={dummyAdmin}
                    alt={user.firstname}
                  />
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.firstname} {user.lastname}
                  </p>
                </div>
              ))}
            </>
          )}
          {isEmpty && (
            <div className="flex items-center justify-center h-full text-gray-500">
              No chats available
            </div>
          )}
        </>
      );
    }
  };

  // Render messages based on role
  const renderMessages = () => {
    const isAdminOrPSAdmin = role === "Admin" || role === "PSadmin";
    const isAdminChat = chatType === "admin";

    if (isAdminOrPSAdmin && isAdminChat && chats.length > 0) {
      // Show all doctor chats in expandable cards (Admin view)
      return (
        <div className="space-y-3 p-6">
          {chats.map((chat, index) => (
            <Card key={index} className="p-4">
              <details className="group">
                <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-800 hover:text-blue-600">
                  <svg
                    className="h-5 w-5 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <img
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    src={dummyAdmin}
                    alt={chat.firstname}
                  />
                  <span className="text-sm">
                    {chat.firstname} {chat.lastname}
                  </span>
                </summary>

                <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <ReactLoading type="bubbles" color="#3b82f6" height={40} width={40} />
                    </div>
                  ) : chat.messages && chat.messages.length > 0 ? (
                    chat.messages.map((message, msgIdx) => {
                      const sent_at = new Date(message.sent_at);
                      const isOwn = message.sender === sender;

                      return (
                        <div
                          key={msgIdx}
                          className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-xs ${isOwn ? "items-end" : "items-start"}`}>
                            <p className="text-xs text-gray-600 px-2 mb-1">
                              {message.firstname} {message.lastname}
                            </p>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                isOwn
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
                    <p className="text-center text-gray-400 text-sm py-4">No messages</p>
                  )}
                </div>
              </details>
            </Card>
          ))}
        </div>
      );
    } else {
      // Regular message view
      return (
        <div className="space-y-4 p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <ReactLoading type="bubbles" color="#3b82f6" height={80} width={80} />
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => {
              const sent_at = new Date(message.sent_at);
              const isOwn = message.sender === sender;

              return (
                <div
                  key={index}
                  className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
                    <p className="text-xs text-gray-600 px-2 mb-1">
                      {message.firstname} {message.lastname}
                    </p>
                    <div
                      className={`px-4 py-3 rounded-lg text-sm ${
                        isOwn
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
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>
      );
    }
  };

  const title = chatType === "admin" ? "Admin Chat" : "Doctor Chat";
  const title2 = chatType === "admin" ? "Admin Chat" : "Doctor Chat";

  return (
    <PatientDetailLayout
      title={title}
      patientIdParam="id"
      userData={patient}
      totalUnreadCount={chatType === "admin" ? chats?.reduce((s, c) => s + (c.unreadCount || 0), 0) : 0}
      totalUnreadCountDoc={chatType === "doctor" ? chats?.reduce((s, c) => s + (c.unreadCount || 0), 0) : 0}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      <div className="h-[80vh] flex flex-col">
        {/* Top Header - Figma Design */}
        {/* <div className="border-b-2 border-cyan-400 flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-bold text-gray-800">{title2}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{patient?.name}</span>
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={patient?.profile_photo || dummyAdmin}
              alt="Patient"
            />
            <button
              onClick={() => navigate(ROUTES.PATIENTS)}
              className="text-cyan-400 hover:text-cyan-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div> */}

        {/* Main Chat Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Contact List */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto noscrollbar">
            {renderContactList()}
          </div>

          {/* Right Side - Messages Area */}
          <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
              {renderMessages()}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-6">
              {activeReciever || (role === "Admin" && chatType === "doctor") ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendCurrentMessage();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={sendCurrentMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition-colors flex items-center justify-center"
                  >
                    <MdSend className="text-xl" />
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">
                  Select a chat to start messaging
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PatientDetailLayout>
  );
};

export default UnifiedChatApp;
