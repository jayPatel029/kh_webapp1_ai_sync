import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";  
import { server_url } from "../../constants/constants";

export default function DialysisTableModalDelete({ id, closeModal, onSuccess, date }) {
  const [errMessage, setErrMessage] = useState("");

  const handleDelete = () => {
    deleteReading({ id });
  };

  const deleteReading = async (data) => {
    axiosInstance
      .post(`${server_url}/dialysisReading/delete`, data)
      .then((response) => {
        if (response.data.success === false) {
          setErrMessage(response.data.data);
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setErrMessage("An error occurred while deleting the entry.");
      });
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Delete Entry</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-700 text-sm mb-4">
              Do you want to delete {date}  entry?
            </p>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
            <button
              onClick={closeModal}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Cancel
            </button>
          </div>
          <div className="p-4 text-red-500">{errMessage}</div>
        </div>
      </div>
    </>
  );
}
