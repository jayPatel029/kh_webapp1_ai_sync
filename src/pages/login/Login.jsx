import React, { useState } from "react";
import logo from "../../assets/kifayti_logo.png";
import { BsFillUnlockFill } from "react-icons/bs";
import { loginUser } from "../../ApiCalls/authapis";
import { Link, Navigate } from "react-router-dom";
import { getUserByEmail } from "../../ApiCalls/authapis";
import { useNavigate } from "react-router-dom";
import { identifyRole } from "../../ApiCalls/authapis";
import { useDispatch } from "react-redux";
import { setPermissions } from "../../redux/permissionSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState([]);
  const theNavigate = useNavigate();
  const dispatch = useDispatch();

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
    // console.log("in login")
    const errors = validateUserData({
      email: email,
      password: password,
    });

    if (errors.length === 0) {
      const payload = {
        email: email,
        password: password,
      };
      const response = await loginUser(payload);
      if (response.success) {
        setErrMsg([]);

        const userResponse = await getUserByEmail(email);
        console.log("user resp",userResponse.data)
        localStorage.setItem(
          "firstname",
          userResponse?.data?.data[0]?.firstname
        );
        localStorage.setItem("email", userResponse?.data?.data[0]?.email);
        localStorage.setItem("token", response?.data?.token);
        localStorage.setItem("role", userResponse?.data?.data[0]?.role);
        try {
          const role = await identifyRole();
          if (role.success) {
            dispatch(setPermissions(role.data.data));
          }
        } catch (error) {
          console.log("login error!!!!!!!!!!!!!!!!!!!!");
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
        <div className="bg-gradient-to-r from-primary to-highlight h-screen md:px-[35vw] py-[15vh]">
          <div className="bg-white  h-[70vh] p-10">
            <div className="flex justify-center items-center">
              <img
                src={logo}
                className="w-[15vh] h-[15vh]"
                alt="Kifayti Health"
              />
            </div>
            <div className="w-full text-center font-semibold mt-3 text-lg">
              Please Log in to Kifayti Health
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
              <label className="block text-sm md:text-base font-semibold text-gray-600 pt-4">
                Password *
              </label>
              <input
                type="password"
                className="w-full px-3 md:px-4 py-2 border rounded mt-2 focus:outline-none focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <div className="block text-sm md:text-base font-semibold text-primary text-right pt-4">
                <Link to="/forgotpassword">Forgot Password ? </Link>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-highlight text-white m-0 py-2 rounded-md w-full mt-3 text-lg">
                <BsFillUnlockFill className="inline-block h-3.5 w-5 mb-1" />
                Login
              </button>
              {errMsg.length > 0 ? (
                <div className="mt-2 block">
                  <div className="text-[#ff0000] ml-2">{errMsg[0]}</div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
