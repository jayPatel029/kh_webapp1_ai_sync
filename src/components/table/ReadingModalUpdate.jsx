/**
 * ReadingModalUpdate Component (Unified)
 * Modal for updating reading values (both regular and dialysis)
 * 
 * @file src/components/table/ReadingModalUpdate.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  FormModal,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from "../../component-library";

export default function ReadingModalUpdate({
  date,
  closeModal,
  id,
  onSuccess,
  type = 'regular', // 'regular' or 'dialysis'
}) {
  const [errMessage, setErrMessage] = useState("");
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoint = type === 'dialysis' ? 'dialysisReading' : 'readings';

  const handleSubmit = () => {
    updateReadings({
      id: id,
      value: value
    });
  };

  const updateReadings = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/${apiEndpoint}/update`, data)
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
      title="Update Reading"
      submitText="Submit"
      isLoading={isLoading}
      errorMessage={errMessage}
      size="sm"
    >
      <VStack gap={4} align="stretch">
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Text>{date}</Text>
        </FormControl>
        <FormControl>
          <FormLabel>Value</FormLabel>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
}
