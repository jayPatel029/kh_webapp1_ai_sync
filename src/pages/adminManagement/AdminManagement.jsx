import React, { useState, useReducer, useEffect, useMemo } from "react";
import { newUserReducer } from "./reducers";
import {
  registerUser,
  getUsers,
  updateUserByEmail,
  deleteUserByEmail,
  getRoles,
} from "../../ApiCalls/authapis";
import { useSelector } from "react-redux";
import { useAdminToast } from "../../components/AdminToast";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import { FormModal } from "../../component-library/modals/FormModal";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button
} from "../../component-library";
import UnifiedListTable from "../../components/table/UnifiedListTable";
import { usePageCache, PAGE_CACHE } from "../../cache";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import { hasEditPermission, hasDeletePermission } from "../../helpers/permissions";

function AdminManagement() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const myRole = useSelector((state) => state.permission);
  const canEditAdmins = hasEditPermission(myRole, "createAdmin");
  const canDeleteAdmins = hasDeletePermission(myRole, "createAdmin");
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.ADMIN_MANAGEMENT);

  // State management
  const [roles, setRoles] = useState([]);
  const [userlist, setUserList] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errMsg, setErrMsg] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [passEditMode, setPassEditMode] = useState(false);
  const [editMail, setEditMail] = useState("");

  const [newUser, newUserDispatch] = useReducer(newUserReducer, {
    name: "",
    email: "",
    role: "Admin",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchWithCache('getUsers', () => getUsers(), {
          transform: (apiData) =>
            (apiData?.data || []).filter(
              (user) => user.role !== "Doctor" && user.role !== "Medical Staff"
            ),
        });
        if (result.success) {
          setUserList(result.data);
          setUsers(result.data);
        } else {
          console.error("Failed to fetch users:", result.data);
        }
        const rolesResult = await fetchWithCache('getRoles', () => getRoles(), {
          transform: (apiData) =>
            (apiData?.data || []).filter(
              (role) =>
                role.role_name !== "Doctor" &&
                role.role_name !== "Patient" &&
                role.role_name !== "Medical Staff"
            ),
        });
        if (rolesResult.success) {
          setRoles(rolesResult.data);
        } else {
          console.error("Failed to fetch roles:", rolesResult.data);
        }
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      }
    };

    fetchData();
  }, [successMessage, refreshKey]);

  function searchUser(keyword) {
    setUsers(
      userlist.filter((user) => {
        if (
          (user["firstname"] + " " + user["lastname"])
            .toLowerCase()
            .includes(keyword.toLowerCase())
        ) {
          return user;
        }
      })
    );
  }
  function validateUserData(userData) {
    const errors = [];
    const nextFieldErrors = {};
    if (!userData.name.trim()) {
      errors.push("Name is required");
      nextFieldErrors.name = "Name is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      errors.push("Enter a valid email address");
      nextFieldErrors.email = "Enter a valid email address";
    }
    if (!userData.role.trim()) {
      errors.push("Role is required");
      nextFieldErrors.role = "Role is required";
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!userData.phone.trim() || !phoneRegex.test(userData.phone)) {
      errors.push("Enter a valid phone number");
      nextFieldErrors.phone = "Enter a valid phone number";
    }
    if (passEditMode && !userData.password.trim()) {
      errors.push("Password is required");
      nextFieldErrors.password = "Password is required";
    }
    if (!editMode && !userData.password.trim()) {
      errors.push("Password is required");
      nextFieldErrors.password = "Password is required";
    }
    return { errors, fieldErrors: nextFieldErrors };
  }

  const clearFields = () => {
    newUserDispatch({ type: "all", payload: {} });
    setEditMode(false);
    setPassEditMode(false);
    setEditMail("");
    setErrMsg([]);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    const { errors, fieldErrors: validationFieldErrors } = validateUserData({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      password: newUser.password,
    });
    setFieldErrors(validationFieldErrors);

    if (errors.length === 0) {
      if (!editMode) {
        const names = newUser.name.split(" ");
        const payload = {
          firstname: names[0],
          lastname: names.length >= 2 ? names[names.length - 1] : " ",
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          phoneno: newUser.phone,
        };
        const response = await mutate(() => registerUser(payload), {
          autoRefetch: false,
        });
        if (response.success) {
          setErrMsg([]);
          setSuccessMessage("Admin added successfully!");
          showToast("Admin added successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg(["Registration Error! " + response.data]);
          showToast("Registration Error! " + response.data, "error");
        }
      } else {
        const names = newUser.name.split(" ");
        let payload = {};
        if (passEditMode) {
          payload = {
            firstname: names[0],
            lastname: names.length >= 2 ? names[names.length - 1] : " ",
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            phoneno: newUser.phone,
          };
        } else {
          payload = {
            firstname: names[0],
            lastname: names.length >= 2 ? names[names.length - 1] : " ",
            email: newUser.email,
            role: newUser.role,
            phoneno: newUser.phone,
          };
        }
        const response = await mutate(() => updateUserByEmail(editMail, payload), {
          autoRefetch: false,
        });
        if (response.success) {
          setErrMsg([]);
          setSuccessMessage("Admin updated successfully!");
          showToast("Admin updated successfully!", "success");
          clearFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg(["Update Error! " + response.data.message]);
          showToast("Update Error! " + response.data.message, "error");
        }
      }
    } else {
      setErrMsg(errors);
      showToast(errors[0] || "Please fix the highlighted fields", "error");
    }
  };

  async function deleteUser(email) {
    if (email === "superadmin@kifaytihealth.com") {
      alert("This user cannot be deleted.");
      return;
    }
    // alert 
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
      return;
    }

    const response = await mutate(() => deleteUserByEmail(email), {
      autoRefetch: false,
    });
    if (response.success) {
      setErrMsg([]);
      setSuccessMessage("User deleted successfully!");
      showToast("User deleted successfully!", "success");
    } else {
      setErrMsg(["Delete Error! " + response.data.message]);
      showToast("Delete Error! " + response.data.message, "error");
    }
  }

  const getFullName = (user) => `${user.firstname || ""} ${user.lastname || ""}`.trim();

  const prepareEditForm = (user, forPassword) => {
    newUserDispatch({
      type: "all",
      payload: {
        name: getFullName(user),
        email: user.email,
        role: user.role,
        phone: user.phoneno,
      },
    });
    setPassEditMode(forPassword);
    setEditMode(true);
    setEditMail(user.email);
    setSuccessMessage("");
    setIsFormModalOpen(true);
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

  const tableData = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        name: getFullName(user),
        actions: user,
      })),
    [users]
  );

  const columns = [
    { key: "name", label: "Name", type: "text", width: "220px" },
    { key: "email", label: "Email", type: "text", width: "240px" },
    { key: "role", label: "Role", type: "text", width: "160px" },
    { key: "actions", label: "Action", type: "actions", width: "200px" },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Admin Management"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Admin Management", active: true }
            ]}
            onBack={() => navigate(ROUTES.USERS_ADMINS)}
            rightAction={<RefreshButton pageName={PAGE_CACHE.ADMIN_MANAGEMENT.name} />}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? "px-3 pb-20" : ""}`}>
          {/* <div className="admin-card"> */}
          <div className="admin-card__header">
            <div className={`admin-toolbar ${isMobile ? "flex-col gap-2" : ""}`}>
              <div
                className={`admin-toolbar__count ${isMobile ? "text-xs" : ""}`}
              >
                Total admins: <span className="font-bold">{users.length}</span>
              </div>
              <div
                className={`admin-toolbar__right ${isMobile ? "w-full justify-between" : ""
                  }`}
              >
                <span
                  className={`admin-toolbar__count ${isMobile ? "text-xs" : ""}`}
                >
                  {users.length} Records Found
                </span>
                <div
                  className="admin-toolbar__left"
                  style={isMobile ? { width: "100%" } : {}}
                >
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchUser(e.target.value);
                    }}
                    style={isMobile ? { width: "100%" } : { width: "250px" }}
                  />
                </div>
                {canEditAdmins &&
                  <Button
                  variant="primary"
                  className="admin-btn admin-btn--primary"
                  onClick={openAddModal}
                  >
                  Add Admin
                </Button>
                }
              </div>
              {/* </div> */}
            </div>

            <UnifiedListTable
              columns={columns}
              data={tableData}
              onEdit={canEditAdmins ? (row) => prepareEditForm(row, false) : undefined}
              onDelete={canDeleteAdmins ? (row) => deleteUser(row.email) : undefined}
              rowsPerPage={8}
              emptyMessage="No admin records found"
              displayMode="table"
            />

            {/* {successMessage && (
              <div className="mt-4 admin-message admin-message--success" style={{ marginLeft: "16px", marginRight: "16px" }}>
                {successMessage}
              </div>
            )} */}
          </div>
        </div>

        {/* Form Modal */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          title={editMode ? "Edit Admin" : "Add Admin"}
          submitText={editMode ? "Update" : "Submit"}
          size="lg"
          errorMessage={errMsg.length > 0 ? errMsg[0] : ""}
          fieldErrors={fieldErrors}
          onFieldErrorClear={(fieldName) => {
            setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
          }}
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
              {/* Left Column */}
              {/* <div className="space-y-4"> */}
              <FormControl
                isRequired={true} isInvalid={getFieldProps("name").isInvalid}>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={newUser.name}
                  {...getFieldProps("name")}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "name",
                      payload: event.target.value,
                    });
                    clearFieldError("name");
                  }}
                />
              </FormControl>

              <FormControl
                isRequired={true} isInvalid={getFieldProps("phone").isInvalid}>
                <FormLabel>Phone No</FormLabel>
                <Input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={newUser.phone}
                  {...getFieldProps("phone")}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "phone",
                      payload: event.target.value,
                    });
                    clearFieldError("phone");
                  }}
                />
              </FormControl>

              {(!editMode || passEditMode) && (
                <FormControl
                  isRequired={true} isInvalid={getFieldProps("password").isInvalid}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    {...getFieldProps("password")}
                    onChange={(event) => {
                      newUserDispatch({
                        type: "password",
                        payload: event.target.value,
                      });
                      clearFieldError("password");
                    }}
                  />
                </FormControl>
              )}
              {/* </div> */}

              {/* Right Column */}
              {/* <div className="space-y-4"> */}
              <FormControl
                isRequired={true} isInvalid={getFieldProps("email").isInvalid}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  {...getFieldProps("email")}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                    clearFieldError("email");
                  }}
                  disabled={editMode}
                />
              </FormControl>

              <FormControl isRequired={true} isInvalid={getFieldProps("role").isInvalid}>
                <FormLabel>Role</FormLabel>
                <Select
                  value={newUser.role}
                  {...getFieldProps("role")}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "role",
                      payload: event.target.value,
                    });
                    clearFieldError("role");
                  }}
                >
                  {roles.map((role, index) => (
                    <option key={index} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* </div>
          </div> */}
              {/* 
          {errMsg.length > 1 && (
            <div className="mt-4">
              {errMsg.slice(1).map((msg, idx) => (
                <div key={idx} className="text-red-600 text-sm">{msg}</div>
              ))}
            </div>
          )} */}
            </>
          )}
        </FormModal>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default AdminManagement;
