import React from "react";
import { useState, useEffect } from "react";
import { postDailyAlertsUpdateIsRead } from "../../../ApiCalls/remainingApis";
import { deleteAlertById } from "../../../ApiCalls/alertsApis";
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
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

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

  const toolbarBtn =
    "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

  return (
    <>
      <ThemedModalShell
        title="Important Alerts"
        onClose={onClose}
        width="min(1100px, 96vw)"
        maxHeight="90vh"
        toolbar={
          <>
            <button
              type="button"
              onClick={viewProfile}
              className={toolbarBtn}
              style={{
                borderColor: THEMED_MODAL.slate,
                color: THEMED_MODAL.slate,
                background: "#fff",
              }}
            >
              View Profile
            </button>
            <button
              type="button"
              onClick={consultDoctor}
              className={toolbarBtn}
              style={{
                borderColor: THEMED_MODAL.danger,
                background: THEMED_MODAL.danger,
                color: "#fff",
              }}
            >
              Consult Doctor
            </button>
            <button
              type="button"
              onClick={openSendMessage}
              className={toolbarBtn}
              style={{
                borderColor: THEMED_MODAL.blue,
                background: THEMED_MODAL.blue,
                color: "#fff",
              }}
            >
              Send Message
            </button>
          </>
        }
        bodyClassName="px-4 py-3"
      >
        {openSimpleModal && (
          <SimpleModal closeModal={closeModalSimple} image={imgUrl} />
        )}
        {smessage && (
          <SendMessage
            closeModal={closeSendMessage}
            patientid={alerts[0]?.patientId}
          />
        )}

        {Array.isArray(alerts) && alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert, index) => (
              <div
                key={alert.id ?? index}
                className="p-4 shadow-sm border rounded-xl transition-colors"
                style={{ borderColor: THEMED_MODAL.border }}
              >
                <div className="flex justify-between items-start gap-3 flex-col lg:flex-row">
                  <div className="min-w-0 flex-1 text-left">
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

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {isNavigableSystemAlert(alert) && (
                      <button
                        type="button"
                        onClick={() => handleOpenDestination(alert)}
                        className="text-xs font-semibold text-white px-3 py-1.5 rounded-md"
                        style={{ background: THEMED_MODAL.cyan }}
                        title="Open related page"
                      >
                        Open
                      </button>
                    )}
                    {getAlertMediaUrl(alert) && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 shadow-sm transition hover:bg-blue-100"
                        onClick={() =>
                          openModalSimple(getAlertMediaUrl(alert))
                        }
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
                    <p className="text-gray-700 text-sm font-bold">
                      {alert.date
                        ?.slice(0, 10)
                        .split("-")
                        .reverse()
                        .join("-")}
                    </p>
                    <button
                      type="button"
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
            ))}
          </div>
        ) : (
          <div className="text-center py-10" style={{ color: THEMED_MODAL.slate }}>
            No Alerts
          </div>
        )}
      </ThemedModalShell>
    </>
  );
};

export default AlertModal;
