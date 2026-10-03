/**
 * Patient Navigation Tabs Component
 * Tab navigation for different patient sections
 * 
 * @file src/components/PatientNavTabs.jsx
 */

import React, { startTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Flex, Box, Badge } from '../component-library';
import '../design-system/styles/index.css';
import alarmIcon from '../assets/alarm.svg';
import dietIcon from '../assets/Healthy_Eating.svg';
import chatIcon from '../assets/Chat.svg';
import labIcon from '../assets/lab_Report.svg';
import prescIcon from '../assets/prescription.svg';
import reqIcon from '../assets/Requsition_report.svg';
import manageIcon from '../assets/admin_management.png';
import { ROUTES } from '../routes/routeConstants';
import { useIsMobile } from './mobile/useIsMobile';
import { isRole } from '../helpers/roleUtils';

export const PatientNavTabs = ({
  patientId,
  userData,
  unreadAdminCount = 0,
  unreadDoctorCount = 0,
  role,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useIsMobile();

  const tabs = [
    { id: 'alarms', label: 'Alarms', path: ROUTES.patientAlarms(patientId), visible: !isRole(role, 'Dialysis Technician') },
    { id: 'diet', label: 'Diet details', path: ROUTES.patientDiet(patientId), state: userData, visible: !isRole(role, 'Dialysis Technician') },
    { id: 'adminChat', label: 'Admin Chat', path: ROUTES.patientAdminChat(patientId), unread: unreadAdminCount, visible: !isRole(role, ['Dialysis Technician', 'Medical Staff']) },
    { id: 'doctorChat', label: 'Doctor Chat', path: ROUTES.patientDoctorChat(patientId), unread: unreadDoctorCount, visible: !isRole(role, ['Medical Staff', 'Dialysis Technician']) },
    { id: 'labs', label: 'Lab reports', path: ROUTES.patientLabs(patientId), state: userData, visible: true },
    { id: 'prescriptions', label: 'Prescriptions', path: ROUTES.patientPrescriptions(patientId), state: userData, visible: true },
    { id: 'requisition', label: 'Requisition reports', path: ROUTES.patientRequisitions(patientId), state: userData, visible: true },
    { id: 'manage', label: 'Manage Parameters', path: ROUTES.patientParameters(patientId), state: userData, visible: isRole(role, 'Admin') },
  ];

  const icons = {
    adminChat: manageIcon,
    doctorChat: chatIcon,
    prescriptions: prescIcon,
    labs: labIcon,
    diet: dietIcon,
    requisition: reqIcon,
    alarms: alarmIcon,
    manage: manageIcon,
    kfre: manageIcon,
  };

  const isActive = (path) => `${location.pathname}${location.search}` === path;

  // Mobile compact tabs - icon-only with label below, small pills
  if (isMobile) {
    return (
      <Flex
        gap={2}
        align="center"
        justify="start"
        className="patient-nav-tabs noscrollbar px-2 py-2 overflow-x-auto bg-white"
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-label="Patient Navigation Tabs"
      >
        {tabs.filter(tab => tab.visible).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              startTransition(() => {
                navigate(tab.path, { state: tab.state });
              });
            }}
            className="flex flex-col items-center gap-1 shrink-0 border-none bg-transparent cursor-pointer relative"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md, 8px)',
              background: isActive(tab.path) ? 'var(--color-accent, #5886a5)' : 'transparent',
              transition: 'var(--transition-fast)',
              minWidth: '56px',
            }}
            aria-label={tab.label}
          >
            <img
              src={icons[tab.id]}
              alt={tab.label}
              style={{
                width: 20,
                height: 20,
                filter: isActive(tab.path)
                  ? 'brightness(0) invert(1)'
                  : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(173deg) brightness(95%) contrast(87%)',
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontFamily: "var(--font-family-primary, 'Sora', sans-serif)",
                fontWeight: isActive(tab.path) ? 600 : 400,
                color: isActive(tab.path) ? '#fff' : 'var(--color-text-muted, #6b7280)',
                whiteSpace: 'nowrap',
                maxWidth: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tab.label}
            </span>
            {tab.unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--color-danger, #dc2626)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tab.unread}
              </span>
            )}
          </button>
        ))}
      </Flex>
    );
  }

  // Desktop tabs (original)
  return (
    <Flex
      gap={3}
      align="center"
      justify="start"
      className="patient-nav-tabs noscrollbar py-4 overflow-x-auto bg-white justify-between sticky top-0"
      aria-label="Patient Navigation Tabs"
    >
      {tabs.filter(tab => tab.visible).map((tab) => (
        <Button
          key={tab.id}
          variant={isActive(tab.path) ? 'secondary' : 'outline'}
          onClick={() => {
            startTransition(() => {
              navigate(tab.path, { state: tab.state });
            });
          }}
          className=" h-10 px-4  py-4 rounded-md flex items-center gap-3 shrink-0 bg-white border-2 border-textLight transition-colors"
          aria-label={tab.label}
        >
          <Flex align="center" gap={2} className="w-full justify-start ">
            <Box className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
              <img
                src={icons[tab.id]}
                alt={tab.label}
                style={{
                  width: 24,
                  height: 24,
                  filter: isActive(tab.path)
                    ? 'brightness(0) invert(1)' // White
                    : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(173deg) brightness(95%) contrast(87%)' // Muted
                }}
              />
            </Box>
            <span className={`truncate text-md ${isActive(tab.path) ? 'text-white' : 'text-textLight'}`}>{tab.label}</span>
            <Box className="ml-auto flex items-center gap-2">
              {tab.unread > 0 && (
                <Badge colorScheme="danger" variant="solid" isPill size="sm">
                  {tab.unread}
                </Badge>
              )}
              {/* {tab.id === 'doctorChat' && <span style={{ fontSize: 12 }}>▾</span>} */}
            </Box>
          </Flex>
        </Button>
      ))}
    </Flex>
  );
};

export default PatientNavTabs;
