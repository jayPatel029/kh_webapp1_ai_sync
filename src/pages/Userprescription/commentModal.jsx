import React, { useState } from "react";
 
import { addComment } from "../../ApiCalls/commentApi";


const CommentModal = ({ closeModal, user_id}) => {
  const [content,setContent] = useState("");
  const [fileId, setFileId] = useState(localStorage.getItem("fileId"));
  const fileType = 0;

  const submitComment = async () => {
    const userId = user_id;
    const iSDoctor = 0;
    const response = await addComment(content, fileId, fileType, userId, iSDoctor);
    if (response.success) {
      console.log(response.message);
    } else {
      console.log(response.message);
    }

  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Enter a Comment: </h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Comment
              </label>
              <textarea 
                type="text"
                id="text"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
           
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={submitComment}
              className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              onClick={closeModal}
              className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentModal;
