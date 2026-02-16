import React, { useState } from 'react';
import { insertAlert } from "../../../ApiCalls/appAlerts";
import { FormModal } from "../../../component-library/modals/FormModal";
import {
  FormControl,
  FormLabel,
  Textarea
} from "../../../component-library";

const SendMessage = ({ closeModal, patientid }) => {
  const [message, setMessage] = useState("");

  const submitMessage = async () => {
    const doctorEmail = localStorage.getItem("email");
    const patientId = patientid;
    const category = "Send Message";
    const mess = message;
    try {
      const data = await insertAlert(doctorEmail, patientId, category, mess);
      alert("Your Message has been sent.");
      console.log(data);
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={submitMessage}
      title="Please Enter the message here"
      submitText="Submit"
      cancelText="Close"
      size="md"
    >
      <FormControl>
        <FormLabel>Message</FormLabel>
        <Textarea
          placeholder="Enter the message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </FormControl>
    </FormModal>
  );
};

export default SendMessage;
