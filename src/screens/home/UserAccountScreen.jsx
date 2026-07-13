import React, { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminsScreen from "./admins/AdminsScreen";

// Reusable Export Button Component
export const ExportButton = ({ onExport, label = 'Export to Excel' }) => (
    <button
        onClick={onExport}
        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors dark:bg-green-700 dark:hover:bg-green-800"
    >
        <FiDownload className="w-4 h-4 mr-2" />
        {label}
    </button>
);

// Tab Content Container Component
export const TabContent = ({ title, children, onExport, buttonLabel = "Export To Excel" }) => (
    <div className="">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {title}
            </h2>
            <ExportButton onExport={onExport} label={buttonLabel} />
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const tabs = [
    { id: 'admins', label: 'Admins' }
];

// Main Report Screen Component
export const UserAccountScreen = ({ permissions = {} }) => {
    const [activeTab, setActiveTab] = useState('admins');
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsRef = useRef(new Map());

    useEffect(() => {
        const activeTabElement = tabsRef.current.get(activeTab);
        if (activeTabElement) {
            setIndicatorStyle({
                width: `${activeTabElement.offsetWidth}px`,
                transform: `translateX(${activeTabElement.offsetLeft}px)`
            });
        }
    }, [activeTab]);

    const renderTabContent = (tabId) => {
        const contents = {
            admins: (
                <AdminsScreen />
            ),
        };

        return (
            <div>
                {contents[tabId]}
            </div>
        );
    };

    return (
        <div className="flex justify-center items-start w-full min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-7xl w-full p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg shadow-sm">
                <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
                            User Account Management
                        </h1>
                    </div>

                    {/* Tab Navigation */}
                    <div className="relative border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex w-full" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    ref={el => el && tabsRef.current.set(tab.id, el)}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                    flex-1
                                    py-4 px-1 
                                    text-sm font-medium
                                    transition-colors duration-200
                                    ${activeTab === tab.id
                                            ? 'text-primary dark:text-primary-light'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Animated Indicator */}
                        <div
                            className="absolute bottom-0 h-0.5 bg-primary dark:bg-primary-light transition-all duration-300 ease-in-out"
                            style={indicatorStyle}
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="py-6 text-gray-900 dark:text-gray-100">
                        <div className="transition-opacity duration-200 ease-in-out">
                            {renderTabContent(activeTab)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
