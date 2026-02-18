/**
 * Patient Navigation Tabs Component
 * Tab navigation for different patient sections
 * 
 * @file src/components/PatientNavTabs.jsx
 */

import React from 'react';
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

export const PatientNavTabs = ({
  patientId,
  userData,
  unreadAdminCount = 0,
  unreadDoctorCount = 0,
  role,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'alarms', label: 'Alarms', path: ROUTES.patientAlarms(patientId), visible: !(role?.role_name === 'Dialysis Technician') },
    { id: 'diet', label: 'Diet Details', path: ROUTES.withPatientQuery(ROUTES.MEDICAL_DIET, patientId), state: userData, visible: !(role?.role_name === 'Dialysis Technician') },
    { id: 'adminChat', label: 'Admin Chat', path: ROUTES.chatAdmin(patientId), unread: unreadAdminCount, visible: !(role?.role_name === 'Dialysis Technician' || role?.role_name === 'Medical Staff') },
    { id: 'doctorChat', label: 'Doctor Chat', path: ROUTES.chatDoctor(patientId), unread: unreadDoctorCount, visible: !(role?.role_name === 'Medical Staff' || role?.role_name === 'Dialysis Technician') },
    { id: 'labs', label: 'Lab Reports', path: ROUTES.withPatientQuery(ROUTES.MEDICAL_LABS, patientId), state: userData, visible: true },
    { id: 'prescriptions', label: 'Prescriptions', path: ROUTES.withPatientQuery(ROUTES.MEDICAL_PRESCRIPTIONS, patientId), state: userData, visible: true },
    { id: 'requisition', label: 'Requisition Reports', path: ROUTES.withPatientQuery(ROUTES.MEDICAL_REQUISITIONS, patientId), state: userData, visible: true },
    { id: 'manage', label: 'Manage Parameters', path: ROUTES.patientParameters(patientId), state: userData, visible: role?.role_name === 'Admin' },
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

  return (
    <Flex
      gap={3}
      align="center"
      justify="start"
      className="patient-nav-tabs noscrollbar px-6 py-4 overflow-x-auto bg-white sticky top-0"
      aria-label="Patient Navigation Tabs"
    >
      {tabs.filter(tab => tab.visible).map((tab) => (
        <Button
          key={tab.id}

          variant={isActive(tab.path) ? 'secondary' : 'outline'}
          onClick={() => navigate(tab.path, { state: tab.state })}
          className=" h-10 px-4 rounded-xl flex items-center gap-3 shrink-0 bg-white border-2 border-divider transition-colors"
          aria-label={tab.label}
        >
          <Flex align="center" gap={2} className="w-full justify-start ">
            <Box className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
              <img
                src={icons[tab.id]}
                alt={tab.label}
                style={{
                  width: 22,
                  height: 22,
                  filter: isActive(tab.path)
                    ? 'brightness(0) invert(1)' // White
                    : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(173deg) brightness(95%) contrast(87%)' // Muted
                }}
              />
            </Box>
            <span className={`truncate   ${isActive(tab.path) ? 'text-white' : 'text-gray-700'}`}>{tab.label}</span>
            <Box className="ml-auto flex items-center gap-2">
              {tab.unread > 0 && (
                <Badge colorScheme="error" isPill size="sm" className="badge-error">
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
