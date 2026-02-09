/**
 * DynamicModal Component
 * Renders different input types based on question type
 * 
 * @file src/components/modals/DynamicModal.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  FormModal,
  FormControl,
  Input,
  Checkbox,
  VStack,
  Flex,
} from "../../component-library";

const DynamicModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  options,
  type,
  onSuccess,
}) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: type === "Date" ? selectedDate : selectedResponse,
    };

    const url = `${server_url}/userResponses/save`;
    setIsLoading(true);

    axiosInstance
      .post(url, postData)
      .then((response) => {
        onSuccess();
        closeModal();
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
        closeModal();
      });
  };

  const renderInput = () => {
    switch (type) {
      case "MultipleChoice":
        return (
          <VStack gap={2} align="stretch">
            {options &&
              options.split(",").map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  isChecked={Array.isArray(selectedResponse) && selectedResponse.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedResponse([...(Array.isArray(selectedResponse) ? selectedResponse : []), option]);
                    } else {
                      setSelectedResponse(
                        Array.isArray(selectedResponse) 
                          ? selectedResponse.filter((i) => i !== option)
                          : []
                      );
                    }
                  }}
                >
                  {option}
                </Checkbox>
              ))}
          </VStack>
        );
      case "SelectAnyOne":
        return (
          <VStack gap={2} align="stretch">
            {options &&
              options.split(",").map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  isChecked={selectedResponse === option}
                  onChange={(e) => setSelectedResponse(e.target.value)}
                >
                  {option}
                </Checkbox>
              ))}
          </VStack>
        );
      case "Text":
        return (
          <Input
            type="text"
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
            placeholder="Enter your response"
          />
        );
      case "Yes/No":
        return (
          <Flex gap={4}>
            <Checkbox
              value="Yes"
              isChecked={selectedResponse === "Yes"}
              onChange={() => setSelectedResponse("Yes")}
            >
              Yes
            </Checkbox>
            <Checkbox
              value="No"
              isChecked={selectedResponse === "No"}
              onChange={() => setSelectedResponse("No")}
            >
              No
            </Checkbox>
          </Flex>
        );
      case "Numeric":
        return (
          <Input
            type="number"
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
            placeholder="Enter a number"
          />
        );
      case "Date":
        return (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title={question}
      submitText="Submit"
      isLoading={isLoading}
      size="md"
    >
      <FormControl>
        {renderInput()}
      </FormControl>
    </FormModal>
  );
};

export default DynamicModal;
