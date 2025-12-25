import React, { useRef, useState, useEffect } from "react";

import postToCloudinaryImage from "../../helpers/postToCloudinaryImage";
import Webcam from "react-webcam";
import { server_url } from "../../constants/constants";
import { uploadFile } from "../../ApiCalls/dataUpload";
import { approveAlert, approveAllAlerts } from "../../ApiCalls/alertsApis";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Modal from "./Modal";
import { Link } from "react-router-dom";
import UploadedFileModal from "../Userprescription/UploadedFileModal";


const PrescriptionModal = ({ closeModal, user_id, onSuccess }) => {
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState(
    "https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?cs=srgb&dl=pexels-felix-mittermeier-1459505.jpg&fm=jpg"
  );
  const [isPrescriptionSelected, setIsPrescriptionSelected] = useState(false);
  const [groupedData, setGroupedData] = useState([]);
  const [isDisAll, setIsDisAll] = useState(false);
  const [showmodel, setShowmodel] = useState(false);

  const closeReasonModal = () => {
    setShowDisapproveModal(false);
  };

  const togglePrescription = () => {
    setIsPrescriptionSelected(isPrescriptionSelected);
  };

  const handleSetPrescriptionImage = (url) => {
    setPrescriptionImage(url);
  };

  const handleApproveAll = async (presId) => {
    await approveAllAlerts(presId);
    closeModal();
    window.location.reload();
  };

  const handleDiapproveAll = () => {
    setIsDisAll(true);
    setShowDisapproveModal(true);
  };

  const handleApprove = async (item) => {
    await approveAlert(item.id, item.alarmId);
    closeModal();
    window.location.reload();
  };

  const handleDiapprove = () => {
    setIsDisAll(false);
    setShowDisapproveModal(true);
  };

  const closeImage = () => {
    setPrescriptionImage(null);
    setIsPrescriptionSelected(false);
  };
  const handlePrescriptionImage = () => {
    setShowmodel(true)
  }
  useEffect(() => {
    var pres = localStorage.getItem("prescriptionAlerts");
    pres = JSON.parse(pres);
    //console.log(pres);
    // group these prescriptions by presId
    const groupData = pres.reduce((acc, item) => {
      const { presId, ...rest } = item;
      if (!acc[presId]) {
        acc[presId] = [];
      }
      acc[presId].push(rest);
      return acc;
    }, {});
    setGroupedData(groupData);
  }, []);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 mt-30 h-max lg:h-[100vh] w-max lg:w-[80%]">
          <div className="header flex justify-between items-center border-b pb-2 mb-4  lg:pt-0  ">
            <h2 className="text-2xl font-bold  ">Digitised Prescription Copy</h2>
            <div className="flex flex-col lg:flex-row items-center">
              {/* <Link to={groupedData[1] ? `/userProfile/${groupedData[1][0].patientId}` : "#"}>
                <div
                  className="rounded-lg text-primary border-2 border-primary w-40 py-2 justify-center flex shadow-lg m-1"
                  style={{ cursor: "pointer" }}
                >
                  View Profile
                </div>
              </Link> */}

              <div
                className="rounded-lg text-red-800 border-2 border-red-800 w-40 py-2 justify-center flex shadow-lg"
                onClick={closeModal}
                style={{ cursor: "pointer" }}
              >
                Close
              </div>
              {showmodel && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
                  <div className="p-7 ml-4 mr-4 mt-4 bg-white w-full md:w-3/5 h-4/5 md:h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowmodel(false)}
                        className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Close
                      </button>
                    </div>

                    <div className="h-4/5 md:h-full">
                      <img
                        src={prescriptionImage}
                        alt="prescription"
                        className="w-full h-full object-contain"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      />
                    </div>
                  </div>
                </div>


              )}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            {/* parent prescription container */}
            <div className="flex flex-col w-full">
              {Object.keys(groupedData).map((key, index) => (
                <div class="prescriptionModal_container flex justify-center flex-col">
                  <div class="w-full">
                    <div class="left">
                      <div className="flex-col">
                        <div className=" bg-blue-300  flex-row flex justify-between items-center border-b p-2 mb-4">
                          <div className="flex flex-row gap-3 lg:gap-5">
                            <button>
                              <b>Prescription on </b>
                              {groupedData[key][0].date.slice(0, 10)}
                            </button>
                            <div
                              onClick={() => {
                                var url = groupedData[key][0].presImg;
                                setIsPrescriptionSelected(true);
                                handleSetPrescriptionImage(url);
                              }}
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: "5px 10px",
                              }}
                            >
                              view prescription
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row gap-1">
                            <div
                              className="rounded-lg text-white border-2 bg-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                              onClick={() => {
                                handleApproveAll(key);
                              }}
                            >
                              Approve All
                            </div>
                            <div
                              className="rounded-lg text-white border-2 bg-red-800 w-40 py-2 justify-center flex shadow-lg cursor-pointer transition duration-300 ease-in-out transform  hover:text-white  hover:scale-105"
                              onClick={handleDiapproveAll}
                            >
                              Disapprove All
                            </div>
                          </div>
                        </div>

                        {/* {groupedData[key].map((item) => (
                          <div className="flex-row flex justify-between items-center border-b p-2 mb-4">
                            {showDisapproveModal && (
                              <Modal
                                closeModal={closeReasonModal}
                                disAll={isDisAll}
                                item={item}
                                presId={key}
                              />
                            )}
                            <div>
                              <div className="font-bold">Alarm Description</div>
                              <div>{item.desc}</div>
                            </div>
                            <div>
                              <div className="font-bold">
                                {item.timesaday}{" "}
                                {item.timesaday > 1 ? "times" : "time"}{" "}
                                {item.isWeek ? "a week" : "a month"}
                              </div>
                              {item.doses.map((dose) => (
                                <div>{dose}</div>
                              ))}
                            </div>
                            <div>
                              <div>{item.weekdays}</div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-1">
                              <button
                                className="rounded-lg text-white border-2 bg-primary border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => {
                                  handleApprove(item);
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="rounded-lg text-white border-2 bg-red-800 w-40 py-2 justify-center flex shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={handleDiapprove}
                              >
                                Disapprove
                              </button>
                            </div>
                          </div>
                        ))} */}

                        <table class="border-collapse w-full rounded-md">
                          <thead>
                            <tr>
                              <th class="p-3 bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                                Alarm Description
                              </th>
                              <th class="p-3 bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                                Frequency
                              </th>
                              <th class="p-3 bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                                Days/Month
                              </th>
                              <th class="p-3 bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedData[key].map((item) => (
                              <tr class="bg-white lg:hover:bg-gray-100 flex lg:table-row flex-row lg:flex-row flex-wrap lg:flex-no-wrap mb-10 lg:mb-0">
                                <td class="w-full lg:w-auto p-6 text-gray-800 text-center border border-b block lg:table-cell relative lg:static">
                                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                                    Alarm Description
                                  </span>

                                  {item.desc}

                                </td>
                                {showDisapproveModal && (
                                  <Modal
                                    closeModal={closeReasonModal}
                                    disAll={isDisAll}
                                    item={item}
                                    presId={key}
                                  />
                                )}
                                <td class="w-full lg:w-auto p-6 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                                    Frequency
                                  </span>
                                  <div className="font-bold">
                                    {item.timesaday}{" "}
                                    {item.timesaday > 1 ? "times" : "time"}{" "}
                                    {item.isWeek ? "a day" : "a month"}
                                  </div>
                                  {/* map times a day with doses*/}
                                  {item.doses.map((dose) => (
                                    <div>{dose}</div>
                                  ))}
                                </td>
                                <td class="w-full lg:w-auto p-6 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                                    Days/Month
                                  </span>
                                  <div>{item.weekdays}</div>
                                </td>
                                <td class="w-full lg:w-auto p-6 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                                    Actions
                                  </span>
                                  <div className="flex flex-row lg:flex-row gap-1 mt-5 lg:m-0">
                                    <button
                                      className="rounded-lg text-white border-2 bg-primary border-primary w-40 py-2 justify-center flex cursor-pointer shadow-lg hover:bg-primary-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                                      onClick={() => {
                                        handleApprove(item);
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="rounded-lg text-white border-2 bg-red-800 w-40 py-2 justify-center flex shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                                      onClick={handleDiapprove}
                                    >
                                      Disapprove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isPrescriptionSelected ? (
              <div className="w-[60%] relative">
                <div className="p-2">
                  <img src={prescriptionImage} onClick={handlePrescriptionImage} alt="" />
                </div>
              </div>
            ) : (
              <div class="w-[60%] bg-gray-100 rounded-lg shadow-md flex justify-center items-center">
                <div class="p-4">
                  Please click on view prescription to see the prescription
                  image here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionModal;
