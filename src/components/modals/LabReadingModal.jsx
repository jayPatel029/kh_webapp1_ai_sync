import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";

const LabRedingUpdateModal = ({
  closeEditModal,
  onSuccess,
  initialData,
  id,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function updateLabReadingTitle(readingId, title) {
    console.log("object", readingId, title);
    try {
      const token = localStorage.getItem("token");

      console.log("updating reading title");
      const response = await axiosInstance.put(
        `${server_url}/labreport/updateLabReadingTitle/${readingId}`,
        {
          newTitle: title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("updated", response.data);
    } catch (e) {
      console.error("error updating reading title:", e);
    }
  }

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateLabReadingTitle(id, newTitle);
      await onSuccess();
      closeEditModal();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      closeEditModal();
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeEditModal}
      onSubmit={handleUpdate}
      title="Update Lab Reading Title"
      submitText="UPDATE"
      cancelText="CANCEL"
      isLoading={isLoading}
      size="sm"
    >
      <FormControl>
        <FormLabel>Title</FormLabel>
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new title"
        />
      </FormControl>
    </FormModal>
  );
};

export default LabRedingUpdateModal;
