import React, { useState, useReducer, useEffect } from "react";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";
import { newUserReducer } from "./reducers";
import {
  registerUser,
  getUsers,
  updateUserByEmail,
  deleteUserByEmail,
  getRoles,
} from "../../ApiCalls/authapis";
import { useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button
} from "../../component-library";

function AdminManagement() {
  const navigate = useNavigate();
  const myRole = useSelector((state) => state.permission);
  const [roles, setRoles] = useState([]);
  const [successful, setSuccessful] = useState("");
  const [userlist, setUserList] = useState([]);
  const [users, setUsers] = useState([]);
  const [editMail, setEditMail] = useState("");

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
  }, [successful]);

  const [errMsg, setErrMsg] = useState([]);
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

  const [editMode, setEditMode] = useState(false);
  const [passEditMode, setPassEditMode] = useState(false);
  const [newUser, newUserDispatch] = useReducer(newUserReducer, {
    name: "",
    email: "",
    role: "Admin",
    phone: "",
    password: "",
  });
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
          setSuccessful("Registration Successful!");
          newUserDispatch({ type: "all", payload: {} });
        } else {
          console.log("errorrr", response);
          setErrMsg(["Registration Error! " + response.data]);
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
          setSuccessful("Update Successful!");

          newUserDispatch({ type: "all", payload: {} });
        } else {
          setErrMsg(["Update Error! " + response.data.message]);
        }
        setEditMode(false);
        setPassEditMode(false);
        setEditMail("");
      }
    } else {
      setErrMsg(errors);
    }
  };
  async function deleteUser(email) {
    setSuccessful("");
    const response = await deleteUserByEmail(email);
    if (response.success) {
      setErrMsg([]);
      setSuccessful("User deleted successfully!");
    } else {
      setErrMsg(["Delete Error! " + response.data.message]);
    }
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Create Admin"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Create Admin", active: true }
              ]}
              onBack={() => navigate(ROUTES.USERS_ADMINS)}
            />
           
        </Box>


        <div className="admin-page-content">
          {/* Form Section */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">Admin Details</h3>
            </div>
            <div className="admin-card__body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <FormControl>
                    <FormLabel>Name*</FormLabel>
                    <Input
                      type="text"
                      placeholder="Name"
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
                    <FormLabel>Phone No</FormLabel>
                    <Input
                      type="number"
                      placeholder="Phone No"
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
                        placeholder="Password"
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
                      type="text"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(event) => {
                        newUserDispatch({
                          type: "email",
                          payload: event.target.value,
                        });
                      }}
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

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6">
                {editMode ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      className="w-32"
                    >
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        newUserDispatch({ type: "all", payload: {} });
                      }}
                      className="w-32"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    className="w-32"
                  >
                    Submit
                  </Button>
                )}
              </div>

              {/* Messages */}
              {errMsg.length > 0 && (
                <div className="mt-4">
                  {errMsg.map((msg, idx) => (
                    <div key={idx} className="admin-message admin-message--error">{msg}</div>
                  ))}
                </div>
              )}
              {successful.length > 0 && (
                <div className="mt-4 admin-message admin-message--success">{successful}</div>
              )}
            </div>
          </div>

          {/* List Section */}
          <div className="admin-card mt-6">
            <div className="admin-card__header flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="admin-card__title">Admin List</h3>
                <span className="text-gray-500 text-sm">
                  ({users.length} Records Found)
                </span>
              </div>
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="Search Name"
                  onChange={(event) => searchUser(event.target.value)}
                />
              </div>
            </div>

            <div className="admin-card__body">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={index}>
                        <td>{u.firstname + " " + u.lastname}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <div className="flex gap-2">
                            {myRole.createAdmin >= 2 && (
                              <>
                                <button
                                  className="admin-action-btn admin-action-btn--edit"
                                  onClick={() => {
                                    newUserDispatch({
                                      type: "all",
                                      payload: {
                                        name: u.firstname + " " + u.lastname,
                                        email: u.email,
                                        role: u.role,
                                        phone: u.phoneno,
                                      },
                                    });
                                    setPassEditMode(true);
                                    setEditMode(true);
                                    setEditMail(u.email);
                                    setSuccessful("");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  title="Edit Password"
                                >
                                  <BsKey size={18} />
                                </button>
                                <button
                                  className="admin-action-btn admin-action-btn--edit"
                                  onClick={() => {
                                    newUserDispatch({
                                      type: "all",
                                      payload: {
                                        name: u.firstname + " " + u.lastname,
                                        email: u.email,
                                        role: u.role,
                                        phone: u.phoneno,
                                      },
                                    });
                                    setPassEditMode(false);
                                    setEditMode(true);
                                    setEditMail(u.email);
                                    setSuccessful("");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  title="Edit User"
                                >
                                  <BsPencilSquare size={18} />
                                </button>
                              </>
                            )}
                            {u.email !== "superadmin@kifaytihealth.com" &&
                              myRole.createAdmin >= 4 && (
                                <button
                                  className="admin-action-btn admin-action-btn--delete"
                                  onClick={() => deleteUser(u.email)}
                                  title="Delete User"
                                >
                                  <BsTrash size={18} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default AdminManagement;
