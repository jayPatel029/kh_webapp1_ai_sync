import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Link, NavLink } from "react-router-dom";
import kifayti_logo from "../../assets/kifayti_logo.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MedicationIcon from "@mui/icons-material/Medication";
import QuizIcon from "@mui/icons-material/Quiz";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockResetIcon from "@mui/icons-material/LockReset";
import RateReviewIcon from "@mui/icons-material/RateReview";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { AdminPanelSettings, ArrowBack, Assessment } from "@mui/icons-material";
import TranslateIcon from "@mui/icons-material/Translate";
import { useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';
import { Sidebar as DSidebar, SidebarHeader } from "../../component-library/navigation/Sidebar";
import Account from "../../assets/Account.svg";
import { ROUTES } from "../../routes/routeConstants";
import { IconButton } from "../../component-library";
import { hasAnyPermission, hasDashboardAccess } from "../../helpers/permissions";

const Sidebar = ({ mobile = false }) => {
  const [dropdown, setDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  // toggle sidebar collapsed state and notify other components
  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('sidebarCollapsed', next ? 'true' : 'false');
    } catch (e) { }
    // dispatch custom event so Sidebar can listen
    window.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { isCollapsed: next } }));
  };

  const isIconOnly = isCollapsed && !mobile;

  const role = useSelector((state) => state.permission);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.isCollapsed !== undefined) {
        setIsCollapsed(!!e.detail.isCollapsed);
      }
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

  useEffect(() => {
    if (isCollapsed) {
      setDropdown(false);
    }
  }, [isCollapsed]);

  const navItems = useMemo(() => {
    const canOpenDashboard = hasDashboardAccess(role?.role_name);
    const items = [];

    if (canOpenDashboard) {
      items.push({
        id: 'admin-dashboard',
        label: 'Admin Dashboard',
        mobileLabel: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: DashboardIcon,
        showInMobileBar: true,
      });
    }

    if (hasAnyPermission(role, "patients")) {
      items.push({
        id: 'patients',
        label: 'Patients',
        href: ROUTES.PATIENTS,
        icon: PeopleAltIcon,
        showInMobileBar: true,
      });
    }

    if (hasAnyPermission(role, "ailmentMaster")) {
      items.push({
        id: 'ailment-master',
        label: 'Aliment Master',
        href: ROUTES.SETTINGS_AILMENTS,
        icon: MedicationIcon,
      });
    }

    if (hasAnyPermission(role, "profileQuestions")) {
      items.push({
        id: 'profile-questions',
        label: 'Profile Questions',
        href: ROUTES.PROFILE_QUESTIONS,
        icon: QuizIcon,
      });
    }

    if (hasAnyPermission(role, "createAdmin")) {
      items.push({
        id: 'language-master',
        label: 'Language Master',
        href: ROUTES.SETTINGS_LANGUAGE,
        icon: TranslateIcon,
      });
    }

    if (hasAnyPermission(role, "dailyReadings")) {
      items.push({
        id: 'daily-readings',
        label: 'Daily Readings',
        href: ROUTES.READINGS_DAILY,
        icon: MonitorHeartIcon,
        // showInMobileBar: true,
      });
    }

    if (hasAnyPermission(role, "dialysisReadings")) {
      items.push({
        id: 'dialysis-readings',
        label: 'Dialysis Readings',
        href: ROUTES.READINGS_DIALYSIS,
        icon: BloodtypeIcon,
      });
    }

    // Add KFRE to navigation for dashboard access users
    if (canOpenDashboard) {
      items.push({
        id: 'kfre',
        label: 'KFRE',
        mobileLabel: 'KFRE',
        href: ROUTES.REPORTS_KFRE,
        icon: Assessment,
        showInMobileBar: true,
      });
    }

    if (hasAnyPermission(role, "userProgramSelection")) {
      items.push({
        id: 'user-program',
        label: 'User Program',
        href: ROUTES.PROGRAMS,
        icon: AssignmentIndIcon,
      });
    }

    if (hasAnyPermission(role, "feedback")) {
      items.push({
        id: 'patient-feedback',
        label: 'Patient Feedback',
        href: ROUTES.SUPPORT,
        icon: RateReviewIcon,
      });
    }

    // if (role?.changePassword) {
    //   items.push({
    //     id: 'change-password',
    //     label: 'Change Password',
    //     href: ROUTES.SETTINGS_PASSWORD,
    //     icon: LockResetIcon,
    //   });
    // }
    items.push({
      id: 'logs',
      label: 'Audit Logs',
      href: ROUTES.SETTINGS_LOGS,
      icon: HistoryIcon,
    });

    return items;
  }, [role]);

  const mobileNavItems = useMemo(() => {
    const filtered = navItems.filter((item) => item.showInMobileBar);
    if (filtered.length) {
      return filtered;
    }
    return navItems.slice(0, 3);
  }, [navItems]);

  const location = useLocation();
  const pathname = location?.pathname || '';


  const getActiveIdFromPath = (path) => {
    if (!path) return null;
    // special mapping: userprofile should activate patients
    if (path.toLowerCase().includes('/userprofile/')) return 'patients';
    // exact match
    const exact = navItems.find((it) => it.href === path);
    if (exact) return exact.id;
    // startsWith match for nested routes (avoid matching root '/').
    const starts = navItems.find((it) => it.href && it.href !== '/' && path.startsWith(it.href));
    if (starts) return starts.id;
    return null;
  };

  const activeId = getActiveIdFromPath(pathname);

  const adminGroupVisible = !!(
    hasAnyPermission(role, "createAdmin") ||
    hasAnyPermission(role, "createDoctor") ||
    hasAnyPermission(role, "manageRoles")
  );

  const renderDesktopNavItem = (item) => {
    const Icon = item.icon;
    return (
      <li key={item.id}>
        <NavLink
          to={item.href}
          end={item.href === '/'}
          className={() => {
            const isIconOnly = isCollapsed && !mobile;
            const isActive = activeId === item.id;
            return clsx(
              'transition-colors duration-150',
              isIconOnly
                ? 'flex flex-col items-center justify-center rounded-none  w-fit px-2 py-2 hover:bg-white/8 space-y-1'
                : 'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold',
              isActive ? (isIconOnly ? 'bg-white/20 w-full ' : 'bg-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.35)]') : 'text-white/90 hover:bg-white/10',
              'text-white'
            );
          }}
        >
          <Icon className={clsx('text-white', isCollapsed && !mobile ? 'text-2xl' : 'text-2xl')} />
          {/* show small label under icon in collapsed mode, normal label in expanded */}
          {isIconOnly ? (
            <span className="text-[8px] text-white text-center ">{item.label}</span>
          ) : (
            !isCollapsed && !mobile && <span className="text-sm">{item.label}</span>
          )}
        </NavLink>
      </li>
    );
  };

  const renderAdminChild = (label, IconComp, href) => (
    <NavLink
      key={href}
      to={href}
      className={() => clsx(
        'flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition-colors duration-200',
        (pathname === href || (href && pathname.startsWith(href))) ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
      )}
    >
      <IconComp className="text-base text-white" />
      <span>{label}</span>
    </NavLink>
  );

  const renderAdminGroup = () => {
    if (!adminGroupVisible) return null;

    const shouldShowChildren = dropdown && !isCollapsed;

    return (
      <li key="admin-management" className={isIconOnly ? 'w-full flex justify-center' : ''}>
        <button
          type="button"
          aria-expanded={dropdown}
          onClick={() => {
            if (isIconOnly) {
              toggleCollapse();
              setDropdown((prev) => !prev)
              return;
            }
            setDropdown((prev) => !prev)
          }}
          className={clsx(
            'text-white transition-colors duration-200',
            isIconOnly
              ? clsx(
                'flex flex-col items-center justify-center px-2 py-2.5 rounded-lg',
                pathname.toLowerCase().includes('/users/') ? 'bg-white/10 text-white' : 'text-white hover:text-white hover:bg-white/10'
              )
              : 'w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold justify-between rounded-2xl'
          )}
        >
          <AdminPanelSettings className="text-2xl text-white" />
          {!isIconOnly && (
            <>
              <span className="text-sm font-semibold break-words">User Management</span>
              <span className={clsx('text-lg transition-transform duration-200', dropdown ? 'rotate-180' : 'rotate-0')}>
                ▾
              </span>
            </>
          )}
          {isIconOnly && (<span className="text-[8px] font-semibold break-words">Users</span>
          )}
        </button>
        {shouldShowChildren && (
          <div className="mt-2 flex flex-col gap-1 pl-4">
            {hasAnyPermission(role, "createAdmin") && renderAdminChild('Create Admin', SubdirectoryArrowRightIcon, ROUTES.USERS_ADMINS)}
            {hasAnyPermission(role, "createDoctor") && renderAdminChild('Create Doctor', SubdirectoryArrowRightIcon, ROUTES.USERS_DOCTORS)}
            {hasAnyPermission(role, "manageRoles") && renderAdminChild('Manage Roles', SubdirectoryArrowRightIcon, ROUTES.USERS_ROLES)}
          </div>
        )}
      </li>
    );
  };

  const desktopSidebarClasses = clsx(
    'flex flex-col justify-between text-white transition-all duration-300 shadow-2xl !z-[200]',
    isCollapsed && !mobile ? 'w-20 px-0.5' : 'w-[250px] px-3',
    'bg-primaryDark min-h-screen'
  );

  const renderDesktop = () => (
    <DSidebar
      isCollapsed={isCollapsed}
      className={desktopSidebarClasses}
    >
      <div className="flex flex-col  gap-4">
        {!isCollapsed && !mobile && (
          <IconButton variant="outline" size="sm" icon={<ArrowBack className="fill-white hover:fill-primaryDark" style={{ fill: "white" }} />} onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hover:bg-primaryDark !hover:float-none  border-white  absolute right-0 mt-2  mr-2 " />
        )}
        <SidebarHeader className={clsx('pt-3', isCollapsed && !mobile ? 'flex justify-center' : 'flex items-center gap-3')}>
          <Link to={ROUTES.DASHBOARD} className={clsx('flex items-center transition-all', isCollapsed && !mobile ? 'justify-center' : 'gap-3')}>

            {/* <img
              src={kifayti_logo}
              alt="Kifayti logo"
              className={clsx(
                'object-cover transition-all rounded',
                isCollapsed && !mobile ? 'w-10 h-10' : 'w-12 h-12'
              )}
            />
            {!isCollapsed && !mobile && <span className="text-lg font-semibold">Kifayti Health</span>} */}
          </Link>




        </SidebarHeader>

        <div className={clsx('flex flex-col', isCollapsed && !mobile ? 'gap-2' : 'gap-4')}>
          <div
            className={clsx(
              'rounded-2xl flex flex-cols items-center transition-all',
              isCollapsed && !mobile
                ? 'flex-col gap-1 px-1 py-1 justify-center'
                : 'flex-col gap-4 px-3'
            )}
          >
            {/* <div className={clsx(
              'rounded-full bg-transparent flex  items-center justify-center flex-shrink-0 transition-all ',
              isCollapsed && !mobile ? 'w-12 h-12' : 'w-14 h-14'
            )}>
              <img
                width={isCollapsed && !mobile ? 36 : 56}
                height={isCollapsed && !mobile ? 36 : 56}
                src={user?.profilePicture || Account}
                alt="User Profile" />
            </div> */}
            {/* {!isCollapsed && !mobile && (
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-sm font-semibold truncate text-white">{user?.name || 'User'}</span>
              </div>
            )} */}
            {/* {isCollapsed && !mobile && (
              <div className="mt-1">
                <span className="text-[11px] text-white text-center block">{user?.name || 'User'}</span>
              </div>
            )} */}

              <img src={kifayti_logo} alt="kifayti health" className={clsx(
                'object-cover transition-all rounded',
                isCollapsed && !mobile ? 'w-10 h-10' : 'w-16 h-16'
              )} />
          </div>

          <nav aria-label="Primary" className="flex-1">
            <ul className={clsx(isCollapsed && !mobile ? 'space-y-1 flex flex-col items-center' : 'space-y-2')}>
              {
                // ensure Admin Management appears immediately after Admin Dashboard
                (() => {
                  const nodes = [];
                  let inserted = false;
                  navItems.forEach((it) => {
                    nodes.push(renderDesktopNavItem(it));
                    if (it.id === 'admin-dashboard') {
                      nodes.push(renderAdminGroup());
                      inserted = true;
                    }
                  });

                  if (!inserted && adminGroupVisible) {
                    nodes.unshift(renderAdminGroup());
                  }

                  return nodes;
                })()
              }
            </ul>
          </nav>
        </div>
      </div>

      {/* <div className={clsx('pb-4 flex justify-center mx-0 w-full transition-all', isCollapsed && !mobile ? 'px-0.5' : '')}>
        <Link
          to="/logout"
          className={clsx(
            'flex items-center rounded-xl text-white transition-colors duration-200',
            isCollapsed && !mobile ? 'justify-center px-2 py-2.5 hover:bg-white/10' : 'gap-3 px-3 py-3 rounded-2xl hover:bg-white/10 w-full',
          )}
        >
          <LogoutIcon className={clsx('text-white', isCollapsed && !mobile ? 'text-2xl' : 'text-2xl')} />
          {!isCollapsed && !mobile && <span className="font-semibold">Logout</span>}
        </Link>
      </div> */}
    </DSidebar>
  );

  const renderMobile = () => {
    if (!mobileNavItems.length) {
      return null;
    }
    return (
      <DSidebar
        isMobile
        className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-gray-200 bg-white px-0 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.18)]"
      >
        <nav aria-label="Mobile navigation" className="flex w-full items-center justify-around gap-0">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <NavLink
                key={item.id}
                to={item.href}
                end={item.href === '/'}
                className={() => clsx(
                  'flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200',
                  'w-[calc(100%/3)] justify-center',
                  isActive ? 'text-[#004c6d]' : 'text-slate-500'
                )}
              >
                <>
                  <Icon className={clsx('text-2xl', isActive ? 'text-[#004c6d]' : 'text-slate-500')} />
                  <span>{item.mobileLabel ?? item.label}</span>
                </>
              </NavLink>
            );
          })}
        </nav>
      </DSidebar>
    );
  };

  // keep original behavior: mobile -> mobile nav, otherwise desktop sidebar
  return mobile ? renderMobile() : renderDesktop();
};

export default Sidebar;