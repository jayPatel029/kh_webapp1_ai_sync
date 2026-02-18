import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button
} from "../../component-library";

const AddRole = () => {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    manageRoles: { view: false, edit: false, delete: false, name: "Manage Roles" },
    ailmentMaster: { view: false, edit: false, delete: false, name: "Ailment Master" },
    createAdmin: { view: false, edit: false, delete: false, name: "Create Admin" },
    createDoctor: { view: false, edit: false, delete: false, name: "Create Doctor" },
    profileQuestions: { view: false, edit: false, delete: false, name: "Profile Questions" },
    patients: { view: false, edit: false, delete: false, name: "Patients" },
    dailyReadings: { view: false, edit: false, delete: false, name: "Daily Readings" },
    dialysisReadings: { view: false, edit: false, delete: false, name: "Dialysis Readings" },
    changePassword: { view: false, edit: false, delete: false, name: "Change Password" },
    userProgramSelection: { view: false, edit: false, delete: false, name: "User Program Selection" },
    doctorReports: { view: false, edit: false, delete: false, name: "Doctor Reports" },
    feedback: { view: false, edit: false, delete: false, name: "Feedback" },
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
    if (roleName === "") {
      alert("Role Name is required");
      return;
    }
    const auth_arr = Object.values(permissions).map((pagePermissions) => {
      const binaryString = `${Number(pagePermissions.delete)}${Number(
        pagePermissions.edit
      )}${Number(pagePermissions.view)}`;
      const decimal = parseInt(binaryString, 2);
      return decimal;
    });
    const role = {
      role_name: roleName,
      auth_arr: auth_arr,
    };

    await axiosInstance.post(`${server_url}/roles/`, role).then((res) => {
      if (res.status === 200) {
        alert("Role Added Successfully");
      } else {
        alert("Role Already Exists");
      }
    });
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="Add Role"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Manage Roles", path: "/users/roles" },
                { label: "Add Role", active: true }
              ]}
            />
          </Container>
        </Box>

         
          <div className="admin-page-content">
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Role Details</h3>
              </div>
              <div className="admin-card__body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormControl isRequired>
                    <FormLabel>Role Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Role Name"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
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
                              className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                              checked={permissions[pageName].view}
                              onChange={() => handleCheckboxChange(pageName, "view")}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                              checked={permissions[pageName].edit}
                              onChange={() => handleCheckboxChange(pageName, "edit")}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                              checked={permissions[pageName].delete}
                              onChange={() => handleCheckboxChange(pageName, "delete")}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
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

export default AddRole;

