import React, { useState, useEffect } from "react";
import "./UserDietDetails.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DietModal from "./DietModal";
import { useLocation, useParams, Link } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { BsTrash } from "react-icons/bs";
// import { Location } from "react-router-dom";
import UploadedFileModal from "./UploadedFileModal";
import { FaFilePdf } from "react-icons/fa6";
import { useSelector } from "react-redux";

function UserDietDetails() {
  const [showModal, setShowModal] = useState(false);
  const [dietData, setDietData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  // const location = useLocation();
  const pid = useParams().id;

  // const { name } = useParams();
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = (data) => {
    setShowModal(false);
    // if (data) {
    //   setDietData(data);
    // }
  };
  const location = useLocation();

  const openFileModal = (id, imageUrl, comment) => {
    setUploadedFile({ id, imageUrl, comment });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };
  const role = useSelector((state) => state.permission);

  const deleteDietDetails = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete these diet details?"
    );
    if (isConfirmed) {
      try {
        const result = await axiosInstance.delete(
          `${server_url}/dietdetails/deleteDietDetails/${id}`
        );

        console.log("Response:", result.data);
        await fetchData(); // Refresh the data to update the state
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to delete diet details. Please try again.");
      }
    }
  };

  const fetchData = async () => {
    try {
      const result = await axiosInstance.get(
        `${server_url}/dietdetails/getPatientDietDetailsAdmin/${pid}`
      );
      console.log("Response:", result.data.data);
      setDietData(result.data.data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
    console.log("role", role);
  }, [showModal]);
  return (
    <>
      <div className="UserDietDetails md:flex block">
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
                  to={`/userProfile/${pid}`}
                  className="text-primary border-b-2 border-primary"
                >
                  go back
                </Link>
                <div className="mt-4 mb-4 flex items-center justify-end">
                  <h1 className="text-xl text">{location.state.name}</h1>
                  {/* <img src="" alt="f" className="rounded-full h-12 w-12" /> */}
                </div>

                {role.role_name === "Doctor" ? null : (
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-2xl font-bold">Diet Details</h2>
                    <div className="flex items-center justify-end">
                      <button
                        className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                        onClick={() => openModal()}
                      >
                        Upload Diet Details
                      </button>
                      {showModal && (
                        <DietModal
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
                )}

                <div className=" overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-white text-gray-700">
                      <tr className="border-b-2 border-black">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Report Type</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-left">Image</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dietData ? (
                        dietData.map((data) => (
                          <tr
                            key={data.id}
                            className="border-b hover:bg-gray-100"
                          >
                            <td className="py-3 px-4 text-left">{data.Date}</td>
                            <td className="py-3 px-4 text-left">
                              {data.Meal_Type}
                            </td>
                            <td className="py-3 px-4 text-left">
                              {data.meal_desc}
                            </td>
                            <td className="py-3 px-4 text-left">
                              {data.meal_img &&
                              data.meal_img.endsWith(".pdf") ? (
                                <FaFilePdf
                                  className="w-20 h-16 cursor-pointer py-3 text-red-500"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    openFileModal(data.id, data.meal_img)
                                  }
                                />
                              ) : (
                                <img
                                  src={data.meal_img}
                                  alt="img"
                                  style={{ cursor: "pointer" }}
                                  className="rounded-full h-12 w-12"
                                  onClick={() =>
                                    openFileModal(data.id, data.meal_img)
                                  }
                                />
                              )}
                            </td>
                            <td className="py-3 px-4 text-left">
                              <button
                                onClick={() =>
                                  deleteDietDetails(data.id).then(() =>
                                    fetchData()
                                  )
                                }
                                className="text-red-500"
                              >
                                <BsTrash />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-left italic font-light"
                          >
                            No data present
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDietDetails;
