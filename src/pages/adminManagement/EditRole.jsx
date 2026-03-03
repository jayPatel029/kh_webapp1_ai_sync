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
import {
  getInitialRolePermissions,
  mapRoleDataToFormPermissions,
  mapFormPermissionsToAuthArray,
} from "../../helpers/permissions";
import PermissionsTable from '../../components/PermissionsTable/PermissionsTable';

const EditRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const { showToast, ToastContainer } = useAdminToast();

  const [permissions, setPermissions] = useState(getInitialRolePermissions);

  const { id, rolename } = useParams();
  const roleParam = decodeURIComponent(rolename || id || "");

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
    const auth_arr = mapFormPermissionsToAuthArray(permissions);
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
          setPermissions(mapRoleDataToFormPermissions(roleData));
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

              <PermissionsTable
                permissions={permissions}
                onChange={setPermissions}
                disabled={false}
              />

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
