/**
 * Inline Important Alerts list (same rows as AlertModal, no modal shell / toolbar).
 * Row click opens media / graph / table / route when applicable (main parity).
 * Mark-read happens only when the user acts on an actionable alert.
 *
 * @file src/components/dashboard/AlertListPanel.jsx
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { postDailyAlertsUpdateIsRead } from "../../ApiCalls/remainingApis";
import {
  isNavigableSystemAlert,
  openAlertDestination,
} from "../../helpers/alertNavigation";
import SimpleModal from "../../pages/adminDashboard/components/SimpleModal";
import GraphModal from "../../pages/adminDashboard/components/graphModal";
import TableModal from "../../pages/adminDashboard/components/TableModal";
import { getPatientId } from "../../helpers/alertGrouping";
import AlertListRow, {
  getAlertMediaUrl,
  isAlertRowUnread,
} from "./AlertListRow";
import { THEMED_MODAL } from "../modals/ThemedModalShell";

const AlertListPanel = ({ alerts = [], nameLookup = {}, onMarkRead }) => {
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

  const handleRowClick = async (alert, kind) => {
    if (!alert || !kind || kind === "none") return;

    if (kind === "media") {
      const url = getAlertMediaUrl(alert);
      if (!url) return;
      setImgUrl(url);
      setOpenSimpleModal(true);
      await markAlertRead(alert);
      return;
    }

    if (kind === "graph") {
      setPatientId(alert.patientId);
      setQuestionId(alert.questionId);
      setDailyorDia(alert.dailyordia);
      setIsGraphVar(alert.isGraph);
      setQuestionTitle(alert.questionTitle);
      setQuestionUnit(alert.questionUnit);
      setOpenGraphModal(true);
      await markAlertRead(alert);
      return;
    }

    if (kind === "table") {
      setPatientId(alert.patientId);
      setQuestionId(alert.questionId);
      setDailyorDia(alert.dailyordia);
      setIsGraphVar(alert.isGraph);
      setQuestionTitle(alert.questionTitle);
      setQuestionUnit(alert.questionUnit);
      setOpenTableModal(true);
      await markAlertRead(alert);
      return;
    }

    if (kind === "route" && isNavigableSystemAlert(alert)) {
      await markAlertRead(alert);
      await openAlertDestination(alert, navigate);
    }
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
        {alerts.map((item, index) => {
          const pid = getPatientId(item);
          const override = pid ? nameLookup[String(pid)] : undefined;
          return (
            <AlertListRow
              key={item.id ?? index}
              alert={item}
              patientNameOverride={override}
              onRowClick={handleRowClick}
            />
          );
        })}
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
  nameLookup: PropTypes.object,
  onMarkRead: PropTypes.func,
};

export default AlertListPanel;
