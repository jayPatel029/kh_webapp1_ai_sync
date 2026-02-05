import React, { useState } from "react";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Textarea } from "../../component-library/primitives/Textarea";
import { VStack, Box } from "../../component-library/layout/Layout";

const ReportModal = ({ imageUrl, closeModal }) => {
  const [comment, setComment] = useState("");

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Comment:", comment);
    closeModal();
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Lab Report"
      submitText="Submit Comment"
      size="lg"
    >
      <VStack gap={4} align="stretch">
        <Box>
          <img src={imageUrl} alt="Lab Report" className="w-full rounded" />
        </Box>
        <FormControl>
          <FormLabel>Comment</FormLabel>
          <Textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Add comment..."
            rows={4}
          />
        </FormControl>
      </VStack>
    </FormModal>
  );
};

export default ReportModal;
