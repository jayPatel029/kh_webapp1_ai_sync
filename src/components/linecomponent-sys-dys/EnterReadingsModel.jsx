import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import getCurrentDate from "../../helpers/formatDate";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { VStack } from "../../component-library/layout/Layout";

const EnterReadingsModel = ({ closeModal, title, question_id, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [readingSys, setReadingSys] = useState("");
  const [readingDia, setReadingDia] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = () => {
    const errors = {};
    if (!selectedDate) errors.date = true;
    if (!readingSys.toString().trim()) errors.readingSys = true;
    if (!readingDia.toString().trim()) errors.readingDia = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrMessage("Please fill all required fields");
      return;
    }
    setErrMessage("");
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
      .post(`${server_url}/readings/add/sys`, data)
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
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size="sm"
    >
      <VStack gap={4} align="stretch">
        <FormControl isRequired isInvalid={Boolean(fieldErrors.date)}>
          <FormLabel>Date</FormLabel>
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
        <FormControl isRequired isInvalid={Boolean(fieldErrors.readingSys)}>
          <FormLabel>Systolic Readings</FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.readingSys)}
            type="text"
            required
            value={readingSys}
            onChange={(e) => {
              setReadingSys(e.target.value);
              setFieldErrors((prev) => ({ ...prev, readingSys: false }));
            }}
          />
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.readingDia)}>
          <FormLabel>Diastolic Readings</FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.readingDia)}
            type="text"
            required
            value={readingDia}
            onChange={(e) => {
              setReadingDia(e.target.value);
              setFieldErrors((prev) => ({ ...prev, readingDia: false }));
            }}
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default EnterReadingsModel;
