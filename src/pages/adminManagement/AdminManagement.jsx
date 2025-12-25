import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";
import { useState, useReducer, useEffect } from "react";
import { newUserReducer } from "./reducers";
import {
  registerUser,
  getUsers,
  updateUserByEmail,
  deleteUserByEmail,
  getRoles,
} from "../../ApiCalls/authapis";
import { useSelector } from "react-redux";

function AdminManagement() {
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
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-12 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="border-b-gray border-b-2 p-2 pb-6 font-semibold text-primary tracking-wide text-xl">
              Admin Master
            </div>
            <div className=" md:grid grid-cols-2">
              <div className="p-5">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Name*
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "name",
                      payload: event.target.value,
                    });
                  }}
                  className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                  Phone No
                </label>
                <input
                  type="Number"
                  placeholder="Phone No"
                  value={newUser.phone}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "phone",
                      payload: event.target.value,
                    });
                  }}
                  className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                {!editMode || passEditMode ? (
                  <>
                    <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                      Password*
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(event) => {
                        newUserDispatch({
                          type: "password",
                          payload: event.target.value,
                        });
                      }}
                      className="border border-gray-300 text-gray-500 text-sm  rounded-lg block w-full p-2.5 focus:outline-primary"
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="p-5">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Email*
                </label>
                <input
                  type="text"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                  }}
                  className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                  Role*
                </label>
                <select
                  value={newUser.role}
                  onChange={(event) => {
                    newUserDispatch({
                      type: "role",
                      payload: event.target.value,
                    });
                  }}
                  className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary">
                  {roles.map((role, index) => {
                    return (
                      <option key={index} value={role.role_name}>
                        {role.role_name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="w-full md:block p-5 pt-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleSubmit}
                    className=" flex-1 mr-2 border md:inline-block text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-[12vw] rounded-lg p-1.5">
                    UPDATE
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      newUserDispatch({ type: "all", payload: {} });
                    }}
                    className="flex-1 border text-[#ff0000] md:inline-block bg-white font-semibold tracking-wide text-lg border-[#ff0000] w-[12vw] rounded-lg  p-1.5">
                    CANCEL
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="block border text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg p-1.5">
                  SUBMIT
                </button>
              )}
              {errMsg.length > 0 ? (
                <div className="mt-3 block">
                  {errMsg.map((msg) => (
                    <div className="text-[#ff0000] ml-2">{msg}</div>
                  ))}
                </div>
              ) : (
                <></>
              )}
              {successful.length > 0 ? (
                <div className="mt-3 block text-primary ml-2">{successful}</div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className=" bg-white md:p-12 p-6 border rounded-md  border-t-4 shadow-md mt-4">
            <div>
              <input
                type="text"
                placeholder="Search Name"
                className="border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                onChange={(event) => {
                  searchUser(event.target.value);
                }}
              />
              {/* <button className="inline-block  mx-3 border-primary border-2 p-3 text-md rounded-md text-primary">
                <FaSearch />
              </button> */}
            </div>

            <div className="relative overflow-x-auto mt-6">
              <span className=" text-gray-900 tracking-wide text-xl ">
                Admin List{" "}
                <span className="text-gray-400 text-sm">
                  ({users.length} Records Found )
                </span>
              </span>
              <div className="mt-4">
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => {
                      return (
                        <tr className="bg-white border-b " key={index}>
                          <td scope="row" className="px-6 py-4">
                            {u.firstname + " " + u.lastname}
                          </td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">{u.role}</td>
                          <td className="px-6 py-4 text-3xl">
                            {myRole.createAdmin >= 2 && (
                              <>
                                <button
                                  className="text-primary inline-block mx-2"
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
                                    window.scrollTo({
                                      top: 0,
                                      left: 0,
                                      behavior: "smooth",
                                    });
                                  }}>
                                  <BsKey />
                                </button>
                                <button
                                  className="text-primary inline-block mx-2"
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
                                    window.scrollTo({
                                      top: 0,
                                      left: 0,
                                      behavior: "smooth",
                                    });
                                  }}>
                                  <BsPencilSquare />
                                </button>
                              </>
                            )}
                            {u.email !== "superadmin@kifaytihealth.com" &&
                            myRole.createAdmin >= 4 ? (
                              <button
                                onClick={() => deleteUser(u.email)}
                                className="text-[#ff0000] inline-block mx-2">
                                <BsTrash />
                              </button>
                            ) : (
                              <></>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminManagement;
