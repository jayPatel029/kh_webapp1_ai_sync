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

function AdminManagement() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const myRole = useSelector((state) => state.permission);
  const { showToast, ToastContainer } = useAdminToast();

  // State management
  const [roles, setRoles] = useState([]);
  const [userlist, setUserList] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errMsg, setErrMsg] = useState([]);
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
        const result = await getUsers();
        if (result.success) {
          setUserList(
            result.data.data.filter(
              (user) => user.role !== "Doctor" && user.role !== "Medical Staff"
            )
          );
          setUsers(
            result.data.data.filter(
              (user) => user.role !== "Doctor" && user.role !== "Medical Staff"
            )
          );
        } else {
          console.error("Failed to fetch users:", result.data);
        }
        const rolesResult = await getRoles();
        if (rolesResult.success) {
          setRoles(
            rolesResult.data.data.filter(
              (role) =>
                role.role_name !== "Doctor" &&
                role.role_name !== "Patient" &&
                role.role_name !== "Medical Staff"
            )
          );
        } else {
          console.error("Failed to fetch users:", result.data);
        }
      } catch (error) {
        console.error("Error fetching users/roles:", error);
      }
    };

    fetchData();
  }, [successMessage]);

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
    if (!userData.name.trim()) {
      errors.push("Name is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      errors.push("Enter a valid email address");
    }
    if (!userData.role.trim()) {
      errors.push("Role is required");
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!userData.phone.trim() || !phoneRegex.test(userData.phone)) {
      errors.push("Enter a valid phone number");
    }
    if (passEditMode && !userData.password.trim()) {
      errors.push("Password is required");
    }
    if (!editMode && !userData.password.trim()) {
      errors.push("Password is required");
    }
    return errors;
  }

  const clearFields = () => {
    newUserDispatch({ type: "all", payload: {} });
    setEditMode(false);
    setPassEditMode(false);
    setEditMail("");
    setErrMsg([]);
  };

  const handleSubmit = async () => {
    const errors = validateUserData({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      password: newUser.password,
    });

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
        const response = await registerUser(payload);
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
        const response = await updateUserByEmail(editMail, payload);
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
    }
  };

  async function deleteUser(email) {
    if (email === "superadmin@kifaytihealth.com") {
      alert("This user cannot be deleted.");
      return;
    }
    const response = await deleteUserByEmail(email);
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
                  {/* <span
                    className={`admin-toolbar__count ${isMobile ? "text-xs" : ""}`}
                  >
                    {users.length} Records Found
                  </span> */}
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
                  <Button
                    variant="primary"
                    className="admin-btn admin-btn--primary"
                    onClick={openAddModal}
                  >
                    Add Admin
                  </Button>
                </div>
              {/* </div> */}
            </div>

            <UnifiedListTable
              columns={columns}
              data={tableData}
              onEdit={myRole.createAdmin >= 2 ? (row) => prepareEditForm(row, false) : undefined}
              onDelete={myRole.createAdmin >= 4 ? (row) => deleteUser(row.email) : undefined}
              enablePagination
              rowsPerPage={8}
              emptyMessage="No admin records found"
              displayMode="table"
            />

            {successMessage && (
              <div className="mt-4 admin-message admin-message--success" style={{ marginLeft: "16px", marginRight: "16px" }}>
                {successMessage}
              </div>
            )}
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
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <FormControl>
                <FormLabel>Name*</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={newUser.name}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "name",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone No*</FormLabel>
                <Input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={newUser.phone}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "phone",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              {(!editMode || passEditMode) && (
                <FormControl>
                  <FormLabel>Password*</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(event) => {
                      newUserDispatch({
                        type: "password",
                        payload: event.target.value,
                      });
                    }}
                  />
                </FormControl>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FormControl>
                <FormLabel>Email*</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                  }}
                  disabled={editMode}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Role*</FormLabel>
                <Select
                  value={newUser.role}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "role",
                      payload: event.target.value,
                    });
                  }}
                >
                  {roles.map((role, index) => (
                    <option key={index} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {errMsg.length > 1 && (
            <div className="mt-4">
              {errMsg.slice(1).map((msg, idx) => (
                <div key={idx} className="text-red-600 text-sm">{msg}</div>
              ))}
            </div>
          )}
        </FormModal>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default AdminManagement;
