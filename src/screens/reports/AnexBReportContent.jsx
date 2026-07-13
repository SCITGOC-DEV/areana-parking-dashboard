import React, { useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ChevronDown } from "lucide-react";
import { TabContent } from "../home/ReportScreen";
import { IoIosArrowDown } from "react-icons/io";
import report from "../../graphql/mutation/report";
import { DataTable } from "../../common/DataTable";
import machine from "../../graphql/queries/machine";
import DatePicker from "react-datepicker";
import ExcelGenerator from "../../utils/ExcelGenerator";
import { Loader } from "../../components/Loader";
import dayjs from "dayjs";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import DateUtils from "../../utils/DateUtils";
import { formatDateToMMDDYYYY, formatDateToYYYYMMDD } from "../../utils/Constants";

export const DateButton = ({ title, selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format date for display (e.g., "2025-06-20")
    const displayDate = selectedDate
        ? dayjs(selectedDate).format('YYYY-MM-DD')
        : 'Select Date';

    return (
        <div className="relative">
            {title && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {title}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <span className="block truncate text-gray-900 dark:text-gray-100 pr-8">
                        {displayDate}
                    </span>
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {isOpen && (
                    <div
                        ref={pickerRef}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
                        role="dialog"
                    >
                        <DatePicker
                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-0 focus:ring-0"
                            selected={selectedDate}
                            onChange={(date) => {
                                onChange(date);
                                setIsOpen(false); // Close the picker when a date is selected
                            }}
                            inline
                            calendarClassName="border-0 dark:bg-gray-800"
                            dayClassName={() =>
                                'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                            wrapperClassName="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const DropdownButton = ({ title, options, label, displayField, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [value, setValue] = useState(null);

    // Utility: Resolve nested field like "vehicle.vehicle_plate_number"
    const resolvePath = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    // Get display text from object based on field(s)
    const getDisplayValue = (option) => {
        if (Array.isArray(displayField)) {
            return displayField.map((field) => resolvePath(option, field)).join(" - ");
        }
        return resolvePath(option, displayField);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative inline-block transition-all duration-300 text-left">
            <p className="text-gray-500 dark:text-gray-500 mb-2">{label}</p>
            <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value === null ? title : value}
                <IoIosArrowDown />
            </button>

            {isOpen && (
                <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                    <ul className="py-1 max-h-60 overflow-auto">
                        {options.map((option, index) => {
                            const display = getDisplayValue(option);
                            return (
                                <li
                                    key={index}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => {
                                        onSelect(option);
                                        setValue(display);
                                        setIsOpen(false);
                                    }}
                                >
                                    {display}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};


export const getOneMonthEarlier = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
};



export const AneXBReportContent = () => {
    const [data, setData] = useState([]);
    const [vehiclePlateNumber, setVehiclePlateNumber] = useState(null);
    const [sn, setSn] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);

    const [getExportData] = useMutation(report.REPORT_ANEX_B_BY_VEHICLE, {
        onCompleted: (data) => {
            console.log('Bir report', data);
            setTimeout(() => {
                setData(data.reportAnexBReport.data);
                setVehiclePlateNumber(data.reportAnexBReport.vehiclePlateNumber);
                setSn(data.reportAnexBReport.sn);
                setLoading(false);
            }, 400);
        },
        onError: (error) => {
            console.error('Error fetching AneXB report data:', error);
            setLoading(false);
        }
    });

    const [getMachines] = useLazyQuery(machine.GET_ALL_MACHINES, {
        onCompleted: (data) => {
            if (data.response && Array.isArray(data.response)) {
                const options = data.response.map((m, idx) => ({
                    id: `machine-${m.id}-${idx}`,
                    label: m.serial_number,
                    serial_number: m.serial_number,
                    machineId: m.id,
                    ...m
                }));
                setMachineSerialNumbers(options);
                setSelectedMachine(options[0] || null); // Set first machine as default
            }
        },
        onError: (error) => {
            console.error('Error fetching machines:', error);
        }
    });

    useEffect(() => {
        getMachines();
    }, [getMachines]);

    useEffect(() => {
        // Skip if selectedMachine is null (initial state)
        if (!selectedMachine) {
            return;
        }

        setLoading(true);

        const startDateStr = formatDateToYYYYMMDD(startDate);
        const endDateStr = formatDateToYYYYMMDD(endDate);

        const variables = {
            startDate: startDateStr,
            endDate: endDateStr,
            machineId: selectedMachine.machineId || selectedMachine.id,
            machineType: selectedMachine.type
        };

        console.log('AnexB query variables:', variables);

        getExportData({ variables });
    }, [startDate, endDate, selectedMachine, getExportData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const totalSummary = data?.reduce((acc, item) => {
        acc.pwdDiscount += item.pwdDiscount || 0;
        acc.seniorCitizenDiscount += item.seniorCitizenDiscount || 0;
        acc.studentDiscount += item.studentDiscount || 0;
        acc.netSales += item.netSales || 0;
        acc.grossSales += item.grossSales || 0;
        acc.oldGrandTotal += Number(item.oldGrandTotal) || 0;
        acc.newGrandTotal += Number(item.newGrandTotal) || 0;
        return acc;
    }, {
        pwdDiscount: 0,
        seniorCitizenDiscount: 0,
        studentDiscount: 0,
        netSales: 0,
        grossSales: 0,
        oldGrandTotal: 0,
        newGrandTotal: 0
    });

    const columns = [
        {
            key: 'transactionDate',
            header: 'Transaction Date',
            render: (item) => (
                <span className="text-gray-800 dark:text-gray-200">
                    {formatDateToMMDDYYYY(item.transactionDate)}
                </span>
            ),
            className: 'min-w-32'
        },
        {
            key: 'beginningOr',
            header: 'Beginning OR',
            render: (item) => (
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {item.beginningOr || 'N/A'}
                </span>
            ),
            className: 'min-w-32',
            hideOnMobile: true
        },
        {
            key: 'endingOr',
            header: 'Ending OR',
            render: (item) => (
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {item.endingOr || 'N/A'}
                </span>
            ),
            className: 'min-w-32',
            hideOnMobile: true
        },
        {
            key: 'grossSales',
            header: 'Gross Sales',
            render: (item) => (
                <span className="font-mono text-blue-700 dark:text-blue-300">
                    {formatCurrency(item.grossSales)}
                </span>
            ),
            className: 'text-right min-w-32'
        },
        {
            key: 'vat_amount',
            header: 'VAT Amount',
            render: (item) => (
                <span className="text-orange-700 dark:text-orange-300 font-mono">
                    {formatCurrency(item.vatableAmount)}
                </span>
            ),
            className: 'text-right min-w-32',
        },
        {
            key: 'vat_exempt_sales',
            header: 'VAT Exempt Sales',
            render: (item) => (
                <span className="text-purple-700 dark:text-purple-300 font-mono">
                    {formatCurrency(item.grossSales)}
                </span>
            ),
            className: 'text-right min-w-32',
        },
        {
            key: 'vatable_sales',
            header: 'Vatable Sales',
            render: (item) => (
                <span className="text-green-700 dark:text-green-300 font-mono">
                    {formatCurrency(item.vatableSales)}
                </span>
            ),
            className: 'text-right min-w-32',
        },
        {
            key: 'oldGrandTotal',
            header: 'Old Grand Total',
            render: (item) => {
                const value = Number(item?.oldGrandTotal);
                return (
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                        {isNaN(value) ? 'N/A' : formatCurrency(value)}
                    </span>
                );
            },
            className: 'text-right min-w-32'
        },
        {
            key: 'newGrandTotal',
            header: 'New Grand Total',
            render: (item) => {
                const value = Number(item?.newGrandTotal);
                return (
                    <span className="font-mono font-semibold text-green-700 dark:text-green-300">
                        {isNaN(value) ? 'N/A' : formatCurrency(value)}
                    </span>
                );
            },
            className: 'text-right min-w-32'
        },
        {
            key: 'netSales',
            header: 'Net Sales',
            render: (item) => (
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.netSales)}
                </span>
            ),
            className: 'text-right min-w-32'
        },
        // {
        //     key: 'pwdDiscount',
        //     header: 'PWD Discount',
        //     render: (item) => (
        //         <span className="font-mono text-purple-700 dark:text-purple-300">
        //             {formatCurrency(item.pwdDiscount)}
        //         </span>
        //     ),
        //     className: 'text-right min-w-32'
        // },
        // {
        //     key: 'seniorCitizenDiscount',
        //     header: 'Senior Citizen Discount',
        //     render: (item) => (
        //         <span className="font-mono text-orange-700 dark:text-orange-300">
        //             {formatCurrency(item.seniorCitizenDiscount)}
        //         </span>
        //     ),
        //     className: 'text-right min-w-32'
        // },
        // {
        //     key: 'studentDiscount',
        //     header: 'Student Discount',
        //     render: (item) => (
        //         <span className="font-mono text-pink-700 dark:text-pink-300">
        //             {formatCurrency(item.studentDiscount)}
        //         </span>
        //     ),
        //     className: 'text-right min-w-32'
        // }
    ];

    useEffect(() => {
        return () => {
            console.log('machineSerialNO: ', selectedMachine)
        };
    }, [selectedMachine]);


    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <TabContent
                onExport={() => {
                    // Determine the identifier for the filename
                    let identifier = selectedMachine?.serial_number || 'All';
                    
                    ExcelGenerator.exportAnexBReport(
                        data,
                        `BIR_POS_Sales_${DateUtils.fileDate(startDate)}_to_${DateUtils.fileDate(endDate)}_${identifier}`,
                        DateUtils.fileDate(startDate),
                        DateUtils.fileDate(endDate),
                        'All',
                        selectedMachine?.serial_number || 'All',
                        { vehiclePlateNumber, sn }
                    );
                }}
                title="BIR POS Sales Report"
                className="bg-white dark:bg-gray-900"
            >
                <div className="relative">
                    {/* Date Filter Section */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select date range and machine for your BIR POS sales report
                                </p>
                            </div>

                            {/* All Filters in One Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DateButton
                                    onChange={setStartDate}
                                    selectedDate={startDate}
                                    title="Start Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                    aria-label="Select start date for report"
                                />
                                <DateButton
                                    onChange={setEndDate}
                                    selectedDate={endDate}
                                    title="End Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                    aria-label="Select end date for report"
                                />
                                <div>
                                    {machineSerialNumbers?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Machine Serial Number"
                                            options={machineSerialNumbers}
                                            displayField="serial_number"
                                            onChange={setSelectedMachine}
                                            value={selectedMachine}
                                            placeholder="Select machine..."
                                            aria-label="Select machine serial number"
                                        />
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Machine Serial Number
                                            </label>
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                                No machines available
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {!loading && data?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data?.length}</p>
                                    </div>
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Sales</p>
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalSummary.grossSales)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Net: {formatCurrency(totalSummary.netSales)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Discounts</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(totalSummary.pwdDiscount + totalSummary.seniorCitizenDiscount + totalSummary.studentDiscount)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            SC: {formatCurrency(totalSummary.seniorCitizenDiscount)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grand Total Diff</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(totalSummary.newGrandTotal - totalSummary.oldGrandTotal)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            New vs Old
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Record Count and Filter Info */}
                    {!loading && (
                        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {data?.length}
                                </span> record{data?.length !== 1 ? 's' : ''} found
                                {selectedMachine && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                                        Machine: {selectedMachine.serial_number}
                                    </span>
                                )}
                            </div>
                            {data?.length > 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Date Range: {formatDateToMMDDYYYY(startDate)} - {formatDateToMMDDYYYY(endDate)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="text-blue-600 dark:text-blue-400" />
                            <span className="ml-3 text-gray-600 dark:text-gray-400">
                                Loading BIR POS sales report data...
                            </span>
                        </div>
                    ) : data?.length === 0 ? (
                        // Empty State
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="text-gray-400 dark:text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No Sales Data Found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                No BIR POS sales transactions found for the selected criteria.
                            </p>
                        </div>
                    ) : (
                        // Data Table
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={data || []}
                                enablePagination={true}
                                className="border-0"
                                headerClassName="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                rowClassName="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                            />
                        </div>
                    )}
                </div>
            </TabContent>
        </div>
    );
};
