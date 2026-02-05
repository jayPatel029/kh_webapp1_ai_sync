import React, { useState } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Checkbox } from "../../component-library/primitives/Checkbox";
import { Flex } from "../../component-library/layout/Layout";

const YesNoModal = ({ closeModal, user_id, question_id, question }) => {
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
      isSubmitDisabled={!selectedResponse}
      size="sm"
    >
      <FormControl>
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
      </FormControl>
    </FormModal>
  );
};

export default YesNoModal;
