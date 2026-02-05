import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";

const TextModal = ({ closeModal, user_id, question_id, question }) => {
  const [selectedResponse, setSelectedResponse] = useState("");
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
        <FormLabel>Enter Response</FormLabel>
        <Input
          type="text"
          value={selectedResponse}
          onChange={(e) => setSelectedResponse(e.target.value)}
          placeholder="Enter your response"
        />
      </FormControl>
    </FormModal>
  );
};

export default TextModal;
