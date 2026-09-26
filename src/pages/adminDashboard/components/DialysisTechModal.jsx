import React from "react";
import { useRef, useState, useEffect } from "react";
import { postDailyAlertsUpdateIsRead, postNotifsPushNotifs } from "../../../ApiCalls/remainingApis";
import SimpleModal from "./SimpleModal";
import { insertAlert } from "../../../ApiCalls/appAlerts";
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
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

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
    const alertAlerts = localStorage.getItem("Dialysis_updates");
    console.log(alertAlerts);
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
      alert("Your Message has been sent for immediate consultation")
    } catch (error) {
      console.error("Error inserting alert:", error);
      alert("something Went wrong please try again")
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
    const res = await postNotifsPushNotifs({
      user_id: 10,
      message: "Test",
      title: "Test",
    });
  };

  const viewProfile = async () => {
    try {
      const patientId = alerts[0].patientId;
      navigate(`/patients/${patientId}`, {});
    } catch (error) {}
  };
  // console.log(alerts);

  return (
    <>
      <ThemedModalShell
        title="Important Alerts"
        onClose={onClose}
        width="min(1100px, 96vw)"
        maxHeight="90vh"
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
                key={index}
                className="p-4 shadow-sm border rounded-xl"
                style={{ borderColor: THEMED_MODAL.border }}
              >
                <div className="flex justify-between items-start gap-3 flex-col lg:flex-row">
                  <div className="min-w-0 flex-1 text-left">
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: alert?.color || "red" }}
                    >
                      {alert.type?.split("https:")[0]}
                    </label>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {alert.questionType == "Upload" &&
                      (alert?.image?.endsWith(".pdf") ? (
                        <FaFilePdf
                          className="w-10 h-10 shadow-md cursor-pointer text-red-500"
                          onClick={() => openModalSimple(alert.image)}
                        />
                      ) : (
                        <img
                          src={alert.image}
                          alt="alert"
                          className="w-10 h-10 shadow-md cursor-pointer"
                          onClick={() => openModalSimple(alert.image)}
                        />
                      ))}
                    <p className="text-gray-700 text-sm font-bold">
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

export default DiaAlertModal;

