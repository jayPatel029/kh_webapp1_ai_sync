import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import getCurrentDate from "../../helpers/formatDate";
import { server_url } from "../../constants/constants";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";

const DateModal = ({ closeModal, user_id, question_id, question }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedDate,
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
        <FormLabel>Select Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          max={getCurrentDate()}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </FormControl>
    </FormModal>
  );
};

export default DateModal;
