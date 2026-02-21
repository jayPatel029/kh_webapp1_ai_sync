/**
 * MobileBottomNav Component
 * Bottom navigation bar for mobile with 3 tabs
 * Shows: Dashboard, Patients, KFRE
 * 
 * @file src/components/mobile/MobileBottomNav.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { Sidebar as DSidebar } from '../../component-library/navigation/Sidebar';

const MobileBottomNav = ({ items = [] }) => {
    if (!items.length) {
        return null;
    }

    return (
        <DSidebar
            isMobile
            className="fixed inset-x-0 bottom-0 z-50 w-full border-t  border-gray-200 bg-white px-0 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.18)]"
        >
            <nav aria-label="Mobile navigation" className="flex w-full items-center justify-between gap-4">
                {items.map((item) => {
                    return (
                        <NavLink
                            key={item.id}
                            to={item.href}
                            end={item.href === '/'}
                            className={({ isActive }) => clsx(
                                'flex flex-col items-center gap-1 w-fit px-3 mr-2 ml-2 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors font-primary duration-200 border-t-2 border-transparent',
                                'w-[calc(100%/3)] justify-center',
                                isActive ? 'text-[#004c6d]  border-[#004c6d]' : 'text-slate-500 '
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* choose active icon when active, fallback to icon */}
                                    <img
                                        src={isActive ? (item.activeicon || item.icon) : item.icon}
                                        alt={`${item.label} icon`}
                                        className="h-6 w-6"
                                    />
                                    <span>{item.mobileLabel ?? item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </DSidebar>
    );
};

export default MobileBottomNav;
