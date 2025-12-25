import "./doctorlogin.scss";
import React, { useEffect, useState } from "react";
// import logo from "../../assets/admindashblue.png";
import { BsFillUnlockFill } from "react-icons/bs";
import {
  getUserByEmailDoctor,
  identifyRole,
  loginUser,
} from "../../ApiCalls/authapis";
import { Navigate } from "react-router-dom";
import { getUserByEmail } from "../../ApiCalls/authapis";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useDispatch } from "react-redux";
import { setPermissions } from "../../redux/permissionSlice";
import { server_url } from "../../constants/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SendIcon from "@mui/icons-material/Send";
import PendingIcon from "@mui/icons-material/Pending";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import logo from "../../assets/kifayti_logo.png";

function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState([]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const theNavigate = useNavigate();
  const [otpSentTime, setOtpSentTime] = useState(0);
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  function validateUserData(userData) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      errors.push("Enter a valid email address");
    }
    return errors;
  }

  const sendOTP = async (email) => {
    setIsLoading(true);
    console.log("sendOTP called with email:", email);
    try {
      const response = await axiosInstance.post(`${server_url}/mail/sentotp`, {
        email,
      });
      console.log("OTP sent successfully:", response.data);
      // You can return the response data if needed
      return response.data;
    } catch (error) {
      console.error("Error sending OTP:", error.response.data);

      throw new Error("Failed to send OTP." + error.response.data); // Throw an error to handle it in the component
    } finally {
      setIsLoading(false);
      console.log("sendOTP loading ended");
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axiosInstance.post(
        `${server_url}/mail/verifyOtp`,
        { email, otp }
      );
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
            // const response = await getUserByEmail(email);
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

            // await toast(`Login Successful! Welcome ${localStorage.getItem("firstname")}`)
            console.log("my info:", userResponse.data.data);
            theNavigate("/");
          } else {
            setErrMsg("Invalid Otp...Please Try Again");
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

  React.useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - otpSentTime;
      const timeLeftInSeconds = Math.max(
        0,
        1 * 60 - Math.floor(elapsedTime / 1000)
      ); // Calculate remaining time in seconds
      setTimeLeft(timeLeftInSeconds);
      if (timeLeftInSeconds === 0) {
        setIsOtpSent(false);
        setOtp("");
        clearInterval(timer); // Stop the timer
      }
      if (timeLeftInSeconds === 1) {
        setErrMsg("Your OTP has expired. Please resend!");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSentTime]);

  const notify = () => toast("Your OTP has expired. Please resend!");
  return (
    <>
      {localStorage.getItem("token") ? (
        <Navigate to="/" replace />
      ) : (
        <div className="bg-gradient-to-r from-primary to-highlight h-screen md:px-[35vw] py-[15vh] br-2">
          <ToastContainer />
          {/* <button onClick={notify}>Notify!</button> */}
          <div className="bg-white p-10 max-h-max rounded-md">
            <div className="flex justify-center items-center">
              <img
                src={logo}
                className="w-[15vh] h-[15vh]"
                alt="Kifayti Health"
              />
            </div>

            <div className="w-full text-center font-semibold mt-6 text-lg text-gray-800">
              <span className="block">
                Welcome to <span className="font-bold">Kifayti Health</span>
              </span>
              <span className="block mt-2 text-sm text-gray-600">
                Please log in to access your doctor portal
              </span>
            </div>
            <div className="pt-6">
              <label className="block text-sm md:text-base font-semibold text-gray-600">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary bg-gray-200 focus:border-2 font-semibold text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isOtpSent && (
                <>
                  <label className="block text-sm md:text-base font-semibold text-gray-600 pt-4">
                    OTP <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary focus:border-2 bg-gray-200 font-semibold text-gray-800"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value;
                      const filteredValue = value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(filteredValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                  />
                </>
              )}

              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-highlight text-white m-0 py-2 rounded-md w-full mt-3 text-lg font-semibold"
              >
                {isLoading
                  ? "Sending OTP..."
                  : isOtpSent
                  ? "Verify OTP"
                  : "Send OTP"}
                {isLoading ? (
                  <PendingIcon className="ml-2" />
                ) : isOtpSent ? (
                  <LockOpenIcon className="ml-2" />
                ) : (
                  <SendIcon className="ml-2" />
                )}
              </button>
              {errMsg.length > 0 ? (
                <div className="mt-2 block">
                  <div className="text-[#ff0000] ml-2">{errMsg}</div>
                </div>
              ) : (
                <></>
              )}
              {isOtpSent && (
                <div className="text-center mt-4 text-gray-600">
                  Time left to verify OTP: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </div>
              )}
              {isOtpSent && (
                <p className="text-gray-600 text-sm mt-2">
                  Didn't receive the OTP? Please check your spam/junk folder.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorLogin;
