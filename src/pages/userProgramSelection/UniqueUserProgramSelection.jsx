import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import dummyadmin from "../../assets/dummyadmin.png";
import { server_url } from "../../constants/constants";

function UniqueUserProgramSelection() {
  const { id } = useParams(); // Get the id from the URL
  const [patient, setPatient] = useState(null);
  const [request, setRequest] = useState([]);

  useEffect(() => {
    // Fetch patients data when component mounts
    getPatients();
  }, [id]); // Dependency array includes id

  const getPatients = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatients`);
      const records = response.data.data;
      const selectedPatient = records.find(record => record.id === Number(id));

      if (selectedPatient) {
        setPatient(selectedPatient);
      } else {
        console.error("Patient not found.");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    const getProgramChangeAlert = async () => {
      try {
        const response = await axiosInstance.get(`${server_url}/alerts/byCategory`);
        setRequest(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getProgramChangeAlert();
  }, []);

  const handleSubmit = async (program, patientId) => {
    try {
      await axiosInstance.put(`${server_url}/patient/updateProgram`, {
        id: patientId,
        program_id: program,
      });

      // Update the patient state with the new program
      setPatient({ ...patient, program });
      console.log("Selected Program:", program);
    } catch (error) {
      console.error("Error updating patient program:", error);
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

  if (!patient) {
    return <div>Loading...</div>;
  }

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
            <span className=" text-gray-900 tracking-wide text-xl ">
              User Program Selection
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
                  <tr key={patient.id}>
                    <td className="py-2 px-4">
                      <div className="flex justify-center items-center">
                        <img
                          src={dummyadmin}
                          alt={patient.name}
                          className="rounded-full w-12 h-12"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-6">{patient.name}</td>
                    <td className="py-2 px-4">{patient.number}</td>
                    <td className="py-2 px-8">{formatDate(patient.registered_date)}</td>
                    <td className="py-2 px-4">
                      {request?.filter(alert => alert.patientId === patient.id).map(alert => (
                        <div key={alert.id}>
                          <p className="font-bold">{alert.programName}</p>
                          <p>Date: {new Date(alert.date).toLocaleDateString()}</p>
                          <button
                            className="bg-green-800 p-2 rounded-sm text-white"
                            onClick={() => handleSubmit(alert.programName, patient.id)}>
                            Accept?
                          </button>
                        </div>
                      ))}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className={`block mb-2 text-primary border-primary border-2 rounded-md w-40 ${
                          patient.program === "Basic" ? "bg-blue-500" : ""
                        }`}
                        onClick={() => handleSubmit("Basic", patient.id)}>
                        Basic
                      </button>
                      <button
                        className={`block mb-2  text-primary border-primary border-2 w-40 rounded-md ${
                          patient.program === "Standard" ? "bg-blue-500" : ""
                        }`}
                        onClick={() => handleSubmit("Standard", patient.id)}>
                        Standard
                      </button>
                      <button
                        className={`block  text-primary border-primary border-2 w-40 rounded-md ${
                          patient.program === "Advanced" ? "bg-blue-500" : ""
                        }`}
                        onClick={() => handleSubmit("Advanced", patient.id)}>
                        Advanced
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniqueUserProgramSelection;
