import React, { useEffect } from "react";
import "./sideBarDoctor.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link } from "react-router-dom";
import kifayti_logo from "../../assets/kifayti_logo.png";
// import AdminManagement from "../../assets/admin_management.png"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import HelpIcon from "@mui/icons-material/Help";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SwipeIcon from "@mui/icons-material/Swipe";
import LockResetIcon from "@mui/icons-material/LockReset";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { identifyRole } from "../../ApiCalls/authapis";

const  DoctorSidebar= () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dropdown, setDropdown] = React.useState(false);
  const [role, setRole] = React.useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await identifyRole();
        if (response.success) {
          setRole(response.data.data);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchData();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="logo-container flex items-center">
            <img
              src={kifayti_logo}
              alt="logo"
              className="rounded-sm w-10 h-10 mr-2"
            />
            <span className="logo text-lg">Kifayti Health</span>
          </div>
        </Link>
      </div>

      <hr />
      <div className="center">
        <ul>
          <Link to="/" style={{ textDecoration: "none" }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Admin DashBoard</span>
            </li>
          </Link>
          {role?.can_vud_ca || role?.can_vud_cd || role?.can_vud_mr ? (
            <li
              className="flex"
              onClick={() => {
                setDropdown(!dropdown);
              }}
            >
              <DashboardIcon className="icon" />
              <span className="w-full pr-10">Admin Management</span>
            </li>
          ) : null}
          {dropdown ? (
            <>
              {role?.can_vud_ca ? (
                <Link to="/create-admin" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <DashboardIcon className="icon" />
                    <span>Create Admin</span>
                  </li>
                </Link>
              ) : null}

              {role?.can_vud_cd ? (
                <Link to="/create-doctor" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <DashboardIcon className="icon" />
                    <span>Create Doctor</span>
                  </li>
                </Link>
              ) : null}
              {role?.can_vud_mr ? (
                <Link to="/manageRoles" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <DashboardIcon className="icon" />
                    <span>Manage Roles</span>
                  </li>
                </Link>
              ) : null}
            </>
          ) : (
            <></>
          )}

          {/* Other Sidebar Links */}
          {role?.can_vud_p ? (
            <Link to="/patient" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Patients</span>
              </li>
            </Link>
          ) : null}

          {role?.can_vud_am ? (
            <Link to="/alimentMaster" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Aliment Master</span>
              </li>
            </Link>
          ) : null}
          {role?.can_vud_pq ? (
            <Link to="/profileQuestions" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Profile Questions</span>
              </li>
            </Link>
          ) : null}
          {role?.can_vud_dr ? (
            <Link to="/dailyReadings" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Daily Readings</span>
              </li>
            </Link>
          ) : null}
          {role?.can_vud_dir ? (
            <Link to="/dialysisReadings" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Dialysis Readings</span>
              </li>
            </Link>
          ) : null}
          {role?.can_vud_ups ? (
            <Link to="/userProgramSelection" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>User Program Selection</span>
              </li>
            </Link>
          ) : null}
          {role?.can_vud_cp ? (
            <Link to="/changePassword" style={{ textDecoration: "none" }}>
              <li>
                <DashboardIcon className="icon" />
                <span>Change Password</span>
              </li>
            </Link>
          ) : null}
        </ul>
      </div>
      <div className="bottom"></div>
    </div>
  );
};

export default DoctorSidebar;
