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

/**
 * Edit paired systolic + diastolic values for one date.
 * isDialysis → POST /readings/update/dia/sys ; else /readings/update/sys
 */
export default function SysDiaReadingModalUpdate({
  date,
  systolicId,
  diastolicId,
  systolic,
  diastolic,
  isDialysis = false,
  closeModal,
  onSuccess,
}) {
  const [readingSys, setReadingSys] = useState(
    systolic != null ? String(systolic) : ""
  );
  const [readingDia, setReadingDia] = useState(
    diastolic != null ? String(diastolic) : ""
  );
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const path = isDialysis ? "/readings/update/dia/sys" : "/readings/update/sys";

  const handleSubmit = () => {
    const errors = {};
    if (!readingSys.toString().trim()) errors.readingSys = true;
    if (!readingDia.toString().trim()) errors.readingDia = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrMessage("Please fill systolic and diastolic");
      return;
    }
    if (systolicId == null) {
      setErrMessage("Missing systolic reading id");
      return;
    }
    setErrMessage("");
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}${path}`, {
        systolicId,
        diastolicId,
        readings: readingSys,
        readingsDia: readingDia,
      })
      .then((response) => {
        if (response.data.success === false) {
          setErrMessage(response.data.data || "Update failed");
        } else {
          onSuccess?.();
          closeModal();
        }
      })
      .catch((error) => {
        console.error(error);
        setErrMessage("An error occurred while updating.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Update BP Reading"
      submitText="Save"
      isLoading={isLoading}
      errorMessage={errMessage}
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) =>
        setFieldErrors((prev) => ({ ...prev, [field]: false }))
      }
      size="sm"
    >
      <VStack gap={4} align="stretch">
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Text>{date}</Text>
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.readingSys)}>
          <FormLabel>Systolic</FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.readingSys)}
            type="text"
            value={readingSys}
            onChange={(e) => {
              setReadingSys(e.target.value);
              setFieldErrors((prev) => ({ ...prev, readingSys: false }));
            }}
          />
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(fieldErrors.readingDia)}>
          <FormLabel>Diastolic</FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.readingDia)}
            type="text"
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
}
