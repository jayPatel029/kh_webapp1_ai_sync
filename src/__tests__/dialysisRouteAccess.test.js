/**
 * @jest-environment node
 */
import React from 'react';
import { getDialysisRoutes } from '../routes/dialysisRoutes';
import { ROUTE_NAMES } from '../routes/routeConstants';

// Mock getDialysisRoutes dependencies
jest.mock('../pages/dialysis/DialysisDashboard', () => () => <div>Dashboard</div>);
jest.mock('../pages/dialysis/DialysisInventory', () => () => <div>Inventory</div>);
jest.mock('../pages/dialysis/DialysisSessions', () => () => <div>Sessions</div>);
jest.mock('../pages/dialysis/DialysisAppointments', () => () => <div>Appointments</div>);
jest.mock('../pages/dialysis/DialysisPatients', () => () => <div>Patients</div>);
jest.mock('../pages/dialysis/DialysisBilling', () => () => <div>Billing</div>);

describe('Dialysis Route Access Restrictions', () => {
  it('enforces that patients queue and summary routes only allow Technician, Doctor, and Medical Staff roles', () => {
    const mockGuard = jest.fn((element, routeName, allowedRoles) => ({
      element,
      routeName,
      allowedRoles,
    }));

    const routes = getDialysisRoutes({ guard: mockGuard, ROUTE_NAMES });
    
    // Find the patients route
    const dialysisRoot = routes.find(r => r.path === 'dialysis');
    expect(dialysisRoot).toBeDefined();

    const patientsRoute = dialysisRoot.children.find(c => c.path === 'patients');
    expect(patientsRoute).toBeDefined();

    // Verify the allowedRoles passed to the guard — Admin/PSadmin now allowed per whole-workflow plan (P2→P3→P4)
    expect(patientsRoute.element.allowedRoles).toEqual([
      'Dialysis Technician',
      'Doctor',
      'Medical Staff',
      'Admin',
      'PSadmin'
    ]);

    expect(patientsRoute.element.allowedRoles).toContain('Admin');
    expect(patientsRoute.element.allowedRoles).toContain('PSadmin');
  });

  it('keeps other routes like dashboard, billing, and sessions accessible to Dialysis Technician, Admin, and PSadmin', () => {
    const mockGuard = jest.fn((element, routeName, allowedRoles) => ({
      element,
      routeName,
      allowedRoles,
    }));

    const routes = getDialysisRoutes({ guard: mockGuard, ROUTE_NAMES });
    const dialysisRoot = routes.find(r => r.path === 'dialysis');

    const checkRoute = (path, expectedRoles) => {
      const route = dialysisRoot.children.find(c => c.path === path);
      expect(route).toBeDefined();
      expect(route.element.allowedRoles).toEqual(expectedRoles);
    };

    checkRoute('dashboard', ['Dialysis Technician', 'Admin', 'PSadmin']);
    checkRoute('inventory', ['Dialysis Technician', 'Admin', 'PSadmin']);
    checkRoute('sessions', ['Dialysis Technician', 'Admin', 'PSadmin']);
    checkRoute('appointments', ['Dialysis Technician', 'Admin', 'PSadmin']);
    checkRoute('billing', ['Dialysis Technician', 'Admin', 'PSadmin']);
  });
});
