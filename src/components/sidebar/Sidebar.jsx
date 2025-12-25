import React, { useEffect } from "react";
import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link } from "react-router-dom";
import kifayti_logo from "../../assets/kifayti_logo.png";
// import AdminManagement from "../../assets/admin_management.png"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import HelpIcon from "@mui/icons-material/Help";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SwipeIcon from "@mui/icons-material/Swipe";
import LockResetIcon from "@mui/icons-material/LockReset";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { LiaLanguageSolid } from "react-icons/lia";
import { useSelector } from "react-redux";

const Sidebar = ({ mobile = false }) => {
  const [dropdown, setDropdown] = React.useState(false);
  const role = useSelector((state) => state.permission);
  useEffect(() => {
    console.log("role", role);
    console.log("role.patients", role.patients);
  }, []);
  return (
    <div
      className={mobile ? "sidebar" : "sidebar hidden md:block min-h-[100vh]"}>
      {mobile ? null : (
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
      )}

      <hr />
      <div className="center">
        <ul>
         {(role?.role_name=="Admin" || role?.role_name=="PSadmin" || role?.role_name=="Doctor") ? ( <Link to="/" style={{ textDecoration: "none" }}>
            <li className="">
              <DashboardIcon className="icon" />
              <span className="">DashBoard</span>
            </li>
          </Link>) : null
         }

          {/* Admin Management Dropdown */}
          {role?.createAdmin || role?.createDoctor || role?.manageRoles ? (
            <li
              className="flex"
              onClick={() => {
                setDropdown(!dropdown);
              }}>
              <ManageAccountsIcon className="icon" />
              <span className="w-full pr-10">Admin Management</span>
            </li>
          ) : null}

          {dropdown ? (
            <>
              {role?.createAdmin ? (
                <Link to="/create-admin" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <SubdirectoryArrowRightIcon className="icon" />
                    <span>Create Admin</span>
                  </li>
                </Link>
              ) : null}

              {role?.createDoctor ? (
                <Link to="/create-doctor" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <SubdirectoryArrowRightIcon className="icon" />
                    <span>Create Doctor</span>
                  </li>
                </Link>
              ) : null}

              {role?.manageRoles ? (
                <Link to="/manageRoles" style={{ textDecoration: "none" }}>
                  <li className="ml-6">
                    <SubdirectoryArrowRightIcon className="icon" />
                    <span className="text-xl">Manage Roles</span>
                  </li>
                </Link>
              ) : null}
            </>
          ) : (
            <></>
          )}

          {/* Other Sidebar Links */}
          {role?.patients ? (
            <Link to="/patient" style={{ textDecoration: "none" }}>
              <li>
                <VaccinesIcon className="icon" />
                <span>Patients</span>
              </li>
            </Link>
          ) : null}
     
     
          {/* {(role?.doctorReports) ? (
            <Link to="/doctorReport" style={{ textDecoration: "none" }}>
              <li>
                <VaccinesIcon className="icon" />
                <span>Doctor Reports</span>
              </li>
            </Link>
          ) : null} */}

          {/* {(role?.role_name=="Admin" || role?.role_name=="PsAdmin" || role?.role_name=="Doctor") ? (
            <Link to="/kfre" style={{ textDecoration: "none" }}>
              <li>
                <PictureAsPdfIcon className="icon" />
                <span>BulkUploadPDF</span>
              </li>
              <li>
                <ArticleIcon className="icon" />
                <span>BulkUploadCSV</span>
              </li>
            </Link>
          ) : null} */}

          {/* {role?. patients ? (
            <Link to="/aiChat" style={{ textDecoration: "none" }}>
              <li>
                <VaccinesIcon className="icon" />
                <span>AI Chat</span>
              </li>
            </Link>
          ) : null} */}
          {role?.ailmentMaster ? (
            <Link to="/alimentMaster" style={{ textDecoration: "none" }}>
              <li>
                <CoronavirusIcon className="icon" />
                <span>Aliment Master</span>
              </li>
            </Link>
          ) : null}
          {role?.profileQuestions ? (
            <Link to="/profileQuestions" style={{ textDecoration: "none" }}>
              <li>
                <HelpIcon className="icon" />
                <span>Profile Questions</span>
              </li>
            </Link>
          ) : null}
          {role?.createAdmin ? (
            <Link to="/languageMaster" style={{ textDecoration: "none" }}>
              <li>
                <LiaLanguageSolid className="icon" />
                <span>Language Master</span>
              </li>
            </Link>
          ) : null}
          {role?.dailyReadings ? (
            <Link to="/dailyReadings" style={{ textDecoration: "none" }}>
              <li>
                <AutoStoriesIcon className="icon" />
                <span>Daily Readings</span>
              </li>
            </Link>
          ) : null}
          {role?.dialysisReadings ? (
            <Link to="/dialysisReadings" style={{ textDecoration: "none" }}>
              <li>
                <MonitorHeartIcon className="icon" />
                <span>Dialysis Readings</span>
              </li>
            </Link>
          ) : null}
          {role?.userProgramSelection ? (
            <Link to="/userProgramSelection" style={{ textDecoration: "none" }}>
              <li>
                <SwipeIcon className="icon" />
                <span>User Program Selection</span>
              </li>
            </Link>
          ) : null}
          {role?.feedback ? (
            <Link to="/contactuspage" style={{ textDecoration: "none" }}>
              <li>
                <LockResetIcon className="icon" />
                <span>Patient Feedback</span>
              </li>
            </Link>
          ) : null}
          {role?.changePassword ? (
            <Link to="/changePassword" style={{ textDecoration: "none" }}>
              <li>
                <LockResetIcon className="icon" />
                <span>Change Password</span>
              </li>
            </Link>
          ) : null}
          {role?.changePassword ? (
            <Link to="/logs" style={{ textDecoration: "none" }}>
              <li>
                <LockResetIcon className="icon" />
                <span>logs</span>
              </li>
            </Link>
          ) : null}
        </ul>
      </div>
      <div className="bottom"></div>
    </div>
  );
};

export default Sidebar;
