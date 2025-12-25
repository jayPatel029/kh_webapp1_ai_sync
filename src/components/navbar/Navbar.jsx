import { useEffect, useState } from "react";
import "./navbar.scss";
import { BsPower } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { TiThMenu } from "react-icons/ti";
import kifayti_logo from "../../assets/kifayti_logo.png";

const Navbar = () => {
  const [uname, setUname] = useState("");
  const [dropdownVisible, setDDVisible] = useState(false);
  const theNavigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstname");
    theNavigate("/doctorLogin");
  };
  useEffect(() => {
    const u = localStorage.getItem("firstname");
    setUname(u);
  }, []);



  return (
    <>
      <div className="hidden md:block">
        <div className="navbar items-center justify-end pr-10 bg-white">
          <span className="text-xl">{uname}</span>
          <BsPower
            className="text-red-900 ml-5 text-2xl font-extrabold cursor-pointer"
            onClick={logout}
          />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="navbar items-center justify-end pr-10 bg-white">
          <div className="items-center justify-start px-3 flex text-xl w-[50%]">
            <TiThMenu
              className="text-primary ml-2 text-4xl font-extrabold cursor-pointer inline-block"
              onClick={() => { setDDVisible(!dropdownVisible); }}
            />
          </div>
          
          <Link to="/">
            <img
              src={kifayti_logo}
              alt="Logo"
              className="h-12 w-auto ml-3 cursor-pointer"
            />
          </Link>
          


          <div className="items-center justify-end flex text-xl w-[50%]">
            <BsPower
              className="text-red-900 ml-5 text-2xl font-extrabold cursor-pointer inline-block"
              onClick={logout}
            />
          </div>
        </div>
        <div className={dropdownVisible ? "block" : "hidden"}>
          <Sidebar mobile />
        </div>
      </div>
    </>
  );
};

export default Navbar;
