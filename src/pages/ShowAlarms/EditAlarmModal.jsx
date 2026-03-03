/**
 * EditAlarmModal Component - Edit existing alarm
 * Refactored to use BaseAlarmModal
 * 
 * @file src/pages/ShowAlarms/EditAlarmModal.jsx
 */

import React from "react";
import BaseAlarmModal from "./BaseAlarmModal";
import { updateAlarm } from "../../ApiCalls/alarmsApis";

const EditAlarmModal = ({ closeModal, alarmData, pid, dosesData, mutate, onSuccess }) => {
  const handleSubmit = async (payload) => {
    const updateRunner = () => updateAlarm(alarmData.id, payload);
    const res = mutate
      ? await mutate(updateRunner, {
          waitForRefetch: true,
          refetchKeys: [`alarms_${pid}`],
        })
      : await updateRunner();
    return res;
  };

  return (
    <BaseAlarmModal
      closeModal={closeModal}
      isEdit={true}
      alarmData={alarmData}
      pid={pid}
      dosesData={dosesData}
      mutate={mutate}
      onSuccess={onSuccess}
      title="Edit Alarm"
      submitText="Update"
      onSubmit={handleSubmit}
      showPrescriptionViewer={false}
    />
  );
};

export default EditAlarmModal;
