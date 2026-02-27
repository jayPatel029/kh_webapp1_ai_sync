/**
 * YesNoModal Component
 * Modal for Yes/No type responses
 * 
 * @file src/components/modals/YesNoModal.jsx
 */

import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { FormModal, FormControl, Checkbox, Flex } from "../../component-library";

const YesNoModal = ({ closeModal, user_id, question_id, question }) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = () => {
    if (!selectedResponse) {
      setFieldErrors({ selection: true });
      return;
    }
    setFieldErrors({});
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
      isSubmitDisabled={!selectedResponse}
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size="sm"
    >
      <FormControl isRequired isInvalid={Boolean(fieldErrors.selection)}>
        <Flex gap={4}>
          <Checkbox
            value="Yes"
            isChecked={selectedResponse === "Yes"}
            onChange={() => {
              setSelectedResponse("Yes");
              setFieldErrors((prev) => ({ ...prev, selection: false }));
            }}
          >
            Yes
          </Checkbox>
          <Checkbox
            value="No"
            isChecked={selectedResponse === "No"}
            onChange={() => {
              setSelectedResponse("No");
              setFieldErrors((prev) => ({ ...prev, selection: false }));
            }}
          >
            No
          </Checkbox>
        </Flex>
      </FormControl>
    </FormModal>
  );
};

export default YesNoModal;
