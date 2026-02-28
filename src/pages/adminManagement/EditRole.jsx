import React, { useState, useEffect } from "react";
import { getRoleByName, updateRoleByName } from "../../ApiCalls/authapis";
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
import { useAdminToast } from "../../components/AdminToast";

const EditRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const { showToast, ToastContainer } = useAdminToast();
  
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

  const permissionOrder = [
    "manageRoles",
    "ailmentMaster",
    "createAdmin",
    "createDoctor",
    "profileQuestions",
    "patients",
    "dailyReadings",
    "dialysisReadings",
    "changePassword",
    "userProgramSelection",
    "doctorReports",
    "feedback",
  ];

  const { id, rolename } = useParams();
  const roleParam = decodeURIComponent(rolename || id || "");

  const getPermissionsFromRole = (roleData) => {
    const auth_arr = Array.isArray(roleData?.auth_arr)
      ? roleData.auth_arr
      : [
          roleData?.can_vud_mr,
          roleData?.can_vud_am,
          roleData?.can_vud_ca,
          roleData?.can_vud_cd,
          roleData?.can_vud_pq,
          roleData?.can_vud_p,
          roleData?.can_vud_dr,
          roleData?.can_vud_dir,
          roleData?.can_vud_cp,
          roleData?.can_vud_ups,
          roleData?.can_vud_docr,
          roleData?.can_vud_fb,
        ];

    const binaryArr = auth_arr.map((auth) =>
      (Number(auth) || 0).toString(2).padStart(3, "0")
    );

    const permiss = {};
    permissionOrder.forEach((pageName, index) => {
      const bin = binaryArr[index] || "000";
      permiss[pageName] = {
        view: Boolean(Number(bin[2])),
        edit: Boolean(Number(bin[1])),
        delete: Boolean(Number(bin[0])),
        name: permissions[pageName].name,
      };
    });

    return permiss;
  };

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
    updateRoleByName(roleParam, role)
      .then((res) => {
        showToast("Role updated successfully!", "success");
        navigate(ROUTES.USERS_ROLES);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (!roleParam) {
      return;
    }

    getRoleByName(roleParam)
      .then((res) => {
        if (res.success) {
          const roleData = res.data?.data || res.data;
          setRoleName(roleData?.role_name || roleParam);
          setPermissions(getPermissionsFromRole(roleData));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [roleParam]);

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
                <FormControl isRequired={true}>
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

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default EditRole;
