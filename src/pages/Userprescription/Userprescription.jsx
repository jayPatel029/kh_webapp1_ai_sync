// import React, { useState, useEffect } from "react";
// import "./Userprescription.scss";
// import Sidebar from "../../components/sidebar/Sidebar";
// import Navbar from "../../components/navbar/Navbar";
// import PrescriptionModal from "./PrescriptionModal";
// import { useLocation } from "react-router-dom";
// import axiosInstance from "../../helpers/axios/axiosInstance";
// import { server_url } from "../../constants/constants";
// import { BsTrash } from "react-icons/bs";
// import { useParams, Link } from "react-router-dom";
// // import CommentModal from "./commentModal";
// import UploadedFileModal from "./UploadedFileModal";

// import { FaFilePdf } from "react-icons/fa6";
// // import UploadBulkProfile from "../labreports/uploadBulkProfileQuestions";

// const Userprescription = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [userPrescriptionData, setUserPrescriptionData] = useState([]);
//   const [filteredPrescriptionData, setFilteredPrescriptionData] = useState([]);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const { id } = useParams();
//   const [doctorOptions, setDoctorOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const location = useLocation();
//   const email = localStorage.getItem("email");

//   const openModal = () => {
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//   };

//   const openFileModal = (user_id, file, comment, file_id) => {
//     console.log("user_id", user_id);
//     setUploadedFile({ user_id, file, comment, file_id });
//   };

//   const closeFileModal = () => {
//     setUploadedFile(null);
//   };

//   // console.log(location.pathname);

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const dateObject = new Date(dateString);
//     const day = String(dateObject.getDate()).padStart(2, "0");
//     const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
//     const year = dateObject.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   console.log(id);
//   const fetchData = async () => {
//     const patient_id = id;
//     try {
//       const response = await axiosInstance.get(
//         `${server_url}/prescription/getPrescription/${patient_id}`
//       );
//       console.log(response.data.data);
//       setUserPrescriptionData(response.data.data);
//       setFilteredPrescriptionData(response.data.data);
//       console.log("data received on frontend : ", response.data.data);
//     } catch (error) {
//       console.error("Error fetching prescription data:", error);
//     }
//   };

//   const fetchMedicalTeam = async (user_id) => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(
//         `${server_url}/patient/getMedicalTeam/${user_id}`
//       );
//       // console.log(response.data)
//       setDoctorOptions(response.data.data);
//     } catch (error) {
//       console.error("Error fetching medical team:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     try {
//       fetchMedicalTeam(id);
//       fetchData();
//     } catch (error) {
//       console.log(error);
//     }
//   }, []);

//   const handleDelete = async (prescriptionId, email) => {
//     const isConfirmed = window.confirm(
//       "Are you sure you want to delete this prescription?"
//     );
//     if (isConfirmed) {
//       try {
//         console.log("prescription id", prescriptionId);
//         await axiosInstance.delete(
//           `${server_url}/prescription/deletePrescription/${prescriptionId}`,
//           {
//             data: {
//               email: email,
//             },
//           }
//         );

//         // Remove the deleted prescription from the state
//         setUserPrescriptionData((prevData) =>
//           prevData.filter((prescription) => prescription.id !== prescriptionId)
//         );
//         setFilteredPrescriptionData((prevData) =>
//           prevData.filter((prescription) => prescription.id !== prescriptionId)
//         );
//       } catch (error) {
//         console.error("Error deleting prescription:", error);
//         alert("Failed to delete prescription. Please try again.");
//       }
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   const handleSelectChange = (e) => {
//     const selectedDoctor = parseFloat(e.target.value);
//     const filteredData = userPrescriptionData.filter(
//       (prescription) =>
//         parseFloat(prescription.prescriptionGivenBy) === selectedDoctor
//     );
//     setFilteredPrescriptionData(filteredData);
//   };

//   return (
//     <div className="Userprescription md:flex block">
//       <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
//         <Sidebar />
//       </div>
//       <div className="md:flex-[5] block w-screen">
//         <div className="sticky top-0 z-10">
//           <Navbar />
//         </div>
//         <div className="container">
//           <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
//             <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary">
//               <Link
//                 to={`/userProfile/${id}`}
//                 className="text-primary border-b-2 border-primary"
//               >
//                 go back
//               </Link>
//               <div className="mt-4 mb-4 flex items-center justify-end">
//                 <h1 className="text-xl text-bold">{location?.state?.name}</h1>
//               </div>
//               <div className="flex justify-between items-center border-b pb-2 mb-4">
//                 <h2 className="text-2xl font-bold">Prescription</h2>
//                 <div className="flex items-center justify-end">
//                   <button
//                     className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
//                     onClick={() => openModal()}
//                   >
//                     Upload Prescription
//                   </button>
//                   {showModal && (
//                     <PrescriptionModal
//                       closeModal={closeModal}
//                       user_id={id}
//                       onSuccess={fetchData}
//                     />
//                   )}

//                   {uploadedFile && (
//                     <UploadedFileModal
//                       closeModal={closeFileModal}
//                       user_id={id}
//                       file_id={uploadedFile.id}
//                       file={uploadedFile.file}
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="flex flex-row">
//                 <select
//                   id="doctorId"
//                   className="w-1/3 border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
//                   // value={selectedDoctorId}
//                   onChange={handleSelectChange}
//                 >
//                   <option>sort by doctor</option>
//                   {Array.isArray(doctorOptions) &&
//                     doctorOptions.map((doctor, index) => (
//                       <option key={index} value={doctor.id}>
//                         {doctor.name}
//                       </option>
//                     ))}
//                 </select>
//                 <button
//                   className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-2"
//                   onClick={() => {
//                     setFilteredPrescriptionData(userPrescriptionData);
//                   }}
//                 >
//                   Clear Filter
//                 </button>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead className="bg-white text-gray-700">
//                     <tr className="border-b-2 border-black">
//                       <th className="py-3 px-4 text-left">Date</th>
//                       <th className="py-3 px-4 text-left">
//                         Prescription Given By
//                       </th>
//                       <th className="py-3 px-4 text-center">Prescription</th>
//                       <th className="py-3 px-4 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredPrescriptionData.length > 0 ? (
//                       filteredPrescriptionData.map(
//                         (prescriptionItem, index) => (
//                           <tr key={index}>
//                             <td className="px-4 border-black">
//                               {formatDate(prescriptionItem.Date)}
//                             </td>
//                             <td className="px-4 border-black text-center">
//                               {prescriptionItem.prescriptionGivenByName}
//                             </td>
//                             <td className="flex justify-center">
//                               {prescriptionItem.Prescription &&
//                               prescriptionItem.Prescription.endsWith(".pdf") ? (
//                                 <FaFilePdf
//                                   className="w-20 h-16 cursor-pointer py-3 text-red-500"
//                                   onClick={() =>
//                                     openFileModal(
//                                       prescriptionItem.id,
//                                       prescriptionItem.Prescription
//                                     )
//                                   }
//                                 />
//                               ) : (
//                                 <img
//                                   className=" cursor-pointer"
//                                   src={prescriptionItem?.Prescription}
//                                   alt="Prescription"
//                                   onClick={() =>
//                                     openFileModal(
//                                       prescriptionItem.id,
//                                       prescriptionItem.Prescription
//                                     )
//                                   }
//                                 />
//                               )}
//                             </td>
//                             <td className="text-center">
//                               <button
//                                 className="text-[#ff0000] inline-block mx-2 text-2xl"
//                                 onClick={() =>
//                                   handleDelete(prescriptionItem.id, email)
//                                 }
//                               >
//                                 <BsTrash />
//                               </button>
//                             </td>
//                           </tr>
//                         )
//                       )
//                     ) : (
//                       <tr>
//                         <td colSpan="3" className="text-left italic font-light">
//                           No Prescription found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           {/* <UploadBulkProfile/> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Userprescription;

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
// import CommentModal from "./commentModal";
import UploadedFileModal from "./UploadedFileModal";

import { FaFilePdf } from "react-icons/fa6";
import { useSelector } from "react-redux";
// import UploadBulkProfile from "../labreports/uploadBulkProfileQuestions";

const Userprescription = () => {
  const [showModal, setShowModal] = useState(false);
  const [userPrescriptionData, setUserPrescriptionData] = useState([]);
  const [filteredPrescriptionData, setFilteredPrescriptionData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { id } = useParams();
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const email = localStorage.getItem("email");
  const role = useSelector((state) => state.permission);

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

  // console.log(location.pathname);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  console.log(id);
  const fetchData = async () => {
    const patient_id = id;
    try {
      const response = await axiosInstance.get(
        `${server_url}/prescription/getPrescription/${patient_id}`
      );
      console.log(response.data.data);
      setUserPrescriptionData(response.data.data);
      setFilteredPrescriptionData(response.data.data);
      // console.log("data received on frontend : ", response.data.data);
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
      // console.log(response.data)
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
  }, []);

  const handleDelete = async (prescriptionId, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );
    if (isConfirmed) {
      try {
        console.log("prescription id", prescriptionId);
        await axiosInstance.delete(
          `${server_url}/prescription/deletePrescription/${prescriptionId}`,
          {
            data: {
              email: email,
            },
          }
        );

        // Remove the deleted prescription from the state
        setUserPrescriptionData((prevData) =>
          prevData.filter((prescription) => prescription.id !== prescriptionId)
        );
        setFilteredPrescriptionData((prevData) =>
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

  const handleSelectChange = (e) => {
    const selectedDoctor = parseFloat(e.target.value);
    const filteredData = userPrescriptionData.filter(
      (prescription) =>
        parseFloat(prescription.prescriptionGivenBy) === selectedDoctor
    );
    setFilteredPrescriptionData(filteredData);
  };

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
                className="text-primary border-b-2 border-primary"
              >
                go back
              </Link>
              <div className="mt-4 mb-4 flex items-center justify-end">
                <h1 className="text-xl text-bold">{location?.state?.name}</h1>
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">Prescription</h2>
                <div className="flex items-center justify-end">
                  {role.role_name != "Dialysis Technician" && (
                    <button
                      className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                      onClick={() => openModal()}
                    >
                      Upload Prescription
                    </button>
                  )}

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
                      user_id={location.state.id}
                      // onSuccess={fetchData}
                      file={uploadedFile}
                      patient_id={id}
                    />
                  )}

                  {uploadedFile && (
                    <UploadedFileModal
                      closeModal={closeFileModal}
                      user_id={uploadedFile.user_id}
                      file={uploadedFile.file}
                      patient_id={id}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-row">
                <select
                  id="doctorId"
                  className="w-1/3 border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                  // value={selectedDoctorId}
                  onChange={handleSelectChange}
                >
                  <option>sort by doctor</option>
                  {Array.isArray(doctorOptions) &&
                    doctorOptions.map((doctor, index) => (
                      <option key={index} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                </select>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-2"
                  onClick={() => {
                    setFilteredPrescriptionData(userPrescriptionData);
                  }}
                >
                  Clear Filter
                </button>
              </div>

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
                    {filteredPrescriptionData.length > 0 ? (
                      filteredPrescriptionData.map(
                        (prescriptionItem, index) => (
                          <tr key={index}>
                            <td className="px-4 border-black">
                              {formatDate(prescriptionItem.Date)}
                            </td>
                            <td className="px-4 border-black text-center">
                              {prescriptionItem.prescriptionGivenByName}
                            </td>
                            <td className="flex justify-center">
                              {prescriptionItem.Prescription &&
                              prescriptionItem.Prescription.endsWith(".pdf") ? (
                                <FaFilePdf
                                  className="w-20 h-16 cursor-pointer py-3 text-red-500"
                                  onClick={() =>
                                    openFileModal(
                                      prescriptionItem?.id,
                                      prescriptionItem?.Prescription
                                    )
                                  }
                                />
                              ) : (
                                <img
                                  className=" cursor-pointer"
                                  src={prescriptionItem?.Prescription}
                                  alt="Prescription"
                                  onClick={() =>
                                    openFileModal(
                                      prescriptionItem?.id,
                                      prescriptionItem.Prescription
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                className="text-[#ff0000] inline-block mx-2 text-2xl"
                                onClick={() =>
                                  handleDelete(prescriptionItem.id, email)
                                }
                              >
                                <BsTrash />
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-left italic font-light">
                          No Prescription found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* <UploadBulkProfile/> */}
        </div>
      </div>
    </div>
  );
};

export default Userprescription;
