import React, { useEffect, useState } from "react";
import { BsFillUnlockFill } from "react-icons/bs";
import {
  getUserByEmailDoctor,
  identifyRole,
  loginUser,
} from "../../ApiCalls/authapis";
import { Navigate, useNavigate } from "react-router-dom";
import { getUserByEmail } from "../../ApiCalls/authapis";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useDispatch } from "react-redux";
import { setPermissions } from "../../redux/permissionSlice";
import { server_url } from "../../constants/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SendIcon from "@mui/icons-material/Send";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import logo from "../../assets/kifayti_logo.png";

// Design primitives
import { Button } from "../../component-library/primitives/Button";
import Input from "../../component-library/primitives/Input";
import { Text, Heading, Label } from "../../component-library/primitives/Typography";
import { Card, CardHeader, CardBody,Flex } from "../../component-library";

function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
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
    try {
      const response = await axiosInstance.post(`${server_url}/mail/sentotp`, {
        email,
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending OTP:", error?.response?.data || error.message);
      throw new Error("Failed to send OTP.");
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axiosInstance.post(`${server_url}/mail/verifyOtp`, { email, otp });
      return response.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw new Error("Failed to verify OTP. Please try again later.");
    }
  };

  const handleSubmit = async () => {
    const error = validateUserData({ email });

    if (error.length === 0) {
      try {
        if (!isOtpSent) {
          await sendOTP(email);
          setIsOtpSent(true);
          setOtpSentTime(new Date().getTime());
          setErrMsg("");
          toast.success("OTP sent to your email");
        } else {
          const res = await verifyOTP(email, otp);
          if (res.status === "true") {
            setErrMsg("");
            const userResponse = await getUserByEmail(email);
            localStorage.setItem("firstname", userResponse.data.data[0].firstname);
            localStorage.setItem("email", userResponse.data.data[0].email);
            localStorage.setItem("token", res.token);

            try {
              const role = await identifyRole();
              if (role.success) {
                dispatch(setPermissions(role.data.data));
              }
            } catch (err) {
              console.error(err.message);
            }

            theNavigate("/");
          } else {
            setErrMsg("Invalid OTP. Please try again.");
          }
        }
      } catch (error) {
        setErrMsg("Error: " + error.message);
      }
    } else {
      setErrMsg(error.join ? error.join(" ") : error);
    }
  };

  useEffect(() => {
    if (!otpSentTime) return;

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = Math.floor((currentTime - otpSentTime) / 1000);
      const totalSeconds = 60; // 60 seconds validity
      const remaining = Math.max(0, totalSeconds - elapsedTime);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsOtpSent(false);
        setOtp("");
        setErrMsg("Your OTP has expired. Please resend.");
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [otpSentTime]);

  const handleResend = async () => {
    try {
      await sendOTP(email);
      setOtpSentTime(new Date().getTime());
      setErrMsg("");
      toast.info("OTP resent");
    } catch (error) {
      setErrMsg("Failed to resend OTP.");
    }
  };

  const formatTime = (s) => {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <>
      {localStorage.getItem("token") ? (
        <Navigate to="/" replace />
      ) : (
          <div className="min-h-screen flex items-center justify-center bg-info px-6 py-12">
          <ToastContainer />

          <Card variant="elevated" className="max-w-lg w-full rounded-2xl">
            <Flex className="flex flex-col items-center gap-4 pt-6">
              <img src={logo} alt="Kifayti Health" className="w-14 mx-auto h-14" />
              <div className="text-center">
                <Heading as="h1" className="text-center text-lg">
                  Welcome to <span className="font-bold">Kifayti Health</span>
                </Heading>
                <Text size="sm" color="muted" className="text-center mt-2">
                  Please log in to your doctors portal
                </Text>
              </div>
            </Flex>

            <CardBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-5"
              >
                <div>
                  {/* <Label htmlFor="email" isRequired>
                    Email Address
                  </Label> */}
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outline"
                    size="md"
                    aria-invalid={!!errMsg}
                      // className="mt-2 border-1 border-primary-dark rounded-md p-2"
                  />
                </div>

                {isOtpSent && (
                  <div>
                    <Label htmlFor="otp" isRequired>
                      OTP
                    </Label>
                    <Input
                      id="otp"
                      name="otp"
                      inputMode="numeric"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      variant="outline"
                      size="md"
                      maxLength={6}
                      aria-describedby="otp-help"
                      className="mt-2"
                    />

                    <div
                      id="otp-help"
                      className="mt-4 flex items-center justify-between text-sm"
                    >
                      <span className="text-muted">
                        Time left:{" "}
                        <strong className="font-semibold text-primary">
                          {formatTime(timeLeft)}
                        </strong>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        isDisabled={timeLeft > 0}
                        onClick={handleResend}
                      >
                        Resend
                      </Button>
                    </div>
                  </div>
                )}

                {errMsg && (
                  <div className="bg-danger/10 border border-danger text-danger text-sm font-medium px-4 py-3 rounded-lg">
                    {errMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={isLoading}
                  isFullWidth
                  className="mt-6 py-3 rounded-md "
                >
                  {isOtpSent ? (
                    <span className="inline-flex items-center gap-2">
                      Verify OTP <LockOpenIcon className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Send OTP <SendIcon className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="mt-3 text-center">
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={!isOtpSent}
                      className="text-sm text-primaryDark hover:underline disabled:text-muted"
                      variant="link"

                  >
                    Resend OTP
                  </Button>
                </div>

                <div className="mt-4 text-center text-xs text-muted">
                  Didn't receive the OTP? Check your spam/junk folder.
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

export default DoctorLogin;
