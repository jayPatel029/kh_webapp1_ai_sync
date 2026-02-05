import React, { useState } from "react";
import axiosInstance from "../../../helpers/axios/axiosInstance";
import getCurrentDate from "../../../helpers/formatDate";
import { server_url } from "../../../constants/constants";
import { FormModal } from "../../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../../component-library/primitives/FormControl";
import { Input } from "../../../component-library/primitives/Input";
import { VStack } from "../../../component-library/layout/Layout";

const EnterReadingsModelDialysis = ({
  closeModal,
  title,
  question_id,
  user_id,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [reading, setReading] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    let data = {
      user_id: user_id,
      date: selectedDate,
      question_id: question_id,
      readings: reading,
    };

    addReadings(data);
  };

  const handleClose = () => {
    onSuccess();
    closeModal();
  };

  const addReadings = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/dialysisReading/add`, data)
      .then((response) => {
        console.log("Response:", response.data);
        if (response.data.success === false) {
          setErrMessage(response.data.data);
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <FormModal
      isOpen={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      submitText="Submit"
      isLoading={isLoading}
      errorMessage={errMessage}
      size="sm"
    >
      <VStack gap={4} align="stretch">
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={selectedDate}
            max={getCurrentDate()}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Answer/Readings</FormLabel>
          <Input
            type="text"
            required
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder="Enter reading"
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default EnterReadingsModelDialysis;
