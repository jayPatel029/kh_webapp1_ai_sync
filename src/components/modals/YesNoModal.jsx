import React, { useState } from "react";
import { server_url } from "../../constants/constants";
 

const YesNoModal = ({ closeModal, user_id, question_id, question }) => {
  const [selectedResponse, setSelectedResponse] = useState("");

  const handleSubmit = () => {
    // Example data to send in the request body
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedResponse,
    };

    const url = `${server_url}/userResponses/save`;

    axiosInstance
      .post(url, postData)
      .then((response) => {
        console.log("Response:", response.data);
        // Handle successful response here
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
  //   console.log(user_id);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {/* {question_id}
                {user_id} */}
                {question}
              </label>
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

export default YesNoModal;
