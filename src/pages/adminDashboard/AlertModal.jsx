import React from "react";
import { useRef, useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import SimpleModal from "./SimpleModal";
import { server_url } from "../../constants/constants";
import { insertAlert } from "../../ApiCalls/appAlerts";
import { Link, useNavigate } from "react-router-dom";
import GraphModal from "./graphModal";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import InsightsIcon from "@mui/icons-material/Insights";
import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";
import TableModal from "./TableModal";
import WarningIcon from "@mui/icons-material/Warning";
import SendMessage from "./SendMessage";
import { FaFilePdf } from "react-icons/fa6";
import ThumbnailModal from "./ThumbnailModal";

const AlertModal = ({ closeModal }) => {
  const [alerts, setAlerts] = useState([]);
  const [openSimpleModal, setOpenSimpleModal] = useState(false);
  const [openGraphModal, setOpenGraphModal] = useState(false);
  const [openTableModal, setOpenTableModal] = useState(false);
  const [patientId, setPatientId] = useState();
  const [questionId, setQuestionId] = useState();
  const [dailyordia, setDailyorDia] = useState();
  const [isGraphVar, setIsGraphVar] = useState();
  const [questionTitle, setQuestionTitle] = useState();
  const [questionUnit, setQuestionUnit] = useState();
  const [smessage, setSmessage] = useState("");

  const [imgUrl, setImgUrl] = useState("");
  const navigate = useNavigate();

  const openSendMessage = () => {
    setSmessage(true);
  };

  const closeSendMessage = () => {
    setSmessage(false);
  };

  const openModalSimple = (imgUrl) => {
    setOpenSimpleModal(true);
    setImgUrl(imgUrl);
  };

  const closeModalSimple = () => {
    setOpenSimpleModal(false);
  };

  const openModalGraph = (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);

    setOpenGraphModal(true);

    // console.log("alert in graph modal", alert)
  };

  const closeModalGraph = () => {
    setOpenGraphModal(false);
  };

  const openModalTable = (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);

    setOpenTableModal(true);

    // console.log("alert in Table modal", alert)
  };

  const closeModalTable = () => {
    setOpenTableModal(false);
  };

  useEffect(() => {
    const alertAlerts = localStorage.getItem("alertAlerts");
    setAlerts(JSON.parse(alertAlerts));
  }, []);

  const onClose = async () => {
    const email = localStorage.getItem("email");
    var sendAlerts = alerts.filter(
      (alert) =>
        alert.isRead === 0 ||
        alert.isRead === "0" ||
        alert.isRead === false ||
        alert.isRead === "false"
    );
    console.log("Send", sendAlerts);
    if (sendAlerts.length > 0) {
      try {
        await axiosInstance.post(`${server_url}/dailyAlerts/updateisRead`, {
          alerts: sendAlerts,
          email: email,
        });
        localStorage.removeItem("alertAlerts");
      } catch (error) {
        console.error("Error updating isRead:", error);
      }
    }
    localStorage.removeItem("alertAlerts");
    closeModal();
    // window.location.reload();
  };

  const consultDoctor = async () => {
    console.log("consulting doctor....");
    try {
      console.log(alerts);
      const patientId = alerts[0].patientId;
      const doctorEmail = localStorage.getItem("email");
      const category = "Consult Doctor";
      const mess = "";
      await insertAlert(doctorEmail, patientId, category, mess);
      alert("Your Message has been sent for immediate consultation");
    } catch (error) {
      console.error("Error inserting alert:", error);
      alert("something Went wrong please try again");
    }
  };

  const sendMessageDoctor = async () => {
    console.log("consulting doctor....");
    try {
      console.log(alerts);
      const patientId = alerts[0].patientId;
      const doctorEmail = localStorage.getItem("email");
      const category = "Consult Doctor";
      const mess = "";
      await insertAlert(doctorEmail, patientId, category, mess);
    } catch (error) {
      console.error("Error inserting alert:", error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState("");
  const openThumbnailModal = (image) => {
    setIsModalOpen(true);
    setImage(image);
  };
  const closeThumbnailModal = () => {
    setIsModalOpen(false);
  };

  const cosultDoctor = async (alert) => {
    // http://localhost:8080/api/notifs/pushNotifs
    const res = await axiosInstance.post(`${server_url}/notifs/pushNotifs`, {
      user_id: 10,
      message: "Test",
      title: "Test",
    });
  };

  const viewProfile = async () => {
    try {
      const patientId = alerts[0].patientId;
      navigate(`/userProfile/${patientId}`, {});
    } catch (error) {}
  };
  // console.log(alerts);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 w-max lg:w-[80%] h-[100vh] overflow-y-auto ">
          <div className="header flex justify-between border-b pb-2 mb-4 flex-col lg:flex-row">
            <h2 className="text-2xl font-bold text-center ">
              Important Alerts
            </h2>
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex lg:flex-row gap-2">
                <div
                  className="rounded-lg text-primary border-2 border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-gray-300 hover:text-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={viewProfile}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  View Profile
                </div>
                <div
                  className="rounded-lg text-white bg-red-900 border-red-900 w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-600 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={consultDoctor}
                >
                  Consult Doctor
                </div>
              </div>

              <div className="flex lg:flex-row gap-2">
                <div
                  className="rounded-lg text-white border-2 bg-primary border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={openSendMessage}
                >
                  Send Message
                </div>
                <div
                  className="rounded-lg text-red-900 border-2 border-red-900 w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-200 hover:text-red-900 transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={onClose}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Close
                </div>
              </div>
            </div>
          </div>

          {openSimpleModal && (
            <SimpleModal closeModal={closeModalSimple} image={imgUrl} />
          )}
          {smessage && (
            <SendMessage
              closeModal={closeSendMessage}
              patientid={alerts[0].patientId}
            />
          )}

          <div className="overflow-y-auto">
            {Array.isArray(alerts) ? (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-4 shadow-md hover:shadow-lg border rounded-lg border-gray-200 transition duration-300 ease-in-out m-1"
                >
                  <div className="flex justify-between items-center flex-col lg:flex-row">
                    <div className="flex items-center">
                      <div className="mb-4">
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{ color: alert?.color || "red" }}
                        >
                          {alert.type?.split("https:")[0]}
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between space-x-3">
                      {alert.questionType == "Upload" &&
                        (alert?.image?.endsWith(".pdf") ? (
                          <FaFilePdf
                            className="w-10 h-10 lg:ml-[500px] shadow-md cursor-pointer text-red-500"
                            onClick={() => openModalSimple(alert.image)}
                          />
                        ) : (
                          <img
                            src={alert.image}
                            alt="alert"
                            className="w-10 h-10 lg:ml-[500px] shadow-md cursor-pointer"
                            onClick={() => openModalSimple(alert.image)}
                          />
                        ))}
                      <p className="text-gray-700 text-sm font-bold mr-2">
                        {alert.date
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </p>
                      {alert.questionId && (
                        <div>
                          {alert.isGraph === 1 && (
                            <InsertChartIcon
                              className="text-primary cursor-pointer transition duration-300 ease-in-out hover:text-blue-500 transform hover:scale-110"
                              style={{ fontSize: "2rem" }}
                              onClick={() => openModalGraph(alert)}
                            />
                          )}
                          {alert.isGraph === 0 && (
                            <DatasetLinkedIcon
                              className="text-primary cursor-pointer transition duration-300 ease-in-out hover:text-blue-500 transform hover:scale-110"
                              style={{ fontSize: "2rem" }}
                              onClick={() => openModalTable(alert)}
                            />
                          )}
                          {openGraphModal && (
                            <GraphModal
                              closeModal={closeModalGraph}
                              patientId={patientId}
                              questionId={questionId}
                              dailyordia={dailyordia}
                              isGraph={isGraphVar}
                              questionTitle={questionTitle}
                              questionUnit={questionUnit}
                            />
                          )}
                          {openTableModal && (
                            <TableModal
                              closeModal={closeModalTable}
                              patientId={patientId}
                              questionId={questionId}
                              dailyordia={dailyordia}
                              isGraph={isGraphVar}
                              questionTitle={questionTitle}
                              questionUnit={questionUnit}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center">No Alerts</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertModal;
