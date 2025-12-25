import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

const DynamicModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  options,
  type,
  onSuccess,
}) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // const [opt, setOpt] = useState(options);

  // console.log(options);
  const handleSubmit = () => {
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: type === "Date" ? selectedDate : selectedResponse,
    };

    const url = `${server_url}/userResponses/save`;

    axiosInstance
      .post(url, postData)
      .then((response) => {
        // console.log("Response:", response.data);
        // Handle successful response here
        onSuccess();
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
    
    closeModal();
  };

  const handleClose = () => {
    closeModal();
  };
  // console.log(question.options);
  const renderInput = () => {
    // if (!options) {
    //   return <p>No options available</p>;
    // }

    switch (type) {
      case "MultipleChoice":
        return (
          <>
            {options &&
              options.split(",").map((option) => (
                <div key={option}>
                  <input
                    type="checkbox"
                    id={option}
                    value={option}
                    onChange={(e) => 
                    
                      // setSelectedResponse(e.target.value)
                    {
                      if(e.target.checked) {
                        setSelectedResponse([...selectedResponse, option]);
                      } else {
                        setSelectedResponse(selectedResponse.filter((i) => i!==option));
                      }}
                    }
                    checked={selectedResponse.includes(option)}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))}
          </>
        );
      case "SelectAnyOne":
        return (
          <>
            {options &&
              options.split(",").map((option) => (
                <div key={option}>
                  <input
                    type="checkbox"
                    id={option}
                    value={option}
                    onChange={(e) => setSelectedResponse(e.target.value)}
                    checked={selectedResponse === option}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))}
          </>
        );
      case "Text":
        return (
          <input
            type="text"
            id="Text"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
          />
        );
      case "Yes/No":
        return (
          <>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                value="Yes"
                checked={selectedResponse === "Yes"}
                onChange={() => setSelectedResponse("Yes")}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                className="form-radio"
                value="No"
                checked={selectedResponse === "No"}
                onChange={() => setSelectedResponse("No")}
              />
              <span className="ml-2">No</span>
            </label>
          </>
        );
      case "Numeric":
        return (
          <input
            type="number"
            id="Number"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
          />
        );
      case "Date":
        return (
          <input
            type="date"
            id="Date"
            className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {question}
              </label>
              {renderInput()}
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
        </div>
      </div>
    </>
  );
};

export default DynamicModal;
