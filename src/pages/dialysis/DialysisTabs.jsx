import React, { useState, Suspense, lazy } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const DialysisDashboard = lazy(() => import('./DialysisDashboard'));
const DialysisInventory = lazy(() => import('./DialysisInventory'));
const DialysisSessions = lazy(() => import('./DialysisSessions'));
const DialysisAppointments = lazy(() => import('./DialysisAppointments'));
const DialysisPatients = lazy(() => import('./DialysisPatients'));
const DialysisBilling = lazy(() => import('./DialysisBilling'));

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Component: DialysisDashboard },
  { id: 'inventory', label: 'Inventory', Component: DialysisInventory },
  { id: 'sessions', label: 'Sessions', Component: DialysisSessions },
  { id: 'appointments', label: 'Appointments', Component: DialysisAppointments },
  { id: 'patients', label: 'Patients', Component: DialysisPatients },
  { id: 'billing', label: 'Billing', Component: DialysisBilling },
];

export default function DialysisTabs() {
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') || 'dashboard';
  const idx = TABS.findIndex(t => t.id === active);
  const current = TABS[idx >= 0 ? idx : 0];
  const ActiveComponent = current.Component;

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={idx >= 0 ? idx : 0} onChange={(_, v) => setParams({ tab: TABS[v].id })} variant="scrollable" scrollButtons="auto">
        {TABS.map(t => <Tab key={t.id} label={t.label} />)}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        <Suspense fallback={<Box sx={{ p: 4 }}>Loading...</Box>}>
          <ActiveComponent />
        </Suspense>
      </Box>
    </Box>
  );
}
