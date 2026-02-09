/**
 * ReadingModalAdd Component (Unified)
 * Modal for adding new readings (both regular and dialysis)
 * 
 * @file src/components/table/ReadingModalAdd.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import {
  FormModal,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from "../../component-library";

export default function ReadingModalAdd({
  closeModal,
  title,
  question_id,
  user_id,
  onSuccess,
  question,
  type = 'regular', // 'regular' or 'dialysis'
}) {
  const [selectedType, setSelectedType] = useState(question?.type || "text");
  const [selectedDate, setSelectedDate] = useState("");
  const [reading, setReading] = useState("Yes");
  const [errMessage, setErrMessage] = useState("");
  const [theFile, setTheFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoint = type === 'dialysis' ? 'dialysisReading' : 'readings';

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedType.toLowerCase() === "upload") {
      if (!theFile) {
        setErrMessage("Please select a file to upload");
        return;
      }
      setIsLoading(true);
      getFileRes(theFile).then((res) => {
        addReadings({
          user_id: user_id,
          date: selectedDate,
          question_id: question_id,
          readings: res.data.objectUrl,
        });
      });
    } else {
      let data = {
        user_id: user_id,
        date: selectedDate,
        question_id: question_id,
        readings: reading,
      };

      addReadings(data);
    }
  };

  const addReadings = async (data) => {
    setIsLoading(true);
    axiosInstance
      .post(`${server_url}/${apiEndpoint}/add`, data)
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

  const renderInputField = () => {
    switch (selectedType.toLowerCase()) {
      case "time":
        return (
          <Input
            type="time"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "yes/no":
        return (
          <Select
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>
        );
      case "int":
      case "decimal":
      case "numeric":
        return (
          <Input
            type="number"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "upload":
        return (
          <Input
            type="file"
            onChange={(e) => setTheFile(e.target.files[0])}
          />
        );
      case "text":
      default:
        return (
          <Input
            type="text"
            required
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title={title}
      submitText="Submit"
      isLoading={isLoading}
      errorMessage={errMessage}
      size="md"
    >
      <VStack gap={4} align="stretch">
        {!question?.type && (
          <FormControl>
            <FormLabel>Input Type</FormLabel>
            <Select
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="date">Date</option>
              <option value="yesno">Yes/No</option>
              <option value="numeric">Numeric</option>
              <option value="text">Text</option>
            </Select>
          </FormControl>
        )}
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
          <FormLabel>{selectedType === "date" ? "Date" : "Answer/Readings"}</FormLabel>
          {renderInputField()}
        </FormControl>
      </VStack>
    </FormModal>
  );
}
