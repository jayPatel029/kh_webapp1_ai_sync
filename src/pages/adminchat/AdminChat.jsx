import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { io } from "socket.io-client";
import { MdSend } from "react-icons/md";
import dummyAdmin from "../../assets/dummyadmin.png";
import { getUsers } from "../../ApiCalls/authapis";

import {
  getPatientById,
  getPatientMedicalTeam,
} from "../../ApiCalls/patientAPis";
import { useParams, Link, useLocation } from "react-router-dom";
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
import { createMessageAlert } from "../../ApiCalls/alertsApis";

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

  return (
    <div className="userProfile md:flex block">
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="bg-gray-100 p-4">
          <Link
            to={`/userProfile/${pid}`}
            className="text-primary border-b-2 border-primary"
          >
            go back
          </Link>
        </div>
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40 ">
          <div className=" w-full bg-white h-[80vh] rounded-lg border-t-4 border-primary shadow-2xl">
            <div className="flex bg-white h-[8vh] border-b-2 border-gray-300">
              <div className="w-[35%] h-full flex items-center px-8">
                <span className="text-2xl font-bold text-primary">
                  Admin Chats
                </span>
              </div>
              <div className=" flex items-center justify-end w-[65%] px-8 h-full">
                {patient?.name}
                <img
                  className="inline-block h-10 w-10 mx-4 rounded-full"
                  src={
                    patient?.profile_photo ? patient?.profile_photo : dummyAdmin
                  }
                />
              </div>
            </div>
            <div className="flex h-[72vh]">
              {role === "Admin" || role === "PSadmin" ? (
                <div className="bg-white w-[35%] rounded-bl-lg h-full border-r-2 border-gray-300">
                  {chats.map((chat, index) => {
                    // Check if the chat's receiver email is in the medical team
                    const isInMedicalTeam = medicalTeam.some(
                      (member) => member.email === chat.receiverEmail
                    );

                    return (
                      <div
                        key={index}
                        className={
                          chat.receiverEmail === activeReciever
                            ? "w-full p-3 border-b-2 border-gray-300 bg-gray-100"
                            : "w-full p-3 border-b-2 cursor-pointer border-gray-300 bg-white"
                        }
                        onClick={async () => {
                          serActiveReciever(chat.receiverEmail);
                          setLoading(true);
                          loadMessages(chat.id).then((res) => {
                            setLoading(false);
                          });
                        }}
                      >
                        <img
                          className="inline-block h-12 w-12 mx-4"
                          src={dummyAdmin}
                        />
                        {chat.firstname} {chat.lastname}
                        {!isInMedicalTeam && (
                          <span className="text-sm text-red-500 ml-4">
                            (This user is not Assigned)
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="rounded-full inline-flex justify-center w-6 h-6 items-center text-xs p-0 text-center ml-2 bg-primary text-white">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white w-[35%] rounded-bl-lg h-full border-r-2 border-gray-300">
                  <div className="w-full p-3 border-b-2 cursor-pointer border-gray-300 bg-white text-center text-lg text-primary">
                    Assigned Admins
                  </div>
                  {adminTeam.map((admin, index) => (
                    <div
                      key={index}
                      className="w-full p-3 border-b-2 border-gray-300 bg-white"
                    >
                      <img
                        className="inline-block h-12 w-12 mx-4"
                        src={dummyAdmin}
                      />
                      {admin.firstname} {admin.lastname}
                    </div>
                  ))}
                </div>
              )}
              <div className="items-center justify-center w-[65%] bg-gradient-to-br from-gray-200 to-white rounded-br-lg h-full">
                <div
                  className="w-full h-[88%] overflow-y-scroll p-8"
                  style={{ transform: "scaleY(-1)" }}
                >
                  {loading ? (
                    <div className="h-full w-full flex justify-center items-center">
                      <ReactLoading
                        type="bubbles"
                        color={"#19b9d4"}
                        height={100}
                        width={100}
                      />
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const sent_at = new Date(message.sent_at);
                      const options = {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      };
                      const timeopts = {
                        hour: "2-digit",
                        minute: "2-digit",
                      };

                      return (
                        <div
                          key={index}
                          className={
                            message.sender === sender
                              ? "w-full flex justify-end py-2"
                              : "w-full flex py-2"
                          }
                          style={{ transform: "scaleY(-1)" }}
                        >
                          <div>
                            <div className="px-2 text-gray-500">
                              {message.firstname} {message.lastname}{" "}
                            </div>
                            <div
                              className={
                                message.sender === sender
                                  ? "p-4 rounded-t-xl rounded-bl-xl bg-yellow-300"
                                  : "p-4 rounded-t-xl rounded-br-xl bg-blue-300"
                              }
                            >
                              {message.message}
                            </div>
                            <div className="px-2 text-gray-500">
                              <span className="pr-4">
                                {sent_at.toLocaleDateString("en-GB", options)}
                              </span>
                              {sent_at.toLocaleTimeString("en-GB", timeopts)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="w-full h-[12%] bg-white flex justify-center items-center p-2">
                  {activeReciever !== "" && (
                    <>
                      <input
                        type="text"
                        placeholder="Enter your message here..."
                        value={currentMessage}
                        onChange={(e) => {
                          setCurrentMessage(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            sendCurrentMessage();
                          }
                        }}
                        className="border border-gray-300 text-gray-500 text-md rounded-lg block w-[85%] p-2 focus:outline-primary"
                      />
                      <button
                        onClick={sendCurrentMessage}
                        className="bg-primary text-white rounded-lg w-[8%] mx-2 p-2 flex justify-center items-center"
                      >
                        <MdSend className="text-2xl" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
