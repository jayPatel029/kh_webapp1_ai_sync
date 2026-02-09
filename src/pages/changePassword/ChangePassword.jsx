import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

// Component Library
import { Box, Container } from "../../component-library";

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
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
            <PageHeader
              title="Change Password"
              breadcrumbs={[
                { label: "Dashboard", path: "/admin" },
                { label: "Change Password", active: true }
              ]}
            />
          </Container>
        </Box>

        <div className="admin-page">
          {/* Change Password Card */}
          <div className="admin-card" style={{ maxWidth: '600px' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__header-title">Change Password</h2>
            </div>
            <div className="admin-card__body">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-form__input"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-form__input"
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={handleChangePassword}
                  className="admin-btn admin-btn--primary"
                >
                  CHANGE PASSWORD
                </button>
              </div>

              {message && (
                <div className="admin-message admin-message--error" style={{ marginTop: '1rem' }}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default ChangePassword;

