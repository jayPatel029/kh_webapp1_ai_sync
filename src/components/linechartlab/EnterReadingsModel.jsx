import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import getCurrentDate from "../../helpers/formatDate";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { VStack } from "../../component-library/layout/Layout";

const EnterReadingsModel = ({ closeModal, title, question_id, user_id, onSuccess, isUpdate }) => {
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
    const postUrl = `${server_url}/labreport/addLabReading`;
    setIsLoading(true);
    axiosInstance
      .post(postUrl, data)
      .then((response) => {
        if (response.data.success === false) {
          setErrMessage(response.data.data);
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch((error) => {
        onSuccess();
        closeModal();
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
      submitText={isUpdate === true ? "Update" : "Submit"}
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
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default EnterReadingsModel;
