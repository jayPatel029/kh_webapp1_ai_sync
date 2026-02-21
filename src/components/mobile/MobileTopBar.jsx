/**
 * MobileTopBar Component
 * Top navigation bar for mobile showing profile, Kifayti Health branding, and logout
 * Matches mockup: User icon (left) | Kifayti Health (center) | Logout icon (right)
 * 
 * @file src/components/mobile/MobileTopBar.jsx
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box } from '../../component-library/layout/Layout';
import { IconButton } from '../../component-library/primitives/Button';
import Account from '../../assets/Account.svg';
import { PowerSettingsNew } from '@mui/icons-material';
import kifayti_logo from '../../assets/kifayti_logo.png';

const MobileTopBar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstname");
    navigate("/doctorLogin");
  };

  return (
    <Box 
      className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
      style={{ height: '56px' }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left - Profile icon */}
        <IconButton
          onClick={() => navigate('/settings')}
          className="p-0"
          variant="ghost"
          aria-label="Profile"
        >
          <img
            src={user?.profilePicture || Account}
            alt="Profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e5e7eb'
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
              objectFit: 'contain'
            }}
          />
          <span 
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#004c6d',
              fontFamily: 'Sora, sans-serif',
              whiteSpace: 'nowrap'
            }}
          >
            Kifayti Health
          </span>
        </div>

        {/* Right - Logout icon */}
        <IconButton
          onClick={handleLogout}
          className="p-0"
          variant="ghost"
          aria-label="Logout"
        >
          <PowerSettingsNew 
            style={{
              fontSize: '24px',
              color: '#6b7280'
            }}
          />
        </IconButton>
      </div>
    </Box>
  );
};

export default MobileTopBar;
