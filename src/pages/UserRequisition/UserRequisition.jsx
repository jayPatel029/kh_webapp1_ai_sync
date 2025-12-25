import React, { useState, useEffect } from "react";
import "./UserRequisition.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import RequisitionModal from "./RequisitionModal";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { BsTrash } from "react-icons/bs";
import { useParams, Link } from "react-router-dom";
import UploadedFileModal from "./UploadedFileModal";
import { FaFilePdf } from "react-icons/fa6";
import { useSelector } from "react-redux";

const UserRequisition = () => {
  const [showModal, setShowModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { id } = useParams();
  const email = localStorage.getItem("email");
  // const { name } = useParams();
  const [userRequisitionData, setUserRequisitionData] = useState([]);
  const openModal = () => {
    setShowModal(true);
  };
  const role = useSelector((state) => state.permission);

  const closeModal = (data) => {
    setShowModal(false);
    if (data) {
      fetchData(); // Fetch data again to reflect the new upload
    }
  };
  const openFileModal = (id, imageUrl, comment) => {
    setUploadedFile({ id, imageUrl, comment });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };
  const location = useLocation();

  const deleteRequisition = async (id, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this requisition?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(`${server_url}/requisition/${id}`, {
          data: { email },
        });
        await fetchData();
      } catch (error) {
        console.error("Error deleting requisition:", error);
        alert("Failed to delete requisition. Please try again.");
      }
    }
  };

  const fetchData = async () => {
    const patient_id = id;
    try {
      const response = await axiosInstance.get(
        `${server_url}/requisition/getRequisition/${patient_id}`
      );
      console.log("requ", response.data.data);
      setUserRequisitionData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showModal]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="UserRequisition md:flex block">
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="container">
          <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
            <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary">
              <Link
                to={`/userProfile/${id}`}
                className="text-primary border-b-2 border-primary"
              >
                go back
              </Link>
              <div className="mt-4 mb-4 flex items-center justify-end">
                <h1 className="text-xl text-bold">{location.state.name}</h1>
                {/* <img src="" alt="f" className="rounded-full h-12 w-12" /> */}
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">Requisition</h2>
                <div className="flex items-center justify-end">
                  {role.role_name != "Dialysis Technician" && (
                    <button
                      className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                      onClick={() => openModal()}
                    >
                      Upload Requisition
                    </button>
                  )}

                  {showModal && (
                    <RequisitionModal
                      closeModal={closeModal}
                      user_id={location.state.id}
                      onSuccess={fetchData}
                    />
                  )}
                  {uploadedFile && (
                    <UploadedFileModal
                      closeModal={closeFileModal}
                      user_id={location.state.id}
                      file_id={uploadedFile.id}
                      file={uploadedFile}
                    />
                  )}
                </div>
              </div>

              <div className=" overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white text-gray-700">
                    <tr className="border-b-2 border-black">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-center">Requisition</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(userRequisitionData) &&
                      userRequisitionData.map((requisitionItem, index) => (
                        <tr
                          key={index}
                          className={`
                         ${
                           localStorage.getItem("requisitionId") ===
                           String(requisitionItem.id)
                             ? "bg-green-100"
                             : ""
                         }
                         border-b border-gray-200 
                        `}
                        >
                          <td>
                            {
                              (requisitionItem.date = formatDate(
                                requisitionItem?.Date
                              ))
                            }
                          </td>
                          <td className="flex justify-center">
                            {requisitionItem.Requisition &&
                            requisitionItem.Requisition.endsWith(".pdf") ? (
                              <FaFilePdf
                                className="w-20 h-16 cursor-pointer py-3 text-red-500"
                                onClick={() =>
                                  openFileModal(
                                    requisitionItem.id,
                                    requisitionItem.Requisition
                                  )
                                }
                              />
                            ) : (
                              <img
                                src={requisitionItem.Requisition}
                                className="h-20 w-20 inline-block"
                                alt="requisition"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  openFileModal(
                                    requisitionItem.id,
                                    requisitionItem.Requisition
                                    // requisitionItem.Comments
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              className="text-red-500 "
                              style={{ fontSize: "1.5rem" }}
                              onClick={() =>
                                deleteRequisition(requisitionItem.id, email)
                              }
                            >
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!Array.isArray(userRequisitionData) && (
                  <div className="text-left italic font-light">
                    No data present
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRequisition;
