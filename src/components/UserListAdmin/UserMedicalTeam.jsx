import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams } from "react-router-dom";
import { server_url } from "../../constants/constants";
import { BsTrash } from "react-icons/bs";
import axiosInstance from "../../helpers/axios/axiosInstance";

function UserMedicalTeam() {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientDoctors, setPatientDoctors] = useState([]);
  const { pid } = useParams();

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/doctor/getDoctors`)
      .then((response) => {
        console.log("Doctors data:", response.data.data);
        setDoctors(response.data.data);
      })
      .catch((error) => console.error("Error fetching doctors:", error));

    getDoctorOfPatient();
  }, []);

  const addDoctorToPatientProgram = async (userId) => {
    try {
      await axiosInstance.post(`${server_url}/assignedDoctor/addDoctor/${pid}`, {
        doctor_id: userId,
      });
      console.log("Doctor added to patient's program successfully");
      getDoctorOfPatient();
    } catch (error) {
      console.error("Error adding doctor to patient's program:", error);
      console.log(
        "An error occurred while adding doctor to patient's program. Please try again later."
      );
    }
  };

  const getDoctorOfPatient = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/assignedDoctor/getDoctor/${pid}`
      );
      console.log("Doctor of patient:", response.data);
      setPatientDoctors(response.data.data); // Set the admin data to state
    } catch (error) {
      console.error("Error fetching admin of patient:", error);
      console.log(
        "An error occurred while fetching admin of patient. Please try again later."
      );
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `${server_url}/assignedDoctor/deleteDoctor/${pid}`,
        {
          data: { doctor_id: userId }, // Pass the userId as data to the request
        }
      );
      console.log("Doctor deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting Doctor:", error);
      console.log(
        "An error occurred while deleting the user. Please try again later."
      );
    }
  };

  return (
    <div className="md:flex block ">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-12 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="mb-4">
              <div className=" text-gray-900 tracking-wide text-xl border-b-2 p-2 border-gray">
                Assign Teams
              </div>
            </div>
            <div className="search-box">
              <label htmlFor="adminSelect" className="block">
                Select Doctor/Medical Staff/Medical Specialist
              </label>
              <select
                id="medicalSelect"
                className="border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                value={searchQuery}
                onChange={(e) => addDoctorToPatientProgram(e.target.value)}
                onSelect={(e) => addDoctorToPatientProgram(e.target.value)}
              >
                <option value="">Select Medical Team</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                <thead className="bg-white text-gray-700">
                  <tr className="border-b-2 border-black">
                    <th className="py-3 px-4 text-left">Doctor Code</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDoctors.map(
                    (
                      doctor // Mapping patientAdmins here
                    ) => (
                      <tr
                        key={doctor.userId}
                        className="border-b-2 border-gray"
                      >
                        <td className="py-3 px-4 text-left">{doctor.name}</td>
                        <td className="py-3 px-4 text-left">{doctor.role}</td>
                        <td className="py-3 px-4 text-left">
                          <button
                            className="text-red-500"
                            style={{ fontSize: "1.5rem" }}
                            onClick={() => deleteUser(doctor.id)}
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMedicalTeam;
