/**
 * LabReadingModal — rename a lab parameter title (main workflow).
 *
 * @file src/components/modals/LabReadingModal.jsx
 */

import React, { useState } from "react";
import { FormModal } from "../../component-library/modals/FormModal";
import {
  FormControl,
  FormLabel,
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { putLabreportUpdateLabReadingTitleByreadingId } from "../../ApiCalls/remainingApis";

const LabReadingModal = ({
  closeModal,
  closeEditModal,
  onSuccess,
  initialData,
  id,
  question,
  question_id,
}) => {
  const readingId = id ?? question_id;
  const startingTitle = initialData ?? question ?? "";
  const [newTitle, setNewTitle] = useState(startingTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    (closeModal || closeEditModal)?.();
  };

  const handleSubmit = async () => {
    const trimmed = newTitle?.toString().trim();
    if (!readingId) {
      setErrorMessage("Missing lab reading id.");
      return;
    }
    if (!trimmed) {
      setErrorMessage("Title is required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await putLabreportUpdateLabReadingTitleByreadingId(
        readingId,
        { newTitle: trimmed }
      );
      if (!result.success) {
        setErrorMessage(
          result?.data?.message || "Failed to update lab reading title."
        );
        return;
      }
      await onSuccess?.(trimmed);
      handleClose();
    } catch (error) {
      console.error("Error updating lab reading title:", error);
      setErrorMessage("Failed to update lab reading title.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Update Lab Reading Title"
      submitText="Update"
      isLoading={isLoading}
      errorMessage={errorMessage}
      size="sm"
    >
      <FormControl isRequired>
        <FormLabel>Title</FormLabel>
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value);
            setErrorMessage("");
          }}
          placeholder="Enter lab reading title"
        />
      </FormControl>
    </FormModal>
  );
};

export default LabReadingModal;
