import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";  
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

export default function DialysisTableModal({
  closeModal,
  title,
  question_id,
  user_id,
  onSuccess,
  question,
}) {
  const [selectedType, setSelectedType] = useState(question.type || "text");
  const [selectedDate, setSelectedDate] = useState("");
  const [reading, setReading] = useState("Yes");
  const [errMessage, setErrMessage] = useState("");
  const [theFile, setTheFile] = useState(null);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedType.toLowerCase() === "upload") {
      if (!theFile) {
        setErrMessage("Please select a file to upload");
        return;
      }
      getFileRes(theFile).then((res) => {
        console.log("File response:", res.data.objectUrl);
        addReadings({
          user_id: user_id,
          date: selectedDate,
          question_id: question_id,
          readings: res.data.objectUrl,
        });
      });
    } else {
      let data = {
        user_id: user_id,
        date: selectedDate,
        question_id: question_id,
        readings: reading,
      };

      addReadings(data);
    }
  };

  const addReadings = async (data) => {
    axiosInstance
      .post(`${server_url}/dialysisReading/add`, data)
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
  const updateReadings = async (data) => {
    axiosInstance
      .post(`${server_url}/dialysisReading/add`, data)
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

  const renderInputField = () => {
    switch (selectedType.toLowerCase()) {
      case "time":
        return (
          <input
            type="time"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "date":
        return (
          <input
            type="date"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "yes/no":
        return (
          <select
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      case "int":
      case "decimal":
      case "numeric":
        return (
          <input
            type="number"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
      case "upload":
        return (
          <input
            type="file"
            className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
            onChange={(e) => setTheFile(e.target.files[0])}
          />
        );
      case "text":
      default:
        return (
          <input
            type="text"
            className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-amber-950"
            required
            value={reading}
            onChange={(e) => setReading(e.target.value)}
          />
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <div className="p-4">
            {!question?.type && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Input Type:
                </label>
                <select
                  className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  <option value="date">Date</option>
                  <option value="yesno">Yes/No</option>
                  <option value="numeric">Numeric</option>
                  <option value="text">Text</option>
                </select>
              </div>
            )}
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
                {selectedType === "date" ? "Date:" : "Answer/Readings:"}
              </label>
              {renderInputField()}
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
          <div>{errMessage}</div>
        </div>
      </div>
    </>
  );
}
