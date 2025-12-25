import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../helpers/axios/axiosInstance";
import { server_url } from "../../../constants/constants";
import profileImg from "../../../assets/pp.png";
import { useSelector } from "react-redux";
import { BsTrash, BsCloudDownload } from "react-icons/bs";
import { canExportPatient } from "../../../ApiCalls/patientAPis";
import getValidImageUrl from "../../../helpers/utils";
export default function PatientList({ data, patientId }) {
  const recordsPerPage = 10;
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [medicalTeamNames, setMedicalTeamNames] = useState({});
  const [adminNames, setAdminNames] = useState({});
  const [canExport, setCanExport] = useState(false);
  const [Loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  async function checkCanExport() {
    try {
      console.log("Checking export permission...");
      const response = await canExportPatient();
      console.log(response);
      if (response.success) {
        setCanExport(true);
      }
    } catch (error) {
      console.error("Error checking export permission:", error);
    }
  }

  const ConditionComponent = ({ condition }) => (
    <p
      className={`${
        condition === "stable"
          ? "text-green-500"
          : condition === "unstable"
          ? "text-yellow-500"
          : condition === "critical"
          ? "text-red-500"
          : "text-gray-500"
      }`}
    >
      {condition}
    </p>
  );

  useEffect(() => {
    setFilteredData(data);
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    checkCanExport();
  }, []);

  useEffect(() => {
    const fetchMedicalTeamNames = async () => {
      const promises = filteredData.map(async (row) => {
        try {
          const response = await axiosInstance.get(
            `${server_url}/assignedDoctor/getDoctor/${row?.id}`
          );
          const doctorNames = response.data.data.map((doctor) => doctor.name);
          setMedicalTeamNames((prevNames) => ({
            ...prevNames,
            [row?.id]: doctorNames.join(", "),
          }));
        } catch (error) {
          console.error("Error fetching medical team names:", error);
        }
      });
      await Promise.all(promises);
    };

    const fetchAdminNames = async () => {
      const promises = filteredData.map(async (row) => {
        try {
          const response = await axiosInstance.get(
            `${server_url}/assignedAdmin/getAdmin/${row?.id}`
          );
          const adminNames = response.data.data.map((admin) => admin.firstname);
          setAdminNames((prevNames) => ({
            ...prevNames,
            [row?.id]: adminNames.join(", "),
          }));
        } catch (error) {
          console.error("Error fetching admin names:", error);
        }
      });
      await Promise.all(promises);
    };

    fetchMedicalTeamNames();
    fetchAdminNames();
  }, [filteredData]);

  const handleFilter = (event) => {
    const filtered = data.filter((row) =>
      row?.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleRowClick = (row) => {
    navigate(`/userProfile/${row?.id}`, { state: row });
  };

  const pageCount = Math.ceil(filteredData.length / recordsPerPage);
  const offset = (currentPage - 1) * recordsPerPage;
  const currentPageData = filteredData.slice(offset, offset + recordsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDelete = async (id) => {
    try {
      // Display a confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to delete this patient?"
      );

      if (!confirmed) {
        return; // If the user cancels, exit the function
      }

      await axiosInstance.delete(`${server_url}/patient/deletePatient/${id}`);
      // Remove the deleted patient from the UI
      setFilteredData(filteredData.filter((patient) => patient.id !== id));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };
  const handleDownload = async (row) => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patientdata/export/${row?.id}`,
        {
          responseType: "blob", // Important for handling file downloads
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patientdata.csv"); // Set the file name as needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file", error);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patientdata/export`,
        {
          responseType: "blob", // Important for handling file downloads
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patientdata.csv"); // Set the file name as needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file", error);
    }
  };

  useEffect(() => {
    if (patientId) {
      setLoading(true);
      const patient = data.find((patient) => patient.id == patientId);
      setFilteredData([patient]);
    }
    setLoading(false);
  }, [data, patientId]);

  if (Loading) return <div>Loading...</div>;

  return (
    <div className="w-5/6 p-7 ml-4 mr-4 mt-10 mb-4 bg-white shadow-md border-t-4 border-primary ">
      <div className="flex justify-between items-center mb-4 space-x-4">
        <div className="flex flex-wrap justify-between items-center">
          {role?.canDeletePatients && (
            <Link
              to="/DeletedPatient"
              className="mt-2 sm:mt-0 ml-0 mx-2 sm:ml-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600 w-full sm:w-auto"
            >
              DeletedPatient
            </Link>
          )}
          <input
            type="text"
            placeholder="Search by Name"
            onChange={handleFilter}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          />
          <button className="mt-2 sm:mt-0 ml-0 sm:ml-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600 w-full sm:w-auto">
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        <div className="mt-5">
          <div className="text-lg font-semibold">
            Total Users: {filteredData.length}
          </div>
          {canExport && (
            <div className="mt-2">
              <button
                className="p-2 rounded-md text-center block bg-primary text-white w-full sm:w-28 sm:px-2 sm:py-2 md:w-32 md:h-10"
                onClick={() => {
                  handleDownloadAll();
                }}
              >
                Export All
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table class="border-collapse w-full">
          <thead>
            <tr>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Profile
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Name
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Number
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Registration Date
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Program
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Medical Team
              </th>
              <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                Assigned To
              </th>
              {(canExport || role.canDeletePatients) && (
                <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((row) => (
              <tr
                class="bg-white lg:hover:bg-gray-100 flex lg:table-row flex-row lg:flex-row flex-wrap lg:flex-no-wrap mb-10 lg:mb-0"
                key={row?.id}
                onClick={() => handleRowClick(row)}
              >
                <td className="w-full lg:w-auto p-3 text-gray-800 text-center border border-b block lg:table-cell relative lg:static flex items-center justify-center">
                  <span className="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Profile
                  </span>

                  <div className="items-center justify-center">
                    <img
                      className="rounded-full object-cover"
                      src={getValidImageUrl(row?.profile_photo)}
                      alt="Profile"
                      style={{ width: "75px", height: "75px" }} // Adjust size as needed
                    />
                    {/*                     
                    <p>
                      {row?.condition} 
                    </p> */}

                    <p
                      className={`${
                        row?.condition == "stable"
                          ? "text-green-500"
                          : row?.condition == "unstable"
                          ? "text-yellow-500"
                          : row?.condition == "critical"
                          ? "text-red-500 font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {row?.condition}
                    </p>
                  </div>
                </td>
                <td class="w-full lg:w-auto p-3 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Name
                  </span>
                  {row?.name ? row?.name : ""}
                </td>
                <td class="w-full lg:w-auto p-3 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Number
                  </span>
                  {row?.number ? row?.number : ""}
                </td>
                <td class="w-full lg:w-auto p-6 text-gray-800  border border-b text-center block lg:table-cell relative lg:static sm:w:28 ">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Registration Date
                  </span>
                  {row?.registered_date ? formatDate(row?.registered_date) : ""}
                </td>
                <td class="w-full lg:w-auto p-3 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Program
                  </span>
                  {row?.program ? row?.program : ""}
                </td>
                <td class="w-full lg:w-auto p-6 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Medical Team
                  </span>

                  {medicalTeamNames[row?.id] &&
                    medicalTeamNames[row?.id]
                      .split(",")
                      .map((name, index) => <div key={index}>{name}</div>)}
                  <div>
                    {role?.manageRoles !== 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/userMedicalTeam/${row?.id}`, {
                            state: row,
                          });
                        }}
                        className="bg-primary text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                      >
                        MANAGE
                      </button>
                    )}
                  </div>
                </td>
                <td class="w-full lg:w-auto p-3 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                  <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                    Assigned To
                  </span>
                  {adminNames[row?.id] &&
                    adminNames[row?.id]
                      .split(",")
                      .map((name, index) => <div key={index}>{name}</div>)}
                  <div>
                    {role?.manageRoles !== 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/userListManage/${row?.id}`, {
                            state: row,
                          });
                        }}
                        className="bg-primary text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                      >
                        MANAGE
                      </button>
                    )}
                  </div>
                </td>
                {(canExport || role?.canDeletePatients) && (
                  <td class="w-full lg:w-auto p-3 text-gray-800  border border-b text-center block lg:table-cell relative lg:static">
                    <span class="lg:hidden absolute top-0 left-0 bg-gray-200 px-2 py-1 text-xs font-bold uppercase">
                      Actions
                    </span>
                    {canExport && (
                      <button
                        className="text-primary inline-block mx-2"
                        onClick={() => {
                          handleDownload(row);
                        }}
                      >
                        <BsCloudDownload />
                      </button>
                    )}
                    {role?.canDeletePatients && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event from triggering
                          handleDelete(row?.id);
                        }}
                        className="text-[#ff0000] inline-block mx-2"
                      >
                        <BsTrash />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pageCount >= 0 && (
        <div className="pagination mt-4 flex items-center justify-end">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            {"\u2190"}
          </button>
          <span>{`Page ${currentPage} of ${pageCount}`}</span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === pageCount}
          >
            {"\u2192"}
          </button>
        </div>
      )}
    </div>
  );
}
