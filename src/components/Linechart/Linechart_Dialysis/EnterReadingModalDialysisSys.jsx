import React, { useState } from "react";
import axiosInstance from "../../../helpers/axios/axiosInstance";
import { server_url } from "../../../constants/constants";
import getCurrentDate from "../../../helpers/formatDate";
import { FormModal } from "../../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../../component-library/primitives/FormControl";
import { Input } from "../../../component-library/primitives/Input";
import { VStack } from "../../../component-library/layout/Layout";

const EnterReadingModalDialysisSys = ({ closeModal, title, question_id, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [readingSys, setReadingSys] = useState("");
  const [readingDia, setReadingDia] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    let data = {
      user_id: user_id,
      date: selectedDate,
      question_id: question_id,
      readings: readingSys,
      readingsDia: readingDia,
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
      .post(`${server_url}/readings//add/dia/sys`, data)
      .then((response) => {
        console.log("Response for adding sys dys:", response.data);
        if (response.data.success === false) {
          setErrMessage(response.data.data);
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch((error) => {
        console.log("error adding", error.response?.data?.message);
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
          <FormLabel>Systolic Readings</FormLabel>
          <Input
            type="text"
            required
            value={readingSys}
            onChange={(e) => setReadingSys(e.target.value)}
            placeholder="Enter systolic reading"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Diastolic Readings</FormLabel>
          <Input
            type="text"
            required
            value={readingDia}
            onChange={(e) => setReadingDia(e.target.value)}
            placeholder="Enter diastolic reading"
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default EnterReadingModalDialysisSys;
