import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl } from "../../component-library/primitives/FormControl";
import { Checkbox } from "../../component-library/primitives/Checkbox";
import { VStack } from "../../component-library/layout/Layout";

const MultipleChoiceModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  options,
}) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [opt] = useState([options]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedResponse,
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
      size="sm"
    >
      <FormControl>
        <VStack gap={2} align="stretch">
          {opt != null &&
            opt.map((option) => (
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
      </FormControl>
    </FormModal>
  );
};

export default MultipleChoiceModal;
