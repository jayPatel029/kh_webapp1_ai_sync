/**
 * MobileTopBar Component
 * Top navigation bar for mobile showing menu, Kifayti Health branding, profile and logout
 * Menu opens the full sidebar drawer (User Management and other destinations).
 *
 * @file src/components/mobile/MobileTopBar.jsx
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box } from '../../component-library/layout/Layout';
import { IconButton } from '../../component-library/primitives/Button';
import { Menu as MenuIcon, PowerSettingsNew } from '@mui/icons-material';
import Account from '../../assets/Account.svg';
import kifayti_logo from '../../assets/kifayti_logo.png';
import { clearAllCaches } from '../../cache';
import { clearAuthSession } from '../../helpers/authSession';
import { clearPermissions } from '../../redux/permissionSlice';
import { isRole } from '../../helpers/roleUtils';
import { ROUTES } from '../../routes/routeConstants';

const MobileTopBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roleName = useSelector((state) => state.permission?.role_name);
  const user = useSelector((state) => state.auth?.user);

  const handleLogout = () => {
    const goDoctorLogin = isRole(roleName, 'Doctor');
    clearAllCaches();
    clearAuthSession();
    dispatch(clearPermissions());
    navigate(goDoctorLogin ? ROUTES.DOCTOR_LOGIN : ROUTES.LOGIN);
  };

  return (
    <Box
      className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
      style={{ height: '56px' }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left - Menu opens full sidebar drawer */}
        <IconButton
          onClick={onMenuClick}
          className="p-0"
          variant="ghost"
          aria-label="Open menu"
        >
          <MenuIcon
            style={{
              fontSize: '28px',
              color: '#004c6d',
            }}
          />
        </IconButton>

        {/* Center - Kifayti Health branding */}
        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <img
            src={kifayti_logo}
            alt="Kifayti logo"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#004c6d',
              fontFamily: 'Sora, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Kifayti Health
          </span>
        </div>

        {/* Right - Profile (settings) and logout */}
        <div className="flex items-center gap-2">
          <IconButton
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="p-0"
            variant="ghost"
            aria-label="Profile"
          >
            <img
              src={user?.profilePicture || Account}
              alt="Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e5e7eb',
              }}
            />
          </IconButton>
          <IconButton
            onClick={handleLogout}
            className="p-0"
            variant="ghost"
            aria-label="Logout"
          >
            <PowerSettingsNew
              style={{
                fontSize: '24px',
                color: '#6b7280',
              }}
            />
          </IconButton>
        </div>
      </div>
    </Box>
  );
};

export default MobileTopBar;
