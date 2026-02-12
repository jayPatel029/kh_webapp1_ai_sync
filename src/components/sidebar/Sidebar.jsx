import React, { useEffect, useState } from "react";
// import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link } from "react-router-dom";
import kifayti_logo from "../../assets/kifayti_logo.png";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import HelpIcon from "@mui/icons-material/Help";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SwipeIcon from "@mui/icons-material/Swipe";
import LockResetIcon from "@mui/icons-material/LockReset";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { AdminPanelSettings } from "@mui/icons-material";
import { LiaLanguageSolid } from "react-icons/lia";
import { useSelector } from "react-redux";
import {
  Sidebar as DSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarItem,
  SidebarGroup,
} from "../../component-library/navigation/Sidebar";

const Sidebar = ({ mobile = false }) => {
  const [dropdown, setDropdown] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.isCollapsed !== undefined) setIsCollapsed(!!e.detail.isCollapsed);
    };
    const storageHandler = (ev) => {
      if (ev.key === 'sidebarCollapsed') {
        setIsCollapsed(ev.newValue === 'true');
      }
    };
    window.addEventListener('sidebar:toggle', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('sidebar:toggle', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  const role = useSelector((state) => state.permission);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    // minimal debug info
  }, [role]);

  const renderItem = (label, IconComp, href) => {
    const baseClass = isCollapsed && !mobile ? "flex items-center hover:bg-white/10 justify-center px-3 py-2" : "px-6 py-2";
    const iconContent = isCollapsed && !mobile ? (
      <div className="sidebar__icon  flex flex-col items-center gap-1">
        <IconComp className="text-white" />
        <span className="sidebar__label text-[9px] text-white text-center">{label}</span>
      </div>
    ) : (
      <IconComp className="text-white" />
    );

    return (
      <SidebarItem icon={iconContent} href={href} className={baseClass} >
        {/* main label for expanded state (kept for accessibility) */}
        {(!isCollapsed || mobile) ? label : ''}
      </SidebarItem>
    );
  };

  return (
    <DSidebar
      isMobile={mobile}
      isCollapsed={isCollapsed}
      className={`${isCollapsed ? "w-24" : "w-[250px]"} bg-[--color-primary-dark] text-white flex flex-col justify-between sticky top-0 h-screen`}
    >
      {/* Header / Logo area */}
      <SidebarHeader className={`px-4 py-5 ${isCollapsed && !mobile ? "flex justify-center" : ""}`}>
        <Link to="/" className={`flex items-center ${isCollapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <img src={kifayti_logo} alt="logo" className={`${mobile ? "w-8 h-8" : isCollapsed && !mobile ? "w-8 h-8" : "w-10 h-10"} object-cover`} />
          {!isCollapsed && <span className="font-semibold text-white">Kifayti Health</span>}
        </Link>
      </SidebarHeader>

      {/* Main content */}
      <SidebarContent className={`overflow-y-auto ${isCollapsed && !mobile ? 'flex flex-col items-center space-y-1' : ''}`}>
        {/* profile */}
        <div className={`${mobile ? "flex flex-col items-center py-4" : isCollapsed ? "flex flex-col items-center py-4" : "flex flex-col items-center py-8"}`}>
          <div className={`${mobile ? "w-10 h-10" : isCollapsed ? "w-10 h-10" : "w-16 h-16"} rounded-full bg-white/10 flex items-center justify-center mb-3`}>
            {/* fallback avatar */}
            <svg className="w-6 h-6 text-white opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
              <path d="M4 20c0-3.314 4.03-6 8-6s8 2.686 8 6v1H4v-1z" fill="currentColor" />
            </svg>
          </div>
          {!mobile && !isCollapsed && <div className="text-sm font-semibold">{user?.name || ''}</div>}
        </div>

        {/* links */}
        {(role?.role_name === "Admin" || role?.role_name === "PSadmin" || role?.role_name === "Doctor") && (
          renderItem(!mobile ? 'Admin Dashboard' : 'Dashboard', DashboardIcon, '/')
        )}

        {(role?.createAdmin || role?.createDoctor || role?.manageRoles) && (
          isCollapsed && !mobile ? (
            // collapsed: show group as single icon-only item
            <SidebarItem icon={<AdminPanelSettings className="text-white" />} href="#" title="Admin Management" className="flex justify-center px-3 py-3" />
          ) : (
            <SidebarGroup title="Admin Management" icon={<AdminPanelSettings className="text-white" />} className={isCollapsed && !mobile ? "px-3 py-3" : "px-6 py-3"} isCollapsible isOpen={dropdown} onToggle={() => setDropdown(!dropdown)}>
              {role?.createAdmin && (
                renderItem('Create Admin', SubdirectoryArrowRightIcon, '/create-admin')
              )}

              {role?.createDoctor && (
                renderItem('Create Doctor', SubdirectoryArrowRightIcon, '/create-doctor')
              )}

              {role?.manageRoles && (
                renderItem('Manage Roles', SubdirectoryArrowRightIcon, '/manageRoles')
              )}
            </SidebarGroup>
          )
        )}

        {role?.patients && (
          renderItem('Patients', VaccinesIcon, '/patient')
        )}

        {role?.ailmentMaster && (
          renderItem('Aliment Master', CoronavirusIcon, '/alimentMaster')
        )}

        {role?.profileQuestions && (
          renderItem('Profile Questions', HelpIcon, '/profileQuestions')
        )}

        {role?.createAdmin && (
          renderItem('Language Master', LiaLanguageSolid, '/languageMaster')
        )}

        {role?.dailyReadings && (
          renderItem('Daily Readings', AutoStoriesIcon, '/dailyReadings')
        )}

        {role?.dialysisReadings && (
          renderItem('Dialysis Readings', MonitorHeartIcon, '/dialysisReadings')
        )}

        {role?.userProgramSelection && (
          renderItem('User Program', SwipeIcon, '/userProgramSelection')
        )}

        {role?.feedback && (
          renderItem('Patient Feedback', LockResetIcon, '/contactuspage')
        )}

        {role?.changePassword && (
          <>
            {renderItem('Change Password', LockResetIcon, '/changePassword')}
            {renderItem('Logs', LockResetIcon, '/logs')}
          </>
        )}
      </SidebarContent>

      {/* bottom logout */}
      <div className={`${isCollapsed && !mobile ? "flex justify-center px-3 py-2" : "px-4 pb-6"}`}>
        <Link to="/logout" className={`flex items-center ${isCollapsed && !mobile ? "justify-center" : "gap-3 px-3"} py-2 rounded-md hover:bg-white/10`}>
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!mobile && !isCollapsed && <span className="text-white">Logout</span>}
        </Link>
      </div>
    </DSidebar>
  );
};

export default Sidebar;