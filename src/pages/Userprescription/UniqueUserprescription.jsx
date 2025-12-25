import React, { useState, useEffect } from "react";
import "./Userprescription.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import PrescriptionModal from "./PrescriptionModal";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { BsTrash } from "react-icons/bs";
import { useParams, Link } from "react-router-dom";
import UploadedFileModal from "./UploadedFileModal";
import { FaFilePdf } from "react-icons/fa6";

const UniqueUserprescription = () => {
  const [showModal, setShowModal] = useState(false);
  const [userPrescriptionData, setUserPrescriptionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { id, prescriptionId } = useParams();
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const openModal = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  const openFileModal = (user_id, file) => {
    setUploadedFile({ closeFileModal, user_id, file });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchData = async () => {
    const patient_id = id;
    try {
      const response = await axiosInstance.get(
        `${server_url}/prescription/getPrescription/${patient_id}`
      );
      setUserPrescriptionData(response.data.data);
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    }
  };

  const fetchMedicalTeam = async (user_id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getMedicalTeam/${user_id}`
      );
      setDoctorOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching medical team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      fetchMedicalTeam(id);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  const handleDelete = async (prescriptionId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );
    if (isConfirmed) {
      try {
        await axiosInstance.delete(
          `${server_url}/prescription/deletePrescription/${prescriptionId}`
        );

        setUserPrescriptionData((prevData) =>
          prevData.filter((prescription) => prescription.id !== prescriptionId)
        );
      } catch (error) {
        console.error("Error deleting prescription:", error);
        alert("Failed to delete prescription. Please try again.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const selectedPrescription = userPrescriptionData.find(
    (prescription) => prescription.id === parseInt(prescriptionId)
  );

  return (
    <div className="Userprescription md:flex block">
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
                className="text-primary border-b-2 border-primary">
                go back
              </Link>
              <div className="mt-4 mb-4 flex items-center justify-end">
                <h1 className="text-xl text-bold">{location?.state?.name}</h1>
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">Prescription</h2>
                <div className="flex items-center justify-end">
                  <button
                    className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                    onClick={openModal}>
                    Upload Prescription
                  </button>
                  {showModal && (
                    <PrescriptionModal
                      closeModal={closeModal}
                      user_id={id}
                      onSuccess={fetchData}
                    />
                  )}

                  {uploadedFile && (
                    <UploadedFileModal
                      closeModal={closeFileModal}
                      user_id={uploadedFile.user_id}
                      file={uploadedFile.file}
                    />
                  )}
                </div>
              </div>

              {selectedPrescription ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-white text-gray-700">
                      <tr className="border-b-2 border-black">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">
                          Prescription Given By
                        </th>
                        <th className="py-3 px-4 text-center">Prescription</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 border-black">
                          {formatDate(selectedPrescription.Date)}
                        </td>
                        <td className="px-4 border-black text-center">
                          {selectedPrescription.prescriptionGivenByName}
                        </td>
                        <td className="flex justify-center">
                          {selectedPrescription.Prescription &&
                          selectedPrescription.Prescription.endsWith(".pdf") ? (
                            <FaFilePdf
                              className="w-20 h-16 cursor-pointer py-3 text-red-500"
                              onClick={() =>
                                openFileModal(
                                  selectedPrescription.id,
                                  selectedPrescription.Prescription
                                )
                              }
                            />
                          ) : (
                            <img
                              className="cursor-pointer"
                              src={selectedPrescription.Prescription}
                              alt="Prescription"
                              onClick={() =>
                                openFileModal(
                                  selectedPrescription.id,
                                  selectedPrescription.Prescription
                                )
                              }
                            />
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            className="text-[#ff0000] inline-block mx-2 text-2xl"
                            onClick={() =>
                              handleDelete(selectedPrescription.id)
                            }>
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No prescription found for this ID.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueUserprescription;
