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
import { useSelector } from "react-redux";
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
import {
  getInitialRolePermissions,
  mapRoleDataToFormPermissions,
  mapFormPermissionsToAuthArray,
  hasViewPermission,
  hasEditPermission,
  hasDeletePermission,
} from "../../helpers/permissions";
import PermissionsTable from '../../components/PermissionsTable/PermissionsTable';
import { invalidatePageCache, emitCacheInvalidation, PAGE_CACHE } from "../../cache";

const invalidateAdminRoleCaches = () => {
  const pages = [
    PAGE_CACHE.USER_ROLES.name,
    PAGE_CACHE.ADMIN_MANAGEMENT.name,
  ];
  pages.forEach(invalidatePageCache);
  emitCacheInvalidation(pages);
};

const AddRole = () => {
  const navigate = useNavigate();
  const myRole = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  // State management
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState(getInitialRolePermissions);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editingRoleName, setEditingRoleName] = useState(null);
  const [listEpoch, setListEpoch] = useState(0);

  const canViewRoles = hasViewPermission(myRole, "manageRoles") || hasEditPermission(myRole, "manageRoles") || hasDeletePermission(myRole, "manageRoles");
  const canEditRoles = hasEditPermission(myRole, "manageRoles");
  const canDeleteRoles = hasDeletePermission(myRole, "manageRoles");

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
  }, [successMessage, listEpoch]);

  const markRolesChanged = (message) => {
    setSuccessMessage(message);
    setListEpoch((n) => n + 1);
    invalidateAdminRoleCaches();
  };

  const clearFields = () => {
    setRoleName("");
    setPermissions(getInitialRolePermissions());
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

  const handleSubmit = async () => {
    if (!canEditRoles) {
      setErrorMessage("You don't have permission to modify roles");
      return;
    }

    setErrorMessage("");
    const nextFieldErrors = {};

    if (!roleName.trim()) {
      nextFieldErrors.roleName = "Role Name is required";
      setFieldErrors(nextFieldErrors);
      setErrorMessage("Role Name is required");
      // showToast("Role Name is required", "error");
      return;
    }

    setFieldErrors({});

    const auth_arr = mapFormPermissionsToAuthArray(permissions);
    const role = {
      role_name: roleName,
      auth_arr: auth_arr,
    };

    try {
      if (!editMode) {
        const result = await createRole(role);
        if (result.success) {
          markRolesChanged("Role added successfully");
          showToast("Role added successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrorMessage(result.error || "Failed to add role");
        }
      } else {
        const result = await updateRoleByName(editingRoleName, role);
        if (result.success) {
          markRolesChanged("Role updated successfully");
          showToast("Role updated successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrorMessage(result.error || "Failed to update role");
        }
      }
    } catch (error) {
      setErrorMessage("Error submitting role: " + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (roleName) => {
    if (!canDeleteRoles) {
      setErrorMessage("You don't have permission to delete roles");
      return;
    }

    if (window.confirm(`Delete role "${roleName}"?`)) {
      try {
        const result = await deleteRoleByName(roleName);
        if (result.success) {
          setRoles((prev) => prev.filter((r) => r.role_name !== roleName));
          markRolesChanged("Role deleted successfully");
          showToast("Role deleted successfully!", "success");
        } else {
          setErrorMessage(result.error || "Failed to delete role");
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
        setPermissions(mapRoleDataToFormPermissions(roleData));
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
          {canViewRoles ? (
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
                    {canEditRoles && (
                      <Button
                        variant="primary"
                        className="admin-btn admin-btn--primary"
                        onClick={openAddModal}
                      >
                        Add Role
                      </Button>
                    )}
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
                onEdit={canEditRoles ? (role) => handleEdit(role) : undefined}
                onDelete={canDeleteRoles ? (role) => handleDelete(role.role_name) : undefined}
                emptyMessage="No roles found"
                displayMode="table"
              />
            </div>
          ) : (
            <div className="px-4 pb-4 text-sm text-red-600">
              You don't have permission to view roles.
            </div>
          )}
        </div>

        {/* Form Modal for Adding/Editing Roles */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          title={editMode ? "Edit Role" : "Add Role"}
          submitText={editMode ? "Update" : "Submit"}
          isSubmitDisabled={!canEditRoles}
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
          <FormControl isRequired={true} isInvalid={getFieldProps("roleName").isInvalid}>
            <FormLabel>Role Name</FormLabel>
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
          <div className="-mb-4 text-xl font-small">
            <PermissionsTable
              permissions={permissions}
              onChange={setPermissions}
              disabled={!canEditRoles}
            />
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

