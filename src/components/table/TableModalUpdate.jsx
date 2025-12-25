import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";  
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

export default function TableModalUpdate({
  date,
  closeModal,
  id,
  onSuccess,
}) {
  const [errMessage, setErrMessage] = useState("");
  const [value, setValue] = useState(0);
  const handleSubmit=()=>{
    updateReadings({
      id:id,
      value:value
    })
  }
  const updateReadings = async (data) => {
    axiosInstance
      .post(`${server_url}/readings/update`, data)
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
      });
  };


  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 ">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold"></h2>
          </div>
          <div className="p-4">
           
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Date:
              </label>
              {date}
            </div>
            <div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Value:
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border border-gray-400 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
            </div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              onClick={closeModal}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
          <div className="p-4 text-red-500">{errMessage}</div>
        </div>
      </div>
    </>
  );
}
