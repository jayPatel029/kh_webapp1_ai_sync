import React from "react";
import { useState, useEffect } from "react";
import { postDailyAlertsUpdateIsRead } from "../../../ApiCalls/remainingApis";
import { deleteAlertById } from "../../../ApiCalls/alertsApis";
import SimpleModal from "./SimpleModal";
import { insertAlert } from "../../../ApiCalls/appAlerts";
import { useNavigate } from "react-router-dom";
import GraphModal from "./graphModal";
import TableModal from "./TableModal";
import SendMessage from "./SendMessage";
import {
  isNavigableSystemAlert,
  openAlertDestination,
} from "../../../helpers/alertNavigation";
import { ROUTES } from "../../../routes/routeConstants";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";
import AlertListRow from "../../../components/dashboard/AlertListRow";

const toolbarBtn =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

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

  const openSendMessage = () => setSmessage(true);
  const closeSendMessage = () => setSmessage(false);

  const openModalSimple = (nextImgUrl) => {
    setOpenSimpleModal(true);
    setImgUrl(nextImgUrl);
  };
  const closeModalSimple = () => setOpenSimpleModal(false);

  const openModalGraph = (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);
    setOpenGraphModal(true);
  };
  const closeModalGraph = () => setOpenGraphModal(false);

  const openModalTable = (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);
    setOpenTableModal(true);
  };
  const closeModalTable = () => setOpenTableModal(false);

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
      await insertAlert(doctorEmail, consultPatientId, "Consult Doctor", "");
      alert("Your Message has been sent for immediate consultation");
    } catch (error) {
      console.error("Error inserting alert:", error);
      alert("something Went wrong please try again");
    }
  };

  const handleDeleteAlert = async (alert) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlertById(alert.id);
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
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
    } catch {
      /* ignore */
    }
  };

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
        bodyClassName="px-4 sm:px-5 py-4"
      >
        {Array.isArray(alerts) && alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert, index) => (
              <AlertListRow
                key={alert.id ?? index}
                alert={alert}
                onOpenDestination={
                  isNavigableSystemAlert(alert)
                    ? handleOpenDestination
                    : undefined
                }
                onOpenMedia={openModalSimple}
                onOpenGraph={openModalGraph}
                onOpenTable={openModalTable}
                onDelete={handleDeleteAlert}
              />
            ))}
          </div>
        ) : (
          <p
            className="text-sm py-10"
            style={{ color: THEMED_MODAL.slate, textAlign: "left" }}
          >
            No alerts
          </p>
        )}
      </ThemedModalShell>

      {openSimpleModal && (
        <SimpleModal closeModal={closeModalSimple} image={imgUrl} />
      )}
      {smessage && (
        <SendMessage
          closeModal={closeSendMessage}
          patientid={alerts[0]?.patientId}
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
    </>
  );
};

export default AlertModal;
