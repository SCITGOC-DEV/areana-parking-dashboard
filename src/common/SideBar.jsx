import {
    FiClock, FiFileText,
    FiHome,
    FiUser,
    FiX,
    FiZap,
    FiSettings
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { cloneElement, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const sidebarOptions = [
    // {
    //     id: 'dashboard',
    //     title: 'Dashboard',
    //     icon: <FiHome className="text-lg" />,
    //     path: '/home/dashboard'
    // },
    {
        id: 'user-accounts',
        title: 'User Accounts',
        icon: <FiUser className="text-lg" />,
        path: '/home/user-accounts'
    },
    // {
    //     id: 'parking-sessions',
    //     title: 'Parking Sessions',
    //     icon: <FiClock className="text-lg" />,
    //     path: '/home/parking-sessions'
    // },
    // {
    //     id: 'parking-locations',
    //     title: 'Parking Locations',
    //     icon: <FiZap className="text-lg" />,
    //     path: '/home/parking-locations'
    // },

    // {
    //     id: 'report',
    //     title: 'Accounting Reports',
    //     icon: <FiFileText className="text-lg" />,
    //     path: '/home/report'
    // },
    // {
    //     id: 'valet-settings',
    //     title: 'Valet Settings',
    //     icon: <FiSettings className="text-lg" />,
    //     path: '/home/valet-settings'
    // },
];



const reportTabPermissions = [
    'senior_citizen_report',
    'pwd_report',
    'sale_report',
    'bir_pos_sales_report',
    'z_report_histories',
    'x_reading_report',
    // 'sale_tickets',
    'card_report',
    'e_journal',
];



const userAccountPermissions = [
    'dashboard_permission',
    'dashboard_dispatcher',
    'dashboard_staff'
];
const busOperationPermissions = [
    'route',
    'bus_stop',
    'bus',
    'vehicle_in_transit',
    'route_running_status',
    'route_analytics_summary',
    'bus_analytics_summary',
];

const operationReportPermissions = [
    'stationary_report',
    'bus_trip_report',
    'pos_sale_report',
    'unused_ticket_pos',
    'used_ticket_pos',
    'used_ticket_qr',
    'unused_ticket_qr',
    'z_reading_report'
];

// Permission mapping for each sidebar option
const sidebarPermissionMap = {
    'dashboard': 'dashboard',
    // 'point_reload': 'point_reload',
    'topup-history': 'reload_history',
    transactions: 'transaction',
    // routes: 'route',
    card: 'card',
    // 'bus-stops': 'bus_stop',
    // 'dashboard_passenger': 'dashboard_passenger',
    // 'dashboard_dispatcher': 'dashboard_dispatcher',
    // 'dashboard_driver': 'dashboard_driver',
    // 'dashboard_staff': 'dashboard_staff',
    // buses: 'bus',
    // 'vehicle-type': 'vehicle_type',
    // 'x-reading': 'x_reading',
    // 'vehicle-routes': 'vehicle_in_transit',
    // 'all-vehicle-routes': 'all_vehicle_route',
    'ai-reporting': 'ai_assistive_reporting',
    // 'dashboard_permission': 'dashboard_permission',
    'z-reports': 'z_reading_report',
    'z-report-history': 'z_reading_report',
    'pos-sale-report': 'pos_sale_report',
    'unused-ticket-pos': 'unused_ticket_pos',
    'used-ticket-pos': 'used_ticket_pos',
    'used-ticket-qr': 'used_ticket_qr',
    'unused-ticket-qr': 'unused_ticket_qr'

};

// List of valid roles to check against
const validRoles = [
    'admin',
    'dashboard_permission',
    'dispatcher',
    'super_admin',
    'route',
    // 'driver',
    // 'passenger',
    'staff',
    'transaction',
    'vehicle_in_transit',
    'bus_stop',
    'all_vehicle_route',
    'card',
    'bus',
    'dashboard_driver',
    // 'x_reading',
    'pwd_report',
    'sale_report',
    'senior_citizen_report',
    'dashboard_passenger',
    'dashboard_dispatcher',
    // 'point_reload',
    'reload_history',
    'dashboard_staff',
    // 'vehicle_type',
    'staff_test',
    'main_admin',
    'all_vehicle_routes',
    'ai_assistive_reporting',
    'z_report_histories',
    'pos_sale_report',
    'unused_ticket_pos',
    'used_ticket_pos',
    'unused_ticket_qr',
    'route_running_status',
    'route_analytics_summary',
    'bus_analytics_summary',
];

export const SideBar = ({ isOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const { adminInfo } = useAuth();

    return (
        <>
            {/* Backdrop overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside className={`w-64 fixed z-50 h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-secondary-light)] transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="p-4 border-b border-[var(--color-secondary-light)]">
                        <div className="flex items-center justify-between">
                            <img
                                src={require('../assets/logo.png')}
                                alt="Logo"
                                className="h-8 w-auto rounded-md"
                            />
                            <button
                                onClick={() => setIsSidebarOpen(!isOpen)}
                                className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                            >
                                <FiX className="w-5 h-5 text-[var(--color-text-primary)]" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-2 space-y-1 overflow-y-auto flex-1">
                        {sidebarOptions.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                    }}
                                    className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'hover:bg-[var(--color-primary-light)] hover:bg-opacity-10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    <span className={`mr-3 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'}`}>
                                        {cloneElement(item.icon, { className: 'w-5 h-5' })}
                                    </span>
                                    <span className="font-medium truncate whitespace-nowrap">{item.title}</span>
                                    {isActive && <div className="ml-auto w-2 h-2 bg-[var(--color-primary)] rounded-full" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--color-secondary-light)] bg-[var(--color-bg-primary)]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                                <FiUser className="w-4 h-4 text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{adminInfo?.fullName || adminInfo?.userName || 'Admin'}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">Administrator</p>
                            </div>
                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
};
