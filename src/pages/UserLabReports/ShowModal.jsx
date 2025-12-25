import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

const MyModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("Select");
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedValues, setExtractedValues] = useState(null); // State for extracted data
  const [isExtracting, setIsExtracting] = useState(false); // Loading state for extraction
  const [email] = useState(localStorage.getItem("email"));
  const [msg, setMsg] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleExtract = async () => {
    if (!selectedImage) {
      alert("Please upload a file first.");
      setIsExtracting(false);
      return;
    }

    setIsExtracting(true);
    if(!selectedDate || !selectedReportType) {
      setMsg("Please fill the required fields!");
      setIsExtracting(false);
      return;
    }
    try {
      const uploadRes = await getFileRes(selectedImage);
      const pdfUrl = uploadRes.data.objectUrl;
      console.log("pdf url", pdfUrl);

  

      if (!pdfUrl) {
        alert("Failed to upload the document.");
        setIsExtracting(false);
        return;
      }
      const data ={
        patient_id: user_id,
        date: selectedDate,
        Report_Type: selectedReportType,
        email,
        Lab_Report: pdfUrl,
        
      }

    
      const extractRes = await axiosInstance.post(
        `${server_url}/labReport/extract`,  data
      );
      console.log(extractRes.data.message);
      if(extractRes.data.message === "Lab Report confirmed and saved successfully"){
        alert("Data saved successfully.");
        onSuccess();
        closeModal();
      }
      setExtractedValues(extractRes.data.extractedValues);
    } catch (error) {
      console.error("Error during extraction:", error);
      alert("Something went wrong while extracting data.");
    } finally {
      setIsExtracting(false);
    }
  };


  const handleSave = async () => {
    if (!extractedValues) {
      alert("No data to save.");
      return;
    }

    const uploadRes = await getFileRes(selectedImage);
    const pdfUrl = uploadRes.data.objectUrl;

    const finalData = {
      patient_id: user_id,
      date: selectedDate,
      Report_Type: selectedReportType,
      email,
      Lab_Report: pdfUrl,
      confirmedValues: extractedValues,
    };

    try {
      await axiosInstance.post(`${server_url}/labReport/confirm`, finalData);
      alert("Data saved successfully.");
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Something went wrong while saving the data.");
    }
  };

  const handleEditValue = (key, value) => {
    setExtractedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName) {
      setExtractedValues((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
        <div className="header flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-2xl font-bold">Upload Lab Reports</h2>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Lab Report Date:
            </label>
            <input
              type="date"
              className="w-full border-2 py-2 px-3 rounded focus:outline-none"
              value={selectedDate}
              max={getCurrentDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Report Type:
            </label>
            <select
              className="w-full border-2 py-2 px-3 rounded focus:outline-none"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}>
              {["Select", "Lab", "Ultrasound", "X-Ray", "Echo", "MRI", "Angiography", "CT Scan"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Upload File:
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none"
              required
            />
          </div>
          <div className="text-[#ff0000]">{msg}</div>

          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {isExtracting ? "Extracting..." : "Extract Data"}
          </button>

          <button
              onClick={closeModal}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Cancel
            </button>

          {extractedValues && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">Extracted Values:</h3>
              <div className="overflow-auto h-24 grid grid-cols-2 gap-4">
                {Object.keys(extractedValues).map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-gray-700 font-medium">{key}</label>
                    <input
                      type="text"
                      value={extractedValues[key]}
                      onChange={(e) => handleEditValue(key, e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddField}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
                + Add New Field
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white py-2 px-4 rounded mt-4">
                Save Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyModal;
