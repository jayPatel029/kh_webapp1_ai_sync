/**
 * AlarmModal Component - Add new alarm
 * Refactored to use BaseAlarmModal
 * 
 * @file src/pages/ShowAlarms/AlarmModal.jsx
 */

import React from "react";
import BaseAlarmModal from "./BaseAlarmModal";
import { insertAlarm } from "../../ApiCalls/alarmsApis";

const AlarmModal = ({ closeModal, pid, patient, mutate, onSuccess }) => {
  const handleSubmit = async (payload) => {
    const submitRunner = () => insertAlarm(payload);
    const res = mutate
      ? await mutate(submitRunner, {
          waitForRefetch: true,
          refetchKeys: [`alarms_${pid}`],
        })
      : await submitRunner();
    return res;
  };

  return (
    <BaseAlarmModal
      closeModal={closeModal}
      isEdit={false}
      pid={pid}
      mutate={mutate}
      onSuccess={onSuccess}
      title="Add Alarm"
      submitText="Submit"
      onSubmit={handleSubmit}
      showPrescriptionViewer={true}
    />
  );
};

export default AlarmModal;
