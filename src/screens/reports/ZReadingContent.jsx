import {TabContent} from "../home/ReportScreen";
import {DateButton, DropdownButton} from "./AnexBReportContent";
import React, {useEffect, useState, useRef} from "react";
import {Loader} from "../../components/Loader";
import {DataTable} from "../../common/DataTable";
import {useLazyQuery, useMutation} from "@apollo/client";
import report from "../../graphql/queries/report";
import {ToastType, useToast} from "../../context/ToastProvider";
import machine from "../../graphql/queries/machine";
import { Calendar, Printer, Download, FileText, Receipt, Users, CreditCard,
    Settings, ChevronDown, RotateCcw, BarChart3, TrendingUp, RefreshCw, Clock, Filter } from 'lucide-react';
import dateUtils from "../../utils/DateUtils";
import dayjs from "dayjs";
import TextFileDownloader from "../../utils/TextFileDownloader";
import vehicle from "../../graphql/queries/vehicle";
import DateUtils from "../../utils/DateUtils";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import { formatDateToMMDDYYYY, formatTIN } from "../../utils/Constants";
import { EXPORT_Z_READING_REPORT } from "../../api/NetworkConstants";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDateToMMDDYYYY(dateString);
};

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return formatDateToMMDDYYYY(dateTimeString);
};

const getFormattedDate = (iso) => {
    const date = new Date(iso);

    const pad = (n) => String(n).padStart(2, "0");

    const hours24 = date.getUTCHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? "PM" : "AM";

    const formatted =
        date.getUTCFullYear() + "_" +
        pad(date.getUTCMonth() + 1) + "_" +
        pad(date.getUTCDate()) + "_" +
        pad(hours12) + "_" +
        pad(date.getUTCMinutes()) + "_" +
        pad(date.getUTCSeconds()) + "_" +
        ampm;

    return formatted;
}

export const ZReadingContent = () => {
    const [date, setDate] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const [reportData, setData] = useState([])
    const [machines, setMachines] = useState([])
    const [selectedMachine, setSelectedMachine] = useState(null)
    const [machineTypeOptions, setMachineTypeOptions] = useState([])
    const [selectedMachineType, setSelectedMachineType] = useState(null)
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([])
    const [allMachines, setAllMachines] = useState([])
    const { addToast } = useToast()
    const [zReadingCount, setZReadingCount] = useState(0)
    const [resetCounter, setResetCounter] = useState(0)
    const [showResetConfirmation, setShowResetConfirmation] = useState(false)
    const prevMachineTypeRef = useRef(null);

    const [getZReadingReport] = useMutation(report.GET_Z_READING_REPORT, {
        onCompleted: (data) => {
            setLoading(false)
            const response = data.response
            setZReadingCount(response.reportData.zReadingCount)
            setResetCounter(response.reportData.resetCount || 0)
            if (response.error === 0) {
                setData(response.data)
                if (response.message.length > 0) {
                    addToast(response.message, ToastType.Info);
                }
            } else {
                addToast(response.message, ToastType.Error)
            }
        },
        onError: (error) => {
            setLoading(false)
            addToast(error.message, ToastType.Error)
        }
    })

    const [updateZReadingCount] = useMutation(report.UPDATE_Z_READING_COUNT, {
        onCompleted: (data) => {
            const response = data.response;
            if (response.error === 0) {
                setZReadingCount(response.reportData.zReadingCount)
                setResetCounter(response.reportData.resetCount)
                //setData(response.data)
                TextFileDownloader.downloadZReadingReportTxt(response.data, date, selectedMachine?.serial_number, selectedMachine?.serial_number, response.reportData.zReadingCount, response.reportData.resetCount)
                if (selectedMachine?.id) {
                    getZReadingReport({
                        variables: {
                            machineId: selectedMachine.id
                        }
                    });
                }
            } else {
                addToast(response.message, ToastType.Error);
            }
        },
        onError: (error) => {
            addToast(error.message, ToastType.Error);
        }
    });

    const [getZReadingCountByDriver] = useMutation(report.GET_Z_READING_COUNT_BY_DRIVER, {
        onCompleted: (data) => {
            const response = data?.reportGetZReadingCountByDriver;
            if (response?.error === 0 && response?.data) {
                setZReadingCount(response.data.zReadingCount || 0);
                setResetCounter(response.data.resetCount || 0);
            } else {
                setZReadingCount(0);
                setResetCounter(0);
            }
        },
        onError: () => {
            setZReadingCount(0);
            setResetCounter(0);
        }
    });

    const [resetZReadingCountByDriver] = useMutation(report.RESET_Z_READING_COUNT_BY_DRIVER, {
        onCompleted: (data) => {
            const response = data?.reportResetZReadingCountByDriver;
            console.log('Reset mutation response:', response);
            if (response?.error === 0 && response?.data) {
                setZReadingCount(response.data.zReadingCount || 0);
                setResetCounter(response.data.resetCount || 0);
                addToast(response.message || 'Reset successful', ToastType.Success);

                // Refresh Z reading data after successful reset
                if (selectedMachine?.id) {
                    getZReadingReport({
                        variables: {
                            machineId: selectedMachine.id
                        }
                    });
                }
            } else {
                addToast(response?.message || 'Reset failed', ToastType.Error);
            }
        },
        onError: (error) => {
            addToast(error.message || 'Reset failed', ToastType.Error);
        }
    });

    const handleDownload = async () => {
        const now = new Date();
    const formattedTime = now.toISOString().replace(/[:.]/g, "-");
        let fileName = `z_reading_report_${DateUtils.fileDate(date)}_${selectedMachine?.serial_number}_${formattedTime}.txt`;
        try {
            const response = await fetch(EXPORT_Z_READING_REPORT, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "machineId": selectedMachine?.id,
                })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }

            if(response?.error === 1) {
                addToast(response.message,"error");
                return;
            }

            const blob = await response.blob();
            // Try to read filename from Content-Disposition
            const disposition = response.headers.get("Content-Disposition");
            //let fileName = `z_reading_report_${getFormattedDate(report.report_date_time)}.txt`;

            if (disposition) {
                const match = disposition.match(/filename="(.+)"/);
                if (match) fileName = match[1];
            }

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            getZReadingReport({
                        variables: {
                            machineId: selectedMachine.id
                        }
                    });

            console.log('download response: ', response)

        } catch (error) {

        }
    };

    const handleResetCounter = () => {
        if (selectedMachine?.id) {
            setShowResetConfirmation(true);
        } else {
            addToast('Please select a machine first.', ToastType.Warning);
        }
    };

    const confirmResetCounter = () => {
        if (selectedMachine?.id) {
            resetZReadingCountByDriver({ variables: { machineId: selectedMachine.id } });
            setShowResetConfirmation(false);
        }
    };

    const cancelResetCounter = () => {
        setShowResetConfirmation(false);
    };

    const handleExport = async () => {
        if (reportData) {
            const variables = {
                machineId: selectedMachine?.id,
            }
            updateZReadingCount({
                variables: variables
            })
        } else {
            addToast("No report data available to export", ToastType.Warning);
        }
    };

    const [getMachines] = useLazyQuery(machine.GET_ALL_MACHINES_WITH_POS, {
        onCompleted: (data) => {
            if (data.response && Array.isArray(data.response)) {
                setAllMachines(data.response);
                
                // Create machine type options with unique IDs
                const typeOptions = [
                    {
                        id: "type-ovv",
                        label: "OVV",
                        type: "ovv"
                    },
                    {
                        id: "type-pos",
                        label: "POS",
                        type: "pos"
                    },
                    {
                        id: "type-mobile",
                        label: "Mobile",
                        type: "mobile",
                        saleMachineId: 1
                    }
                ];
                
                setMachineTypeOptions(typeOptions);
                setSelectedMachineType(typeOptions[0]); // Set "OVV" as default
            }
        },
        onError: (error) => {
            console.error('Error fetching machines:', error);
        }
    });

    const [getMachinesByDriver] = useLazyQuery(machine.GET_MACHINES_BY_DRIVER, {
        onCompleted: (data) => {
            if (data.response && Array.isArray(data.response)) {
                const options = data.response.map((m, idx) => ({
                    id: `ovv-${m.id}-${idx}`,
                    label: m.serial_number,
                    type: "ovv",
                    serial_number: m.serial_number,
                    machineId: m.id,
                    ...m
                }));
                setMachineSerialNumbers(options);
                setSelectedMachine(options[0]); // Set first machine as default
            }
        },
        onError: (error) => {
            console.error('Error fetching OVV machines:', error);
        }
    });

    useEffect(() => {
        getMachines();
    }, []);

    useEffect(() => {
        // Update machine serial numbers based on selected machine type
        if (selectedMachineType && selectedMachineType.type === "ovv") {
            getMachinesByDriver();
        } else if (selectedMachineType && selectedMachineType.type === "pos") {
            const posMachines = allMachines.filter(m => m.pos_terminal_number);
            const options = posMachines.map((m, idx) => ({
                id: `pos-${m.id}-${idx}`,
                label: m.serial_number,
                type: "pos",
                serial_number: m.serial_number,
                machineId: m.id,
                ...m
            }));
            setMachineSerialNumbers(options);
            setSelectedMachine(options[0]); // Set first machine as default
        } else if (selectedMachineType && selectedMachineType.type === "mobile") {
            setMachineSerialNumbers([]);
            setSelectedMachine(null);
        }
    }, [selectedMachineType, allMachines]);

    useEffect(() => {
        // Skip if selectedMachineType is null (initial state)
        if (selectedMachineType === null) {
            return;
        }

        // For OVV and POS, wait until the machine dropdown is set
        if ((selectedMachineType.type === "ovv" || selectedMachineType.type === "pos") && selectedMachine === null) {
            return;
        }

        // For Mobile, call API immediately when type is set to mobile
        if (selectedMachineType.type === "mobile") {
            setZReadingCount(0);
            setResetCounter(0);
            getZReadingReport({
                variables: { machineId: 1 }
            });
        }
    }, [selectedMachineType]);

    useEffect(() => {
        // Only call API when selectedMachine changes (for OVV and POS)
        if (selectedMachine && selectedMachineType && (selectedMachineType.type === "ovv" || selectedMachineType.type === "pos")) {
            setZReadingCount(0);
            setResetCounter(0);
            getZReadingReport({
                variables: { machineId: selectedMachine?.id }
            });
        }
    }, [selectedMachine]);

    return (
        <div>
            <TabContent
                onExport={handleDownload}
                buttonLabel="Export"
                title="Z Reading Report">
                <div className="relative">
                    {/* Enhanced Filter Section */}
                    <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Z Reading Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select machine type and serial number to generate your Z reading report
                                </p>
                            </div>

                            {/* All Filters in One Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    {machineTypeOptions?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Machine Type"
                                            options={machineTypeOptions}
                                            displayField="label"
                                            onChange={setSelectedMachineType}
                                            value={selectedMachineType}
                                            placeholder="Select machine type..."
                                            aria-label="Select machine type"
                                        />
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Machine Type
                                            </label>
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                                No machine types available
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedMachineType?.type !== "mobile" && (
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
                                )}

                                <div className="flex items-end">
                                    <button
                                        className="w-full h-11 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 justify-center"
                                        onClick={handleResetCounter}
                                        type="button"
                                    >
                                        <RotateCcw size={16} />
                                        Reset Counter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Counter Values Below Options and Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center justify-center">
                            <div className="flex-1 min-w-[220px] bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-6 text-center hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <BarChart3 size={20} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Z Reading Counter</span>
                                </div>
                                <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{zReadingCount}</span>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total readings</p>
                            </div>
                            <div className="flex-1 min-w-[220px] bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800 p-6 text-center hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="p-2 bg-orange-600 rounded-lg">
                                        <RefreshCw size={20} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">Reset Counter</span>
                                </div>
                                <span className="text-3xl font-bold text-orange-700 dark:text-orange-300">{resetCounter}</span>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">System resets</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="w-full bg-[var(--color-bg-primary)] ">
                            <div className="mx-auto">
                                {/* Header Section */}
                                <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-[var(--color-secondary-light)] p-6 mb-6">

                                    {/* Company Info */}
                                    <div className="text-center border-b border-[var(--color-secondary-light)] pb-6 mb-6">
                                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{reportData?.headerTitle}</h2>
                                        <p className="text-[var(--color-text-secondary)]">{reportData?.headerSubTitle}</p>
                                        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
                                            <span>TIN: {formatTIN(reportData?.vatTin)}</span>
                                            <span>Accreditation: {reportData?.accreditationNo}</span>
                                            <span>PTU No: {reportData?.ptuNo}</span>
                                        </div>
                                    </div>

                                    {/* Report Period */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={18} className="text-[var(--color-text-primary)]" />
                                                <span className="font-medium text-[var(--color-text-primary)]">Report Date</span>
                                            </div>
                                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatDate(reportData?.reportDate)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={18} className="text-[var(--color-text-primary)]" />
                                                <span className="font-medium text-[var(--color-text-primary)]">Period</span>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {formatDateTime(reportData?.startDateTime)} - {formatDateTime(reportData?.endDateTime)}
                                            </p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Receipt size={18} className="text-[var(--color-text-primary)]" />
                                                <span className="font-medium text-[var(--color-text-primary)]">OR Range</span>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {reportData?.beginningOr} - {reportData?.endingOr}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sales Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-[var(--color-secondary-light)]">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Gross Sales</h3>
                                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.grossSales)}</p>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-[var(--color-secondary-light)]">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Net Sales</h3>
                                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.netSales)}</p>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-[var(--color-secondary-light)]">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Discount</h3>
                                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.totalDiscount)}</p>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-[var(--color-secondary-light)]">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Payment</h3>
                                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.totalPayment)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Passenger Data Table */}
                                    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Users size={20} className="text-[var(--color-text-primary)]" />
                                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Passenger Breakdown</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-[var(--color-bg-secondary)]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Type</th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-primary)]">Count</th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-primary)]">Fare</th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-primary)]">Total</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                {reportData?.passengerData?.map((passenger, index) => (
                                                    <tr key={index} className="hover:bg-[var(--color-bg-secondary)]">
                                                        <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{passenger.passengerType}</td>
                                                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-right">{passenger.count}</td>
                                                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-right">{formatCurrency(passenger.ticketCost)}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] text-right">{formatCurrency(passenger.totalNetAmount)}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CreditCard size={20} className="text-[var(--color-text-primary)]" />
                                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Payment Methods</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {reportData?.paymentMethod?.map((payment, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                                                    <span className="font-medium text-[var(--color-text-primary)]">{payment.paymentType}</span>
                                                    <span className="font-bold text-lg text-[var(--color-text-primary)]">{formatCurrency(payment.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Discount Breakdown */}
                                <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6 mb-6">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Discount Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-red-200">
                                            <h4 className="font-medium text-[var(--color-text-secondary)] mb-2">Senior Citizen</h4>
                                            <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.seniorCitizenDiscount)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-blue-200">
                                            <h4 className="font-medium text-[var(--color-text-secondary)] mb-2">PWD Discount</h4>
                                            <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.pwdDiscount)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-green-200">
                                            <h4 className="font-medium text-[var(--color-text-secondary)] mb-2">Student Discount</h4>
                                            <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.studentDiscount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* VAT Information */}
                                <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6 mb-6">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">VAT Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">VATable Sales</h4>
                                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.vatableSales)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">VATable Amount</h4>
                                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.vatableAmount)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">VAT Exempt Sales</h4>
                                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.grossSales)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Zero Rated Sales</h4>
                                            <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.zeroRatedSales)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Grand Total Summary */}
                                <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6 mb-6">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Grand Total Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-blue-200">
                                            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Previous Grand Total</h4>
                                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.oldGrandTotal)}</p>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg border border-[var(--color-secondary-light)] border border-[var(--color-secondary-light)]-green-200">
                                            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">New Grand Total</h4>
                                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(reportData?.newGrandTotal)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* System Information */}
                                <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)] p-6">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">System Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-500">Serial Number:</span>
                                            <p className="text-[var(--color-text-primary)]">{reportData?.sn}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Z Counter:</span>
                                            <p className="text-[var(--color-text-primary)]">{zReadingCount}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Reset Counter:</span>
                                            <p className="text-[var(--color-text-primary)]">{resetCounter}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">MIN:</span>
                                            <p className="text-[var(--color-text-primary)]">{reportData?.min}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Valid Until:</span>
                                            <p className="text-[var(--color-text-primary)]">{formatDate(reportData?.validUntil)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Date Issued:</span>
                                            <p className="text-[var(--color-text-primary)]">{formatDate(reportData?.dateIssued)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center mt-8 p-6 bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-secondary-light)]">
                                    <h4 className="font-bold text-[var(--color-text-primary)]">{reportData?.footerTitle}</h4>
                                    <p className="text-[var(--color-text-secondary)]">{reportData?.footerSubTitle}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Generated on {formatDateTime(new Date().toISOString())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TabContent>
            {/* Reset Counter Confirmation Dialog */}
            {showResetConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                                    <RotateCcw className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Reset Counter Confirmation
                                </h3>
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to reset the counter for machine <strong>{selectedMachine?.serial_number}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={cancelResetCounter}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={confirmResetCounter}
                            >
                                Reset Counter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
