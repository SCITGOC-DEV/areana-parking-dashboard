import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiLogOut, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from "../../context/AuthContext";
import { SideBar } from "../../common/SideBar";
import { Dialog } from "../../components/Dialog";
import { useTheme } from "../../context/ThemeContext";
import { PermissionsContext } from './PermissionsContext';
import { sidebarOptions } from '../../common/SideBar';
import { Watermark } from '../../components/Watermark';

export const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const { logout } = useAuth();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const getHeaderTitle = () => {
        const currentPath = location.pathname;
        const matchedOption = sidebarOptions.find(option => currentPath.startsWith(option.path));
        if (matchedOption) return matchedOption.title;

        const pathSegments = location.pathname.split('/').filter(Boolean);
        const titleSegment = pathSegments.reverse().find(segment => isNaN(segment));
        const stateTitle = location.state?.routeName || location.state?.pageName;
        const formatTitle = (str) => {
            if (!str) return 'Dashboard';
            return str.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        };
        return stateTitle || formatTitle(titleSegment) || 'Dashboard';
    };

    return (
        <PermissionsContext.Provider value={[]}>
            <div className="min-h-screen flex bg-[var(--color-bg-primary)] overflow-x-hidden">
                <Dialog
                    isOpen={showLogoutDialog}
                    onClose={() => setShowLogoutDialog(false)}
                    onConfirm={logout}
                    title="Confirm Logout"
                    message="Are you sure you want to logout?"
                    confirmText="Logout"
                    confirmColor="bg-red-500"
                />

                <SideBar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} permissions={[]} />

                <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} overflow-x-hidden`}>
                    <header className="sticky top-0 bg-[var(--color-bg-primary)] border-b border-[var(--color-secondary-light)] p-4 flex justify-between items-center shadow-sm z-40">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg"
                                aria-label="Toggle sidebar"
                            >
                                <FiMenu className="text-xl text-[var(--color-text-primary)]" />
                            </button>
                            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] capitalize truncate">
                                {getHeaderTitle()}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleTheme(!isDark)}
                                className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                            >
                                {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
                            </button>

                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                aria-label="Logout"
                            >
                                <FiLogOut className="text-xl" />
                            </button>
                        </div>
                    </header>

                    <main className="bg-[var(--color-bg-primary)] min-h-[calc(100vh-4rem)] p-4 sm:p-6 overflow-x-hidden relative overflow-y-visible">
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
                            {/*<Watermark />*/}
                        </div>
                        <div className="max-w-7xl mx-auto relative">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </PermissionsContext.Provider>
    );
};
