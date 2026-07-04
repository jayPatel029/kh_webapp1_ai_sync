/**
 * useMobileNavItems Hook
 * Computes the mobile navigation items based on user role and permissions
 * Returns the 3 mobile nav items: Dashboard, Patients, KFRE
 * 
 * @file src/hooks/useMobileNavItems.js
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isRole } from '../helpers/roleUtils';
import { ROUTES } from '../routes/routeConstants';

// Mobile icon assets (passive / active)
import HomeIcon from '../assets/icons/mobile/Home Page.svg';
import HomeIconActive from '../assets/icons/mobile/Home Page-1.svg';
import FeverIcon from '../assets/icons/mobile/Fever.svg';
import FeverIconActive from '../assets/icons/mobile/Fever-1.svg';
import KidneyIcon from '../assets/icons/mobile/Kidney.svg';
import KidneyIconActive from '../assets/icons/mobile/Kidney-1.svg';
export const useMobileNavItems = () => {
    const role = useSelector((state) => state.permission);

    return useMemo(() => {
        const hasDashboardAccess = isRole(role, ['Admin', 'PSadmin', 'Doctor']);
        const items = [];

        // Dashboard
        if (hasDashboardAccess) {
            items.push({
                id: 'admin-dashboard',
                label: 'Admin Dashboard',
                mobileLabel: 'Dashboard',
                href: ROUTES.DASHBOARD,
                icon: HomeIcon,
                activeicon: HomeIconActive,
                showInMobileBar: true,
            });
        }

        // Patients
        if (role?.patients) {
            items.push({
                id: 'patients',
                label: 'Patients',
                href: ROUTES.PATIENTS,
                icon: FeverIcon,
                activeicon: FeverIconActive,
                showInMobileBar: true,
            });
        }

        // KFRE
        if (hasDashboardAccess) {
            items.push({
                id: 'kfre',
                label: 'KFRE',
                mobileLabel: 'KFRE',
                href: ROUTES.REPORTS_KFRE,
                icon: KidneyIcon,
                activeicon: KidneyIconActive,
                showInMobileBar: true,
            });
        }

        // Return only items with showInMobileBar flag
        const filtered = items.filter((item) => item.showInMobileBar);
        if (filtered.length) {
            return filtered;
        }
        return items.slice(0, 3);
    }, [role]);
};

export default useMobileNavItems;
