import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

// Component Library
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button
} from "../../component-library";

function ChangePassword() {
  const navigate = useNavigate();
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
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Change Password"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Change Password", active: true }
              ]}
              onBack={() => navigate(ROUTES.HOME)}
            />
           
        </Box>

         
          <div className="admin-page-content">
            <div className="admin-card max-w-xl">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Change Password</h3>
              </div>
              <div className="admin-card__body">
                <div className="flex flex-col gap-6">
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormControl>

                  <div className="mt-2">
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      className="w-full sm:w-auto"
                    >
                      CHANGE PASSWORD
                    </Button>
                  </div>

                  {message && (
                    <div className={`admin-message ${message.includes("success") ? "admin-message--success" : "admin-message--error"}`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </Box>
    </ThemeProvider>
  );
}

export default ChangePassword;

