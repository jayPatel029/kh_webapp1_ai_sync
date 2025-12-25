import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const EditRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  
  const [permissions, setPermissions] = useState({
    manageRoles: {
      view: false,
      edit: false,
      delete: false,
      name: "Manage Roles",
    },
    ailmentMaster: {
      view: false,
      edit: false,
      delete: false,
      name: "Ailment Master",
    },
    createAdmin: {
      view: false,
      edit: false,
      delete: false,
      name: "Create Admin",
    },
    createDoctor: {
      view: false,
      edit: false,
      delete: false,
      name: "Create Doctor",
    },
    profileQuestions: {
      view: false,
      edit: false,
      delete: false,
      name: "Profile Questions",
    },
    patients: { view: false, edit: false, delete: false, name: "Patients" },
    dailyReadings: {
      view: false,
      edit: false,
      delete: false,
      name: "Daily Readings",
    },
    dialysisReadings: {
      view: false,
      edit: false,
      delete: false,
      name: "Dialysis Readings",
    },
    changePassword: {
      view: false,
      edit: false,
      delete: false,
      name: "Change Password",
    },
    userProgramSelection: {
      view: false,
      edit: false,
      delete: false,
      name: "User Program Selection",
    },
    doctorReports: {
      view: false,
      edit: false,
      delete: false,
      name: "Doctor Reports",
    },
    feedback: {
      view: false,
      edit: false,
      delete: false,
      name: "Feedback",
    },
  });

  const handleCheckboxChange = (pageName, permissionType) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [pageName]: {
        ...prevPermissions[pageName],
        [permissionType]: !prevPermissions[pageName][permissionType],
      },
    }));
  };

  const handleSubmit = async () => {
    const auth_arr = Object.values(permissions).map((pagePermissions) => {
      const binaryString = `${Number(pagePermissions.delete)}${Number(
        pagePermissions.edit
      )}${Number(pagePermissions.view)}`;
      const decimal = parseInt(binaryString, 2);
      return decimal;
    });
    const role = {
      auth_arr: auth_arr,
    };
    axiosInstance
      .put(`${server_url}/roles/byName/${rolename}`, role)
      .then((res) => {
        alert("Role updated successfully");
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const { rolename } = useParams();

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/roles/byName/${rolename}`)
      .then((res) => {
        console.log(res);
        setRoleName(res.data.data.role_name);
        const auth_arr = [
          res.data.data.can_vud_mr,
          res.data.data.can_vud_am,
          res.data.data.can_vud_ca,
          res.data.data.can_vud_cd,
          res.data.data.can_vud_pq,
          res.data.data.can_vud_p,
          res.data.data.can_vud_dr,
          res.data.data.can_vud_dir,
          res.data.data.can_vud_cp,
          res.data.data.can_vud_ups,
          res.data.data.can_vud_docr,
          res.data.data.can_vud_fb,

        ];
        console.log("at",auth_arr);
        const binaryArr = auth_arr.map((auth) =>
          auth.toString(2).padStart(3, "0")
        );
        console.log("bina",binaryArr);
        const permiss = {};
        Object.keys(permissions).forEach((pageName, index) => {
          permiss[pageName] = {
            view: Boolean(Number(binaryArr[index][2])),
            edit: Boolean(Number(binaryArr[index][1])),
            delete: Boolean(Number(binaryArr[index][0])),
            name: permissions[pageName].name,
          };
        });
        setPermissions(permiss);
        console.log(permiss);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [rolename]);

  return (
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>
      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="header flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold">Add Role</h2>
            </div>
            <div className="form-section mb-4 md:mb-6">
              <label className="block text-sm md:text-base font-bold text-gray-600">
                Role Name
              </label>
              <input
                type="text"
                className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="table-section">
              <table className="w-full border-collapse">
                <thead className="bg-white text-gray-700">
                  <tr>
                    <th className="py-2 pl-2 text-left font-bold">Page Name</th>
                    <th className="py-2 text-center font-bold">View</th>
                    <th className="py-2 text-center font-bold">Edit</th>
                    <th className="py-2 text-center font-bold">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(permissions).map((pageName) => (
                    <tr key={pageName} className="border-b">
                      <td className="py-2 pl-2">
                        {permissions[pageName].name}
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[pageName].view}
                          onChange={() =>
                            handleCheckboxChange(pageName, "view")
                          }
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[pageName].edit}
                          onChange={() =>
                            handleCheckboxChange(pageName, "edit")
                          }
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[pageName].delete}
                          onChange={() =>
                            handleCheckboxChange(pageName, "delete")
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button
                className="bg-gradient-to-r from-primary to-teal-400 text-white px-4 py-2 rounded-md"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;
