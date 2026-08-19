/**
 * Dialysis Routes
 * Lazy-loads all dialysis member pages and exports route config.
 *
 * @file src/routes/dialysisRoutes.jsx
 */

import React, { lazy } from 'react';
import DialysisLayout from '../pages/dialysis/DialysisLayout';

const DialysisDashboard = lazy(() => import('../pages/dialysis/DialysisDashboard'));
const DialysisInventory = lazy(() => import('../pages/dialysis/DialysisInventory'));
const DialysisSessions = lazy(() => import('../pages/dialysis/DialysisSessions'));
const DialysisAppointments = lazy(() => import('../pages/dialysis/DialysisAppointments'));
const DialysisPatients = lazy(() => import('../pages/dialysis/DialysisPatients'));
const DialysisBilling = lazy(() => import('../pages/dialysis/DialysisBilling'));
const DuringDialysisPage = lazy(() => import('../pages/dialysis/DuringDialysisPage'));
const PostDialysisPage = lazy(() => import('../pages/dialysis/PostDialysisPage'));

export const getDialysisRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: 'dialysis',
    element: guard(<DialysisLayout />, ROUTE_NAMES.DIALYSIS_DASHBOARD, ['Dialysis Technician', 'Admin', 'PSadmin']),
    children: [
      {
        index: true,
        element: <DialysisDashboard />,
      },
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
          ['Dialysis Technician', 'Doctor', 'Medical Staff', 'Admin', 'PSadmin']
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
      {
        path: 'during/:sessionId/:screenId',
        element: guard(
          <DuringDialysisPage />,
          ROUTE_NAMES.DIALYSIS_DURING,
          ['Dialysis Technician', 'Nurse', 'Nephrologist', 'Doctor', 'Medical Staff', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'during/:screenId',
        element: guard(
          <DuringDialysisPage />,
          ROUTE_NAMES.DIALYSIS_DURING,
          ['Dialysis Technician', 'Nurse', 'Nephrologist', 'Doctor', 'Medical Staff', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'post/:sessionId/:screenId',
        element: guard(
          <PostDialysisPage />,
          ROUTE_NAMES.DIALYSIS_DURING,
          ['Dialysis Technician', 'Nurse', 'Nephrologist', 'Doctor', 'Medical Staff', 'Admin', 'PSadmin']
        ),
      },
      {
        path: 'post/:screenId',
        element: guard(
          <PostDialysisPage />,
          ROUTE_NAMES.DIALYSIS_DURING,
          ['Dialysis Technician', 'Nurse', 'Nephrologist', 'Doctor', 'Medical Staff', 'Admin', 'PSadmin']
        ),
      },
    ],
  },
];
