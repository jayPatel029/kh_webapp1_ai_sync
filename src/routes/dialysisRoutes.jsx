/**
 * Dialysis Routes
 * Lazy-loads all dialysis member pages and exports route config.
 *
 * @file src/routes/dialysisRoutes.jsx
 */

import React, { lazy } from 'react';

const DialysisDashboard = lazy(() => import('../pages/dialysis/DialysisDashboard'));
const DialysisInventory = lazy(() => import('../pages/dialysis/DialysisInventory'));
const DialysisSessions = lazy(() => import('../pages/dialysis/DialysisSessions'));
const DialysisAppointments = lazy(() => import('../pages/dialysis/DialysisAppointments'));
const DialysisPatients = lazy(() => import('../pages/dialysis/DialysisPatients'));
const DialysisBilling = lazy(() => import('../pages/dialysis/DialysisBilling'));

export const getDialysisRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: 'dialysis',
    children: [
      {
        path: 'dashboard',
        element: guard(
          <DialysisDashboard />,
          ROUTE_NAMES.DIALYSIS_DASHBOARD,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'inventory',
        element: guard(
          <DialysisInventory />,
          ROUTE_NAMES.DIALYSIS_INVENTORY,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'sessions',
        element: guard(
          <DialysisSessions />,
          ROUTE_NAMES.DIALYSIS_SESSIONS,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'appointments',
        element: guard(
          <DialysisAppointments />,
          ROUTE_NAMES.DIALYSIS_APPOINTMENTS,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'patients',
        element: guard(
          <DialysisPatients />,
          ROUTE_NAMES.DIALYSIS_PATIENTS,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'billing',
        element: guard(
          <DialysisBilling />,
          ROUTE_NAMES.DIALYSIS_BILLING,
          ['Dialysis Technician', 'Admin', 'PSadmin']
        ),
      },
    ],
  },
];
