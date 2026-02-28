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
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const submitMessage = async () => {
    if (!message.trim()) {
      setFieldErrors({ message: true });
      return;
    }
    setFieldErrors({});
    setErrorMsg("");
    const doctorEmail = localStorage.getItem("email");
    const patientId = patientid;
    const category = "Send Message";
    const mess = message;
    try {
      await insertAlert(doctorEmail, patientId, category, mess);
      alert("Your Message has been sent.");
      closeModal();
    } catch (error) {
      console.error("Error sending message:", error);
      const msg = error?.message || "Failed to send message. Please try again.";
      setErrorMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
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
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      errorMessage={errorMsg}
      size="md"
    >
      <FormControl isRequired isInvalid={Boolean(fieldErrors.message)}>
        <FormLabel>Message</FormLabel>
        <Textarea
          isInvalid={Boolean(fieldErrors.message)}
          placeholder="Enter the message here"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setFieldErrors((prev) => ({ ...prev, message: false }));
          }}
          rows={4}
        />
      </FormControl>
    </FormModal>
  );
};

export default SendMessage;
