import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";
import { useState, useEffect } from "react";
import { server_url } from "../../constants/constants.js";
import axiosInstance from "../../helpers/axios/axiosInstance.js";
 

const UserRoles = () => {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    axiosInstance
      .get(`${server_url}/roles`)
      .then((res) => {
        setRoles(res.data.data);
        console.log(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const deleteRole = (role_name) => {
    console.log("object", role_name);
    axiosInstance
      .delete(`${server_url}/roles/byName/${role_name}`)
      .then((res) => {
        alert("Role deleted successfully");
        window.location.reload();
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateRole = (role_name) => {
    console.log("object", role_name);
    axiosInstance
      .put(`${server_url}/roles/byName/${role_name}`)
      .then((res) => {
        alert("Role updated successfully");
        window.location.reload();
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>
      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary">
            <div className="header flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-2xl font-bold">User Roles</h2>
              <Link to="/add-role">
                <button className="bg-gradient-to-r from-primary to-teal-400 text-white px-4 py-2 rounded-md">
                  Add Role
                </button>
              </Link>
            </div>

            <div className="md:px-10 overflow-x-auto">
              <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Role Name
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, index) => (
                    <tr className="bg-white border-b " key={index}>
                      <td scope="row" className="px-6 py-4">
                        {role.role_name}
                      </td>
                      <td className="px-6 py-4 text-3xl">
                        <Link to={`/edit-role/${role.role_name}`}>
                          <button className="text-primary inline-block mx-2">
                            <BsPencilSquare />
                          </button>
                        </Link>

                        <button
                          onClick={() => deleteRole(role.role_name)}
                          className="text-[#ff0000] inline-block mx-2"
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
};

export default UserRoles;
