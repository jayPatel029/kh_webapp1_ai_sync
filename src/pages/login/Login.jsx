import React, { useState } from "react";
import logo from "../../assets/kifayti_logo.png";
import { BsFillUnlockFill } from "react-icons/bs";
import { loginUser, getUserByEmail, identifyRole } from "../../ApiCalls/authapis";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPermissions } from "../../redux/permissionSlice";
import { clearAllCaches } from "../../cache";
import { parseJwt } from "../../helpers/utils";

// Design primitives
import { Button } from "../../component-library/primitives/Button";
import Input from "../../component-library/primitives/Input";
import { Text, Heading, Label } from "../../component-library/primitives/Typography";
import { Card, CardHeader, CardBody } from "../../component-library/primitives/Card";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState([]);
  const theNavigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  function validateUserData(userData) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      errors.push("Enter a valid email address");
    }
    if (!userData.password.trim()) {
      errors.push("Password is required");
    }
    return errors;
  }

  const handleSubmit = async () => {
    const errors = validateUserData({
      email: email,
      password: password,
    });

    if (errors.length === 0) {
      const payload = {
        email: email,
        password: password,
      };
      setIsLoading(true);
      const response = await loginUser(payload);
      setIsLoading(false);
      if (response.success) {
        setErrMsg([]);
        clearAllCaches();

        const decoded = parseJwt(response?.data?.token);
        localStorage.setItem("firstname", decoded?.firstname || "");
        localStorage.setItem("email", decoded?.email || email);
        localStorage.setItem("token", response?.data?.token);
        localStorage.setItem("role", decoded?.role || "");
        try {
          const role = await identifyRole();
          if (role.success) {
            dispatch(setPermissions(role.data.data));
          }
        } catch (error) {
          console.error(error.message);
        }
        theNavigate("/");
      } else {
        setErrMsg(["Login Error: " + response.data.message]);
      }
    } else {
      setErrMsg(errors);
    }
  };

  return (
    <>
      {localStorage.getItem("token") ? (
        <Navigate to="/" replace />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-info px-4 py-8 sm:px-6 sm:py-12">
          <Card variant="elevated" className="max-w-md w-full rounded-2xl mx-auto">
              <CardHeader className="!border-none flex flex-col items-center gap-3 pt-6 sm:gap-4">
              <img src={logo} alt="Kifayti Health" className="w-12 h-12 sm:w-14 sm:h-14" />
              <div className="text-center">
                <Heading as="h2" className="text-center text-lg">
                  Welcome to <span className="font-bold">Kifayti Health</span>
                </Heading>
                <Text size="sm" color="muted" className="text-center mt-2">
                  Please log in to your doctors portal
                </Text>
              </div>
            </CardHeader>

            <CardBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="email" isRequired>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outline"
                    size="md"
                    aria-invalid={errMsg.length > 0}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password" isRequired>
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outline"
                    size="md"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgotpassword"
                    className="text-sm font-semibold text-primary hover:text-primary-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {errMsg.length > 0 && (
                  <div className="bg-danger/10 border border-danger text-danger text-sm font-medium px-4 py-3 rounded-lg">
                    {errMsg[0]}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={isLoading}
                  isFullWidth
                  className="mt-6 py-3 rounded-md"
                >
                  <span className="inline-flex items-center gap-2">
                    <BsFillUnlockFill className="w-4 h-4" />
                    Login
                  </span>
                </Button>

                <div className="mt-4 text-center">
                  {/* <Link to="/doctorLogin" className="text-sm text-primary hover:underline">
                    Resend OTP
                  </Link> */}
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

export default Login;
