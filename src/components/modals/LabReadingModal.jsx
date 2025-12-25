import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";


const LabRedingUpdateModal = ({
  closeEditModal,
  onSuccess,
  initialData,
  id,
}) => {

  const [newTitle, setNewTitle] = useState("");

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
    try {
      updateLabReadingTitle(id, newTitle);

      await onSuccess();
        closeEditModal();

      // await axiosInstance
      // .put(`${server_url}/patient/updatePatient`, updatedUserData)
      // .then(async (response) => {
      //   console.log("User data updated successfully:", response.data);
      //   await onSuccess()
      //   closeEditModal();
      // })
      // .catch((error) => {
      //   console.error("Error updating user data:", error);
      // });
    } catch (error) {
      console.log(error);
    } finally {
      closeEditModal();
    }
  };

  const handleCancel = () => {
    closeEditModal();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Update Lab Reading Title</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="">Title: </label>
              <input
                type="text"
                id="name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleUpdate}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              UPDATE
            </button>
            <button
              onClick={handleCancel}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabRedingUpdateModal;
