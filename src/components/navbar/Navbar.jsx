import { useEffect, useState } from "react";
import "./navbar.scss";
import { BsPower } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { TiThMenu } from "react-icons/ti";
import kifayti_logo from "../../assets/kifayti_logo.png";
import dummyadmin from "../../assets/dummyadmin.png";

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
        <div className="navbar items-center justify-between pr-6 pl-6 bg-white">
          <div className="flex items-center gap-4">
            <TiThMenu className="text-primary text-2xl cursor-pointer" onClick={() => { /* reserved for desktop menu toggle */ }} />
            <Link to="/" className="flex items-center gap-2">
              <img src={kifayti_logo} alt="Logo" className="h-8 w-auto" />
              <span className="text-base font-semibold text-slate-700">Kifayti</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-base text-slate-800">{uname || 'User'}</span>
            <img
              src={dummyadmin}
              alt="profile"
              className="h-9 w-9 rounded-full cursor-pointer border border-slate-100"
              onClick={logout}
            />
          </div>
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
            <img
              src={dummyadmin}
              alt="profile"
              className="h-9 w-9 rounded-full cursor-pointer inline-block border border-slate-100"
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
