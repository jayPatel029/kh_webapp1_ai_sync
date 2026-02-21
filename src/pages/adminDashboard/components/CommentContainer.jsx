import React from "react";
import ThumbnailModal from "./ThumbnailModal";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../../helpers/axios/axiosInstance";
import { server_url } from "../../../constants/constants";
import { insertAlert } from "../../../ApiCalls/appAlerts";
import SendMessage from "./SendMessage";
import { checkURl, isValidHttpUrl } from "../../../helpers/utils";
import { useIsMobile } from "../../../components/mobile/useIsMobile";

const CommentContainer = ({ comments, closeModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState("");
  const [comment, setComment] = useState(null);
  const [smessage, setSmessage] = useState(false);
  const { isMobile } = useIsMobile();
  console.log(comments)
  const openSendMessage = () => {
    setSmessage(true);
  };

  const closeSendMessage = () => {
    setSmessage(false);
  };

  const openThumbnailModal = (image, comment) => {
    setComment(comment);
    setIsModalOpen(true);
    setImage(image);
  };
  const closeThumbnailModal = async () => {
    setIsModalOpen(false);
  };

  const consultDoctor = async () => {
    // console.log("comment[0]:", comments[0])
    const patientId = comments[0].userId;
    const doctorEmail = localStorage.getItem("email");
    const mess = "";
    const category = "Consult Doctor";

    try {
      await insertAlert(doctorEmail, patientId, category, mess);
      alert("Your Message has been sent for immediate consultation")
    } catch (error) {
      console.log(error);
      alert("something Went wrong please try again")
    }
  };

  // https://kifaytidata2024.s3.amazonaws.com/7036_3D_ETRX_17_KAUSTUBH_GHARAT%20(2).jpg

  var reversedComments = comments.reverse();
  console.log(reversedComments);
  var coms = reversedComments.filter(function (comment) {
    console.log("comment url")
    console.log(comment.url, isValidHttpUrl(comment.url));

    return isValidHttpUrl(comment.url);
  });

  // console.log(checkURl("https://kifaytidata2024.s3.amazonaws.com/7036_3D_ETRX_17_KAUSTUBH_GHARAT%20(2).jpg"))

  // var coms = comments.reverse();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
      <div className={`bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto ${isMobile ? 'mx-2 mt-2 p-4 w-full h-[95vh]' : 'p-7 ml-4 mr-4 mt-4 w-max lg:w-[80%] h-[100vh]'}`}>
        <div className={`header flex justify-between items-center border-b pb-2 mb-4 ${isMobile ? 'flex-col gap-2' : 'flex-col lg:flex-row'}`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Comments</h2>
          <div className={`flex ${isMobile ? 'flex-wrap gap-2 w-full' : 'flex-col lg:flex-row gap-2'}`}>
            <div className={`flex ${isMobile ? 'gap-1 flex-1' : 'lg:flex-row gap-2'}`}>
              <Link to={"/userProfile/" + comments[0]?.userId} className={isMobile ? 'flex-1' : ''}>
                <div
                  className={`rounded-lg text-primary border-2 border-primary py-2 justify-center flex cursor-pointer shadow-lg hover:bg-gray-300 hover:text-gray-900 transition duration-300 ease-in-out transform hover:scale-105 ${isMobile ? 'w-full text-xs px-2' : 'w-40'}`}
                >
                  View Profile
                </div>
              </Link>
              <div
                className={`rounded-lg text-white bg-red-900 border-red-900 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-600 hover:text-white transition duration-300 ease-in-out transform hover:scale-105 ${isMobile ? 'flex-1 text-xs px-2' : 'w-40'}`}
                onClick={consultDoctor}
              >
                Consult Doctor
              </div>
            </div>

            <div className={`flex ${isMobile ? 'gap-1 flex-1' : 'lg:flex-row gap-2'}`}>
              <div
                className={`rounded-lg text-white border-2 bg-primary border-primary py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105 ${isMobile ? 'flex-1 text-xs px-2' : 'w-40'}`}
                onClick={openSendMessage}
              >
                Send Message
              </div>
              <div
                className={`rounded-lg text-red-900 border-2 border-red-900 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-red-200 hover:text-red-900 transition duration-300 ease-in-out transform hover:scale-105 ${isMobile ? 'flex-1 text-xs px-2' : 'w-40'}`}
                onClick={closeModal}
                style={{
                  cursor: "pointer",
                }}
              >
                Close
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <ThumbnailModal
            closeModal={closeThumbnailModal}
            image={image}
            comment={comment}
          />
        )}
        {smessage && (
          <SendMessage
            closeModal={closeSendMessage}
            patientid={comments[0].userId}
          />
        )}
        {coms.map((comment) => (
          <div className={`shadow-md hover:shadow-lg border rounded-lg border-gray-200 transition duration-300 ease-in-out m-1 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`flex justify-between items-center ${isMobile ? 'flex-col gap-2' : 'flex-col lg:flex-row'}`}>
              <div className="flex items-center">
                <div className="mb-4">
                  <label
                    className={`block font-semibold mb-2 text-red-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {comment.fileType}
                  </label>
                  <label className={`block font-bold mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    PATIENT COMMENT - "{comment.content}"
                  </label>
                </div>
              </div>
              <div
                className={`rounded-lg text-white border-2 bg-primary border-primary py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105 ${isMobile ? 'w-full text-xs' : 'w-40'}`}
                onClick={() => {
                  openThumbnailModal(comment.url, comment);
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                View/Comment
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentContainer;
