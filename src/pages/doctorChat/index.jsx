import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { io } from "socket.io-client";
import { MdKeyboardBackspace } from "react-icons/md";
import { MdSend } from "react-icons/md";
import dummyAdmin from "../../assets/dummyadmin.png";
import { getUsers } from "../../ApiCalls/authapis";
import { getPatientById } from "../../ApiCalls/patientAPis";
import { useParams,Link } from "react-router-dom";
import { identifyRole } from "../../ApiCalls/authapis";
import { getDoctors, getDoctorsChat } from "../../ApiCalls/doctorApis";

import {
  getChatId,
  getMessages,
  sendMessage,
  getAllChats,
  getAllSWChats,
  getSWMessages,
} from "../../ApiCalls/chatApis";
import ReactLoading from "react-loading";

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
        if (roleResult.data.data.role_name === "Admin" || roleResult.data.data.role_name==="PSadmin") {
          const getDoctorsResult = await getDoctorsChat(pid);
          console.log("doctorRes",getDoctorsResult)
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
       <Link to={`/userProfile/${pid}`} className="text-primary border-b-2 border-primary">
                go back
                </Link>
       </div>
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40 ">
          <div className=" w-full bg-white h-[80vh] rounded-lg border-t-4 border-primary shadow-2xl">
            <div className="flex bg-white h-[8vh] border-b-2 border-gray-300">
              <div className="w-[35%] h-full flex items-center px-8">
                <span className="text-2xl font-bold text-primary">
                  Doctor Chats
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
              {role !== "Admin" && role!=="PSadmin"? (
                <div className="bg-white w-[35%] rounded-bl-lg h-full border-r-2 border-gray-300 overflow-y-scroll">
                  {chats.map((chat, index) => {
                    return (
                      <div
                        key={index}
                        className={
                          chat.receiverEmail === activeReciever
                            ? "w-full p-3 border-b-2  border-gray-300 bg-gray-100"
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
                        {chat.unreadCount > 0 && (
                          <span className=" rounded-full inline-flex justify-center w-6 h-6 items-center text-xs p-0 text-center ml-2 bg-primary text-white">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {users.map((user, index) => (
                    <div
                      key={index}
                      className={
                        user.email === activeReciever
                          ? "w-full p-3 border-b-2  border-gray-300 bg-gray-100"
                          : "w-full p-3 border-b-2 cursor-pointer border-gray-300 bg-white"
                      }
                      onClick={async () => {
                        serActiveReciever(user.email);
                        setLoading(true);
                        setChatId(null);
                        loadChats(user.email).then((res) => {
                          setLoading(false);
                        });
                      }}
                    >
                      <img
                        className="inline-block h-12 w-12 mx-4"
                        src={dummyAdmin}
                      />
                      {user.firstname} {user.lastname}{" "}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white w-[35%] rounded-bl-lg h-full border-r-2 border-gray-300 overflow-y-scroll">
                  {doctors.map((doc, index) => (
                    <div
                      key={index}
                      className="w-full p-3 border-b-2 cursor-pointer border-gray-300 bg-white"
                      onClick={async () => {
                        setSender(doc.email);
                        serActiveReciever("");
                        setLoading(true);
                        loadSWChats(doc.email).then((res) => {
                          setLoading(false);
                        });
                      }}
                    >
                      <img
                        className="inline-block h-12 w-12 mx-4"
                        src={dummyAdmin}
                      />
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}
              <div className="items-center justify-center w-[65%] bg-gradient-to-br from-gray-200 to-white rounded-br-lg h-full">
                {role === "Admin" || role==="PSadmin"? (
                  <>
                    <div className="w-full h-[88%] overflow-y-scroll p-2">
                      {chats.map((chat, index) => (
                        <details
                          key={index}
                          class="group text-lg py-5 w-full p-3 border-b-2 cursor-pointer border-gray-300 bg-white"
                        >
                          <summary class="flex cursor-pointer flex-row items-center marker:[font-size:0px]">
                            <svg
                              class="h-6 w-6 rotate-0 transform text-gray-400 group-open:rotate-180"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="2"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>{" "}
                            <img
                              className="inline-block h-12 w-12 mx-4"
                              src={dummyAdmin}
                            />
                            {chat.firstname} {chat.lastname}
                          </summary>
                          <div className="overflow-y-scroll h-[88%] p-8">
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
                              chat.messages.map((message, index) => {
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
                                  >
                                    <div>
                                      <div className="px-2 text-gray-500">
                                        {message.firstname} {message.lastname}
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
                                        {sent_at.toLocaleDateString(
                                          "en-GB",
                                          options
                                        )}{" "}
                                        {sent_at.toLocaleTimeString(
                                          "en-GB",
                                          timeopts
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </>
                ) : (
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
                                {message.firstname} {message.lastname}
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
                                {sent_at.toLocaleDateString("en-GB", options)}{" "}
                                {sent_at.toLocaleTimeString("en-GB", timeopts)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                <div className="w-full h-[12%] bg-white flex justify-center items-center p-2">
                  {activeReciever !== "" && role !== "Admin" && (
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
