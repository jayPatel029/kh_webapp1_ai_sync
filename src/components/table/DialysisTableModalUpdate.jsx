import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Text } from "../../component-library/primitives/Typography";
import { VStack } from "../../component-library/layout/Layout";

export default function DialysisTableModalUpdate({
  date,
  closeModal,
  id,
  onSuccess,
}) {
  const [errMessage, setErrMessage] = useState("");
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    updateReadings({
      id: id,
      value: value
    });
  };

  const updateReadings = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/dialysisReading/update`, data)
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
