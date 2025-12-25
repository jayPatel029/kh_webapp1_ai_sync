import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { server_url } from "../../constants/constants";
import { useParams } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import axiosInstance from "../../helpers/axios/axiosInstance"

function UserListManage() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientAdmins, setPatientAdmins] = useState([]);
  const { pid } = useParams();
  // console.log(useParams());

  // console.log(pid);
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Fetch admins with role Admin
        // const adminResponse = await axiosInstance.get(`${server_url}/users/byRole/Admin`);
        // console.log("Admins data:", adminResponse.data.data);
        
        // // Fetch admins with role PSadmin
        // const psAdminResponse = await axiosInstance.get(`${server_url}/users/byRole/PSadmin`);
        // console.log("PSadmin data:", psAdminResponse.data.data);
        // const dialysisTech= await axiosInstance.get(`${server_url}/users/byRole/Dialysis Technician`);
        // console.log("Dialysis Technician data:", dialysisTech.data.data);

        const allAdmins = await axiosInstance.get(`${server_url}/users/admins`);
        console.log("al admins data:", allAdmins.data.data);

        // Combine both sets of data if needed or handle separately
        // const combinedAdmins = [...adminResponse.data.data, ...psAdminResponse.data.data, ...dialysisTech.data.data];
        const combinedAdmins = [...allAdmins.data.data];
  
        // Update state with combined admins or handle separately
        setAdmins(combinedAdmins);
  
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };
  
    fetchAdmins();
    getAdminOfPatient();  // Fetch admins assigned to the patient
  }, []);
  
  const addAdminToPatientProgram = async (userId) => {
    try {
      // console.log("selected admin id:", userId);
      await axiosInstance.post(`${server_url}/assignedAdmin/addAdmin/${pid}`, {
        admin_id: userId,
      });
      console.log("Admin added to patient's program successfully");
      getAdminOfPatient();
    } catch (error) {
      console.error("Error adding admin to patient's program:", error);
      console.log(
        "An error occurred while adding admin to patient's program. Please try again later."
      );
    }
  };

  const getAdminOfPatient = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/assignedAdmin/getAdmin/${pid}`
      );
      console.log("Admin of patient:", response.data);
      setPatientAdmins(response.data.data); // Set the admin data to state
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
        `${server_url}/assignedAdmin/deleteAdmin/${pid}`,
        {
          data: { admin_id: userId }, // Pass the userId as data to the request
        }
      );
      console.log("User deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error);
      console.log(
        "An error occurred while deleting the user. Please try again later."
      );
    }
  };

  return (
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>

      <div className="md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className="bg-white md:p-12 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="mb-4">
              <div className="text-gray-900 tracking-wide text-xl border-b-2 p-2 border-gray">
                Assign Teams
              </div>
            </div>
            <div className="search-box">
              <label htmlFor="adminSelect" className="block">
                Select Admin
              </label>
              <select
                id="adminSelect"
                className="border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                value={searchQuery}
                onChange={(e) => addAdminToPatientProgram(e.target.value)}
                onSelect={(e) => addAdminToPatientProgram(e.target.value)}
              >
                <option value="">Select an admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.firstname}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                <thead className="bg-white text-gray-700">
                  <tr className="border-b-2 border-black">
                    <th className="py-3 px-4 text-left">Admin Name</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAdmins.map((admin) => (
                    <tr key={admin.userId} className="border-b-2 border-gray">
                      <td className="py-3 px-4 text-left">{admin.firstname}</td>
                      <td className="py-3 px-4 text-left">{admin.role}</td>
                      <td className="py-3 px-4 text-left">
                        <button
                          className="text-red-500"
                          style={{ fontSize: "1.5rem" }}
                          onClick={() => deleteUser(admin.id)}
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserListManage;
