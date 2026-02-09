/**
 * MainLayout Component
 * Centralized layout wrapper for all protected routes
 * Handles Sidebar and Navbar rendering based on route and user role
 * 
 * @file src/layouts/MainLayout.jsx
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import { Box, Flex } from '../component-library';

const MainLayout = () => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        } catch (e) {
            return false;
        }
    });

    // Get user role and permissions from Redux
    const role = useSelector((state) => state.permission);
    const user = useSelector((state) => state.auth?.user);

    // Sync collapsed state across tabs/windows
    useEffect(() => {
        const storageHandler = (ev) => {
            if (ev.key === 'sidebarCollapsed') {
                setIsSidebarCollapsed(ev.newValue === 'true');
            }
        };
        window.addEventListener('storage', storageHandler);
        return () => window.removeEventListener('storage', storageHandler);
    }, []);

    // Listen to sidebar toggle events
    useEffect(() => {
        const handler = (e) => {
            if (e?.detail?.isCollapsed !== undefined) {
                setIsSidebarCollapsed(!!e.detail.isCollapsed);
            }
        };
        window.addEventListener('sidebar:toggle', handler);
        return () => window.removeEventListener('sidebar:toggle', handler);
    }, []);

    // Determine if current route should show sidebar
    // Routes without sidebar: login pages, public pages
    const noSidebarRoutes = ['/login', '/doctorLogin', '/forgotpassword'];
    const showSidebar = !noSidebarRoutes.includes(location.pathname);

    // Calculate sidebar width for layout offset
    const SIDEBAR_WIDTH = 250;
    const COLLAPSED_WIDTH = 96; // 24 * 4 (w-24 in tailwind)
    const sidebarOffset = showSidebar
        ? (isSidebarCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH)
        : 0;

    return (
        <Box className="flex min-h-screen w-full">
            {/* Conditionally render sidebar */}
            {showSidebar && (
            <Box className="fixed top-0 left-0 h-screen z-50">
                <Sidebar />
            </Box>
            )}

            {/* Main content area */}
            <Box
                className="flex-1 min-h-screen transition-all duration-300"
                style={{
                    marginLeft: showSidebar ? `${sidebarOffset}px` : '0px',
                }}
            >
                {/* Navbar */}
                {showSidebar && <Navbar />}

                {/* Page content - rendered by nested routes */}
                <Box className={showSidebar ? "p-4 md:p-6" : ""}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
