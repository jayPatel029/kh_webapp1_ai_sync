/**
 * DateModal Component
 * Modal for entering date type responses
 * 
 * @file src/components/modals/DateModal.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import getCurrentDate from "../../helpers/formatDate";
import { server_url } from "../../constants/constants";
import { FormModal, FormControl, FormLabel, Input } from "../../component-library";

const DateModal = ({ closeModal, user_id, question_id, question }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = () => {
    if (!selectedDate) {
      setFieldErrors({ date: true });
      return;
    }
    setFieldErrors({});
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedDate,
    };

    const url = `${server_url}/userResponses/save`;
    setIsLoading(true);

    axiosInstance
      .post(url, postData)
      .then((response) => {
        console.log("Response:", response.data);
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
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size="sm"
    >
      <FormControl isRequired isInvalid={Boolean(fieldErrors.date)}>
        <FormLabel>Select Date</FormLabel>
        <Input
          isInvalid={Boolean(fieldErrors.date)}
          type="date"
          value={selectedDate}
          max={getCurrentDate()}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setFieldErrors((prev) => ({ ...prev, date: false }));
          }}
        />
      </FormControl>
    </FormModal>
  );
};

export default DateModal;
