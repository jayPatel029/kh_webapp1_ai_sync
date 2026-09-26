/**
 * Shared View Profile / Consult Doctor / Send Message toolbar for
 * alert viewer modals (graph, table, image/PDF).
 *
 * @file src/components/dashboard/AlertViewerToolbar.jsx
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { insertAlert } from "../../ApiCalls/appAlerts";
import { ROUTES } from "../../routes/routeConstants";
import { THEMED_MODAL } from "../modals/ThemedModalShell";
import SendMessage from "../../pages/adminDashboard/components/SendMessage";

const toolbarBtn =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

const AlertViewerToolbar = ({ patientId }) => {
  const navigate = useNavigate();
  const [smessage, setSmessage] = useState(false);

  if (!patientId) return null;

  const viewProfile = () => {
    navigate(ROUTES.userProfile(patientId));
  };

  const consultDoctor = async () => {
    try {
      const doctorEmail = localStorage.getItem("email");
      await insertAlert(doctorEmail, patientId, "Consult Doctor", "");
      window.alert("Your Message has been sent for immediate consultation");
    } catch (error) {
      console.error("Error inserting alert:", error);
      window.alert("something Went wrong please try again");
    }
  };

  return (
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
        onClick={() => setSmessage(true)}
        className={toolbarBtn}
        style={{
          borderColor: THEMED_MODAL.blue,
          background: THEMED_MODAL.blue,
          color: "#fff",
        }}
      >
        Send Message
      </button>
      {smessage ? (
        <SendMessage
          closeModal={() => setSmessage(false)}
          patientid={patientId}
        />
      ) : null}
    </>
  );
};

AlertViewerToolbar.propTypes = {
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AlertViewerToolbar;
