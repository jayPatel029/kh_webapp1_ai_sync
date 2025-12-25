import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { addComment } from "../../ApiCalls/commentApi";
import { useLocation } from "react-router-dom";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";
import { getPatientByIdad } from "../../ApiCalls/patientAPis";
import { useSelector } from "react-redux";

function UploadedFileModal({ closeModal, file, user_id, file_id }) {
  //   const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successful, setSuccessful] = useState(true);
  const [patientProgram, setProgram] = useState(false);
  // const role = localStorage.getItem("role");
  const [userRole, setRole] = useState(false);
  const role = useSelector((state) => state.permission);

  const location = useLocation();

  const getId = async () => {
    const res = await getPatientByIdad(user_id);
    console.log("res for id", res.data);
    if (
      res.data.data.program == "Advanced" ||
      res.data.data.program == "Standard"
    ) {
      setProgram(true);
      if (role.role_name === "Dialysis Technician") {
        setRole(true);
      }
      console.log("role here", userRole);

      console.log("the program", res.data.data.program);
    }
  };

  useEffect(() => {
    const data = {
      fileId: file_id,
      fileType: "Requisition",
    };
    getId();
    axiosInstance
      .post(`${server_url}/comments/getComments`, data)
      .then((res) => {
        console.log("Comments", res.data.data);
        setPrevComments(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [successful]);
  console.log(file.imageUrl);
  useEffect(() => {
    setLoading(true); // Set loading to true when file changes
    // Check if file is loaded
    if (file.imageUrl && file.imageUrl !== "") {
      setLoading(false);
    }
  }, [file.imageUrl]);

  const isPdf = /.*\.pdf$/.test(file.imageUrl);

  const uploadComment = async () => {
    try {
      const trimmedComment = newComment.trim();
      if (!trimmedComment) return;

      console.log(file);
      const id = location.state.id;
      const fileId = file.id;
      const fileType = "Requisition";
      var iSDoctor = 0;
      var isD = localStorage.getItem("isDoctor");
      if (isD === "true") {
        iSDoctor = 1;
      }

      // console.log(
      //   "ID:",
      //   id,
      //   "FileID:",
      //   fileId,
      //   "FileType:",
      //   fileType,
      //   "isDoctor:",
      //   iSDoctor
      // );

      const response = await addComment(
        trimmedComment,
        fileId,
        fileType,
        id,
        iSDoctor
      );
      if (response.success) {
        console.log(response.message);
      }
      // After uploading, fetch the updated comments
      //   fetchComments();
      // Clear the input field
      setNewComment("");
      setSuccessful(!successful);
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  };
                 
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const istDateObject = new Date(dateObject.getTime() + 330 * 60000);
    const day = istDateObject.getDate();
    const month = istDateObject.toLocaleString("default", { month: "short" });
    const year = istDateObject.getFullYear();
    let hours = istDateObject.getHours();
    const minutes = istDateObject.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
        <div className="header flex justify-between items-center sticky top-0 bg-white  border-b pb-2 mb-4">
          <h1 className="text-2xl font-bold">Uploaded Image</h1>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Close
          </button>
        </div>

        {/* Image */}
        <div className="h-full">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="overflow-auto h-4/5">
              {isPdf ? (
                <div className="h-full">
                  <MyPDFViewer file={file.imageUrl} />
                </div>
              ) : (
                <img
                  src={file.imageUrl ? file.imageUrl : ""}
                  alt="Requisition"
                  className="w-full h-full object-contain"
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </div>
          )}

          {patientProgram ? (
            <div className="flex-1 mt-4">
              <div className="mb-4 overflow-auto h-3/4">
                <h2 className="font-medium">Previous Comments</h2>
                <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto max-h-[400px]">
                  {prevComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex items-start mb-4 ${
                        comment.isDoctor ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center mr-2 ${
                          comment.isDoctor ? "order-1" : "order-2"
                        }`}
                      >
                        {comment.isDoctor ? "D" : "P"}
                      </div>
                      <div
                        className={`bg-white text-black p-2 text-sm rounded-lg shadow-md max-w-3/4 ${
                          comment.isDoctor
                            ? "ml-2 bg-black"
                            : "mr-2 bg-teal-500 text-black"
                        }`}
                      >
                        <span className="font-medium text-xs text-gray-500 mr-2">
                          {comment.isDoctor
                            ? `Doctor ${comment.doctorName} : `
                            : "Patient: "}
                        </span>
                        <span className="flex-grow text-sm text-black font-bold">
                          {comment.content}
                        </span>
                        <p className="flex justify-end text-gray-600 italic text-xs">
                          {formatDate(comment.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!userRole && (
                <div>
                  <h2 className="font-medium">Add a Comment</h2>
                  <textarea
                    id="text"
                    className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                    rows="1"
                    style={{ minHeight: "38px", height: "auto" }}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={uploadComment}
                      className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500 font-medium">
              Comments cannot be added as the patient is on the basic program.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadedFileModal;
