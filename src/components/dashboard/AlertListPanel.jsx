/**
 * Inline Important Alerts list (same rows as AlertModal, no modal shell / toolbar).
 * Mark-read happens only when the user acts on an alert.
 *
 * @file src/components/dashboard/AlertListPanel.jsx
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { postDailyAlertsUpdateIsRead } from "../../ApiCalls/remainingApis";
import { deleteAlertById } from "../../ApiCalls/alertsApis";
import {
  isNavigableSystemAlert,
  openAlertDestination,
} from "../../helpers/alertNavigation";
import SimpleModal from "../../pages/adminDashboard/components/SimpleModal";
import GraphModal from "../../pages/adminDashboard/components/graphModal";
import TableModal from "../../pages/adminDashboard/components/TableModal";
import AlertListRow, { isAlertRowUnread } from "./AlertListRow";
import { THEMED_MODAL } from "../modals/ThemedModalShell";

const AlertListPanel = ({ alerts = [], onMarkRead, onDelete }) => {
  const navigate = useNavigate();
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

  const markAlertRead = async (alert) => {
    if (!alert || !isAlertRowUnread(alert)) return;
    const email = localStorage.getItem("email");
    try {
      await postDailyAlertsUpdateIsRead({
        alerts: [alert],
        email,
      });
      onMarkRead?.(alert);
    } catch (error) {
      console.error("Error updating isRead:", error);
    }
  };

  const openModalSimple = async (nextImgUrl, alert) => {
    setImgUrl(nextImgUrl);
    setOpenSimpleModal(true);
    await markAlertRead(alert);
  };

  const openModalGraph = async (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);
    setOpenGraphModal(true);
    await markAlertRead(alert);
  };

  const openModalTable = async (alert) => {
    setPatientId(alert.patientId);
    setQuestionId(alert.questionId);
    setDailyorDia(alert.dailyordia);
    setIsGraphVar(alert.isGraph);
    setQuestionTitle(alert.questionTitle);
    setQuestionUnit(alert.questionUnit);
    setOpenTableModal(true);
    await markAlertRead(alert);
  };

  const handleDeleteAlert = async (item) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlertById(item.id);
      onDelete?.(item);
    } catch (error) {
      console.error("Error deleting alert:", error);
      window.alert("Failed to delete alert.");
    }
  };

  const handleOpenDestination = async (alert) => {
    await markAlertRead(alert);
    await openAlertDestination(alert, navigate);
  };

  if (!Array.isArray(alerts) || alerts.length === 0) {
    return (
      <p
        className="text-sm py-10"
        style={{ color: THEMED_MODAL.slate, textAlign: "left" }}
      >
        No alerts
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {alerts.map((item, index) => (
          <AlertListRow
            key={item.id ?? index}
            alert={item}
            onOpenDestination={
              isNavigableSystemAlert(item) ? handleOpenDestination : undefined
            }
            onOpenMedia={(url) => openModalSimple(url, item)}
            onOpenGraph={openModalGraph}
            onOpenTable={openModalTable}
            onDelete={handleDeleteAlert}
          />
        ))}
      </div>

      {openSimpleModal && (
        <SimpleModal
          closeModal={() => setOpenSimpleModal(false)}
          image={imgUrl}
        />
      )}
      {openGraphModal && (
        <GraphModal
          closeModal={() => setOpenGraphModal(false)}
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
          closeModal={() => setOpenTableModal(false)}
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

AlertListPanel.propTypes = {
  alerts: PropTypes.array,
  onMarkRead: PropTypes.func,
  onDelete: PropTypes.func,
};

export default AlertListPanel;
