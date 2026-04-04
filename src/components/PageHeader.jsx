/**
 * Page Header Component
 * Breadcrumb and page title — supports desktop and mobile variants
 * 
 * @file src/components/PageHeader.jsx
 */

import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Text, Heading, Box, Flex, IconButton, Button } from '../component-library';
import { ROUTES } from '../routes/routeConstants';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MedicationIcon from '@mui/icons-material/Medication';
import QuizIcon from '@mui/icons-material/Quiz';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import TranslateIcon from '@mui/icons-material/Translate';
import { Assessment } from '@mui/icons-material';
import { hasAnyPermission, hasDashboardAccess } from '../helpers/permissions';
import * as assets from '../assets';
import kifayti_logo from '../assets/kifayti_logo.png';
import Account from '../assets/Account.svg';
import '../design-system/styles/index.css';
import onBackButton from '../assets/onBackButton.svg';
import { useIsMobile } from './mobile/useIsMobile';
import { Padding } from '@mui/icons-material';

export const PageHeader = ({
  breadcrumbs = [],
  title = 'Patient Name',
  onBack,
  variant = "onlyheader", // 'mobile' | undefined (auto-detects)
  rightAction, // optional right-side element for mobile header
}) => {

  const { isMobile: autoMobile } = useIsMobile();
  const isMobile = autoMobile;

  const role = useSelector((state) => state.permission);
  const user = useSelector((state) => state.auth?.user);
  const location = useLocation();
  const pathname = location?.pathname || '';
  const isDoctor = role?.role_name === 'Doctor';

  const navItems = React.useMemo(() => {
    const canOpenDashboard = hasDashboardAccess(role?.role_name);
    const items = [];
    if (canOpenDashboard) {
      items.push({ id: 'admin-dashboard', label: 'Admin Dashboard', mobileLabel: 'Dashboard', href: ROUTES.DASHBOARD, icon: DashboardIcon, showInMobileBar: true });
    }
    if (hasAnyPermission(role, 'patients')) {
      items.push({ id: 'patients', label: 'Patients', href: ROUTES.PATIENTS, icon: PeopleAltIcon, showInMobileBar: true });
    }
    if (hasAnyPermission(role, 'ailmentMaster')) {
      items.push({ id: 'ailment-master', label: 'Ailment Master', href: ROUTES.SETTINGS_AILMENTS, icon: MedicationIcon });
    }
    if (hasAnyPermission(role, 'profileQuestions')) {
      items.push({ id: 'profile-questions', label: 'Profile Questions', href: ROUTES.PROFILE_QUESTIONS, icon: QuizIcon });
    }
    if (hasAnyPermission(role, 'createAdmin')) {
      items.push({ id: 'language-master', label: 'Language Master', href: ROUTES.SETTINGS_LANGUAGE, icon: TranslateIcon });
    }
    if (hasAnyPermission(role, 'dailyReadings')) {
      items.push({ id: 'daily-readings', label: 'Daily Readings', href: ROUTES.READINGS_DAILY, icon: MonitorHeartIcon });
    }
    if (hasAnyPermission(role, 'dialysisReadings')) {
      items.push({ id: 'dialysis-readings', label: 'Dialysis Readings', href: ROUTES.READINGS_DIALYSIS, icon: BloodtypeIcon });
    }
    if (canOpenDashboard) {
      items.push({ id: 'kfre', label: 'KFRE', mobileLabel: 'KFRE', href: ROUTES.REPORTS_KFRE, icon: Assessment, showInMobileBar: true });
    }
    if (hasAnyPermission(role, 'userProgramSelection')) {
      items.push({ id: 'user-program', label: 'User Program', href: ROUTES.PROGRAMS, icon: AssignmentIndIcon });
    }
    if (hasAnyPermission(role, 'feedback')) {
      items.push({ id: 'patient-feedback', label: 'Patient Feedback', href: ROUTES.SUPPORT, icon: RateReviewIcon });
    }
    // items.push({ id: 'logs', label: 'Audit Logs', href: ROUTES.SETTINGS_LOGS, icon: HistoryIcon });
    return items;
  }, [role]);

  const getActiveIdFromPath = (path) => {
    if (!path) return null;
    if (path.toLowerCase().includes('/userprofile/')) return 'patients';
    const exact = navItems.find((it) => it.href === path);
    if (exact) return exact.id;
    const starts = navItems.find((it) => it.href && it.href !== '/' && path.startsWith(it.href));
    if (starts) return starts.id;
    return null;
  };

  const activeId = getActiveIdFromPath(pathname);

  // Render the "only header" variant by default when no variant is provided
  const renderOnlyHeaderDefault = variant === 'onlyheader';

  if (renderOnlyHeaderDefault) {
    // If doctor role, center logo and title and render top-tabs beneath
    if (isDoctor && !isMobile) {
      return (
        <Box className="w-full border-b-2 -mt-8 border-info bg-white relative">


          <div className="flex flex-col items-start justify-start py-4">
            {/* tabs */}
            <nav className="mt-3 flex gap-3 items-center">
              {navItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    end={item.href === '/'}
                    className={() => clsx(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150',
                      isActive ? 'bg-[#e6f7f4] text-[#004c6d]' : 'text-slate-600 hover:bg-gray-100'
                    )}
                  >
                    {item.icon && React.createElement(item.icon, { className: 'text-base' })}
                    <span>{item.mobileLabel ?? item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </Box>
      );
    }

    // default non-doctor header
    return (
      <Box
        className={`border-b-2 -mt-8  border-info ${isMobile ? 'pb-2' : 'pb-4'}`}
        style={{
          // borderColor: 'var(--color-info)',
          height: isMobile ? 'auto' : '100px',
          paddingBottom: isMobile ? '0.5rem' : '2rem',
          position: 'relative'
        }}
      >
        <Heading
          as="h1"
          size={isMobile ? 'none' : '2xl'}
          style={{
            ...(isMobile ? {} : {
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            color: 'var(--color-heading)',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 'bold',
            marginBottom: '35px',
          }}
        >
          {title}
        </Heading>
      </Box>
    );
  }

  // Normalize breadcrumbs: accept array of strings or objects { label, path, active, icon }
  const crumbs = Array.isArray(breadcrumbs)
    ? breadcrumbs.map((b) => (typeof b === 'string' ? { label: b } : b))
    : [{ label: String(breadcrumbs) }];

  // Mobile compact header
  if (isMobile) {
    return (
      <Box className="w-full px-0 ">
        <Flex align="center" justify="between" className="min-h-[44px]">
          <Flex align="center" gap={2}>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer"
                aria-label="Go back"
                style={{ transition: 'var(--transition-fast)' }}
              >
                <img src={onBackButton} alt="back" className="w-5 h-5" />
              </button>
            )}
            <div
              className="text-accent font-bold font-['Sora'] truncate"
              style={{ fontSize: 'var(--font-size-lg)' }}
            >
              {title}
            </div>
          </Flex>
          {rightAction && (
            <Flex align="center" gap={2}>
              {rightAction}
            </Flex>
          )}
        </Flex>
        {/* Compact breadcrumbs on mobile - single line */}
        {crumbs.length > 1 && (
          <Text size="xs" weight="normal" className="text-muted mt-1 truncate">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                {c.path && !c.active ? (
                  <Link to={c.path} className="text-muted hover:text-primary" style={{ textDecoration: 'none' }}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </Text>
        )}
      </Box>
    );
  }

  // Desktop header (original)
  return (
    <Box className="w-full -mt-3 px-0 py-4 noscrollbar">
      <Flex direction="rows" align="center" gap={6}>
        {onBack && (
          <img src={onBackButton} alt="back" onClick={onBack} className="w-6 h-6" />
        )}
        <Flex gap={4} direction="column" align="flex-start">
          <Text size="sm" weight="normal" className="text-muted">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2">/</span>}
                {c.icon && assets[c.icon] ? (
                  <img
                    src={assets[c.icon]}
                    alt="icon"
                    className="inline-block mr-2"
                    style={{ width: 14, height: 14 }}
                  />
                ) : null}
                {c.path && !c.active ? (
                  <Link
                    to={c.path}
                    className="text-muted hover:text-primary transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </Text>

          <div className="self-stretch justify-start text-accent text-2xl font-bold font-['Sora']">{title}</div>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PageHeader;