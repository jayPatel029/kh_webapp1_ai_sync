import React, { useState } from "react";
  // Import axiosInstance for making HTTP requests
import "./changepassword.scss"; // If you have additional styles in a separate file
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      const response = await axiosInstance.post(
        `${server_url}/auth/changePassword`,
        {
          token: token, // Pass the token
          newPassword: newPassword,
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("Something went wrong while changing the password");
    }
  };

  return (
    <div className="changePassword flex">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="changePasswordContainer flex-grow">
        <div className="sticky top-0 bg-white z-50 ">
          <Navbar />
        </div>
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className="manage-roles-container p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary">
            <div className="header flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-2xl font-bold text-teal">Change Password</h2>
            </div>
            <div className="form-container">
              <div className="mb-4">
                <label className="text-lg font-semibold mb-2 block">
                  New Password*
                </label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-lg border-2 px-4 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="text-lg font-semibold mb-2 block">
                  Confirm Password*
                </label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg px-4 py-2 border-2 w-full"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="rounded-lg bg-primary text-white px-4 py-2"
              >
                CHANGE PASSWORD
              </button>
              {message && <p className="text-red-500 mt-2">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
