import React, { useState, useEffect } from "react";
import {
  createRole,
  getRoles,
  getRoleByName,
  updateRoleByName,
  deleteRoleByName,
} from "../../ApiCalls/authapis";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import UnifiedListTable from "../../components/table/UnifiedListTable";
import { FormModal } from "../../component-library/modals/FormModal";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "../../component-library";
import { useAdminToast } from "../../components/AdminToast";
import { SearchBar } from "../../components";

const PERMISSIONS_CONFIG = {
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
};

const getInitialPermissions = () =>
  Object.keys(PERMISSIONS_CONFIG).reduce((acc, key) => {
    acc[key] = { ...PERMISSIONS_CONFIG[key] };
    return acc;
  }, {});

const AddRole = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  // State management
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState(getInitialPermissions);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editingRoleName, setEditingRoleName] = useState(null);

  const mapRoleToPermissions = (roleData) => {
    const pageKeys = Object.keys(PERMISSIONS_CONFIG);
    const initialPermissions = getInitialPermissions();

    const authArr = Array.isArray(roleData?.auth_arr)
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

    authArr.forEach((authValue, index) => {
      if (!pageKeys[index]) return;
      const binary = (Number(authValue) || 0).toString(2).padStart(3, "0");
      initialPermissions[pageKeys[index]] = {
        ...initialPermissions[pageKeys[index]],
        delete: binary[0] === "1",
        edit: binary[1] === "1",
        view: binary[2] === "1",
      };
    });

    return initialPermissions;
  };

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await getRoles();
        if (result.success) {
          const list = result.data?.data ?? result.data ?? [];
          setRoles(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [successMessage]);

  const clearFields = () => {
    setRoleName("");
    setPermissions(getInitialPermissions());
    setEditMode(false);
    setEditingRoleName(null);
    setErrorMessage("");
    setFieldErrors({});
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

  const convertPermissionsToAuthArr = () => {
    return Object.values(permissions).map((pagePermissions) => {
      const binaryString = `${Number(pagePermissions.delete)}${Number(
        pagePermissions.edit
      )}${Number(pagePermissions.view)}`;
      const decimal = parseInt(binaryString, 2);
      return decimal;
    });
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    const nextFieldErrors = {};

    if (!roleName.trim()) {
      nextFieldErrors.roleName = "Role Name is required";
      setFieldErrors(nextFieldErrors);
      setErrorMessage("Role Name is required");
      showToast("Role Name is required", "error");
      return;
    }

    setFieldErrors({});

    const auth_arr = convertPermissionsToAuthArr();
    const role = {
      role_name: roleName,
      auth_arr: auth_arr,
    };

    try {
      if (!editMode) {
        const result = await createRole(role);
        if (result.success) {
          setSuccessMessage("Role added successfully");
          showToast("Role added successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrorMessage(result.message || "Failed to add role");
          showToast(result.message || "Failed to add role", "error");
        }
      } else {
        const result = await updateRoleByName(editingRoleName, role);
        if (result.success) {
          setSuccessMessage("Role updated successfully");
          showToast("Role updated successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrorMessage(result.message || "Failed to update role");
          showToast(result.message || "Failed to update role", "error");
        }
      }
    } catch (error) {
      setErrorMessage("Error submitting role: " + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (roleName) => {
    if (window.confirm(`Delete role "${roleName}"?`)) {
      try {
        const result = await deleteRoleByName(roleName);
        if (result.success) {
          setRoles((prev) => prev.filter((r) => r.role_name !== roleName));
          setSuccessMessage("Role deleted successfully");
          showToast("Role deleted successfully!", "success");
        } else {
          setErrorMessage("Failed to delete role");
          showToast("Failed to delete role", "error");
        }
      } catch (error) {
        setErrorMessage("Error deleting role: " + error.message);
        console.error(error);
      }
    }
  };

  const handleEdit = (role) => {
    const selectedRoleName = role.role_name;
    setRoleName(selectedRoleName);
    setEditingRoleName(selectedRoleName);
    setEditMode(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});
    setIsFormModalOpen(true);

    // Always fetch full role detail so edit form has all allocated permissions
    getRoleByName(selectedRoleName)
      .then((result) => {
        if (!result.success) return;
        const roleData = result.data?.data || result.data || role;
        setRoleName(roleData.role_name || selectedRoleName);
        setPermissions(mapRoleToPermissions(roleData));
      })
      .catch((error) => {
        console.error("Error loading role details:", error);
      });
  };

  const openAddModal = () => {
    clearFields();
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    clearFields();
  };

  const filteredRoles = roles.filter((role) =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "role_name", label: "Role Name", type: "text", width: "250px" },
    { key: "actions", label: "Actions", type: "actions", width: "150px" },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Manage Roles"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Manage Roles", active: true },
            ]}
            onBack={() => navigate(ROUTES.USERS_ROLES)}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? "px-3 pb-20" : ""}`}>
          <div className="admin-card">
            <div className="admin-card__header">
              <div className={`admin-toolbar ${isMobile ? "flex-col gap-2" : ""}`}>
                <SearchBar
                  type="text"
                  placeholder="Search by role name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={isMobile ? { width: "100%" } : { width: "250px" }}
                />
                <div
                  className={`admin-toolbar__right ${isMobile ? "w-full justify-between" : ""
                    }`}
                >
                  <span
                    className={`admin-toolbar__count ${isMobile ? "text-xs" : ""}`}
                  >
                    {filteredRoles.length} Records Found
                  </span>
                  <Button
                    variant="primary"
                    className="admin-btn admin-btn--primary"
                    onClick={openAddModal}
                  >
                    Add Role
                  </Button>
                </div>
              </div>
            </div>

            <UnifiedListTable
              columns={columns}
              data={filteredRoles.map((role) => ({
                ...role,
                actions: role,
              }))}
              enableSearch={false}
              renderSearchUI={false}
              onEdit={(role) => handleEdit(role)}
              onDelete={(role) => handleDelete(role.role_name)}
              emptyMessage="No roles found"
              displayMode="table"
            />
          </div>
        </div>

        {/* Form Modal for Adding/Editing Roles */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          title={editMode ? "Edit Role" : "Add Role"}
          submitText={editMode ? "Update" : "Submit"}
          size="lg"
          errorMessage={errorMessage}
          fieldErrors={fieldErrors}
          onFieldErrorClear={(fieldName) => {
            setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
          }}
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
          {/* Role Name Input */}
          <FormControl isInvalid={getFieldProps("roleName").isInvalid}>
            <FormLabel>Role Name*</FormLabel>
            <Input
              type="text"
              placeholder="Enter role name"
              value={roleName}
              {...getFieldProps("roleName")}
              onChange={(e) => {
                setRoleName(e.target.value);
                clearFieldError("roleName");
              }}
              disabled={editMode}
            />
          </FormControl>

          {/* Permissions Table */}
          <div >
            {/* <h4 style={{ marginBottom: "0.25rem", fontWeight: "600" }}>Permissions </h4> */}
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
                          onChange={() =>
                            handleCheckboxChange(pageName, "view")
                          }
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                          checked={permissions[pageName].edit}
                          onChange={() =>
                            handleCheckboxChange(pageName, "edit")
                          }
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
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
          </div>
          </>
          )}
        </FormModal>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default AddRole;

