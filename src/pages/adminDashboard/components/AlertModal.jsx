import React from "react";
import { useState, useEffect } from "react";
import { postDailyAlertsUpdateIsRead } from "../../../ApiCalls/remainingApis";
import { updateIsReadAlert, deleteAlertById } from "../../../ApiCalls/alertsApis";
import SimpleModal from "./SimpleModal";
import { insertAlert } from "../../../ApiCalls/appAlerts";
import { useNavigate } from "react-router-dom";
import GraphModal from "./graphModal";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TableModal from "./TableModal";
import SendMessage from "./SendMessage";
import { FaFilePdf } from "react-icons/fa6";
import {
  isNavigableSystemAlert,
  openAlertDestination,
} from "../../../helpers/alertNavigation";
import { ROUTES } from "../../../routes/routeConstants";

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

  const openModalSimple = (nextImgUrl) => {
    setOpenSimpleModal(true);
    setImgUrl(nextImgUrl);
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
  };

  const closeModalTable = () => {
    setOpenTableModal(false);
  };

  useEffect(() => {
    try {
      const alertAlerts = localStorage.getItem("alertAlerts");
      setAlerts(alertAlerts ? JSON.parse(alertAlerts) : []);
    } catch {
      setAlerts([]);
    }
  }, []);

  const onClose = async () => {
    const email = localStorage.getItem("email");
    const sendAlerts = (alerts || []).filter(
      (alert) =>
        alert.isRead === 0 ||
        alert.isRead === "0" ||
        alert.isRead === false ||
        alert.isRead === "false"
    );
    if (sendAlerts.length > 0) {
      try {
        await postDailyAlertsUpdateIsRead({
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
  };

  const consultDoctor = async () => {
    try {
      const consultPatientId = alerts[0].patientId;
      const doctorEmail = localStorage.getItem("email");
      const category = "Consult Doctor";
      const mess = "";
      await insertAlert(doctorEmail, consultPatientId, category, mess);
      alert("Your Message has been sent for immediate consultation");
    } catch (error) {
      console.error("Error inserting alert:", error);
      alert("something Went wrong please try again");
    }
  };

  const getAlertMediaUrl = (alert) => alert?.image || alert?.url || alert?.mediaUrl || "";

  const handleMarkRead = async (alertId, index) => {
    try {
      await updateIsReadAlert({ id: alertId, isRead: 1 });
      setAlerts((prev) =>
        prev.map((a, i) => (i === index ? { ...a, isRead: 1 } : a))
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const handleDeleteAlert = async (alertId, index) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlertById(alertId);
      setAlerts((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert.");
    }
  };

  const handleOpenDestination = async (alert) => {
    const ok = await openAlertDestination(alert, navigate);
    if (ok) {
      localStorage.removeItem("alertAlerts");
      closeModal();
    }
  };

  const viewProfile = async () => {
    try {
      const pid = alerts[0]?.patientId;
      if (pid) navigate(ROUTES.userProfile(pid));
    } catch (error) {
      /* ignore */
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-10 bg-black/10 overflow-y-auto">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 w-max lg:w-[80%] h-[100vh] overflow-y-auto ">
          <div className="header flex justify-between border-b pb-2 mb-4 flex-col lg:flex-row">
            <h2 className="text-2xl font-bold text-center ">Important Alerts</h2>
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex lg:flex-row gap-2">
                <div
                  className="rounded-lg text-primary border-2 border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-gray-300 hover:text-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={viewProfile}
                >
                  View Profile
                </div>
                <div
                  className="rounded-lg text-white bg-red-600 border-red-900 w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-600 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={consultDoctor}
                >
                  Consult Doctor
                </div>
              </div>

              <div className="flex lg:flex-row gap-2">
                <div
                  className="rounded-lg text-white border-2 bg-primary border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={openSendMessage}
                >
                  Send Message
                </div>
                <div
                  className="rounded-lg text-red-900 border-2 border-red-900 w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-200 hover:text-red-900 transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={onClose}
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
                  key={alert.id ?? index}
                  className="p-4 shadow-md hover:shadow-lg border rounded-lg border-gray-200 transition duration-300 ease-in-out m-1"
                >
                  <div className="flex justify-between items-center flex-col lg:flex-row">
                    <div className="flex items-center">
                      <div className="mb-4 flex flex-col">
                        <label
                          className="block text-sm font-semibold mb-1"
                          style={{ color: alert?.color || "red" }}
                        >
                          {alert.type?.split("https:")[0]?.toUpperCase() || "ALERT"}
                        </label>
                        {alert.category && (
                          <span className="text-gray-800 text-sm font-medium">
                            {alert.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between space-x-3 flex-wrap gap-2">
                      {isNavigableSystemAlert(alert) && (
                        <button
                          type="button"
                          onClick={() => handleOpenDestination(alert)}
                          className="text-xs font-semibold bg-[#00cccc] text-white px-3 py-1.5 rounded-md hover:bg-[#00b3b3] transition-colors"
                          title="Open related page"
                        >
                          Open
                        </button>
                      )}
                      {getAlertMediaUrl(alert) && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 shadow-sm transition hover:bg-blue-100"
                          onClick={() => openModalSimple(getAlertMediaUrl(alert))}
                          title={
                            getAlertMediaUrl(alert).endsWith(".pdf")
                              ? "Open attached document"
                              : "Open attached image"
                          }
                        >
                          {getAlertMediaUrl(alert).endsWith(".pdf") ? (
                            <FaFilePdf className="h-4 w-4 text-red-500" />
                          ) : (
                            <ImageOutlinedIcon style={{ fontSize: 18 }} />
                          )}
                          <span className="text-xs font-semibold whitespace-nowrap">
                            {getAlertMediaUrl(alert).endsWith(".pdf")
                              ? "View file"
                              : "View image"}
                          </span>
                        </button>
                      )}
                      <p className="text-gray-700 text-sm font-bold mr-2">
                        {alert.date
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </p>
                      {(alert.isRead === 0 ||
                        alert.isRead === false ||
                        alert.isRead === "0") && (
                        <button
                          onClick={() => handleMarkRead(alert.id, index)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          title="Mark as read"
                        >
                          Mark Read
                        </button>
                      )}
                      {alert.isRead === 1 && (
                        <span className="text-xs text-green-500 px-2 py-1">✓ Read</span>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id, index)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 transition-colors"
                        title="Delete alert"
                      >
                        ✕
                      </button>
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
