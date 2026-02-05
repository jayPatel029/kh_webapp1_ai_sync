import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { ConfirmModal } from "../../component-library/modals/ConfirmModal";
import { Text } from "../../component-library/primitives/Typography";

export default function TableModalDelete({ id, closeModal, onSuccess, date }) {
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    deleteReading({ id });
  };

  const deleteReading = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/readings/delete`, data)
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
      {errMessage && <Text className="text-red-500 mt-2">{errMessage}</Text>}
    </ConfirmModal>
  );
}
