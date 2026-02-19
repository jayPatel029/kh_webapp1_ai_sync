import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button
} from "../../component-library";

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

  const { rolename } = useParams();

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
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Edit Role"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Edit Role", active: true }
              ]}
              onBack={() => navigate(ROUTES.USERS_ROLES)}
            />
           
        </Box>

         
          <div className="admin-page-content">
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Role Details</h3>
              </div>

              <div className="admin-card__body">
                <div className="max-w-md mb-6">
                  <FormControl>
                    <FormLabel>Role Name</FormLabel>
                    <Input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Enter role name"
                    />
                  </FormControl>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Page Name</th>
                        <th className="text-center">View</th>
                        <th className="text-center">Edit</th>
                        <th className="text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(permissions).map((pageName) => (
                        <tr key={pageName}>
                          <td>{permissions[pageName].name}</td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 bg-gray-100 border-gray-300 rounded text-teal-600 focus:ring-teal-500"
                              checked={permissions[pageName].view}
                              onChange={() =>
                                handleCheckboxChange(pageName, "view")
                              }
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 bg-gray-100 border-gray-300 rounded text-teal-600 focus:ring-teal-500"
                              checked={permissions[pageName].edit}
                              onChange={() =>
                                handleCheckboxChange(pageName, "edit")
                              }
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 bg-gray-100 border-gray-300 rounded text-teal-600 focus:ring-teal-500"
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

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    className="w-32"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>

      </Box>
    </ThemeProvider>
  );
};

export default EditRole;
