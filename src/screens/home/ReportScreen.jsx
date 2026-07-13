import React, {useEffect, useRef, useState} from 'react';
import {Download} from 'lucide-react';
import {AneXBReportContent} from "../reports/AnexBReportContent";
import {AnexAReportContent} from "../reports/AnexAReportContent";
import {SeniorCitizenContent} from "../reports/SeniorCitizenContent";
import {DisablePersonReportContent} from "../reports/DisablePersonReportContent";
// import {StationReportContent} from "../reports/StationReportContent";
// import {BusTripReportContent} from "../reports/BusTripReportContent";
// import {ZReadingContent} from "../reports/ZReadingContent";
// import {XReadingContent} from "../reports/XReadingContent";
import {updateHasuraRole} from "../../api/apolloClient";
import {XReadingScreen} from "../x-reading/X-ReadingScreen";
import { ZReportsScreen } from '../z-reports/ZReportsScreen';
import { SaleTicketReportContent } from '../reports/SaleTicketsReportContent';
import { CardReportContent } from '../reports/CardReportContent';
import { EJournalScreen } from '../e-journal/EJournalScreen';
// Reusable Export Button Component
export const ExportButton = ({onExport, label = 'Export to Excel'}) => (
    <button
        onClick={onExport}
        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors dark:bg-green-700 dark:hover:bg-green-800"
    >
        <Download className="w-4 h-4 mr-2"/>
        {label}
    </button>
);

// Generic Input Field Component
const FormField = ({label, type = 'text', options = [], ...props}) => {
    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark";

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            {type === 'select' ? (
                <select className={inputClasses} {...props}>
                    {options.map((option, index) => (
                        <option key={index} value={option.value || option}>
                            {option.label || option}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea className={`${inputClasses} h-24`} {...props} />
            ) : (
                <input type={type} className={inputClasses} {...props} />
            )}
        </div>
    );
};

// Tab Content Container Component
export const TabContent = ({title, children, onExport, buttonLabel = "Export To Excel"}) => (
    <div className="">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {title}
            </h2>
            <ExportButton onExport={onExport} label={buttonLabel}/>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const roleMap = {
    senior: "senior_citizen_report",
    person: "pwd_report",
    anexa: "sale_report",
    anexb: "bir_pos_sales_report",
    zreading: "z_report_histories",
    xreadingPos: "x_reading_report",
    // sale_tickets : "sale_tickets",
    card_report : "card_report",
    e_journal: "e_journal",

};

// Main Report Screen Component
export const ReportScreen = ({ permissions = {} }) => {
    const [activeTab, setActiveTab] = useState('senior');
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsRef = useRef(new Map());

    // Map tab IDs to permission keys
    const tabPermissionMap = {
        senior: 'senior_citizen_report',
        person: 'pwd_report',
        anexa: 'sale_report',
        anexb: 'bir_pos_sales_report',
        zreading: 'z_report_histories',
        xreadingPos: 'x_reading_report',
        // sale_tickets : "sale_tickets",
        card_report : "card_report",
        e_journal: "e_journal",
    };

    // Define all available tabs
    const allTabs = [
        {id: 'senior', label: 'Senior Citizen '},
        {id: 'person', label: 'PWD '},
        {id: 'anexa', label: 'Sales'},
        {id: 'anexb', label: 'BIR POS'},
        {id: 'zreading', label: 'Z Reading'},
        {id: 'xreadingPos', label: 'X Reading'},

        // {id: 'sale_tickets',label: 'Sales (Tickets)'},
        {id: 'card_report',label: 'Card'},
        {id:'e_journal', label: 'E-Journal'},


    ];

    useEffect(() => {
        const role = roleMap[activeTab];
        console.log('role: ', role, activeTab);
        if (role) updateHasuraRole(role);
    }, [activeTab]);


    // Show all tabs - permissions managed server-side
    const tabs = allTabs;

    useEffect(() => {
        if (!tabs.find(tab => tab.id === activeTab) && tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
    }, [permissions]);

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
            senior: (
                <SeniorCitizenContent/>
            ),
            person: (
                <DisablePersonReportContent/>
            ),
            anexa: (
                <AnexAReportContent/>
            ),
            anexb: (
                <AneXBReportContent/>
            ),
            zreading: (
                <ZReportsScreen/>
            ),
            sale_tickets:(
                <SaleTicketReportContent/>

            ),
            card_report:(
                <CardReportContent/>
            ),
            e_journal:(
                <EJournalScreen/>
            ),
            xreadingPos: (
                <XReadingScreen/>
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
                            Accounting Reports
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
                                    ${
                                        activeTab === tab.id
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
