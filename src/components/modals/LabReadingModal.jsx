/**
 * LabReadingModal Component
 * Modal for entering lab reading values
 * 
 * @file src/components/modals/LabReadingModal.jsx
 */

import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { FormModal, FormControl, FormLabel, Input } from "../../component-library";

const LabReadingModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  onSuccess,
}) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedResponse,
    };

    const url = `${server_url}/labReadings/save`;
    setIsLoading(true);

    axiosInstance
      .post(url, postData)
      .then((response) => {
        console.log("Response:", response.data);
        if (onSuccess) onSuccess();
        closeModal();
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title={question}
      submitText="Submit"
      isLoading={isLoading}
      size="sm"
    >
      <FormControl>
        <FormLabel>Enter Value</FormLabel>
        <Input
          type="number"
          value={selectedResponse}
          onChange={(e) => setSelectedResponse(e.target.value)}
          placeholder="Enter lab reading"
        />
      </FormControl>
    </FormModal>
  );
};

export default LabReadingModal;
