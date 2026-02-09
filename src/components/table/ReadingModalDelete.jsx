/**
 * ReadingModalDelete Component (Unified)
 * Modal for confirming reading deletion (both regular and dialysis)
 * 
 * @file src/components/table/ReadingModalDelete.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { ConfirmModal, Text } from "../../component-library";

export default function ReadingModalDelete({ 
  id, 
  closeModal, 
  onSuccess, 
  date,
  type = 'regular', // 'regular' or 'dialysis'
}) {
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoint = type === 'dialysis' ? 'dialysisReading' : 'readings';

  const handleDelete = () => {
    deleteReading({ id });
  };

  const deleteReading = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/${apiEndpoint}/delete`, data)
      .then((response) => {
        if (response.data.success === false) {
          setErrMessage(response.data.data);
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setErrMessage("An error occurred while deleting the entry.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <ConfirmModal
      isOpen={true}
      onClose={closeModal}
      onConfirm={handleDelete}
      title="Delete Entry"
      confirmText="Delete"
      cancelText="Cancel"
      confirmVariant="danger"
      isLoading={isLoading}
    >
      <Text>Do you want to delete {date} entry?</Text>
      {errMessage && <Text className="text-error mt-2">{errMessage}</Text>}
    </ConfirmModal>
  );
}
