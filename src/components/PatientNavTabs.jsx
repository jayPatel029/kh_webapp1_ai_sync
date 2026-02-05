/**
 * Patient Navigation Tabs Component
 * Tab navigation for different patient sections
 * 
 * @file src/components/PatientNavTabs.jsx
 */

import React from 'react';
import { Button } from './primitives/Button';
import { Flex, Box } from './layout/Layout';
import { colors, spacing } from '../design-system/tokens';

export const PatientNavTabs = ({
  tabs = [
    { id: 'alarms', label: 'Alarms', icon: '🔔' },
    { id: 'diet', label: 'Diet details', icon: '🍽️' },
    { id: 'chats', label: 'Chats', icon: '💬' },
    { id: 'labs', label: 'Lab reports', icon: '📊' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'requisition', label: 'Requisition report', icon: '📋' },
  ],
  activeTab,
  onTabChange,
  unreadCounts = {},
}) => {
  return (
    <Flex
      gap={0}
      align="center"
      justify="start"
      className="px-10 py-6 border-b"
      style={{
        borderBottom: `1px solid ${colors.border.DEFAULT}`,
        boxShadow: '2px 0px 8px rgba(0,0,0,0.15)',
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'solid' : 'ghost'}
          onClick={() => onTabChange?.(tab.id)}
          className="px-6 py-3 h-12 flex items-center gap-2 rounded-none"
          style={{
            background: activeTab === tab.id ? colors.primary.DEFAULT : 'transparent',
            color: activeTab === tab.id ? 'white' : colors.text.DEFAULT,
            borderBottomWidth: activeTab === tab.id ? '3px' : '0px',
            borderBottomColor: colors.primary.DEFAULT,
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {unreadCounts[tab.id] > 0 && (
            <Box
              className="rounded-full text-xs font-bold text-white"
              style={{
                background: colors.danger.DEFAULT,
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCounts[tab.id]}
            </Box>
          )}
        </Button>
      ))}
    </Flex>
  );
};

export default PatientNavTabs;
