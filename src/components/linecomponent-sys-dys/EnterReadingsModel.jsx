import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance"; 
import { server_url } from "../../constants/constants";
import getCurrentDate from "../../helpers/formatDate";

const EnterReadingsModel = ({ closeModal, title, question_id, user_id,onSuccess}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [readingSys, setReadingSys] = useState()
  const [readingDia, setReadingDia] = useState()

  const [errMessage, setErrMessage] = useState('');

  const handleSubmit = () => {
    // console.log(question_id,user_id)
    let data = {
      user_id: user_id,
      date: selectedDate,
      question_id: question_id,
      readings: readingSys,
      readingsDia: readingDia,
    }
    // console.log(data)

    addReadings(data)
    onSuccess();

  };

  const handleClose = () =>{
    onSuccess();
    closeModal();
}

  const addReadings = async (data) => {
    axiosInstance.post(`${server_url}/readings/add/sys`, data)
      .then(response => {
        console.log("Response:", response.data);
        
        // console.log(response.data.success)

        if (response.data.success === false) {
          setErrMessage(response.data.data)
          // console.log(response.data.data)
          
          
        } else {
          onSuccess();
          closeModal();
        }
      })
      .catch(error => {
        console.error("Error:", error.message);
      });
  }


  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Date:
              </label>
              <input
                type="date"
                id="Date"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={selectedDate}
                max={getCurrentDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Systolic Readings:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                onChange={(e) => setReadingSys(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Diastolic Readings:
              </label>
              <input
                type="text"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
                required
                onChange={(e) => setReadingDia(e.target.value)}
              />
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
              onClick={handleClose}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
          <div>{errMessage}</div>
        </div>
        
      </div>
    </>
  );
};

export default EnterReadingsModel;
