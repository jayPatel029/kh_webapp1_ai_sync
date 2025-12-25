import React, { useState } from "react";

const ReportModal = ({ imageUrl, closeModal }) => {
  const [comment, setComment] = useState("");

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = () => {
    // Implement your logic to handle the comment submission
    console.log("Comment:", comment);
    closeModal();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <button className="text-gray-700" onClick={closeModal}>
            Close
          </button>
        </div>
        <img src={imageUrl} alt="Lab Report" className="mb-4" />
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add comment..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows="4"
        ></textarea>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={handleSubmit}
        >
          Submit Comment
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
