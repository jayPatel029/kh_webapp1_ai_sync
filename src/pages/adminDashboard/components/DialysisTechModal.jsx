import React, { useState, useEffect } from "react";
import { postDailyAlertsUpdateIsRead } from "../../../ApiCalls/remainingApis";
import SimpleModal from "./SimpleModal";
import { useNavigate } from "react-router-dom";
import GraphModal from "./graphModal";
import TableModal from "./TableModal";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";
import AlertListRow from "../../../components/dashboard/AlertListRow";
import { ROUTES } from "../../../routes/routeConstants";

const DiaAlertModal = ({ closeModal }) => {
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
  const [imgUrl, setImgUrl] = useState("");
  const navigate = useNavigate();

  const openModalSimple = (url) => {
    setOpenSimpleModal(true);
    setImgUrl(url);
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
      const raw = localStorage.getItem("Dialysis_updates");
      setAlerts(raw ? JSON.parse(raw) : []);
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
          email,
        });
      } catch (error) {
        console.error("Error updating isRead:", error);
      }
    }
    localStorage.removeItem("Dialysis_updates");
    localStorage.removeItem("alertAlerts");
    closeModal();
  };

  const viewProfile = () => {
    const pid = alerts[0]?.patientId;
    if (pid) navigate(ROUTES.userProfile(pid));
  };

  const toolbarBtn =
    "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

  return (
    <>
      <ThemedModalShell
        title="Dialysis Alerts"
        onClose={onClose}
        width="min(1100px, 96vw)"
        maxHeight="90vh"
        toolbar={
          alerts[0]?.patientId ? (
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
          ) : null
        }
        bodyClassName="px-4 sm:px-5 py-4"
      >
        {Array.isArray(alerts) && alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert, index) => (
              <AlertListRow
                key={alert.id ?? index}
                alert={alert}
                onOpenMedia={openModalSimple}
                onOpenGraph={openModalGraph}
                onOpenTable={openModalTable}
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

export default DiaAlertModal;
