import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import dummyadmin from "../../assets/dummyadmin.png";
import { server_url } from "../../constants/constants";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function UserProgramSelection() {
  const recordsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [request, setrequest] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const role = useSelector((state) => state.permission);

  useEffect(() => {
    // Fetch patients data when component mounts
    getPatients();
  }, []);
  console.log(records);

  const getPatients = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getPatients`
      );
      setRecords(response.data.data);
      setTotalPages(Math.ceil(response.data.data.length / recordsPerPage));
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(()=>{
    const getProgramChangeAlert = async ()=>{
      try {
        const response= await axiosInstance.get(`${server_url}/alerts/byCategory`);
        console.log("Program",response);
        setrequest(response.data)
      }
      catch(error){
  console.log(error)
      }
    }
    getProgramChangeAlert();
  },[])
 
  function handleFilter(event) {
    const newData = records.filter((row) => {
      return row.name.toLowerCase().includes(event.target.value.toLowerCase());
    });
    setRecords(newData);
    setCurrentPage(1);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAccept= async(program,patientId)=>{
    const response = await axiosInstance.put(`${server_url}/patient/updateProgram`,{
      id:patientId,
      program_id:program
    })
  }
  const handleSubmit = async (program, patientId) => {
    try {
      if(!role?.canEditUserProgramSelection) {
        alert("You are not authorized to perform this action");
        return;
      }
      const response = await axiosInstance.put(
        `${server_url}/patient/updateProgram`,
        {
          id: patientId,
          program_id: program,
        }
      );

      // Update the records state with the updated program for the specific patient
      setRecords(
        records.map((record) =>
          record.id === patientId ? { ...record, program } : record
        )
      );


      console.log("Selected Program:", program);
      // location.reload();
      window.location.reload();
      // Handle success response if needed
    } catch (error) {
      console.error("Error updating patient program:", error);
      // Handle error
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="md:flex block ">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className=" md:flex-[5] block w-screen">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-12 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search By Name"
                className="border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                onChange={handleFilter}
              />
            </div>
            <span className=" text-gray-900 tracking-wide text-xl ">
              User Program Selection{" "}
              <span className="text-gray-400 text-sm">
                ({records.length} Records Found )
              </span>
            </span>

            <div className="mt-4">
              <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                  <tr>
                    <th scope="col" className="px-6 py-3 ">
                      Profile Photo
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Number
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Registration Date
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Request For
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Program
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.length > 0 ? (
                    paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="py-2 px-4">
                          <div className="flex justify-center items-center">
                            <img
                              src={dummyadmin}
                              alt={record.name}
                              className="rounded-full w-12 h-12"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-6">{record.name}</td>
                        <td className="py-2 px-4">{record.number}</td>
                        <td className="py-2 px-8">
                          {formatDate(record.registered_date)}
                        </td>
                        <td className="py-2 px-4">{request?.filter(alert => alert.patientId === record.id).map(alert => (
             
             <div key={alert.id}>
                
                <p className="font-bold">{alert.programName}</p>
                <p>Date: {new Date(alert.date).toLocaleDateString()}</p>
                <button className="bg-green-800 p-2 rounded-sm text-white " onClick={()=>handleSubmit(alert.programName,record.id)}>Accept?</button>
            
              </div>))}</td>
                        <td className="py-2 px-4">
                          <button
                            className={`block mb-2 text-primary border-primary border-2 rounded-md w-40 ${
                              record.program === "Basic" ? "bg-blue-500" : ""
                            }`}
                            onClick={() => handleSubmit("Basic", record.id)}>
                            Basic
                          </button>
                          <button
                            className={`block mb-2  text-primary border-primary border-2 w-40 rounded-md ${
                              record.program === "Standard" ? "bg-blue-500" : ""
                            }`}
                            onClick={() => handleSubmit("Standard", record.id)}>
                            Standard
                          </button>
                          <button
                            className={`block  text-primary border-primary border-2 w-40 rounded-md ${
                              record.program === "Advanced" ? "bg-blue-500" : ""
                            }`}
                            onClick={() => handleSubmit("Advanced", record.id)}>
                            Advanced
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {records.length > recordsPerPage && (
              <div className="pagination mt-4 flex items-center justify-end">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}>
                  {"\u2190"}
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}>
                  {"\u2192"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProgramSelection;
