import React, { useState, useEffect } from "react";
import "./UserLabReports.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import MyModal from "./ShowModal";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { BsTrash } from "react-icons/bs";
import { useParams, Link } from "react-router-dom";
import UploadedFileModal from "./UploadedFileModal";
import { FaFilePdf } from "react-icons/fa6";
import CSVLab2 from "../../components/csvLab2/CSVLab2";
import CSVReader from "../../components/csvlab/CSVLab";
import { da } from "date-fns/locale";
import { useSelector } from "react-redux";

const UserLabReports = () => {
  const [showModal, setShowModal] = useState(false);
  const [labReportData, setLabReportData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvData, setCsvData] = useState();
  const [success, setSuccess] = useState(false);
  const { id } = useParams();
  const [patients, setPatients] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(false);
  const email = localStorage.getItem("email");
  const role = useSelector((state) => state.permission);

  const [patientData, setPatientData] = useState([
    {
      selectedPatient: null,
      Gfr: "",
      acr: "",
      calcium: "",
      phosphorous: "",
      bicarbonate: "",
      albumin: "",
      gender: "",
    },
  ]);
  // const { name } = useParams();
  const openModal = () => {
    setShowModal(true);
  };

  useEffect(() => {
    // console.log('================================');
    // console.log(patientOptions)
    // console.log(patientData)
    console.log("my role is", role);
    if (csvData) {
      const formattedData = csvData;
      setPatientData(formattedData);
      console.log("Formatted Data from KFRE List:", formattedData);
    }
  }, [success]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const closeModal = (data) => {
    setShowModal(false);
    // if (data) {
    //   setLabReportData(data);
    // }
  };

  // const openFileModal = (user_id, file) => {
  //   setUploadedFile({ closeFileModal, user_id, file });
  // };
  const openFileModal = (id, imageUrl, comment) => {
    setUploadedFile({ id, imageUrl, comment });
  };

  const closeFileModal = () => {
    setUploadedFile(null);
  };

  const deleteLabReport = async (id, email) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this lab report?"
    );
    if (isConfirmed) {
      try {
        console.log(id);
        const response = await axiosInstance.delete(
          `${server_url}/labreport/deleteLabReport/${id}`,
          { data: { email } }
        );
        console.log(response);

        // Fetch the updated data to refresh the state
        await fetchData();
      } catch (error) {
        console.error("Error deleting lab report:", error);
        alert("Failed to delete lab report. Please try again.");
      }
    }
  };
  const location = useLocation();

  const fetchData = async () => {
    const patient_id = id;
    try {
      const response = await axiosInstance.get(
        `${server_url}/labreport/getLabReports/${patient_id}`
      );
      setLabReportData(response.data.data);
      console.log(response.data.data);
      console.log(localStorage.getItem("labReportId"));
    } catch (error) {
      console.error("Error fetching lab report data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    console.log(labReportData);
    console.log("pat data", patientData);
  }, [showModal]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(
        `${server_url}/labreport/deleteLabReport/${id}`
      );
      // Update the userRequisitionData state to reflect the deletion
      setLabReportData(labReportData.filter((patient) => patient.id !== id));
    } catch (error) {
      console.error("Error deleting requisition:", error);
    }
  };

  return (
    <div className="UserLabReports md:flex block">
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="container">
          <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
            <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white max-w-7xl shadow-md border-t-4 border-primary">
              <Link
                to={`/userProfile/${id}`}
                className="text-primary border-b-2 border-primary"
              >
                go back
              </Link>
              <div className="mt-4 mb-4 flex items-center justify-end">
                <h1 className="text-xl text-bold">{location?.state?.name}</h1>
                {/* <img src="" alt="f" className="rounded-full h-12 w-12" /> */}
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">User Lab Report</h2>
                <div className="flex items-center justify-end">
                  {role.role_name != "Dialysis Technician" && (
                    <button
                      className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                      onClick={() => openModal()}
                    >
                      Upload Lab Report
                    </button>
                  )}

                  {showModal && (
                    <MyModal
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
                      patient_id={id}
                    />
                  )}
                </div>
              </div>
              <CSVLab2
                patientId={id}
                setData={setCsvData}
                setSuccess={setSuccess}
                success={success}
              />
              <div className=" overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white text-gray-700">
                    <tr className="border-b-2 border-black">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-center">Report Type</th>
                      <th className="py-3 px-4 text-center">Lab Reports</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(labReportData) &&
                      labReportData.map((labReportsItem, index) => (
                        <tr
                          key={index}
                          className={`
                         ${
                           localStorage.getItem("labReportId") ===
                           String(labReportsItem.id)
                             ? "bg-green-100"
                             : ""
                         }
                         border-b border-gray-200 
                        `}
                        >
                          <td>
                            {
                              (labReportsItem.date = formatDate(
                                labReportsItem?.Date
                              ))
                            }
                          </td>
                          <td className="py-3 px-4 text-center">
                            {labReportsItem.Report_Type}
                          </td>
                          <td className="flex justify-center">
                            {labReportsItem.Lab_Report &&
                            labReportsItem.Lab_Report.endsWith(".pdf") ? (
                              <FaFilePdf
                                className="w-20 h-16 cursor-pointer py-3 text-red-500"
                                onClick={() =>
                                  openFileModal(
                                    labReportsItem.id,
                                    labReportsItem.Lab_Report
                                  )
                                }
                              />
                            ) : (
                              <img
                                src={labReportsItem.Lab_Report}
                                alt="Lab Report"
                                className="h-20 w-20 inline-block"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  openFileModal(
                                    labReportsItem.id,
                                    labReportsItem.Lab_Report
                                    // labReportsItem.Comments
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
                                deleteLabReport(labReportsItem.id, email)
                              }
                            >
                              <BsTrash />
                              {/* <button
                                className="text-green-600 inline-block mx-2 text-m"
                                // onClick={}
                              >
                                comment
                              </button> */}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!Array.isArray(labReportData) && (
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

export default UserLabReports;
