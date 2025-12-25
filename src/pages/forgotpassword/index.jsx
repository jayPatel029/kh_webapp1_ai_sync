import "./doctorlogin.scss";
import React, { useEffect, useState } from "react";
import logo from "../../assets/admindashblue.png";
import { BsFillUnlockFill } from "react-icons/bs";
import { identifyRole, loginUser } from "../../ApiCalls/authapis";
import { Navigate } from "react-router-dom";
import { getUserByEmail } from "../../ApiCalls/authapis";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useDispatch } from "react-redux";
import { setPermissions } from "../../redux/permissionSlice";
import { server_url } from "../../constants/constants";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState([]);
  const [msg, setMsg] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const theNavigate = useNavigate();
  const [otpSentTime, setOtpSentTime] = useState(0);
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();

  function validateUserData(userData) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      errors.push("Enter a valid email address");
    }
    return errors;
  }

  const sendOTP = async (email) => {
    try {
      setErrMsg([]);
      setMsg("Sending OTP...");
      const response = await axiosInstance.post(`${server_url}/mail/sentotp`, {
        email,
      });
      setMsg("OTP sent successfully");
      console.log("OTP sent successfully:", response.data);
      // You can return the response data if needed
      return response.data;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("Failed to send OTP. Please try again later."); // Throw an error to handle it in the component
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axiosInstance.post(`${server_url}/mail/verifyOtp`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw new Error("Failed to verify OTP. Please try again later.");
    }
  };

  const handleSubmit = async () => {
    const error = validateUserData({ email });
    console.log(error);

    if (error.length === 0) {
      try {
        if (!isOtpSent) {
          // Send OTP
          await sendOTP(email);
          setIsOtpSent(true);
          setOtpSentTime(new Date().getTime());
          setErrMsg("");
        } else {
          // Verify OTP
          console.log("Verifying OTP");
          const res = await verifyOTP(email, otp);
          console.log(res.status);
          if (res.status === "true") {
            console.log("Res", res);
            console.log("OTP verified");
            const response = await getUserByEmail(email);
            setErrMsg([]);
            const userResponse = await getUserByEmail(email);
            localStorage.setItem(
              "firstname",
              userResponse.data.data[0].firstname
            );
            localStorage.setItem("email", userResponse.data.data[0].email);
            localStorage.setItem("token", res.token);
            try {
              const role = await identifyRole();
              if (role.success) {
                dispatch(setPermissions(role.data.data));
              }
            } catch (error) {
              console.error(error.message);
            }
            theNavigate("/changepassword");
          }
          if (res.status === "incorrect") {
            setErrMsg("Invalid OTP");
            setMsg("");
          }
          // Navigate to doctor dashboard if OTP is verified successfully
          // theNavigate('/doctorDashboard', { replace: true });
        }
      } catch (error) {
        setErrMsg("Error: " + error.message);
      }
    } else {
      setErrMsg(error);
    }
  };

  return (
    <>
      {localStorage.getItem("token") ? (
        <Navigate to="/" replace />
      ) : (
        <div className="bg-gradient-to-r from-primary to-highlight h-screen md:px-[35vw] py-[15vh] ">
          <div className="bg-white p-10 max-h-max">
            <div className="flex justify-center items-center">
              <img
                src="https://kifaytidata2024.s3.ap-south-1.amazonaws.com/kifayti_logo.png"
                className="w-[15vh] h-[15vh]"
                alt="Kifayti Health"
              />
            </div>
            <div className="w-full text-center font-semibold mt-3 text-lg">
              Enter the email address associated with your account
            </div>
            <div className="pt-6">
              <label className="block text-sm md:text-base font-semibold text-gray-600">
                Email Address *
              </label>
              <input
                type="text"
                className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isOtpSent && (
                <>
                  <label className="block text-sm md:text-base font-semibold text-gray-600 pt-4">
                    OTP *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                  />
                </>
              )}

              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-highlight text-white m-0 py-2 rounded-md w-full mt-3 text-lg"
              >
                <BsFillUnlockFill className="inline-block h-3.5 w-5 mb-1" />
                {isOtpSent ? "Verify OTP" : "Send OTP"}
              </button>
              {errMsg.length > 0 ? (
                <div className="mt-2 block">
                  <div className="text-[#ff0000] ml-2">{errMsg}</div>
                </div>
              ) : (
                <></>
              )}
              <div className="mt-2 block">
                <div className="text-primary ml-2">{msg}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
